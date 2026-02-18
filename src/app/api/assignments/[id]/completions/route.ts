/**
 * PROJ-10: Hausaufgaben-Zuweisung (Completion endpoint)
 * POST /api/assignments/[id]/completions
 *
 * Marks a training session as completed for a given assignment.
 * One completion per assignment per day (unique constraint enforced at DB level).
 *
 * Used by:
 * - PROJ-10 (Therapeuten-Ansicht, Backdating)
 * - PROJ-11 (Patient App — patient marks own session done)
 *
 * Access:
 * - The patient themselves (patient_id === auth.uid())
 * - The therapist who owns the assignment
 * - Admin
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

// ── Constants ─────────────────────────────────────────────────────────────────

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ── Zod schema for POST body ──────────────────────────────────────────────────

const createCompletionSchema = z.object({
  // The calendar date the patient trained. Defaults to today if omitted.
  // Must be an ISO date string (YYYY-MM-DD).
  completed_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum muss im Format YYYY-MM-DD sein.")
    .refine((d) => !isNaN(Date.parse(d)), "Ungültiges Datum.")
    .optional(),

  // Optional: which plan unit was completed (e.g., specific training day)
  unit_id: z.string().uuid("Ungültige Einheiten-ID.").optional().nullable(),

  // BUG-3 FIX: patient_id is taken from the assignment record (server-side),
  // not trusted from the client. This prevents therapists from submitting
  // completions for patients that don't belong to the assignment.
})

// ── POST /api/assignments/[id]/completions ────────────────────────────────────

export async function POST(
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
    return NextResponse.json(
      { error: "Nicht autorisiert. Bitte einloggen." },
      { status: 401 }
    )
  }

  if (!UUID_REGEX.test(assignmentId)) {
    return NextResponse.json({ error: "Ungültige Zuweisungs-ID." }, { status: 400 })
  }

  // Parse + validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = createCompletionSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Validierungsfehler.",
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 422 }
    )
  }

  const { completed_date, unit_id } = parseResult.data

  // Resolve the completed_date: default to today
  const resolvedDate =
    completed_date ?? new Date().toISOString().split("T")[0]

  // Completed date must not be in the future
  const todayStr = new Date().toISOString().split("T")[0]
  if (resolvedDate > todayStr) {
    return NextResponse.json(
      { error: "Das Erledigungs-Datum darf nicht in der Zukunft liegen." },
      { status: 422 }
    )
  }

  // Fetch the assignment to verify it exists, is active, and check authorization
  const { data: assignment, error: assignmentError } = await supabase
    .from("patient_assignments")
    .select("id, patient_id, therapist_id, status, start_date, end_date")
    .eq("id", assignmentId)
    .single()

  if (assignmentError || !assignment) {
    return NextResponse.json(
      { error: "Zuweisung nicht gefunden." },
      { status: 404 }
    )
  }

  // Only active assignments can receive new completions
  if (assignment.status !== "aktiv") {
    return NextResponse.json(
      { error: "Nur aktive Zuweisungen können als erledigt markiert werden." },
      { status: 409 }
    )
  }

  // BUG-3 FIX: patient_id is always taken from the assignment record — never from the body.
  // This prevents any client-side manipulation of who gets the completion attributed to.
  const patient_id = assignment.patient_id

  // Authorization: must be the patient, the therapist who owns the assignment, or admin
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const isAdmin = profile?.role === "admin"
  const isTherapist = assignment.therapist_id === user.id

  // BUG-1 FIX (PROJ-11): assignment.patient_id is the clinic UUID (patients.id), not the
  // auth UUID (auth.users.id). These are different. We look up patients.user_id = auth.uid()
  // to check if the logged-in user is the patient who owns this assignment.
  const { data: patientRecord } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .eq("id", patient_id)
    .maybeSingle()
  const isPatient = !!patientRecord

  if (!isAdmin && !isTherapist && !isPatient) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  // Completed date must be within the assignment window
  if (
    resolvedDate < assignment.start_date ||
    resolvedDate > assignment.end_date
  ) {
    return NextResponse.json(
      {
        error: `Das Datum muss zwischen ${assignment.start_date} und ${assignment.end_date} liegen.`,
      },
      { status: 422 }
    )
  }

  // Validate unit_id if provided: must belong to the assignment's plan
  if (unit_id && unit_id !== null) {
    if (!UUID_REGEX.test(unit_id)) {
      return NextResponse.json(
        { error: "Ungültige Einheiten-ID." },
        { status: 400 }
      )
    }

    const { data: unit, error: unitError } = await supabase
      .from("plan_units")
      .select("id, plan_id")
      .eq("id", unit_id)
      .single()

    if (unitError || !unit) {
      return NextResponse.json(
        { error: "Trainingseinheit nicht gefunden." },
        { status: 404 }
      )
    }
  }

  // Insert completion — DB unique constraint prevents duplicate (assignment, date)
  const { data: created, error: insertError } = await supabase
    .from("assignment_completions")
    .insert({
      assignment_id: assignmentId,
      unit_id: unit_id ?? null,
      patient_id,
      completed_date: resolvedDate,
      completed_at: new Date().toISOString(),
    })
    .select(
      "id, assignment_id, unit_id, patient_id, completed_date, completed_at"
    )
    .single()

  if (insertError) {
    // Unique constraint violation = already marked done for this day
    if (
      insertError.code === "23505" ||
      insertError.message?.includes("uq_completion_per_day")
    ) {
      return NextResponse.json(
        {
          error: "Diese Trainingseinheit wurde für dieses Datum bereits als erledigt markiert.",
        },
        { status: 409 }
      )
    }

    console.error(
      "[POST /api/assignments/[id]/completions] Supabase error:",
      insertError
    )
    return NextResponse.json(
      { error: "Erledigung konnte nicht gespeichert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ completion: created }, { status: 201 })
}

// ── GET /api/assignments/[id]/completions ─────────────────────────────────────
// Returns all completions for an assignment (used for progress display).

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: assignmentId } = await params
  const supabase = await createSupabaseServerClient()

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

  if (!UUID_REGEX.test(assignmentId)) {
    return NextResponse.json({ error: "Ungültige Zuweisungs-ID." }, { status: 400 })
  }

  // Verify assignment exists and is accessible (RLS handles ownership)
  const { data: assignment, error: assignmentError } = await supabase
    .from("patient_assignments")
    .select("id, patient_id, therapist_id")
    .eq("id", assignmentId)
    .single()

  if (assignmentError || !assignment) {
    return NextResponse.json(
      { error: "Zuweisung nicht gefunden oder keine Berechtigung." },
      { status: 404 }
    )
  }

  const { data: completions, error: fetchError } = await supabase
    .from("assignment_completions")
    .select("id, assignment_id, unit_id, patient_id, completed_date, completed_at")
    .eq("assignment_id", assignmentId)
    .order("completed_date", { ascending: false })
    .limit(366) // max 1 per day, capped at 1 year

  if (fetchError) {
    console.error(
      "[GET /api/assignments/[id]/completions] Supabase error:",
      fetchError
    )
    return NextResponse.json(
      { error: "Erledigungen konnten nicht geladen werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ completions: completions ?? [] })
}
