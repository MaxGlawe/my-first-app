/**
 * GET /api/os/dashboard-stats
 * Lightweight KPI endpoint for the Therapeuten-Dashboard.
 * Returns aggregated stats in a single request.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

// ── Day-of-week helper (same as hausaufgaben/dashboard) ─────────────────────

const DOW_MAP: Record<number, string> = {
  1: "mo", 2: "di", 3: "mi", 4: "do", 5: "fr", 6: "sa", 0: "so",
}

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

// ── GET ─────────────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Fetch user profile (via service client to bypass RLS)
  const { createSupabaseServiceClient } = await import("@/lib/supabase-service")
  const serviceClient = createSupabaseServiceClient()

  // Run queries in parallel
  const [profileResult, patientsResult, assignmentsResult, messagesResult] =
    await Promise.all([
      // 1. User profile for greeting
      serviceClient
        .from("user_profiles")
        .select("first_name")
        .eq("id", user.id)
        .single(),

      // 2. Patient count (non-archived)
      supabase
        .from("patients")
        .select("id", { count: "exact", head: true })
        .is("archived_at", null),

      // 3. Active assignments with completion data
      supabase
        .from("patient_assignments")
        .select(`
          id,
          patient_id,
          start_date,
          end_date,
          active_days,
          status
        `)
        .eq("therapist_id", user.id)
        .eq("status", "aktiv")
        .limit(500),

      // 4. Unread chat messages
      supabase
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .neq("sender_id", user.id)
        .is("read_at", null),
    ])

  const firstName = profileResult.data?.first_name ?? ""
  const patientCount = patientsResult.count ?? 0
  const activeAssignments = assignmentsResult.data?.length ?? 0

  // Calculate compliance + trained-today from assignments
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split("T")[0]
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0]

  let trainedTodayCount = 0
  let totalExpected = 0
  let totalDone = 0

  if (assignmentsResult.data && assignmentsResult.data.length > 0) {
    const assignmentIds = assignmentsResult.data.map((a) => a.id)

    const { data: completions } = await supabase
      .from("assignment_completions")
      .select("assignment_id, completed_date")
      .in("assignment_id", assignmentIds)
      .gte("completed_date", sevenDaysAgoStr)
      .lte("completed_date", todayStr)

    // Group completions by assignment
    const completionsByAssignment = new Map<string, Set<string>>()
    for (const c of completions ?? []) {
      if (!completionsByAssignment.has(c.assignment_id)) {
        completionsByAssignment.set(c.assignment_id, new Set())
      }
      completionsByAssignment.get(c.assignment_id)!.add(c.completed_date)
    }

    // Track which patients trained today
    const trainedTodayPatients = new Set<string>()

    for (const a of assignmentsResult.data) {
      const activeDays = (a.active_days as string[]) ?? []
      const expected = expectedIn7Days(activeDays, a.start_date, a.end_date)
      totalExpected += expected

      const done = completionsByAssignment.get(a.id) ?? new Set<string>()
      totalDone += done.size

      if (done.has(todayStr)) {
        trainedTodayPatients.add(a.patient_id)
      }
    }

    trainedTodayCount = trainedTodayPatients.size
  }

  const avgCompliance7d =
    totalExpected > 0
      ? Math.min(100, Math.round((totalDone / totalExpected) * 100))
      : 0

  return NextResponse.json({
    patientCount,
    activeAssignments,
    trainedTodayCount,
    avgCompliance7d,
    unreadMessages: messagesResult.count ?? 0,
    firstName,
  })
}
