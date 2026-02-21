/**
 * PROJ-16: Streak & Gamification
 * GET /api/me/streak — Returns streak, weekly goal, and achievements
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

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

function computeAchievements(
  totalCompletions: number,
  currentStreak: number,
  painEntries: { pain_level: number; entry_date: string }[]
): Achievement[] {
  const achievements: Achievement[] = [
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
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      target: 7,
      current: 0,
    },
  ]

  // Check-in streak: consecutive days with pain diary entries
  if (painEntries.length > 0) {
    const sortedDates = painEntries
      .map((e) => e.entry_date)
      .sort()
      .reverse()
    let checkInStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const cursor = new Date(today)

    for (let i = 0; i < 30; i++) {
      const dateStr = cursor.toISOString().split("T")[0]
      if (sortedDates.includes(dateStr)) {
        checkInStreak++
      } else if (i > 0) {
        break // streak broken
      }
      cursor.setDate(cursor.getDate() - 1)
    }

    const checkInAch = achievements.find((a) => a.id === "check_in_streak")
    if (checkInAch) {
      checkInAch.current = Math.min(7, checkInStreak)
      checkInAch.progress = Math.min(100, (checkInStreak / 7) * 100)
      checkInAch.unlocked = checkInStreak >= 7
    }
  }

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

  // Calculate current streak (consecutive days from today going backwards)
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const cursor = new Date(today)

  for (let i = 0; i < 365; i++) {
    const dateStr = cursor.toISOString().split("T")[0]
    if (uniqueDates.includes(dateStr)) {
      streak++
    } else if (i > 0) {
      break
    }
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
      const dateStr = day.toISOString().split("T")[0]
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
    const weekStart = mondayOfWeek.toISOString().split("T")[0]
    const weekEnd = new Date(mondayOfWeek)
    weekEnd.setDate(mondayOfWeek.getDate() + 6)
    const weekEndStr = weekEnd.toISOString().split("T")[0]

    weeklyDone = uniqueDates.filter(
      (d) => d >= weekStart && d <= weekEndStr
    ).length
  }

  // Total completions for achievements
  const totalCompletions = uniqueDates.length

  // Pain diary entries for check-in achievement
  const { data: painEntries } = await supabase
    .from("pain_diary_entries")
    .select("pain_level, entry_date")
    .eq("patient_id", patient.id)
    .order("entry_date", { ascending: false })
    .limit(30)

  const achievements = computeAchievements(
    totalCompletions,
    streak,
    (painEntries ?? []) as { pain_level: number; entry_date: string }[]
  )

  return NextResponse.json({
    streak,
    weeklyGoal,
    weeklyDone,
    totalCompletions,
    achievements,
  })
}
