/**
 * POST /api/intake/[id]/convert — Convert intake request to patient
 * Creates a patient record from intake data and links them.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Check admin/heilpraktiker role
  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || !["admin", "heilpraktiker"].includes(profile.role)) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  const { id } = await params

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 })
  }

  // Get the intake request
  const { data: intake, error: fetchErr } = await supabase
    .from("intake_requests")
    .select("*")
    .eq("id", id)
    .single()

  if (fetchErr || !intake) {
    return NextResponse.json({ error: "Anfrage nicht gefunden." }, { status: 404 })
  }

  if (intake.status === "patient_erstellt") {
    return NextResponse.json({ error: "Patient wurde bereits erstellt." }, { status: 409 })
  }

  // Create patient record via service client (bypasses RLS)
  // geburtsdatum & geschlecht are NOT NULL in DB but unknown from intake form
  const { data: patient, error: patientErr } = await serviceClient
    .from("patients")
    .insert({
      vorname: intake.vorname,
      nachname: intake.nachname,
      email: intake.email,
      telefon: intake.telefon,
      geburtsdatum: "1900-01-01",
      geschlecht: "unbekannt",
      interne_notizen: `[Aus Anfrage erstellt — Geburtsdatum & Geschlecht bitte nachtragen]\n\nBeschwerde: ${intake.beschwerde_bereich} — ${intake.beschwerde_freitext.slice(0, 300)}`,
      therapeut_id: user.id,
    })
    .select("id, vorname, nachname")
    .single()

  if (patientErr || !patient) {
    console.error("[POST /api/intake/[id]/convert] Patient insert error:", patientErr)
    return NextResponse.json(
      { error: "Patient konnte nicht erstellt werden." },
      { status: 500 }
    )
  }

  // Link intake request to patient and update status
  await serviceClient
    .from("intake_requests")
    .update({
      status: "patient_erstellt",
      patient_id: patient.id,
    })
    .eq("id", id)

  return NextResponse.json({
    patient,
    message: `Patient ${patient.vorname} ${patient.nachname} wurde erstellt.`,
  })
}
