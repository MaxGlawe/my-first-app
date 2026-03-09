/**
 * POST /api/me/billing/setup-checkout
 * Creates a Stripe Checkout Session in "setup" mode to collect IBAN/payment method.
 * No charge — just saves the payment method for future billing.
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { getStripe } from "@/lib/stripe"

export async function POST() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const serviceClient = createSupabaseServiceClient()

  const { data: patient } = await serviceClient
    .from("patients")
    .select("id, vorname, nachname")
    .eq("user_id", user.id)
    .single()

  if (!patient) {
    return NextResponse.json({ error: "Kein Patientenprofil." }, { status: 404 })
  }

  const { data: subscription } = await serviceClient
    .from("patient_subscriptions")
    .select("stripe_customer_id")
    .eq("patient_id", patient.id)
    .single()

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json({ error: "Kein Abo gefunden." }, { status: 404 })
  }

  try {
    const stripe = getStripe()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wwwpraxis-os.com"

    const session = await stripe.checkout.sessions.create({
      mode: "setup",
      customer: subscription.stripe_customer_id,
      payment_method_types: ["sepa_debit", "card"],
      success_url: `${siteUrl}/app/dashboard?payment_setup=success`,
      cancel_url: `${siteUrl}/app/zahlungsmethode?cancelled=true`,
      metadata: {
        patient_id: patient.id,
        patient_name: `${patient.vorname} ${patient.nachname}`,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("[POST /api/me/billing/setup-checkout] Error:", err)
    return NextResponse.json(
      { error: "Checkout konnte nicht erstellt werden." },
      { status: 500 }
    )
  }
}
