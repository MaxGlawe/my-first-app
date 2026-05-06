/**
 * PROJ-16: Streak & Gamification
 * GET /api/me/streak — Returns streak, weekly goal, and achievements
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

// Local-date formatter — avoids the UTC drift that .toISOString() introduces
// for timezones east of UTC (e.g. Europe/Berlin), which silently shifts dates
// by one day for late-evening / early-morning local times.
function formatLocalDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

// ── Achievement Definitions ──────────────────────────────────────────────────

interface Achievement {
  id: string
  name: string
  description: string
  icon: string // emoji
  unlocked: boolean
  unlockedAt: string | null
  progress: number // 0-100
  target: number
  current: number
}

function computeAchievements(ctx: {
  totalCompletions: number
  currentStreak: number
  painEntries: { pain_level: number; entry_date: string }[]
  completedCourses: number
  consecutiveCompliantWeeks: number
}): Achievement[] {
  const { totalCompletions, currentStreak, painEntries, completedCourses, consecutiveCompliantWeeks } = ctx

  // Check if patient ever reached NRS 0
  const reachedPainFree = painEntries.some((e) => e.pain_level === 0)

  // Check-in streak: consecutive days with pain diary entries
  let checkInStreak = 0
  if (painEntries.length > 0) {
    const sortedDates = painEntries
      .map((e) => e.entry_date)
      .sort()
      .reverse()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const cursor = new Date(today)

    for (let i = 0; i < 30; i++) {
      const dateStr = formatLocalDate(cursor)
      if (sortedDates.includes(dateStr)) {
        checkInStreak++
      } else if (i > 0) {
        break
      }
      cursor.setDate(cursor.getDate() - 1)
    }
  }

  const achievements: Achievement[] = [
    // ── Original Achievements ──
    {
      id: "first_step",
      name: "Erster Schritt",
      description: "Erste Trainingseinheit abgeschlossen",
      icon: "👟",
      unlocked: totalCompletions >= 1,
      unlockedAt: null,
      progress: Math.min(100, (totalCompletions / 1) * 100),
      target: 1,
      current: Math.min(1, totalCompletions),
    },
    {
      id: "week_warrior",
      name: "Wochenkämpfer",
      description: "7-Tage-Streak erreicht",
      icon: "🔥",
      unlocked: currentStreak >= 7,
      unlockedAt: null,
      progress: Math.min(100, (currentStreak / 7) * 100),
      target: 7,
      current: Math.min(7, currentStreak),
    },
    {
      id: "ten_sessions",
      name: "Ausdauer",
      description: "10 Einheiten abgeschlossen",
      icon: "💪",
      unlocked: totalCompletions >= 10,
      unlockedAt: null,
      progress: Math.min(100, (totalCompletions / 10) * 100),
      target: 10,
      current: Math.min(10, totalCompletions),
    },
    {
      id: "monthly_hero",
      name: "Monatlicher Held",
      description: "30 Einheiten abgeschlossen",
      icon: "🏆",
      unlocked: totalCompletions >= 30,
      unlockedAt: null,
      progress: Math.min(100, (totalCompletions / 30) * 100),
      target: 30,
      current: Math.min(30, totalCompletions),
    },
    {
      id: "check_in_streak",
      name: "Regelmäßig dabei",
      description: "7 Tage in Folge Check-in gemacht",
      icon: "📊",
      unlocked: checkInStreak >= 7,
      unlockedAt: null,
      progress: Math.min(100, (checkInStreak / 7) * 100),
      target: 7,
      current: Math.min(7, checkInStreak),
    },

    // ── New Achievements ──
    {
      id: "pain_free",
      name: "Schmerzfrei",
      description: "NRS 0 erreicht — keine Schmerzen!",
      icon: "🌟",
      unlocked: reachedPainFree,
      unlockedAt: null,
      progress: reachedPainFree ? 100 : 0,
      target: 1,
      current: reachedPainFree ? 1 : 0,
    },
    {
      id: "exercise_king",
      name: "Übungskönig",
      description: "50 Trainingseinheiten abgeschlossen",
      icon: "👑",
      unlocked: totalCompletions >= 50,
      unlockedAt: null,
      progress: Math.min(100, (totalCompletions / 50) * 100),
      target: 50,
      current: Math.min(50, totalCompletions),
    },
    {
      id: "endurance_30",
      name: "Durchhalter",
      description: "30-Tage-Streak erreicht",
      icon: "🔥",
      unlocked: currentStreak >= 30,
      unlockedAt: null,
      progress: Math.min(100, (currentStreak / 30) * 100),
      target: 30,
      current: Math.min(30, currentStreak),
    },
    {
      id: "consistent",
      name: "Fleißig",
      description: "4 Wochen in Folge mindestens 80% Compliance",
      icon: "📈",
      unlocked: consecutiveCompliantWeeks >= 4,
      unlockedAt: null,
      progress: Math.min(100, (consecutiveCompliantWeeks / 4) * 100),
      target: 4,
      current: Math.min(4, consecutiveCompliantWeeks),
    },
    {
      id: "knowledge",
      name: "Wissensdurst",
      description: "Einen kompletten Kurs abgeschlossen",
      icon: "🎓",
      unlocked: completedCourses >= 1,
      unlockedAt: null,
      progress: completedCourses >= 1 ? 100 : 0,
      target: 1,
      current: Math.min(1, completedCourses),
    },
  ]

  return achievements
}

// ── GET /api/me/streak ──────────────────────────────────────────────────────

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Find patient record
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!patient) {
    return NextResponse.json(
      { error: "Kein Patienten-Profil gefunden." },
      { status: 404 }
    )
  }

  // Get all completions for streak calculation
  const { data: completions } = await supabase
    .from("assignment_completions")
    .select("completed_date")
    .eq("patient_id", patient.id)
    .order("completed_date", { ascending: false })

  const completionDates = (completions ?? []).map((c) => c.completed_date as string)
  const uniqueDates = [...new Set(completionDates)].sort().reverse()

  // Need active assignments to know which days are planned training days vs rest days
  const { data: streakAssignments } = await supabase
    .from("patient_assignments")
    .select("active_days, start_date, end_date")
    .eq("patient_id", patient.id)
    .eq("status", "aktiv")

  const DOW_CODES: Record<number, string> = {
    1: "mo", 2: "di", 3: "mi", 4: "do", 5: "fr", 6: "sa", 0: "so",
  }

  // Helper: is the given date a planned training day in any active assignment?
  function isPlannedDay(date: Date, dateStr: string): boolean {
    if (!streakAssignments || streakAssignments.length === 0) return false
    const dowCode = DOW_CODES[date.getDay()]
    for (const a of streakAssignments) {
      if (dateStr < a.start_date || dateStr > a.end_date) continue
      if ((a.active_days as string[]).includes(dowCode)) return true
    }
    return false
  }

  // Calculate current streak: consecutive *planned* training days completed.
  // Rest days (e.g. Tue/Thu when plan is Mo/Wed/Fri) are skipped — they
  // neither extend nor break the streak.
  // Today is special: if today is a planned day and not yet completed,
  // we tolerate it (streak doesn't break before the day is "over").
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = formatLocalDate(today)
  const cursor = new Date(today)

  for (let i = 0; i < 365; i++) {
    const dateStr = formatLocalDate(cursor)
    const planned = isPlannedDay(cursor, dateStr)
    const completed = uniqueDates.includes(dateStr)

    if (planned) {
      if (completed) {
        streak++
      } else if (i === 0 && dateStr === todayStr) {
        // Today's training not yet done — don't break the streak yet
      } else {
        break
      }
    }
    // Rest days: skip silently
    cursor.setDate(cursor.getDate() - 1)
  }

  // Weekly goal: how many training sessions are planned vs completed this week
  const { data: assignments } = await supabase
    .from("patient_assignments")
    .select("active_days, start_date, end_date")
    .eq("patient_id", patient.id)
    .eq("status", "aktiv")

  const DOW_MAP: Record<number, string> = {
    1: "mo", 2: "di", 3: "mi", 4: "do", 5: "fr", 6: "sa", 0: "so",
  }

  // Calculate this week's planned training days (Mon-Sun)
  const mondayOfWeek = new Date(today)
  const dayOfWeek = today.getDay()
  mondayOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

  let weeklyGoal = 0
  let weeklyDone = 0

  if (assignments) {
    const weekDays: string[] = []
    for (let d = 0; d < 7; d++) {
      const day = new Date(mondayOfWeek)
      day.setDate(mondayOfWeek.getDate() + d)
      const dateStr = formatLocalDate(day)
      const dowCode = DOW_MAP[day.getDay()]

      for (const a of assignments) {
        if (dateStr < a.start_date || dateStr > a.end_date) continue
        if ((a.active_days as string[]).includes(dowCode)) {
          if (!weekDays.includes(dateStr)) {
            weekDays.push(dateStr)
            weeklyGoal++
          }
        }
      }
    }

    // Count completions this week
    const weekStart = formatLocalDate(mondayOfWeek)
    const weekEnd = new Date(mondayOfWeek)
    weekEnd.setDate(mondayOfWeek.getDate() + 6)
    const weekEndStr = formatLocalDate(weekEnd)

    weeklyDone = uniqueDates.filter(
      (d) => d >= weekStart && d <= weekEndStr
    ).length
  }

  // Total completions for achievements
  const totalCompletions = uniqueDates.length

  // Pain diary entries for check-in achievement + pain-free check
  const { data: painEntries } = await supabase
    .from("pain_diary_entries")
    .select("pain_level, entry_date")
    .eq("patient_id", patient.id)
    .order("entry_date", { ascending: false })
    .limit(90)

  // Completed courses for Wissensdurst achievement
  const { count: completedCourses } = await supabase
    .from("course_enrollments")
    .select("id", { count: "exact", head: true })
    .eq("patient_id", patient.id)
    .eq("status", "abgeschlossen")

  // Calculate consecutive compliant weeks (for "Fleißig" achievement)
  // Look back 8 weeks and count consecutive weeks with ≥80% compliance
  let consecutiveCompliantWeeks = 0
  if (assignments && assignments.length > 0) {
    const eightWeeksAgo = new Date(mondayOfWeek)
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 7 * 7) // go back 7 more weeks

    for (let w = 0; w < 8; w++) {
      const weekStart = new Date(mondayOfWeek)
      weekStart.setDate(weekStart.getDate() - w * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      let planned = 0
      let done = 0
      for (let d = 0; d < 7; d++) {
        const day = new Date(weekStart)
        day.setDate(weekStart.getDate() + d)
        const dateStr = formatLocalDate(day)
        const dowCode = DOW_MAP[day.getDay()]

        let isPlanned = false
        for (const a of assignments) {
          if (dateStr < a.start_date || dateStr > a.end_date) continue
          if ((a.active_days as string[]).includes(dowCode)) {
            isPlanned = true
            break
          }
        }
        if (isPlanned) {
          planned++
          if (uniqueDates.includes(dateStr)) done++
        }
      }

      const compliance = planned > 0 ? done / planned : 0
      if (compliance >= 0.8 && planned > 0) {
        consecutiveCompliantWeeks++
      } else {
        break // streak of compliant weeks broken
      }
    }
  }

  const achievements = computeAchievements({
    totalCompletions,
    currentStreak: streak,
    painEntries: (painEntries ?? []) as { pain_level: number; entry_date: string }[],
    completedCourses: completedCourses ?? 0,
    consecutiveCompliantWeeks,
  })

  return NextResponse.json({
    streak,
    weeklyGoal,
    weeklyDone,
    totalCompletions,
    achievements,
  })
}
