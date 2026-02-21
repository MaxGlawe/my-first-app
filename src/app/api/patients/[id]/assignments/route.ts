/**
 * PROJ-10: Hausaufgaben-Zuweisung
 * GET  /api/patients/[id]/assignments  — Alle Zuweisungen eines Patienten
 * POST /api/patients/[id]/assignments  — Neue Zuweisung erstellen
 *
 * Access: Therapist (own patients) + Admin
 * RLS: Enforced at DB level (pa_select / pa_insert)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

// ── Constants ─────────────────────────────────────────────────────────────────

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const VALID_WOCHENTAGE = ["mo", "di", "mi", "do", "fr", "sa", "so"] as const

// ── Zod schema for ad-hoc exercise entry ─────────────────────────────────────

const adhocExerciseSchema = z.object({
  exercise_id: z.string().uuid("Ungültige Übungs-ID."),
  saetze: z.number().int().min(1).max(99),
  wiederholungen: z.number().int().min(1).max(999).nullable().optional(),
  dauer_sekunden: z.number().int().min(1).max(7200).nullable().optional(),
  pause_sekunden: z.number().int().min(0).max(3600),
  anmerkung: z.string().max(2000).nullable().optional(),
})

// ── Zod schema for POST body ──────────────────────────────────────────────────

const createAssignmentSchema = z
  .object({
    plan_id: z.string().uuid("Ungültige Plan-ID.").nullable().optional(),

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

    adhoc_exercises: z.array(adhocExerciseSchema).max(50).optional().nullable(),

    hauptproblem: z.string().min(2).max(200).optional().nullable(),
  })
  .refine((data) => data.start_date <= data.end_date, {
    message: "Das Startdatum muss vor oder gleich dem Enddatum sein.",
    path: ["end_date"],
  })
  .refine(
    (data) =>
      data.plan_id != null ||
      (data.adhoc_exercises != null && data.adhoc_exercises.length > 0),
    {
      message:
        "Entweder ein Trainingsplan oder mindestens eine Ad-hoc-Übung muss angegeben werden.",
      path: ["plan_id"],
    }
  )

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Calculate compliance rate for a single assignment over the last 7 days.
 * Returns a value between 0 and 100.
 */
function computeCompliance7Days(
  activeDays: string[],
  startDate: string,
  endDate: string,
  completedDates: string[]
): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6) // inclusive: today + 6 previous days

  const windowStart = new Date(Math.max(sevenDaysAgo.getTime(), new Date(startDate).getTime()))
  const windowEnd = new Date(Math.min(today.getTime(), new Date(endDate).getTime()))

  if (windowEnd < windowStart) return 0

  // Day-of-week number → weekday code (JS: 0=Sunday)
  const DOW_MAP: Record<number, string> = {
    1: "mo",
    2: "di",
    3: "mi",
    4: "do",
    5: "fr",
    6: "sa",
    0: "so",
  }

  let expected = 0
  const cursor = new Date(windowStart)
  while (cursor <= windowEnd) {
    const dayCode = DOW_MAP[cursor.getDay()]
    if (activeDays.includes(dayCode)) {
      expected++
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  if (expected === 0) return 0

  // Count completions within the window
  const windowStartStr = windowStart.toISOString().split("T")[0]
  const windowEndStr = windowEnd.toISOString().split("T")[0]
  const done = completedDates.filter(
    (d) => d >= windowStartStr && d <= windowEndStr
  ).length

  return Math.min(100, Math.round((done / expected) * 100))
}

/**
 * Count total expected sessions from start_date up to today (or end_date).
 */
function computeExpectedCount(
  activeDays: string[],
  startDate: string,
  endDate: string
): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const start = new Date(startDate)
  const end = new Date(Math.min(today.getTime(), new Date(endDate).getTime()))

  if (end < start) return 0

  const DOW_MAP: Record<number, string> = {
    1: "mo",
    2: "di",
    3: "mi",
    4: "do",
    5: "fr",
    6: "sa",
    0: "so",
  }

  let count = 0
  const cursor = new Date(start)
  while (cursor <= end) {
    if (activeDays.includes(DOW_MAP[cursor.getDay()])) {
      count++
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return count
}

// ── GET /api/patients/[id]/assignments ───────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params
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

  if (!UUID_REGEX.test(patientId)) {
    return NextResponse.json({ error: "Ungültige Patienten-ID." }, { status: 400 })
  }

  // Verify patient exists and is accessible via RLS
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id")
    .eq("id", patientId)
    .single()

  if (patientError || !patient) {
    return NextResponse.json(
      { error: "Patient nicht gefunden oder keine Berechtigung." },
      { status: 404 }
    )
  }

  // BUG-6 FIX: Auto-expire runs as fire-and-forget so GET stays effectively read-only
  // from the caller's perspective (no response delay from the write).
  void supabase
    .from("patient_assignments")
    .update({ status: "abgelaufen" })
    .eq("patient_id", patientId)
    .eq("status", "aktiv")
    .lt("end_date", new Date().toISOString().split("T")[0])

  // Fetch all assignments for this patient — newest first
  const { data: rows, error: fetchError } = await supabase
    .from("patient_assignments")
    .select(`
      id,
      patient_id,
      therapist_id,
      plan_id,
      start_date,
      end_date,
      active_days,
      status,
      adhoc_exercises,
      notiz,
      hauptproblem,
      created_at,
      updated_at,
      training_plans!left (
        name,
        beschreibung
      )
    `)
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(100)

  if (fetchError) {
    console.error("[GET /api/patients/[id]/assignments] Supabase error:", fetchError)
    return NextResponse.json(
      { error: "Hausaufgaben konnten nicht geladen werden." },
      { status: 500 }
    )
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json({ assignments: [] })
  }

  // Fetch all completions for these assignments in one query
  const assignmentIds = rows.map((r) => r.id)
  const { data: completions } = await supabase
    .from("assignment_completions")
    .select("assignment_id, completed_date")
    .in("assignment_id", assignmentIds)

  // Group completions by assignment_id
  const completionsByAssignment: Record<string, string[]> = {}
  for (const c of completions ?? []) {
    if (!completionsByAssignment[c.assignment_id]) {
      completionsByAssignment[c.assignment_id] = []
    }
    completionsByAssignment[c.assignment_id].push(c.completed_date)
  }

  // Build response
  const assignments = rows.map((row) => {
    const plan = row.training_plans as unknown as
      | { name: string; beschreibung: string | null }
      | null

    const completedDates = completionsByAssignment[row.id] ?? []
    const activeDays = (row.active_days as string[]) ?? []

    const compliance7days = computeCompliance7Days(
      activeDays,
      row.start_date,
      row.end_date,
      completedDates
    )
    const expectedCount = computeExpectedCount(
      activeDays,
      row.start_date,
      row.end_date
    )

    return {
      id: row.id,
      patient_id: row.patient_id,
      therapist_id: row.therapist_id,
      plan_id: row.plan_id,
      start_date: row.start_date,
      end_date: row.end_date,
      active_days: activeDays,
      status: row.status,
      adhoc_exercises: row.adhoc_exercises ?? null,
      notiz: row.notiz ?? null,
      hauptproblem: row.hauptproblem ?? null,
      created_at: row.created_at,
      updated_at: row.updated_at,
      // Joined
      plan_name: plan?.name ?? null,
      plan_beschreibung: plan?.beschreibung ?? null,
      // Computed
      compliance_7days: compliance7days,
      completion_count: completedDates.length,
      expected_count: expectedCount,
    }
  })

  return NextResponse.json({ assignments })
}

// ── POST /api/patients/[id]/assignments ──────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params
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

  if (!UUID_REGEX.test(patientId)) {
    return NextResponse.json({ error: "Ungültige Patienten-ID." }, { status: 400 })
  }

  // Verify patient accessible
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id")
    .eq("id", patientId)
    .single()

  if (patientError || !patient) {
    return NextResponse.json(
      { error: "Patient nicht gefunden oder keine Berechtigung." },
      { status: 404 }
    )
  }

  // Parse + validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = createAssignmentSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Validierungsfehler.",
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 422 }
    )
  }

  const { plan_id, start_date, end_date, active_days, notiz, adhoc_exercises, hauptproblem } =
    parseResult.data

  // If a plan_id is provided, verify it exists and is accessible
  if (plan_id) {
    const { data: plan, error: planError } = await supabase
      .from("training_plans")
      .select("id")
      .eq("id", plan_id)
      .eq("is_archived", false)
      .single()

    if (planError || !plan) {
      return NextResponse.json(
        { error: "Trainingsplan nicht gefunden oder nicht zugänglich." },
        { status: 404 }
      )
    }
  }

  // Insert the assignment — therapist_id always from authenticated user
  const { data: created, error: insertError } = await supabase
    .from("patient_assignments")
    .insert({
      patient_id: patientId,
      therapist_id: user.id,
      plan_id: plan_id ?? null,
      start_date,
      end_date,
      active_days,
      status: "aktiv",
      adhoc_exercises: adhoc_exercises ?? null,
      notiz: notiz?.trim() || null,
      hauptproblem: hauptproblem?.trim() || null,
    })
    .select(
      "id, patient_id, therapist_id, plan_id, start_date, end_date, active_days, status, adhoc_exercises, notiz, hauptproblem, created_at, updated_at"
    )
    .single()

  if (insertError) {
    console.error("[POST /api/patients/[id]/assignments] Supabase error:", insertError)
    return NextResponse.json(
      { error: "Zuweisung konnte nicht erstellt werden." },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      assignment: {
        ...created,
        plan_name: null,
        plan_beschreibung: null,
        compliance_7days: 0,
        completion_count: 0,
        expected_count: 0,
      },
    },
    { status: 201 }
  )
}
