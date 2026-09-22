/**
 * PROJ-26: POST /api/os/programm-angebot
 *
 * „Programm-Angebot erstellen" — der Knopf am Ende der Videokonsultation.
 * Erzeugt einen Behandlungsvertrag (contract_type = praxis_os_programm) mit
 * 48-Stunden-Token, schickt ihn per Mail und gibt den Link zurück, damit das
 * OS ihn als QR-Code auf den geteilten Bildschirm legen kann.
 *
 * Das ist der EINZIGE Kontrollpunkt: ohne Angebot kein Checkout, ohne Zahlung
 * kein Zugang. Ein Patient kann sich nirgends selbst freischalten.
 *
 * GET liefert das aktuell offene Angebot eines Patienten (für die Anzeige im
 * Patientenprofil).
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import QRCode from "qrcode"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { generateToken } from "@/lib/tokens"
import { generateVertragText } from "@/lib/contract-templates"
import { programmAngebotEmail } from "@/lib/email-templates/programm-angebot"
import { sendEmail } from "@/lib/email"
import { getBegleitungStatus } from "@/lib/app-access"
import { PROGRAMM, PROGRAMM_CALLS, PROGRAMM_LEISTUNGEN } from "@/lib/programm"
import { CONTRACT_TYPE_CONFIG } from "@/types/contract"
import type { PraxisSettings } from "@/types/billing"

const STAFF_ROLES = ["admin", "heilpraktiker", "physiotherapeut"]

const bodySchema = z.object({
  patient_id: z.string().uuid(),
  /**
   * Neu ausstellen, obwohl noch ein Angebot offen ist (abgelaufener Link).
   * Bewusst explizit — sonst entstehen im Eifer des Gefechts Doppelangebote.
   */
  neu_ausstellen: z.boolean().optional().default(false),
  /**
   * Der Patient hat die Videokonsultation bereits einzeln bezahlt (69 €) und
   * entscheidet sich jetzt doch fürs Programm. Dann wird sie angerechnet und
   * es sind nur noch 430 € offen. Startet er direkt im Call, ist die
   * Konsultation im Gesamtpreis enthalten und es bleibt bei 499 €.
   */
  konsultation_angerechnet: z.boolean().optional().default(false),
})

async function requireStaff() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const svc = createSupabaseServiceClient()
  const { data: profile } = await svc
    .from("user_profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .single()

  if (!profile || !STAFF_ROLES.includes(profile.role)) return null
  return { user, svc, profile }
}

/**
 * QR-Code serverseitig erzeugen. Bewusst nicht im Browser: `qrcode` ist ein
 * Node-Paket, und im Call zählt, dass das Bild sofort da ist, wenn der
 * Therapeut den Bildschirm teilt.
 */
async function qrFor(url: string): Promise<string | null> {
  try {
    return await QRCode.toDataURL(url, {
      width: 512,
      margin: 1,
      color: { dark: "#2C3E2DFF", light: "#FFFFFFFF" },
    })
  } catch (err) {
    console.error("[programm-angebot] QR-Code fehlgeschlagen:", err)
    return null
  }
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ── GET: offenes Angebot eines Patienten ────────────────────────────────────

export async function GET(request: NextRequest) {
  const auth = await requireStaff()
  if (!auth) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })

  const patientId = request.nextUrl.searchParams.get("patient_id")
  if (!patientId) {
    return NextResponse.json({ error: "patient_id fehlt." }, { status: 400 })
  }

  const { data } = await auth.svc
    .from("treatment_contracts")
    .select(
      "id, contract_number, status, signing_token, token_expires_at, gesamtpreis, bereits_beglichen, paid_at, created_at"
    )
    .eq("patient_id", patientId)
    .eq("contract_type", "praxis_os_programm")
    .order("created_at", { ascending: false })
    .limit(5)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wwwpraxis-os.com"
  const angebote = (data ?? []).map((c) => ({
    ...c,
    url: c.signing_token ? `${siteUrl}/vertrag/${c.signing_token}` : null,
    abgelaufen: !!c.token_expires_at && new Date(c.token_expires_at) < new Date(),
  }))

  // Läuft gerade eine Betreuung? Bestimmt, ob überhaupt ein Angebot sinnvoll ist.
  const { data: patient } = await auth.svc
    .from("patients")
    .select("user_id")
    .eq("id", patientId)
    .maybeSingle()

  const betreuung = patient?.user_id
    ? await getBegleitungStatus(auth.svc, patient.user_id)
    : { active: false, endsAt: null, everHadGrant: false, daysLeft: 0 }

  // QR nur für das eine noch zahlbare Angebot — mehr braucht die Ansicht nicht.
  const zahlbar = angebote.find((a) => !a.paid_at && !a.abgelaufen && a.url && ["entwurf", "versendet"].includes(a.status))
  const qr = zahlbar?.url ? await qrFor(zahlbar.url) : null

  return NextResponse.json({ angebote, betreuung, offenes_angebot: zahlbar ?? null, qr_data_url: qr })
}

// ── POST: Angebot erstellen und versenden ───────────────────────────────────

export async function POST(request: NextRequest) {
  const auth = await requireStaff()
  if (!auth) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 422 })
  }
  const { patient_id, neu_ausstellen, konsultation_angerechnet } = parsed.data
  const svc = auth.svc

  // ── Patient laden ─────────────────────────────────────────────────────────
  const { data: patient } = await svc
    .from("patients")
    .select("id, vorname, nachname, email, strasse, plz, ort, geburtsdatum, user_id")
    .eq("id", patient_id)
    .single()

  if (!patient) return NextResponse.json({ error: "Patient nicht gefunden." }, { status: 404 })
  if (!patient.email) {
    return NextResponse.json(
      { error: "Der Patient hat keine E-Mail-Adresse — ohne die lässt sich kein Angebot senden." },
      { status: 422 }
    )
  }

  // ── Läuft bereits eine Betreuung? ─────────────────────────────────────────
  if (patient.user_id) {
    const betreuung = await getBegleitungStatus(svc, patient.user_id)
    if (betreuung.active) {
      return NextResponse.json(
        {
          error: `Die Betreuung läuft bereits bis zum ${new Date(
            betreuung.endsAt!
          ).toLocaleDateString("de-DE")}.`,
          code: "BETREUUNG_AKTIV",
        },
        { status: 409 }
      )
    }
  }

  // ── Liegt schon ein offenes Angebot vor? ──────────────────────────────────
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wwwpraxis-os.com"

  const { data: offen } = await svc
    .from("treatment_contracts")
    .select("id, contract_number, signing_token, token_expires_at")
    .eq("patient_id", patient_id)
    .eq("contract_type", "praxis_os_programm")
    .in("status", ["entwurf", "versendet"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (offen && !neu_ausstellen) {
    const nochGueltig = !offen.token_expires_at || new Date(offen.token_expires_at) > new Date()
    if (nochGueltig) {
      const url = `${siteUrl}/vertrag/${offen.signing_token}`
      return NextResponse.json({
        already_open: true,
        contract_number: offen.contract_number,
        url,
        qr_data_url: await qrFor(url),
        expires_at: offen.token_expires_at,
      })
    }
    return NextResponse.json(
      {
        error: "Für diesen Patienten ist ein Angebot abgelaufen. Neu ausstellen?",
        code: "ABGELAUFEN",
        contract_number: offen.contract_number,
      },
      { status: 409 }
    )
  }

  // Beim Neu-Ausstellen das alte Angebot schließen — sonst stehen zwei
  // zahlbare Links nebeneinander.
  if (offen && neu_ausstellen) {
    await svc
      .from("treatment_contracts")
      .update({ status: "storniert", notes: "Ersetzt durch ein neu ausgestelltes Angebot." })
      .eq("id", offen.id)
  }

  // ── Praxis-Snapshot ───────────────────────────────────────────────────────
  const { data: praxis } = await svc.from("praxis_settings").select("*").limit(1).single()
  if (!praxis) {
    return NextResponse.json(
      { error: "Praxis-Einstellungen sind nicht konfiguriert." },
      { status: 422 }
    )
  }

  const { data: contractNumber } = await svc.rpc("generate_contract_number")
  if (!contractNumber) {
    return NextResponse.json({ error: "Vertragsnummer konnte nicht erzeugt werden." }, { status: 500 })
  }

  const patientName = `${patient.vorname} ${patient.nachname}`
  const patientAddress = patient.strasse
    ? `${patient.strasse}\n${patient.plz || ""} ${patient.ort || ""}`.trim()
    : null

  // 90 Tage ≈ 13 Wochen — im Vertragstext steht „voraussichtlich ca.",
  // maßgeblich für die Freischaltung ist programm_tage.
  const dauerWochen = Math.round(PROGRAMM.tage / 7)

  const angerechnet = konsultation_angerechnet ? PROGRAMM.konsultation : 0

  const vertragText = generateVertragText({
    contractType: "praxis_os_programm",
    leistungen: PROGRAMM_LEISTUNGEN,
    gesamtpreis: PROGRAMM.gesamtpreis,
    bereitsBeglichen: angerechnet,
    programmTage: PROGRAMM.tage,
    zahlungsweise: "einmalig",
    dauerWochen,
    sitzungenAnzahl: PROGRAMM_CALLS,
    praxis: praxis as PraxisSettings,
    patientName,
    patientAddress,
    patientGeburtsdatum: patient.geburtsdatum,
  })

  const signingToken = generateToken()
  const expiresAt = new Date(
    Date.now() + PROGRAMM.angebotGueltigStunden * 60 * 60 * 1000
  ).toISOString()
  const now = new Date().toISOString()

  const { data: contract, error: insertError } = await svc
    .from("treatment_contracts")
    .insert({
      contract_number: contractNumber,
      patient_id,
      created_by: auth.user.id,
      contract_type: "praxis_os_programm",
      leistungen: PROGRAMM_LEISTUNGEN,
      gesamtpreis: PROGRAMM.gesamtpreis,
      bereits_beglichen: angerechnet,
      programm_tage: PROGRAMM.tage,
      zahlungsweise: "einmalig",
      dauer_wochen: dauerWochen,
      sitzungen_anzahl: PROGRAMM_CALLS,
      vertrag_text: vertragText,
      praxis_name: praxis.praxis_name,
      praxis_address: `${praxis.strasse}, ${praxis.plz} ${praxis.ort}`,
      praxis_inhaber: praxis.inhaber_name,
      praxis_zulassung: praxis.zulassungsnummer ?? null,
      patient_name: patientName,
      patient_address: patientAddress,
      patient_email: patient.email,
      patient_geburtsdatum: patient.geburtsdatum,
      signing_token: signingToken,
      token_expires_at: expiresAt,
      status: "versendet",
      sent_at: now,
      sent_to_email: patient.email,
    })
    .select("id, contract_number")
    .single()

  if (insertError || !contract) {
    console.error("[programm-angebot] Insert fehlgeschlagen:", insertError?.message)
    return NextResponse.json({ error: "Angebot konnte nicht angelegt werden." }, { status: 500 })
  }

  // ── Mail ──────────────────────────────────────────────────────────────────
  const angebotUrl = `${siteUrl}/vertrag/${signingToken}`
  const mail = programmAngebotEmail({
    patientName: patient.vorname,
    angebotUrl,
    contractNumber: contract.contract_number,
    gueltigBis: formatDateTime(expiresAt),
    praxisName: praxis.praxis_name,
    behandlerName:
      [auth.profile.first_name, auth.profile.last_name].filter(Boolean).join(" ") ||
      praxis.inhaber_name,
    siteUrl,
  })

  const sent = await sendEmail({ to: patient.email, subject: mail.subject, html: mail.html })

  // Der Mailversand darf das Angebot nicht scheitern lassen — im Call zählt
  // der QR-Code, die Mail ist nur die Absicherung.
  if (!sent?.success) {
    console.error("[programm-angebot] Mailversand fehlgeschlagen für", contract.contract_number)
  }

  return NextResponse.json({
    contract_id: contract.id,
    contract_number: contract.contract_number,
    url: angebotUrl,
    qr_data_url: await qrFor(angebotUrl),
    expires_at: expiresAt,
    mail_versendet: !!sent?.success,
    zu_zahlen: PROGRAMM.gesamtpreis - angerechnet,
    label: CONTRACT_TYPE_CONFIG.praxis_os_programm.label,
  })
}
