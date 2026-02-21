/**
 * PROJ-11: GET /api/me/assignments
 * Returns all active assignments for the currently logged-in patient.
 * Includes full training plan structure (phases, units, exercises) for use
 * in the Patienten-App training session view.
 *
 * Bridge: patients.user_id = auth.uid() (with email fallback)
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

// Helper: compute day-of-week code from a JS Date
const DOW_MAP: Record<number, string> = {
  1: "mo",
  2: "di",
  3: "mi",
  4: "do",
  5: "fr",
  6: "sa",
  0: "so",
}

function todayCode(): string {
  return DOW_MAP[new Date().getDay()]
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0]
}

function computeCompliance7Days(
  activeDays: string[],
  startDate: string,
  endDate: string,
  completedDates: string[]
): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)

  const windowStart = new Date(Math.max(sevenDaysAgo.getTime(), new Date(startDate).getTime()))
  const windowEnd = new Date(Math.min(today.getTime(), new Date(endDate).getTime()))

  if (windowEnd < windowStart) return 0

  let expected = 0
  const cursor = new Date(windowStart)
  while (cursor <= windowEnd) {
    if (activeDays.includes(DOW_MAP[cursor.getDay()])) expected++
    cursor.setDate(cursor.getDate() + 1)
  }
  if (expected === 0) return 0

  const wsStr = windowStart.toISOString().split("T")[0]
  const weStr = windowEnd.toISOString().split("T")[0]
  const done = completedDates.filter((d) => d >= wsStr && d <= weStr).length
  return Math.min(100, Math.round((done / expected) * 100))
}

function findNextTrainingDay(activeDays: string[], endDate: string): string | null {
  const cursor = new Date()
  cursor.setDate(cursor.getDate() + 1) // start from tomorrow
  const end = new Date(endDate)
  for (let i = 0; i < 14; i++) {
    if (cursor > end) break
    if (activeDays.includes(DOW_MAP[cursor.getDay()])) {
      return cursor.toISOString().split("T")[0]
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return null
}

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Find the patient record (user_id bridge, with email fallback)
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
    return NextResponse.json({ assignments: [], patientId: null })
  }

  const patientId = patient.id
  const today = todayStr()
  const todayDayCode = todayCode()

  // Auto-expire overdue active assignments (fire-and-forget)
  void supabase
    .from("patient_assignments")
    .update({ status: "abgelaufen" })
    .eq("patient_id", patientId)
    .eq("status", "aktiv")
    .lt("end_date", today)

  // Fetch all assignments
  const { data: rows, error: fetchError } = await supabase
    .from("patient_assignments")
    .select(`
      id,
      patient_id,
      plan_id,
      therapist_id,
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
        id,
        name,
        beschreibung,
        plan_phases (
          id,
          name,
          dauer_wochen,
          order,
          plan_units (
            id,
            name,
            order,
            plan_exercises (
              id,
              unit_id,
              exercise_id,
              order,
              params,
              is_archived_exercise,
              exercises (
                id,
                name,
                beschreibung,
                ausfuehrung,
                muskelgruppen,
                media_url,
                media_type
              )
            )
          )
        )
      )
    `)
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(50)

  if (fetchError) {
    console.error("[GET /api/me/assignments] Supabase error:", fetchError)
    return NextResponse.json(
      { error: "Zuweisungen konnten nicht geladen werden." },
      { status: 500 }
    )
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json({ assignments: [], patientId })
  }

  // Fetch completions for all assignments
  const assignmentIds = rows.map((r) => r.id)
  const { data: completions } = await supabase
    .from("assignment_completions")
    .select("assignment_id, completed_date")
    .in("assignment_id", assignmentIds)
    .order("completed_date", { ascending: false })
    .limit(1000)

  const completionsByAssignment: Record<string, string[]> = {}
  for (const c of completions ?? []) {
    if (!completionsByAssignment[c.assignment_id]) {
      completionsByAssignment[c.assignment_id] = []
    }
    completionsByAssignment[c.assignment_id].push(c.completed_date)
  }

  // Enrich ad-hoc exercises with media data from the exercises table
  const adhocExerciseIds = new Set<string>()
  for (const row of rows) {
    if (!row.plan_id && Array.isArray(row.adhoc_exercises)) {
      for (const ae of row.adhoc_exercises as Array<{ exercise_id: string }>) {
        if (ae.exercise_id) adhocExerciseIds.add(ae.exercise_id)
      }
    }
  }

  let exerciseMediaMap: Record<string, { media_url: string | null; media_type: string | null; beschreibung: string | null; ausfuehrung: unknown; muskelgruppen: string[] }> = {}
  if (adhocExerciseIds.size > 0) {
    const { data: exerciseRows } = await supabase
      .from("exercises")
      .select("id, media_url, media_type, beschreibung, ausfuehrung, muskelgruppen")
      .in("id", Array.from(adhocExerciseIds))
    for (const ex of exerciseRows ?? []) {
      exerciseMediaMap[ex.id] = {
        media_url: ex.media_url,
        media_type: ex.media_type,
        beschreibung: ex.beschreibung,
        ausfuehrung: ex.ausfuehrung,
        muskelgruppen: ex.muskelgruppen,
      }
    }
  }

  // Build enriched assignments
  const assignments = rows.map((row) => {
    const activeDays = (row.active_days as string[]) ?? []
    const completedDates = completionsByAssignment[row.id] ?? []
    const plan = row.training_plans as unknown as {
      id: string
      name: string
      beschreibung: string | null
      plan_phases: Array<{
        id: string
        name: string
        dauer_wochen: number
        order: number
        plan_units: Array<{
          id: string
          name: string
          order: number
          plan_exercises: Array<{
            id: string
            unit_id: string
            exercise_id: string
            order: number
            params: Record<string, unknown>
            is_archived_exercise: boolean
            exercises: {
              id: string
              name: string
              beschreibung: string | null
              ausfuehrung: Array<{ nummer: number; beschreibung: string }> | null
              muskelgruppen: string[]
              media_url: string | null
              media_type: "image" | "video" | null
            } | null
          }>
        }>
      }>
    } | null

    const isTrainingToday =
      activeDays.includes(todayDayCode) &&
      row.start_date <= today &&
      row.end_date >= today

    const completedToday = completedDates.includes(today)

    const nextTrainingDay =
      !isTrainingToday || completedToday
        ? findNextTrainingDay(activeDays, row.end_date)
        : null

    return {
      id: row.id,
      patient_id: row.patient_id,
      plan_id: row.plan_id,
      therapist_id: row.therapist_id,
      start_date: row.start_date,
      end_date: row.end_date,
      active_days: activeDays,
      status: row.status,
      adhoc_exercises: Array.isArray(row.adhoc_exercises)
        ? (row.adhoc_exercises as Array<Record<string, unknown>>).map((ae) => {
            const media = exerciseMediaMap[ae.exercise_id as string]
            return {
              ...ae,
              media_url: media?.media_url ?? null,
              media_type: media?.media_type ?? null,
              beschreibung: media?.beschreibung ?? (ae.anmerkung as string | null) ?? null,
              ausfuehrung: media?.ausfuehrung ?? null,
              muskelgruppen: media?.muskelgruppen ?? [],
            }
          })
        : null,
      notiz: row.notiz ?? null,
      hauptproblem: row.hauptproblem ?? null,
      created_at: row.created_at,
      updated_at: row.updated_at,
      // Joined plan data
      plan_name: plan?.name ?? null,
      plan_beschreibung: plan?.beschreibung ?? null,
      plan: plan ?? null,
      // Computed
      compliance_7days: computeCompliance7Days(
        activeDays,
        row.start_date,
        row.end_date,
        completedDates
      ),
      completion_count: completedDates.length,
      expected_count: (() => {
        const end = new Date(Math.min(new Date().getTime(), new Date(row.end_date).getTime()))
        const start = new Date(row.start_date)
        let count = 0
        const cursor = new Date(start)
        while (cursor <= end) {
          if (activeDays.includes(DOW_MAP[cursor.getDay()])) count++
          cursor.setDate(cursor.getDate() + 1)
        }
        return count
      })(),
      completed_dates: completedDates,
      is_training_today: isTrainingToday,
      completed_today: completedToday,
      next_training_day: nextTrainingDay,
    }
  })

  return NextResponse.json({ assignments, patientId })
}
