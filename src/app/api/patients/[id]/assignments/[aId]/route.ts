/**
 * PROJ-10: Hausaufgaben-Zuweisung
 * GET    /api/patients/[id]/assignments/[aId]  — Einzelne Zuweisung laden
 * PUT    /api/patients/[id]/assignments/[aId]  — Zuweisung bearbeiten
 * DELETE /api/patients/[id]/assignments/[aId]  — Zuweisung deaktivieren (soft)
 *
 * Access: Therapist (own assignments) + Admin
 * RLS: Enforced at DB level
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

// ── Constants ─────────────────────────────────────────────────────────────────

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const VALID_WOCHENTAGE = ["mo", "di", "mi", "do", "fr", "sa", "so"] as const

// ── Zod schema for PUT body ───────────────────────────────────────────────────

const updateAssignmentSchema = z
  .object({
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Startdatum muss im Format YYYY-MM-DD sein.")
      .refine((d) => !isNaN(Date.parse(d)), "Ungültiges Startdatum."),

    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Enddatum muss im Format YYYY-MM-DD sein.")
      .refine((d) => !isNaN(Date.parse(d)), "Ungültiges Enddatum."),

    active_days: z
      .array(z.enum(VALID_WOCHENTAGE))
      .min(1, "Mindestens ein Trainingstag muss gewählt werden.")
      .max(7),

    notiz: z.string().max(1000).optional().nullable(),

    hauptproblem: z.string().min(2).max(200).optional().nullable(),
  })
  .refine((data) => data.start_date <= data.end_date, {
    message: "Das Startdatum muss vor oder gleich dem Enddatum sein.",
    path: ["end_date"],
  })

// ── Shared: verify assignment exists and belongs to current therapist ─────────

async function resolveAssignment(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  patientId: string,
  assignmentId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from("patient_assignments")
    .select("id, patient_id, therapist_id, status, plan_id")
    .eq("id", assignmentId)
    .eq("patient_id", patientId)
    .single()

  if (error || !data) {
    return { assignment: null, forbidden: false }
  }

  // Check ownership (admin bypass handled by RLS — if they got data, they have access)
  // We still want to return a meaningful 403 vs 404 for non-admin users
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", userId)
    .single()

  const isAdmin = profile?.role === "admin"

  if (data.therapist_id !== userId && !isAdmin) {
    return { assignment: null, forbidden: true }
  }

  return { assignment: data, forbidden: false }
}

// ── GET /api/patients/[id]/assignments/[aId] ─────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; aId: string }> }
) {
  const { id: patientId, aId: assignmentId } = await params
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

  if (!UUID_REGEX.test(patientId) || !UUID_REGEX.test(assignmentId)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 })
  }

  const { data: row, error: fetchError } = await supabase
    .from("patient_assignments")
    .select(`
      id, patient_id, therapist_id, plan_id, start_date, end_date,
      active_days, status, adhoc_exercises, notiz, hauptproblem, created_at, updated_at,
      training_plans!left (name, beschreibung)
    `)
    .eq("id", assignmentId)
    .eq("patient_id", patientId)
    .single()

  if (fetchError || !row) {
    return NextResponse.json(
      { error: "Zuweisung nicht gefunden oder keine Berechtigung." },
      { status: 404 }
    )
  }

  const plan = row.training_plans as unknown as
    | { name: string; beschreibung: string | null }
    | null

  return NextResponse.json({
    assignment: {
      id: row.id,
      patient_id: row.patient_id,
      therapist_id: row.therapist_id,
      plan_id: row.plan_id,
      start_date: row.start_date,
      end_date: row.end_date,
      active_days: row.active_days,
      status: row.status,
      adhoc_exercises: row.adhoc_exercises ?? null,
      notiz: row.notiz ?? null,
      hauptproblem: row.hauptproblem ?? null,
      created_at: row.created_at,
      updated_at: row.updated_at,
      plan_name: plan?.name ?? null,
      plan_beschreibung: plan?.beschreibung ?? null,
    },
  })
}

// ── PUT /api/patients/[id]/assignments/[aId] ─────────────────────────────────
// Allows updating: start_date, end_date, active_days, notiz.
// plan_id is intentionally immutable after creation (spec: Snapshot-Prinzip).

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; aId: string }> }
) {
  const { id: patientId, aId: assignmentId } = await params
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

  if (!UUID_REGEX.test(patientId) || !UUID_REGEX.test(assignmentId)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 })
  }

  const { assignment, forbidden } = await resolveAssignment(
    supabase,
    patientId,
    assignmentId,
    user.id
  )

  if (forbidden) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }
  if (!assignment) {
    return NextResponse.json(
      { error: "Zuweisung nicht gefunden." },
      { status: 404 }
    )
  }

  if (assignment.status === "deaktiviert") {
    return NextResponse.json(
      { error: "Deaktivierte Zuweisungen können nicht bearbeitet werden." },
      { status: 409 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = updateAssignmentSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Validierungsfehler.",
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 422 }
    )
  }

  const { start_date, end_date, active_days, notiz, hauptproblem } = parseResult.data

  // Determine correct status after date change:
  // If end_date is now in the past → mark as abgelaufen, else restore to aktiv
  const today = new Date().toISOString().split("T")[0]
  const newStatus = end_date < today ? "abgelaufen" : "aktiv"

  const { data: updated, error: updateError } = await supabase
    .from("patient_assignments")
    .update({
      start_date,
      end_date,
      active_days,
      notiz: notiz?.trim() || null,
      hauptproblem: hauptproblem !== undefined ? (hauptproblem?.trim() || null) : undefined,
      status: newStatus,
    })
    .eq("id", assignmentId)
    .select(
      "id, patient_id, therapist_id, plan_id, start_date, end_date, active_days, status, adhoc_exercises, notiz, hauptproblem, created_at, updated_at"
    )
    .single()

  if (updateError) {
    console.error(
      "[PUT /api/patients/[id]/assignments/[aId]] Supabase error:",
      updateError
    )
    return NextResponse.json(
      { error: "Zuweisung konnte nicht aktualisiert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ assignment: updated })
}

// ── DELETE /api/patients/[id]/assignments/[aId] ──────────────────────────────
// Soft-delete: sets status = 'deaktiviert'. No data is removed.

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; aId: string }> }
) {
  const { id: patientId, aId: assignmentId } = await params
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

  if (!UUID_REGEX.test(patientId) || !UUID_REGEX.test(assignmentId)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 })
  }

  const { assignment, forbidden } = await resolveAssignment(
    supabase,
    patientId,
    assignmentId,
    user.id
  )

  if (forbidden) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }
  if (!assignment) {
    return NextResponse.json(
      { error: "Zuweisung nicht gefunden." },
      { status: 404 }
    )
  }

  if (assignment.status === "deaktiviert") {
    return NextResponse.json(
      { error: "Zuweisung ist bereits deaktiviert." },
      { status: 409 }
    )
  }

  const { error: updateError } = await supabase
    .from("patient_assignments")
    .update({ status: "deaktiviert" })
    .eq("id", assignmentId)

  if (updateError) {
    console.error(
      "[DELETE /api/patients/[id]/assignments/[aId]] Supabase error:",
      updateError
    )
    return NextResponse.json(
      { error: "Zuweisung konnte nicht deaktiviert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
