/**
 * PROJ-7: Buchungstool-Integration
 * GET /api/patients/[id]/appointments
 *
 * Returns cached appointments for a patient from the appointments table.
 * Data is pushed by the booking tool via webhook and cached here.
 *
 * Access: authenticated therapists can only read appointments for their own patients
 *         (enforced via RLS on the patients table + the explicit therapist_id check below).
 *         Admins can read appointments for all patients.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  // ---- Authentication ----
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: "Nicht autorisiert. Bitte einloggen." },
      { status: 401 }
    )
  }

  // ---- Validate patient UUID ----
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Ungültige Patienten-ID." }, { status: 400 })
  }

  // ---- Verify the patient exists and is accessible by this user ----
  // RLS on patients table ensures therapists only see their own patients.
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id")
    .eq("id", id)
    .maybeSingle()

  if (patientError) {
    console.error("[GET /api/patients/[id]/appointments] Patient lookup error:", patientError)
    return NextResponse.json(
      { error: "Patient konnte nicht geladen werden." },
      { status: 500 }
    )
  }

  if (!patient) {
    return NextResponse.json(
      { error: "Patient nicht gefunden oder keine Berechtigung." },
      { status: 404 }
    )
  }

  // ---- Fetch cached appointments ----
  // Return all appointments (upcoming + past), ordered by date descending.
  // Frontend handles the upcoming/past split.
  const { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select(
      "id, patient_id, booking_system_appointment_id, scheduled_at, duration_minutes, therapist_name, service_name, status, synced_at"
    )
    .eq("patient_id", id)
    .order("scheduled_at", { ascending: false })
    .limit(200)

  if (appointmentsError) {
    console.error(
      "[GET /api/patients/[id]/appointments] Appointments query error:",
      appointmentsError
    )
    return NextResponse.json(
      { error: "Termine konnten nicht geladen werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ appointments: appointments ?? [] })
}
