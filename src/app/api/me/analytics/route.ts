/**
 * Patient Analytics API
 * GET /api/me/analytics?days=30
 * Aggregiert Daten aus pain_diary, patient_assignments und training_session_logs
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Find patient record
  let patientId: string | null = null
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (patient) {
    patientId = patient.id
  } else {
    const { data: patientByEmail } = await supabase
      .from("patients")
      .select("id")
      .eq("email", user.email)
      .single()
    patientId = patientByEmail?.id ?? null
  }

  if (!patientId) {
    return NextResponse.json({ error: "Kein Patient-Profil gefunden." }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const days = Math.min(parseInt(searchParams.get("days") ?? "30", 10) || 30, 365)

  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceStr = since.toISOString().split("T")[0]

  // Parallel queries
  const [painResult, assignmentsResult, logsResult] = await Promise.all([
    // Pain diary entries
    supabase
      .from("pain_diary_entries")
      .select("entry_date, pain_level, wellbeing, sleep_quality, stress_level, movement_restriction")
      .eq("patient_id", patientId)
      .gte("entry_date", sinceStr)
      .order("entry_date", { ascending: true })
      .limit(365),

    // Active assignments with completion data
    supabase
      .from("patient_assignments")
      .select("id, status, active_days, start_date, end_date")
      .eq("patient_id", patientId)
      .eq("status", "aktiv"),

    // Training session logs
    supabase
      .from("training_session_logs")
      .select("started_at, duration_seconds, overall_difficulty, overall_pain, exercise_logs")
      .eq("patient_id", patientId)
      .gte("started_at", since.toISOString())
      .order("started_at", { ascending: true })
      .limit(500),
  ])

  // Pain trend (daily)
  const painTrend = (painResult.data ?? []).map((entry) => ({
    date: entry.entry_date,
    pain: entry.pain_level,
    wellbeing: entry.wellbeing,
    sleep: entry.sleep_quality,
    stress: entry.stress_level,
    movement: entry.movement_restriction,
  }))

  // Weekly compliance calculation
  const assignments = assignmentsResult.data ?? []
  const completionCounts: Record<string, number> = {}
  const expectedCounts: Record<string, number> = {}

  // Get completions for active assignments
  for (const a of assignments) {
    const { data: completions } = await supabase
      .from("assignment_completions")
      .select("completed_date")
      .eq("assignment_id", a.id)
      .gte("completed_date", sinceStr)

    for (const c of completions ?? []) {
      // Group by ISO week
      const d = new Date(c.completed_date)
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - d.getDay() + 1)
      const weekKey = weekStart.toISOString().split("T")[0]
      completionCounts[weekKey] = (completionCounts[weekKey] ?? 0) + 1
    }

    // Calculate expected completions per week
    const activeDays = a.active_days ?? []
    const weeksInRange = Math.ceil(days / 7)
    for (let w = 0; w < weeksInRange; w++) {
      const weekDate = new Date(since)
      weekDate.setDate(since.getDate() + w * 7)
      const weekStart = new Date(weekDate)
      weekStart.setDate(weekDate.getDate() - weekDate.getDay() + 1)
      const weekKey = weekStart.toISOString().split("T")[0]
      expectedCounts[weekKey] = (expectedCounts[weekKey] ?? 0) + activeDays.length
    }
  }

  // Build weekly compliance array
  const allWeeks = [...new Set([...Object.keys(completionCounts), ...Object.keys(expectedCounts)])]
    .sort()
  const complianceWeekly = allWeeks.map((week) => {
    const done = completionCounts[week] ?? 0
    const expected = expectedCounts[week] ?? 1
    return {
      week,
      label: new Date(week).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
      compliance: Math.min(100, Math.round((done / Math.max(expected, 1)) * 100)),
      done,
      expected,
    }
  })

  // Training logs analysis
  const logs = logsResult.data ?? []
  const difficultyTrend = logs
    .filter((l) => l.overall_difficulty != null)
    .map((l) => ({
      date: new Date(l.started_at).toISOString().split("T")[0],
      difficulty: l.overall_difficulty as number,
      pain: l.overall_pain as number | null,
      duration: l.duration_seconds as number | null,
    }))

  // Overall stats
  const totalPainEntries = painTrend.length
  const avgPain = totalPainEntries > 0
    ? Math.round((painTrend.reduce((s, e) => s + e.pain, 0) / totalPainEntries) * 10) / 10
    : null
  const avgWellbeing = totalPainEntries > 0
    ? Math.round((painTrend.reduce((s, e) => s + e.wellbeing, 0) / totalPainEntries) * 10) / 10
    : null

  const totalSessions = logs.length
  const avgDifficulty = logs.filter((l) => l.overall_difficulty).length > 0
    ? Math.round(
        (logs.filter((l) => l.overall_difficulty).reduce((s, l) => s + (l.overall_difficulty ?? 0), 0) /
          logs.filter((l) => l.overall_difficulty).length) *
          10
      ) / 10
    : null

  const totalDuration = logs.reduce((s, l) => s + (l.duration_seconds ?? 0), 0)

  return NextResponse.json({
    painTrend,
    complianceWeekly,
    difficultyTrend,
    stats: {
      avgPain,
      avgWellbeing,
      totalSessions,
      avgDifficulty,
      totalDurationMinutes: Math.round(totalDuration / 60),
      totalPainEntries,
    },
    period: { days, since: sinceStr },
  })
}
