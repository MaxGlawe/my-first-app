/**
 * Patient Subscription API
 *
 * GET:  Get own subscription status + payment plans
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const serviceClient = createSupabaseServiceClient()

  // Find patient record for this user
  const { data: patient } = await serviceClient
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!patient) {
    return NextResponse.json({ error: "Kein Patientenprofil gefunden." }, { status: 404 })
  }

  // Get subscription
  const { data: subscription } = await serviceClient
    .from("patient_subscriptions")
    .select("*")
    .eq("patient_id", patient.id)
    .single()

  // Get payment plans with installments
  const { data: paymentPlans } = await serviceClient
    .from("payment_plans")
    .select("*, payment_installments(*)")
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false })
    .limit(10)

  return NextResponse.json({
    subscription: subscription ?? null,
    payment_plans: paymentPlans ?? [],
  })
}
