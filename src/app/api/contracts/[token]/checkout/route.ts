/**
 * PROJ-26: POST /api/contracts/[token]/checkout
 *
 * Startet die Zahlung für ein Programm-Angebot. Öffentlich erreichbar (der
 * Patient klickt aus der Mail oder scannt den QR-Code im Call), abgesichert
 * über den 48-Stunden-Token und Rate-Limiting.
 *
 * Zwei Dinge passieren hier bewusst VOR der Zahlung:
 *   1. Der Widerrufsverzicht wird protokolliert (Zeitstempel, IP, User-Agent).
 *      Das ist der Moment, in dem der Patient die Checkbox gesetzt hat.
 *   2. Es wird KEIN `stripe_session_id` gespeichert. Der wandert erst im
 *      Webhook in den Vertrag — dadurch trägt die UNIQUE-Spalte genau eine
 *      bezahlte Session, egal wie oft der Patient den Checkout abbricht.
 *
 * Steuer: heilkundliche Leistung, § 4 Nr. 14a UStG. Hier darf NIEMALS
 * `UST_TAX_RATE_ID` gesetzt werden — der gehört zu den Shop-Produkten.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { isRateLimited } from "@/lib/rate-limit"
import { getStripe } from "@/lib/stripe"
import { offenerBetrag } from "@/types/contract"
import { CONTRACT_TYPE_CONFIG } from "@/types/contract"

const bodySchema = z.object({
  // § 356 Abs. 4 BGB — ausdrückliche Zustimmung zum sofortigen Leistungsbeginn.
  // Pflicht, kein `.optional()`: ohne sie darf die Betreuung nicht starten.
  widerrufVerzicht: z.literal(true, {
    message: "Bitte bestätige den sofortigen Beginn der Betreuung.",
  }),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"

  if (isRateLimited(`programm-checkout:${ip}`, 10, 3_600_000)) {
    return NextResponse.json(
      { error: "Zu viele Versuche. Bitte versuche es später erneut." },
      { status: 429 }
    )
  }

  if (!token || !/^[a-zA-Z0-9_-]{16,}$/.test(token)) {
    return NextResponse.json({ error: "Ungültiger Link." }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." },
      { status: 422 }
    )
  }

  const svc = createSupabaseServiceClient()

  const { data: contract } = await svc
    .from("treatment_contracts")
    .select(
      "id, contract_number, contract_type, status, gesamtpreis, bereits_beglichen, programm_tage, patient_id, patient_email, patient_name, token_expires_at, paid_at"
    )
    .eq("signing_token", token)
    .maybeSingle()

  if (!contract) {
    return NextResponse.json({ error: "Angebot nicht gefunden." }, { status: 404 })
  }

  if (contract.contract_type !== "praxis_os_programm") {
    return NextResponse.json(
      { error: "Dieser Vertrag wird nicht per Zahlung abgeschlossen." },
      { status: 422 }
    )
  }

  if (contract.paid_at || contract.status === "unterschrieben") {
    return NextResponse.json(
      { error: "Dieses Angebot wurde bereits bezahlt.", code: "ALREADY_PAID" },
      { status: 409 }
    )
  }

  if (contract.status === "storniert" || contract.status === "widerrufen") {
    return NextResponse.json({ error: "Dieses Angebot ist nicht mehr gültig." }, { status: 410 })
  }

  if (contract.token_expires_at && new Date(contract.token_expires_at) < new Date()) {
    await svc
      .from("treatment_contracts")
      .update({ status: "abgelaufen" })
      .eq("id", contract.id)
      .in("status", ["entwurf", "versendet"])
    return NextResponse.json(
      {
        error:
          "Dieses Angebot ist abgelaufen. Melde dich kurz bei deinem Therapeuten — er stellt es dir neu aus.",
        code: "EXPIRED",
      },
      { status: 410 }
    )
  }

  const betrag = offenerBetrag(contract)
  if (betrag <= 0) {
    return NextResponse.json({ error: "Es ist kein Betrag offen." }, { status: 422 })
  }

  // ── Widerrufsverzicht protokollieren (vor der Zahlung) ───────────────────
  await svc
    .from("treatment_contracts")
    .update({
      signer_consent: true,
      signer_ip: ip,
      signer_user_agent: request.headers.get("user-agent") || "unknown",
    })
    .eq("id", contract.id)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wwwpraxis-os.com"

  // ── Testbetrag (Abnahme der Zahlungskette ohne 378 € zu bewegen) ─────────
  //
  // Greift NUR, wenn beides zutrifft:
  //   1. PROGRAMM_TESTBETRAG_CENT ist gesetzt, UND
  //   2. die Patienten-E-Mail enthält "+test"
  //
  // Die zweite Bedingung ist die eigentliche Sicherung: Bleibt die Variable
  // nach dem Test versehentlich stehen, zahlt ein echter Patient trotzdem den
  // vollen Betrag — seine Adresse enthält kein "+test". Ein vergessener
  // Testschalter kann hier also keinen Umsatz kosten.
  const testCent = Number(process.env.PROGRAMM_TESTBETRAG_CENT ?? 0)
  const istTestAdresse = (contract.patient_email ?? "").toLowerCase().includes("+test")
  const testbetragAktiv = Number.isFinite(testCent) && testCent > 0 && istTestAdresse

  const unitAmount = testbetragAktiv ? Math.round(testCent) : Math.round(betrag * 100)

  if (testbetragAktiv) {
    console.warn(
      `[programm-checkout] TESTBETRAG AKTIV: ${unitAmount} Cent statt ${betrag} EUR ` +
        `(Vertrag ${contract.contract_number}, ${contract.patient_email})`
    )
  }

  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: contract.patient_email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: unitAmount,
            product_data: {
              name: testbetragAktiv
                ? `TESTZAHLUNG — ${CONTRACT_TYPE_CONFIG.praxis_os_programm.label}`
                : CONTRACT_TYPE_CONFIG.praxis_os_programm.label,
              description: testbetragAktiv
                ? `TEST — Vertrag ${contract.contract_number}, regulär ${betrag.toFixed(2)} €`
                : `Vertrag ${contract.contract_number} — Videokonsultation bereits angerechnet`,
            },
          },
          quantity: 1,
          // Kein tax_rates: § 4 Nr. 14a UStG, umsatzsteuerfrei.
        },
      ],
      // payment_method_types bewusst nicht gesetzt → Stripe zeigt alles, was im
      // Dashboard aktiv ist (Karte, Klarna). Welche Klarna-Option erscheint,
      // entscheidet Klarna nach eigener Prüfung.
      success_url: `${siteUrl}/vertrag/${token}?bezahlt=1`,
      cancel_url: `${siteUrl}/vertrag/${token}`,
      metadata: {
        kind: "praxis_os_programm",
        contract_id: contract.id,
        contract_number: contract.contract_number,
        patient_id: contract.patient_id,
        widerruf_verzicht: "true",
        widerruf_verzicht_at: new Date().toISOString(),
        ...(testbetragAktiv ? { testzahlung: "true" } : {}),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("[programm-checkout] Stripe-Fehler:", err)
    return NextResponse.json(
      { error: "Die Zahlung konnte nicht gestartet werden. Bitte versuche es erneut." },
      { status: 500 }
    )
  }
}
