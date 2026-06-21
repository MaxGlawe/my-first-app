/**
 * PROJ-34 / Stage 2: POST /api/me/billing/start-subscription
 *
 * Self-serve Abo-Start für Patienten (z. B. aus /meine-termine). Erzeugt einen
 * Stripe-Checkout im `subscription`-Mode mit 1 Monat Trial (geschenkt). Die
 * `patient_subscriptions`-Zeile wird hier mit nicht-aktivem Platzhalter-Status
 * angelegt (Paywall bleibt zu, bis bezahlt); der bestehende Stripe-Webhook
 * (`customer.subscription.created` → matcht `metadata.praxis_os_patient_id`)
 * setzt sie nach erfolgreichem Checkout auf `trial`/`active`.
 */
import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { getStripe, getOrCreateCustomer, getSubscriptionPriceId, SUBSCRIPTION_PRICES } from "@/lib/stripe"

const TRIAL_DAYS = 30 // 1. Monat geschenkt

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

  // Schon ein aktives/Trial-Abo? → nichts tun.
  const { data: existing } = await svc
    .from("patient_subscriptions")
    .select("id, status, stripe_customer_id")
    .eq("patient_id", patient.id)
    .maybeSingle()
  if (existing && ["trial", "active"].includes(existing.status)) {
    return NextResponse.json({ error: "Dein Abo ist bereits aktiv." }, { status: 409 })
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

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: { praxis_os_patient_id: patient.id },
      },
      success_url: `${siteUrl}/meine-termine?abo=success`,
      cancel_url: `${siteUrl}/meine-termine?abo=cancelled`,
      metadata: { praxis_os_patient_id: patient.id, kind: "patient_self_subscribe" },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("[start-subscription] Error:", err)
    return NextResponse.json({ error: "Checkout konnte nicht gestartet werden." }, { status: 500 })
  }
}
