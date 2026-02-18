/**
 * PROJ-7 BUG-4: GET /api/me/appointments
 * Returns the logged-in patient's upcoming and past appointments.
 * Matches the patient record by auth email. RLS enforces access.
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Find patient record by matching auth email
  const { data: patient } = await supabase
    .from("patients")
    .select("id, booking_system_id")
    .eq("email", user.email!)
    .limit(1)
    .maybeSingle()

  if (!patient) {
    return NextResponse.json({ appointments: [], linked: false })
  }

  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("id, scheduled_at, duration_minutes, therapist_name, service_name, status, synced_at")
    .eq("patient_id", patient.id)
    .order("scheduled_at", { ascending: false })
    .limit(50)

  if (error) {
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
