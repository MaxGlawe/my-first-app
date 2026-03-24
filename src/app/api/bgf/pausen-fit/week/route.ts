/**
 * PROJ-18: GET /api/bgf/pausen-fit/week
 * Returns this week's session stats (Mon-Sun) + streak count.
 * Days with no sessions and no check-in are treated as rest days (Ruhetag)
 * and don't break the streak.
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const sc = createSupabaseServiceClient()

  // Calculate Monday of this week
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))
  const mondayStr = monday.toISOString().split("T")[0]

  // Sunday
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const sundayStr = sunday.toISOString().split("T")[0]

  // Fetch this week's sessions (Mon-Sun)
  const { data: weekData, error } = await sc
    .from("pausen_fit_sessions")
    .select("geplant_um, status")
    .eq("user_id", user.id)
    .gte("geplant_um", `${mondayStr}T00:00:00`)
    .lte("geplant_um", `${sundayStr}T23:59:59`)
    .order("geplant_um", { ascending: true })

  if (error) {
    console.error("[GET /api/bgf/pausen-fit/week] error:", error)
    return NextResponse.json({ error: "Fehler." }, { status: 500 })
  }

  // Fetch this week's check-ins (to know which days the user was active vs rest)
  const { data: checkins } = await sc
    .from("bgf_daily_checkins")
    .select("datum, arbeitstag_typ")
    .eq("user_id", user.id)
    .gte("datum", mondayStr)
    .lte("datum", sundayStr)

  const checkinByDate = new Map(
    (checkins ?? []).map((c) => [c.datum, c.arbeitstag_typ])
  )

  // Group sessions by date
  const days: Record<string, { completed: number; total: number; isRestDay: boolean }> = {}

  for (const session of weekData ?? []) {
    const date = session.geplant_um.split("T")[0]
    if (!days[date]) days[date] = { completed: 0, total: 0, isRestDay: false }
    days[date].total++
    if (session.status === "abgeschlossen") days[date].completed++
  }

  // Mark rest days: dates with no sessions AND either no check-in or check-in with "frei"
  // For past dates only (future dates are just not yet happened)
  const todayStr = today.toISOString().split("T")[0]
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = d.toISOString().split("T")[0]

    if (dateStr > todayStr) continue // Future — skip

    if (!days[dateStr]) {
      days[dateStr] = { completed: 0, total: 0, isRestDay: false }
    }

    const checkinType = checkinByDate.get(dateStr)
    const hasNoSessions = days[dateStr].total === 0
    const dow = d.getDay() // 0=Sun, 6=Sat
    const isWeekend = dow === 0 || dow === 6

    // Rest day if:
    // - Weekend (Sa/So) with no sessions → automatic rest day
    // - Weekday with explicit "frei" check-in → rest day
    // - Weekday with no check-in → NOT rest day (vergessen ≠ frei)
    if (hasNoSessions && (isWeekend || checkinType === "frei")) {
      days[dateStr].isRestDay = true
    }
  }

  // ── Streak calculation ─────────────────────────────────────────────
  // Consecutive days with at least 1 completed session.
  // Rest days (no check-in or "frei") don't break the streak.
  // Grace period for today (hasn't finished yet).

  // First, fetch last 60 days of sessions + check-ins for proper streak calc
  const sixtyDaysAgo = new Date(today)
  sixtyDaysAgo.setDate(today.getDate() - 60)
  const sixtyDaysAgoStr = sixtyDaysAgo.toISOString().split("T")[0]

  const [{ data: histSessions }, { data: histCheckins }] = await Promise.all([
    sc.from("pausen_fit_sessions")
      .select("geplant_um, status")
      .eq("user_id", user.id)
      .gte("geplant_um", `${sixtyDaysAgoStr}T00:00:00`)
      .eq("status", "abgeschlossen"),
    sc.from("bgf_daily_checkins")
      .select("datum, arbeitstag_typ")
      .eq("user_id", user.id)
      .gte("datum", sixtyDaysAgoStr),
  ])

  // Build sets for quick lookup
  const completedDates = new Set(
    (histSessions ?? []).map((s) => s.geplant_um.split("T")[0])
  )
  const allCheckins = new Map(
    (histCheckins ?? []).map((c) => [c.datum, c.arbeitstag_typ])
  )

  let streak = 0
  const checkDate = new Date(today)

  for (let i = 0; i < 60; i++) {
    const dateStr = checkDate.toISOString().split("T")[0]
    const hasCompleted = completedDates.has(dateStr)
    const checkinType = allCheckins.get(dateStr)
    const dow = checkDate.getDay() // 0=Sun, 6=Sat
    const isWeekend = dow === 0 || dow === 6

    // Rest day: weekend OR explicit "frei" check-in
    // Weekday without check-in = vergessen, NOT a rest day
    const isRestDay = !hasCompleted && (isWeekend || checkinType === "frei")

    if (hasCompleted) {
      streak++
    } else if (isRestDay) {
      // Rest day — don't break streak, don't count it
    } else if (i === 0) {
      // Today — grace period (day not over yet)
    } else {
      // Workday with no completed sessions — streak breaks
      break
    }

    checkDate.setDate(checkDate.getDate() - 1)
  }

  return NextResponse.json({ days, streak })
}
