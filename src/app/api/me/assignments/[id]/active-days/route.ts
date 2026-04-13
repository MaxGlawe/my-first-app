/**
 * PATCH /api/me/assignments/[id]/active-days
 * Patient overrides their training days for an assignment.
 * The number of days must match the therapist-set count.
 *
 * Access: Patient only (own assignments)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const VALID_WOCHENTAGE = ["mo", "di", "mi", "do", "fr", "sa", "so"] as const

const updateActiveDaysSchema = z.object({
  active_days: z
    .array(z.enum(VALID_WOCHENTAGE))
    .min(1, "Mindestens ein Trainingstag muss gewählt werden.")
    .max(7),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: assignmentId } = await params
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  if (!UUID_REGEX.test(assignmentId)) {
    return NextResponse.json({ error: "Ungültige Zuweisungs-ID." }, { status: 400 })
  }

  // Find the patient record for this user
  let { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!patient && user.email) {
    const { data: byEmail } = await supabase
      .from("patients")
      .select("id")
      .eq("email", user.email)
      .maybeSingle()
    patient = byEmail ?? null
  }

  if (!patient) {
    return NextResponse.json({ error: "Kein Patientenprofil gefunden." }, { status: 404 })
  }

  // Fetch assignment — must belong to this patient and be active
  const { data: assignment, error: fetchErr } = await supabase
    .from("patient_assignments")
    .select("id, active_days, patient_active_days, status")
    .eq("id", assignmentId)
    .eq("patient_id", patient.id)
    .single()

  if (fetchErr || !assignment) {
    return NextResponse.json({ error: "Zuweisung nicht gefunden." }, { status: 404 })
  }

  if (assignment.status !== "aktiv") {
    return NextResponse.json(
      { error: "Nur aktive Zuweisungen können angepasst werden." },
      { status: 409 }
    )
  }

  // Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = updateActiveDaysSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { active_days: newDays } = parseResult.data
  const therapistDays = (assignment.active_days as string[]) ?? []

  // Enforce same number of days as therapist set
  if (newDays.length !== therapistDays.length) {
    return NextResponse.json(
      {
        error: `Du musst genau ${therapistDays.length} Trainingstage wählen (vom Therapeuten vorgegeben).`,
      },
      { status: 422 }
    )
  }

  // Check for duplicates
  if (new Set(newDays).size !== newDays.length) {
    return NextResponse.json({ error: "Doppelte Tage sind nicht erlaubt." }, { status: 422 })
  }

  // If patient chose the same days as therapist, clear the override
  const sortedNew = [...newDays].sort()
  const sortedOriginal = [...therapistDays].sort()
  const isSameAsOriginal = sortedNew.every((d, i) => d === sortedOriginal[i])

  const { data: updated, error: updateErr } = await supabase
    .from("patient_assignments")
    .update({
      patient_active_days: isSameAsOriginal ? null : newDays,
    })
    .eq("id", assignmentId)
    .select("id, active_days, patient_active_days")
    .single()

  if (updateErr) {
    console.error("[PATCH /api/me/assignments/[id]/active-days] Error:", updateErr)
    return NextResponse.json(
      { error: "Trainingstage konnten nicht aktualisiert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({
    assignment: updated,
    message: isSameAsOriginal
      ? "Trainingstage auf Standard zurückgesetzt."
      : "Trainingstage erfolgreich angepasst.",
  })
}
