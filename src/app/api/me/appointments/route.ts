/**
 * PROJ-7 BUG-4: GET /api/me/appointments
 * Returns the logged-in patient's upcoming and past appointments.
 * Auth verified via session, then service client used for queries
 * (the appointments RLS policy can't access auth.users from patient context).
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Use service client to bypass RLS — access is scoped by verified auth email
  const serviceClient = createSupabaseServiceClient()

  // Find patient record by matching auth email
  const { data: patient } = await serviceClient
    .from("patients")
    .select("id, booking_system_id")
    .eq("email", user.email!)
    .limit(1)
    .maybeSingle()

  if (!patient) {
    return NextResponse.json({ appointments: [], linked: false })
  }

  const { data: appointments, error } = await serviceClient
    .from("appointments")
    .select("id, scheduled_at, duration_minutes, therapist_name, service_name, status, synced_at")
    .eq("patient_id", patient.id)
    .order("scheduled_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("[GET /api/me/appointments] Error:", error)
    return NextResponse.json(
      { error: "Termine konnten nicht geladen werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({
    appointments: appointments ?? [],
    linked: !!patient.booking_system_id,
  })
}
