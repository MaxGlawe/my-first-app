/**
 * PROJ-10: Hausaufgaben-Zuweisung
 * GET /api/hausaufgaben/dashboard
 *
 * Returns a compliance overview of all patients that belong to the
 * authenticated therapist and have at least one patient_assignment.
 *
 * Response shape:
 * {
 *   rows: PatientComplianceRow[]  — one row per patient with any assignment
 * }
 *
 * Access: Therapist (own patients) + Admin
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

// ── Day-of-week helper (mirrors the logic in assignments/route.ts) ─────────────

const DOW_MAP: Record<number, string> = {
  1: "mo",
  2: "di",
  3: "mi",
  4: "do",
  5: "fr",
  6: "sa",
  0: "so",
}

/**
 * For a given assignment, count how many days in the last 7 calendar days
 * (including today) were scheduled training days within the assignment window.
 */
function expectedIn7Days(
  activeDays: string[],
  startDate: string,
  endDate: string
): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)

  const windowStart = new Date(
    Math.max(sevenDaysAgo.getTime(), new Date(startDate).getTime())
  )
  const windowEnd = new Date(
    Math.min(today.getTime(), new Date(endDate).getTime())
  )

  if (windowEnd < windowStart) return 0

  let count = 0
  const cursor = new Date(windowStart)
  while (cursor <= windowEnd) {
    if (activeDays.includes(DOW_MAP[cursor.getDay()])) count++
    cursor.setDate(cursor.getDate() + 1)
  }
  return count
}

// ── GET /api/hausaufgaben/dashboard ──────────────────────────────────────────

export async function GET(_request: NextRequest) {
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

  // Auto-expire stale assignments for this therapist before reading dashboard
  await supabase
    .from("patient_assignments")
    .update({ status: "abgelaufen" })
    .eq("therapist_id", user.id)
    .eq("status", "aktiv")
    .lt("end_date", new Date().toISOString().split("T")[0])

  // Fetch all active assignments belonging to this therapist, joined with patient info
  const { data: assignments, error: assignmentsError } = await supabase
    .from("patient_assignments")
    .select(`
      id,
      patient_id,
      start_date,
      end_date,
      active_days,
      status,
      patients!inner (
        id,
        vorname,
        nachname,
        avatar_url
      )
    `)
    .eq("therapist_id", user.id)
    .order("created_at", { ascending: false })
    .limit(500)

  if (assignmentsError) {
    console.error("[GET /api/hausaufgaben/dashboard] assignments error:", assignmentsError)
    return NextResponse.json(
      { error: "Dashboard-Daten konnten nicht geladen werden." },
      { status: 500 }
    )
  }

  if (!assignments || assignments.length === 0) {
    return NextResponse.json({ rows: [] })
  }

  // Collect unique patient IDs (across all assignments — not just aktiv)
  const patientMap = new Map<
    string,
    { name: string; avatar_url: string | null }
  >()
  const activeAssignmentIds: string[] = []

  for (const a of assignments) {
    const patient = a.patients as unknown as {
      id: string
      vorname: string
      nachname: string
      avatar_url: string | null
    } | null

    if (!patient) continue

    if (!patientMap.has(a.patient_id)) {
      patientMap.set(a.patient_id, {
        name: `${patient.vorname} ${patient.nachname}`.trim(),
        avatar_url: patient.avatar_url ?? null,
      })
    }

    if (a.status === "aktiv") {
      activeAssignmentIds.push(a.id)
    }
  }

  // Fetch completions for all active assignments over the last 7 days
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)
  const todayStr = today.toISOString().split("T")[0]
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0]

  let completions: Array<{ assignment_id: string; completed_date: string }> = []

  if (activeAssignmentIds.length > 0) {
    const { data: completionRows, error: completionsError } = await supabase
      .from("assignment_completions")
      .select("assignment_id, completed_date")
      .in("assignment_id", activeAssignmentIds)
      .gte("completed_date", sevenDaysAgoStr)
      .lte("completed_date", todayStr)

    if (completionsError) {
      console.error(
        "[GET /api/hausaufgaben/dashboard] completions error:",
        completionsError
      )
      // Non-fatal — return 0% compliance rather than error
    } else {
      completions = completionRows ?? []
    }
  }

  // Group completions by assignment_id
  const completionsByAssignment = new Map<string, Set<string>>()
  for (const c of completions) {
    if (!completionsByAssignment.has(c.assignment_id)) {
      completionsByAssignment.set(c.assignment_id, new Set())
    }
    completionsByAssignment.get(c.assignment_id)!.add(c.completed_date)
  }

  // Build per-patient aggregations
  // For each patient: count active plans, check trained_today, calculate 7-day compliance
  const patientAggregations = new Map<
    string,
    {
      activeCount: number
      trainedToday: boolean
      totalExpected: number
      totalDone: number
    }
  >()

  // Include all patients who appear in any assignment
  for (const patientId of patientMap.keys()) {
    patientAggregations.set(patientId, {
      activeCount: 0,
      trainedToday: false,
      totalExpected: 0,
      totalDone: 0,
    })
  }

  for (const a of assignments) {
    if (a.status !== "aktiv") continue

    const agg = patientAggregations.get(a.patient_id)
    if (!agg) continue

    agg.activeCount++

    const activeDays = (a.active_days as string[]) ?? []
    const expected = expectedIn7Days(activeDays, a.start_date, a.end_date)
    agg.totalExpected += expected

    const done = completionsByAssignment.get(a.id) ?? new Set<string>()
    agg.totalDone += done.size

    // Check if patient trained today for this assignment
    if (done.has(todayStr)) {
      agg.trainedToday = true
    }
  }

  // Build response rows — include all patients that have any assignment
  const rows = []
  for (const [patientId, info] of patientMap.entries()) {
    const agg = patientAggregations.get(patientId)!

    const compliance7days =
      agg.totalExpected > 0
        ? Math.min(100, Math.round((agg.totalDone / agg.totalExpected) * 100))
        : 0

    rows.push({
      patient_id: patientId,
      patient_name: info.name,
      avatar_url: info.avatar_url,
      active_plans_count: agg.activeCount,
      trained_today: agg.trainedToday,
      compliance_7days: compliance7days,
    })
  }

  // Sort: patients with active plans first, then by patient name
  rows.sort((a, b) => {
    if (b.active_plans_count !== a.active_plans_count) {
      return b.active_plans_count - a.active_plans_count
    }
    return a.patient_name.localeCompare(b.patient_name, "de")
  })

  return NextResponse.json({ rows })
}
