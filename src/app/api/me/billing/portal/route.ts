/**
 * POST /api/me/billing/portal
 * Creates a Stripe Customer Portal session for the current patient.
 * Returns the portal URL — patient gets redirected to manage payment methods.
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { createPortalSession } from "@/lib/stripe"

export async function POST() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const serviceClient = createSupabaseServiceClient()

  // Find patient
  const { data: patient } = await serviceClient
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!patient) {
    return NextResponse.json({ error: "Kein Patientenprofil gefunden." }, { status: 404 })
  }

  // Get subscription with Stripe customer ID
  const { data: subscription } = await serviceClient
    .from("patient_subscriptions")
    .select("stripe_customer_id")
    .eq("patient_id", patient.id)
    .single()

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json({ error: "Kein Abo gefunden." }, { status: 404 })
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wwwpraxis-os.com"
    const session = await createPortalSession(
      subscription.stripe_customer_id,
      `${siteUrl}/app/abo`
    )

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("[POST /api/me/billing/portal] Error:", err)
    return NextResponse.json(
      { error: "Billing-Portal konnte nicht geöffnet werden." },
      { status: 500 }
    )
  }
}
