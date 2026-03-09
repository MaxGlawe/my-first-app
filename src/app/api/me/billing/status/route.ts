/**
 * GET /api/me/billing/status
 * Check if the patient's Stripe customer has a payment method.
 * Also returns subscription details for the setup gate UI.
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { getStripe } from "@/lib/stripe"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const serviceClient = createSupabaseServiceClient()

  const { data: patient } = await serviceClient
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!patient) {
    return NextResponse.json({ has_subscription: false, has_payment_method: false })
  }

  const { data: subscription } = await serviceClient
    .from("patient_subscriptions")
    .select("stripe_customer_id, status, plan_type, price_amount, trial_end, extra_free_months, promo_code_id")
    .eq("patient_id", patient.id)
    .single()

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json({ has_subscription: false, has_payment_method: false })
  }

  // Look up promo code name if exists
  let promoCode: string | null = null
  if (subscription.promo_code_id) {
    const { data: promo } = await serviceClient
      .from("promo_codes")
      .select("code")
      .eq("id", subscription.promo_code_id)
      .single()
    promoCode = promo?.code ?? null
  }

  // Check Stripe for payment methods
  try {
    const stripe = getStripe()
    const paymentMethods = await stripe.paymentMethods.list({
      customer: subscription.stripe_customer_id,
      limit: 1,
    })

    return NextResponse.json({
      has_subscription: true,
      subscription_status: subscription.status,
      has_payment_method: paymentMethods.data.length > 0,
      plan_type: subscription.plan_type,
      price_amount: subscription.price_amount,
      trial_end: subscription.trial_end,
      extra_free_months: subscription.extra_free_months ?? 0,
      promo_code: promoCode,
    })
  } catch (err) {
    console.error("[GET /api/me/billing/status] Stripe error:", err)
    return NextResponse.json({
      has_subscription: true,
      subscription_status: subscription.status,
      has_payment_method: true, // fail open
    })
  }
}
