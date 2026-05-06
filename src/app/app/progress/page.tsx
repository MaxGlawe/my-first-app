"use client"

/**
 * Progress Page — Premium Redesign
 * Trend-Charts, Compliance-Balken, Schwierigkeits-Trends, Achievements
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GlassCard } from "@/components/app/GlassCard"
import { AnimatedCounter } from "@/components/app/AnimatedCounter"
import { TrendChart } from "@/components/app/charts/TrendChart"
import { BarChart } from "@/components/app/charts/BarChart"
import {
  usePatientApp,
  getActiveAssignments,
} from "@/hooks/use-patient-app"
import type { PatientAppAssignment } from "@/hooks/use-patient-app"
import { useStreak } from "@/hooks/use-streak"
import { usePainDiary } from "@/hooks/use-pain-diary"
import type { Achievement } from "@/hooks/use-streak"
import {
  ArrowLeft,
  AlertTriangle,
  Flame,
  CheckCircle2,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react"

// ── Analytics Hook ────────────────────────────────────────────────────────────

interface AnalyticsData {
  painTrend: { date: string; pain: number; wellbeing: number }[]
  complianceWeekly: { week: string; label: string; compliance: number }[]
  difficultyTrend: { date: string; difficulty: number }[]
  stats: {
    avgPain: number | null
    avgWellbeing: number | null
    totalSessions: number
    avgDifficulty: number | null
    totalDurationMinutes: number
  }
}

function useAnalytics(days: number) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetch(`/api/me/analytics?days=${days}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json) setData(json)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [days])

  return { data, loading }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Local-date formatter — avoids the UTC drift that .toISOString() introduces
// for timezones east of UTC. Without this, completed days were shown as missed
// because the day-string mismatched the DB-stored local date.
function formatLocalDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function buildLast4WeeksDays(): Date[] {
  const days: Date[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(today.getDate() - 27)
  const cursor = new Date(start)
  while (cursor <= today) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

type DayStatus = "done" | "missed" | "none" | "future"

function getDayStatus(
  date: Date,
  assignments: PatientAppAssignment[]
): DayStatus {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (date > today) return "future"

  const dateStr = formatLocalDate(date)
  const DOW_MAP: Record<number, string> = {
    1: "mo", 2: "di", 3: "mi", 4: "do", 5: "fr", 6: "sa", 0: "so",
  }
  const dayCode = DOW_MAP[date.getDay()]

  let hadTraining = false
  let completed = false

  for (const a of assignments) {
    if (dateStr < a.start_date || dateStr > a.end_date) continue
    if (!(a.active_days as string[]).includes(dayCode)) continue
    hadTraining = true
    if ((a.completed_dates ?? []).includes(dateStr)) {
      completed = true
      break
    }
  }

  if (!hadTraining) return "none"
  if (completed) return "done"
  return "missed"
}

// ── Period Selector ──────────────────────────────────────────────────────────

function PeriodSelector({
  value,
  onChange,
}: {
  value: number
  onChange: (days: number) => void
}) {
  const options = [
    { label: "7T", days: 7 },
    { label: "30T", days: 30 },
    { label: "90T", days: 90 },
  ]

  return (
    <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
      {options.map((o) => (
        <button
          key={o.days}
          onClick={() => onChange(o.days)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            value === o.days
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ── CalendarGrid ──────────────────────────────────────────────────────────────

function CalendarGrid({ assignments }: { assignments: PatientAppAssignment[] }) {
  const days = buildLast4WeeksDays()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const firstDay = days[0]
  const dowFirst = firstDay.getDay()
  const paddingBefore = dowFirst === 0 ? 6 : dowFirst - 1

  const gridCells: (Date | null)[] = [
    ...Array<null>(paddingBefore).fill(null),
    ...days,
  ]
  const remainder = gridCells.length % 7
  if (remainder !== 0) {
    for (let i = 0; i < 7 - remainder; i++) gridCells.push(null)
  }

  const weeks: (Date | null)[][] = []
  for (let i = 0; i < gridCells.length; i += 7) {
    weeks.push(gridCells.slice(i, i + 7))
  }

  const DOW_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

  return (
    <GlassCard>
      <h2 className="text-sm font-semibold text-slate-700 mb-4">Trainings-Kalender</h2>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DOW_LABELS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-slate-400">
            {d}
          </div>
        ))}
      </div>

      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((day, di) => {
              if (!day) return <div key={di} className="aspect-square" />
              const status = getDayStatus(day, assignments)
              const isToday = day.getTime() === today.getTime()
              const dayNum = day.getDate()

              return (
                <div
                  key={di}
                  className={`
                    aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium
                    transition-colors
                    ${status === "done" ? "bg-emerald-500 text-white" : ""}
                    ${status === "missed" ? "bg-red-100 text-red-400" : ""}
                    ${status === "none" ? "bg-slate-50 text-slate-300" : ""}
                    ${status === "future" ? "bg-transparent text-slate-200" : ""}
                    ${isToday ? "ring-2 ring-emerald-500 ring-offset-1" : ""}
                  `}
                  title={`${day.toLocaleDateString("de-DE")}: ${
                    status === "done" ? "Trainiert" : status === "missed" ? "Verpasst" : "Kein Training"
                  }`}
                >
                  {dayNum}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-emerald-500" />
          Erledigt
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-red-100" />
          Verpasst
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-slate-100" />
          Kein Training
        </span>
      </div>
    </GlassCard>
  )
}

// ── Achievements Grid ────────────────────────────────────────────────────────

function AchievementsGrid({ achievements }: { achievements: Achievement[] }) {
  if (achievements.length === 0) return null

  return (
    <GlassCard>
      <h2 className="text-sm font-semibold text-slate-700 mb-4">Achievements</h2>

      <div className="grid grid-cols-2 gap-3">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`rounded-xl p-3 text-center border transition-all ${
              ach.unlocked
                ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/60 shadow-sm"
                : "bg-slate-50/80 border-slate-200/60"
            }`}
          >
            <span className={`text-2xl ${ach.unlocked ? "" : "grayscale opacity-40"}`}>
              {ach.icon}
            </span>
            <p
              className={`text-xs font-semibold mt-1 ${
                ach.unlocked ? "text-amber-700" : "text-slate-400"
              }`}
            >
              {ach.name}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{ach.description}</p>

            {!ach.unlocked && (
              <div className="mt-2">
                <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{ width: `${ach.progress}%` }}
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  {ach.current}/{ach.target}
                </p>
              </div>
            )}
            {ach.unlocked && (
              <p className="text-[9px] text-amber-600 font-medium mt-1">Erreicht!</p>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const [period, setPeriod] = useState(30)
  const { assignments, isLoading, error } = usePatientApp()
  const {
    streak,
    totalCompletions,
    achievements,
    isLoading: streakLoading,
  } = useStreak()
  const { entries: painEntries, isLoading: diaryLoading } = usePainDiary()
  const { data: analytics, loading: analyticsLoading } = useAnalytics(period)

  const active = getActiveAssignments(assignments)

  // Compliance calculation
  const days = buildLast4WeeksDays()
  const last28Start = days[0] ? formatLocalDate(days[0]) : ""
  const todayStr = formatLocalDate(new Date())
  const totalDone = assignments.reduce((sum, a) => {
    return sum + (a.completed_dates ?? []).filter((d) => d >= last28Start && d <= todayStr).length
  }, 0)
  const totalExpected = days.filter((d) => {
    const s = getDayStatus(d, assignments)
    return s === "done" || s === "missed"
  }).length
  const overallCompliance =
    totalExpected > 0 ? Math.min(100, Math.round((totalDone / totalExpected) * 100)) : 0

  const isFullyLoaded = !isLoading && !streakLoading && !diaryLoading

  // Prepare chart data from pain diary
  const painChartData = [...painEntries]
    .sort((a, b) => a.entry_date.localeCompare(b.entry_date))
    .slice(-period)
    .map((e) => ({
      label: new Date(e.entry_date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
      value: e.pain_level,
    }))

  const wellbeingChartData = [...painEntries]
    .sort((a, b) => a.entry_date.localeCompare(b.entry_date))
    .slice(-period)
    .map((e) => ({
      label: new Date(e.entry_date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
      value: e.wellbeing,
    }))

  // Compliance bar chart from analytics
  const complianceBars = (analytics?.complianceWeekly ?? []).map((w) => ({
    label: w.label,
    value: w.compliance,
  }))

  // Difficulty trend from analytics
  const difficultyChartData = (analytics?.difficultyTrend ?? []).map((d) => ({
    label: new Date(d.date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
    value: d.difficulty,
  }))

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f7" }}>
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 pt-6 pb-16 px-4">
        <div className="container mx-auto max-w-lg">
          <div className="flex items-center gap-3">
            <Link href="/app/dashboard">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">Mein Fortschritt</h1>
              <p className="text-xs text-slate-400">Deine Entwicklung im Überblick</p>
            </div>
            <PeriodSelector value={period} onChange={setPeriod} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-lg -mt-10 pb-24 space-y-4">
        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading */}
        {!isFullyLoaded && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </div>
            <Skeleton className="h-52 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
        )}

        {isFullyLoaded && !error && (
          <>
            {/* ── Stat Cards (4-col) ──────────────────────────────── */}
            <div className="grid grid-cols-4 gap-2 animate-fade-in-up">
              <GlassCard compact className="text-center">
                <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center mx-auto mb-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                </div>
                <p className="text-xl font-bold text-slate-800 tabular-nums">
                  <AnimatedCounter value={streak} />
                </p>
                <p className="text-[9px] text-slate-400 font-medium">Streak</p>
              </GlassCard>

              <GlassCard compact className="text-center">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center mx-auto mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-xl font-bold text-slate-800 tabular-nums">
                  <AnimatedCounter value={totalCompletions} />
                </p>
                <p className="text-[9px] text-slate-400 font-medium">Sessions</p>
              </GlassCard>

              <GlassCard compact className="text-center">
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-1">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-xl font-bold text-slate-800 tabular-nums">
                  <AnimatedCounter value={overallCompliance} suffix="%" />
                </p>
                <p className="text-[9px] text-slate-400 font-medium">Compliance</p>
              </GlassCard>

              <GlassCard compact className="text-center">
                <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center mx-auto mb-1">
                  <Clock className="h-4 w-4 text-purple-500" />
                </div>
                <p className="text-xl font-bold text-slate-800 tabular-nums">
                  <AnimatedCounter value={analytics?.stats.totalDurationMinutes ?? 0} />
                </p>
                <p className="text-[9px] text-slate-400 font-medium">Min.</p>
              </GlassCard>
            </div>

            {/* ── Pain/Wellbeing Trend ────────────────────────────── */}
            {painChartData.length >= 2 && (
              <div className="animate-fade-in-up animation-delay-150">
                <TrendChart
                  data={painChartData}
                  color="#f87171"
                  secondaryData={wellbeingChartData}
                  secondaryColor="#10b981"
                  min={0}
                  max={10}
                  title="Schmerzentwicklung"
                  subtitle="Schmerz (rot) vs. Wohlbefinden (grün)"
                  showAverage
                />
              </div>
            )}

            {/* ── Compliance Bar Chart ────────────────────────────── */}
            {complianceBars.length > 0 && (
              <div className="animate-fade-in-up animation-delay-300">
                <BarChart
                  data={complianceBars}
                  max={100}
                  title="Wöchentliche Compliance"
                  suffix="%"
                />
              </div>
            )}

            {/* ── Difficulty Trend ────────────────────────────────── */}
            {difficultyChartData.length >= 2 && (
              <div className="animate-fade-in-up animation-delay-300">
                <TrendChart
                  data={difficultyChartData}
                  color="#f59e0b"
                  min={1}
                  max={5}
                  title="Schwierigkeits-Trend"
                  subtitle="Wie schwer fühlten sich die Übungen an?"
                />
              </div>
            )}

            {/* ── Calendar ────────────────────────────────────────── */}
            <div className="animate-fade-in-up animation-delay-450">
              <CalendarGrid assignments={assignments} />
            </div>

            {/* ── Per-Plan Compliance ─────────────────────────────── */}
            {active.length > 0 && (
              <GlassCard className="animate-fade-in-up animation-delay-450">
                <h2 className="text-sm font-semibold text-slate-700 mb-4">Compliance pro Plan</h2>
                <div className="space-y-4">
                  {active.map((a) => {
                    const c = a.compliance_7days ?? 0
                    return (
                      <div key={a.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-slate-600 font-medium truncate max-w-[70%]">
                            {a.plan_name ?? "Training"}
                          </span>
                          <span
                            className={`text-sm font-bold tabular-nums ${
                              c >= 80 ? "text-emerald-600" : c >= 50 ? "text-amber-600" : "text-red-500"
                            }`}
                          >
                            {c}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              c >= 80 ? "bg-emerald-500" : c >= 50 ? "bg-amber-400" : "bg-red-400"
                            }`}
                            style={{ width: `${c}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {a.completion_count ?? 0} von {a.expected_count ?? 0} Einheiten (gesamt)
                        </p>
                      </div>
                    )
                  })}
                </div>
              </GlassCard>
            )}

            {/* ── Achievements ────────────────────────────────────── */}
            <div className="animate-fade-in-up animation-delay-600">
              <AchievementsGrid achievements={achievements} />
            </div>

            {/* No assignments */}
            {assignments.length === 0 && (
              <GlassCard className="text-center p-8">
                <TrendingUp className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600 mb-1">Noch keine Daten</p>
                <p className="text-xs text-slate-400">
                  Sobald du deinen ersten Plan erhältst, siehst du hier deinen Fortschritt.
                </p>
              </GlassCard>
            )}
          </>
        )}
      </div>
    </div>
  )
}
