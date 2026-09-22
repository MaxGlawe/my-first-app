/**
 * POST /api/me/billing/start-subscription — Erhaltungsphase (16,99 €/Monat)
 *
 * PROJ-26: Dies ist KEIN allgemeiner Abo-Einstieg mehr. Praxis OS verkauft kein
 * App-Abo; bezahlt wird die 90-Tage-Betreuung. Dieser Endpunkt bedient nur noch
 * den einen Fall danach: Ein Patient, dessen Programm **abgelaufen** ist, möchte
 * die App weiternutzen (Schreibzugriff, Chat, neue Pläne — ohne Video-Calls).
 *
 * Daraus folgen zwei harte Regeln:
 *   1. Ohne jemals abgeschlossenes Programm → 403. Niemand kauft sich am
 *      Programm vorbei in die App.
 *   2. Kein Trial. Die 90 Tage waren bezahlte Betreuung; ein "Gratismonat"
 *      obendrauf wäre sinnlos und würde das alte Abo-Framing zurückholen.
 *
 * Die `patient_subscriptions`-Zeile wird hier mit nicht-aktivem Platzhalter-Status
 * angelegt (Paywall bleibt zu, bis bezahlt); der bestehende Stripe-Webhook
 * (`customer.subscription.created` → matcht `metadata.praxis_os_patient_id`)
 * setzt sie nach erfolgreichem Checkout auf `active`.
 */
import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { getBegleitungStatus } from "@/lib/app-access"
import { getStripe, getOrCreateCustomer, getSubscriptionPriceId, SUBSCRIPTION_PRICES } from "@/lib/stripe"

export async function POST() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const svc = createSupabaseServiceClient()
  const { data: patient } = await svc
    .from("patients")
    .select("id, vorname, nachname, email")
    .eq("user_id", user.id)
    .maybeSingle()
  if (!patient) return NextResponse.json({ error: "Kein Patientenprofil." }, { status: 404 })

  // ── Zugangsregel: nur nach abgelaufener Betreuung ───────────────────────
  const betreuung = await getBegleitungStatus(svc, user.id)
  if (!betreuung.everHadGrant) {
    return NextResponse.json(
      {
        error:
          "Die Weiternutzung steht erst nach einer abgeschlossenen Betreuung zur Verfügung. " +
          "Der Einstieg läuft über eine persönliche Videokonsultation.",
      },
      { status: 403 }
    )
  }
  if (betreuung.active) {
    return NextResponse.json(
      { error: "Deine Betreuung läuft noch — du brauchst dafür nichts zusätzlich abzuschließen." },
      { status: 409 }
    )
  }

  // Schon ein aktives Erhaltungs-Abo? → nichts tun.
  const { data: existing } = await svc
    .from("patient_subscriptions")
    .select("id, status, stripe_customer_id")
    .eq("patient_id", patient.id)
    .maybeSingle()
  if (existing && ["trial", "active"].includes(existing.status)) {
    return NextResponse.json({ error: "Deine Weiternutzung ist bereits aktiv." }, { status: 409 })
  }

  try {
    const stripe = getStripe()
    const priceId = getSubscriptionPriceId("monthly")
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wwwpraxis-os.com"
    const email = patient.email || user.email || ""

    const customerId = await getOrCreateCustomer({
      email,
      name: `${patient.vorname ?? ""} ${patient.nachname ?? ""}`.trim() || "Patient",
      patientId: patient.id,
      existingCustomerId: existing?.stripe_customer_id ?? null,
    })

    // patient_subscriptions-Zeile (Platzhalter, NICHT aktiv) sicherstellen, damit
    // der Webhook-UPDATE eine Zeile zum Aktivieren hat.
    await svc.from("patient_subscriptions").upsert(
      {
        patient_id: patient.id,
        plan_type: "monthly",
        status: existing && ["trial", "active"].includes(existing.status) ? existing.status : "expired",
        price_amount: SUBSCRIPTION_PRICES.monthly,
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "patient_id" }
    )

    // Kein trial_period_days: die Erhaltungsphase folgt auf 90 bezahlte Tage.
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: { praxis_os_patient_id: patient.id },
      },
      success_url: `${siteUrl}/meine-termine?abo=success`,
      cancel_url: `${siteUrl}/meine-termine?abo=cancelled`,
      metadata: { praxis_os_patient_id: patient.id, kind: "erhaltungsphase" },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("[start-subscription] Error:", err)
    return NextResponse.json({ error: "Checkout konnte nicht gestartet werden." }, { status: 500 })
  }
}
