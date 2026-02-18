"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  usePatientApp,
  getActiveAssignments,
} from "@/hooks/use-patient-app"
import type { PatientAppAssignment } from "@/hooks/use-patient-app"
import {
  ArrowLeft,
  AlertTriangle,
  Flame,
  CheckCircle2,
  TrendingUp,
} from "lucide-react"

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildLast4WeeksDays(): Date[] {
  const days: Date[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // Go back 27 days (4 weeks = 28 days including today)
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

  const dateStr = date.toISOString().split("T")[0]
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

function computeStreak(days: Date[], assignments: PatientAppAssignment[]): number {
  let streak = 0
  // Walk backwards from today until we hit a missed training day
  const trainingDays = [...days]
    .reverse()
    .filter((d) => {
      const s = getDayStatus(d, assignments)
      return s === "done" || s === "missed"
    })
  for (const d of trainingDays) {
    if (getDayStatus(d, assignments) === "done") {
      streak++
    } else {
      break
    }
  }
  return streak
}

// ── CalendarGrid ──────────────────────────────────────────────────────────────

function CalendarGrid({ assignments }: { assignments: PatientAppAssignment[] }) {
  const days = buildLast4WeeksDays()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // BUG-2 FIX: Pad the grid so the first cell always lands on Monday.
  // JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat → Monday-first offset:
  const firstDay = days[0]
  const dowFirst = firstDay.getDay()
  const paddingBefore = dowFirst === 0 ? 6 : dowFirst - 1 // 0 if Mon, 6 if Sun

  // Build padded cell array: null = empty padding cell, Date = real day
  const gridCells: (Date | null)[] = [
    ...Array<null>(paddingBefore).fill(null),
    ...days,
  ]
  // Pad end to complete the last row (so grid always has full weeks)
  const remainder = gridCells.length % 7
  if (remainder !== 0) {
    for (let i = 0; i < 7 - remainder; i++) gridCells.push(null)
  }

  // Group into weeks of 7
  const weeks: (Date | null)[][] = []
  for (let i = 0; i < gridCells.length; i += 7) {
    weeks.push(gridCells.slice(i, i + 7))
  }

  const DOW_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">Letzte 4 Wochen</h2>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DOW_LABELS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-slate-400">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((day, di) => {
              if (!day) {
                // Empty padding cell
                return <div key={di} className="aspect-square" />
              }
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

      {/* Legend */}
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
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const { assignments, isLoading, error } = usePatientApp()
  const active = getActiveAssignments(assignments)
  const allAssignments = assignments // include past for calendar

  const days = buildLast4WeeksDays()
  const streak = computeStreak(days, allAssignments)

  // Total completions in last 4 weeks
  const last28Start = days[0]?.toISOString().split("T")[0] ?? ""
  const today = new Date().toISOString().split("T")[0]

  const totalDone = allAssignments.reduce((sum, a) => {
    return (
      sum +
      (a.completed_dates ?? []).filter(
        (d) => d >= last28Start && d <= today
      ).length
    )
  }, 0)

  // Expected in last 4 weeks
  const totalExpected = days.filter((d) => {
    const s = getDayStatus(d, allAssignments)
    return s === "done" || s === "missed"
  }).length

  const overallCompliance =
    totalExpected > 0 ? Math.min(100, Math.round((totalDone / totalExpected) * 100)) : 0

  return (
    <div className="container mx-auto py-6 px-4 max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/app/dashboard">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Mein Fortschritt</h1>
          <p className="text-xs text-slate-400">Letzte 4 Wochen</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* Streak */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 text-center">
              <div className="h-9 w-9 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-2">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{streak}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Tage Streak</p>
            </div>

            {/* Total sessions */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 text-center">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{totalDone}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Einheiten</p>
            </div>

            {/* Compliance */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 text-center">
              <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{overallCompliance}%</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Compliance</p>
            </div>
          </div>

          {/* Calendar */}
          <CalendarGrid assignments={allAssignments} />

          {/* No assignments */}
          {assignments.length === 0 && (
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-center">
              <TrendingUp className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600 mb-1">Noch keine Daten</p>
              <p className="text-xs text-slate-400">
                Sobald du deinen ersten Plan erhältst, siehst du hier deinen Fortschritt.
              </p>
            </div>
          )}

          {/* Per-plan compliance */}
          {active.length > 0 && (
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-700">Compliance pro Plan</h2>
              {active.map((a) => {
                const c = a.compliance_7days ?? 0
                return (
                  <div key={a.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-slate-600 font-medium truncate max-w-[70%]">
                        {a.plan_name ?? "Training"}
                      </span>
                      <span
                        className={`text-sm font-bold ${
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
          )}
        </>
      )}
    </div>
  )
}
