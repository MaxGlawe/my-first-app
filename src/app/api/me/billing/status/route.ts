/**
 * GET /api/me/billing/status
 * Check if the patient's Stripe customer has a payment method.
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
    .select("stripe_customer_id, status")
    .eq("patient_id", patient.id)
    .single()

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json({ has_subscription: false, has_payment_method: false })
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
    })
  } catch (err) {
    console.error("[GET /api/me/billing/status] Stripe error:", err)
    // If Stripe fails, don't block the user
    return NextResponse.json({
      has_subscription: true,
      subscription_status: subscription.status,
      has_payment_method: true, // fail open
    })
  }
}
