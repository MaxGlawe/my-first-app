/**
 * PROJ-18: POST /api/bgf/organizations/[id]/setup-sepa
 * Creates a Stripe Checkout session in "setup" mode for SEPA direct debit.
 * Returns the checkout URL for the HR contact to enter their IBAN.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { getStripe } from "@/lib/stripe"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await params

  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const sc = createSupabaseServiceClient()
  const stripe = getStripe()

  // Load organization
  const { data: org } = await sc
    .from("organizations")
    .select("id, name, kontakt_name, kontakt_email, stripe_customer_id")
    .eq("id", orgId)
    .single()

  if (!org) {
    return NextResponse.json({ error: "Organisation nicht gefunden." }, { status: 404 })
  }

  // Create or reuse Stripe customer
  let customerId = org.stripe_customer_id

  if (customerId) {
    // Verify it still exists
    try {
      const customer = await stripe.customers.retrieve(customerId)
      if ("deleted" in customer && customer.deleted) {
        customerId = null
      }
    } catch {
      customerId = null
    }
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: org.kontakt_email,
      name: org.name,
      metadata: {
        praxis_os_organization_id: orgId,
        kontakt_name: org.kontakt_name,
        type: "bgf_organization",
      },
    })
    customerId = customer.id

    // Save customer ID to org
    await sc
      .from("organizations")
      .update({ stripe_customer_id: customerId })
      .eq("id", orgId)
  }

  // Create Stripe Checkout in "setup" mode for SEPA
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  const session = await stripe.checkout.sessions.create({
    mode: "setup",
    customer: customerId,
    payment_method_types: ["sepa_debit"],
    success_url: `${siteUrl}/os/bgf/${orgId}?sepa=success`,
    cancel_url: `${siteUrl}/os/bgf/${orgId}?sepa=cancelled`,
    metadata: {
      organization_id: orgId,
      type: "bgf_sepa_setup",
    },
  })

  return NextResponse.json({ checkout_url: session.url })
}

/**
 * GET /api/bgf/organizations/[id]/setup-sepa
 * Check if SEPA is set up for this organization.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await params

  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const sc = createSupabaseServiceClient()

  const { data: org } = await sc
    .from("organizations")
    .select("stripe_customer_id")
    .eq("id", orgId)
    .single()

  if (!org || !org.stripe_customer_id) {
    return NextResponse.json({ sepa_active: false, payment_methods: [] })
  }

  const stripe = getStripe()

  try {
    const methods = await stripe.paymentMethods.list({
      customer: org.stripe_customer_id,
      type: "sepa_debit",
    })

    const sepaActive = methods.data.length > 0
    const sepaInfo = methods.data.map((m) => ({
      id: m.id,
      last4: m.sepa_debit?.last4 ?? "****",
      bank: m.sepa_debit?.bank_code ?? "",
      country: m.sepa_debit?.country ?? "",
    }))

    return NextResponse.json({
      sepa_active: sepaActive,
      payment_methods: sepaInfo,
    })
  } catch {
    return NextResponse.json({ sepa_active: false, payment_methods: [] })
  }
}
