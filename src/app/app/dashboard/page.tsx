"use client"

/**
 * PROJ-16: Dashboard 2.0 — Apple Health Style
 * Persönliche Begrüßung, Wochenziel-Ring, Streak, Check-in Banner
 */

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { HeuteKarte, NoAssignmentState } from "@/components/app/HeuteKarte"
import { MeineTermineKarte } from "@/components/app/MeineTermineKarte"
import { MeineKurseKarte } from "@/components/app/MeineKurseKarte"
import {
  usePatientApp,
  getTodayAssignments,
  getActiveAssignments,
} from "@/hooks/use-patient-app"
import { useStreak } from "@/hooks/use-streak"
import { usePainDiary } from "@/hooks/use-pain-diary"
import {
  AlertTriangle,
  Flame,
  Target,
  Heart,
  ChevronRight,
  Settings,
  Bell,
  LogOut,
  BookOpen,
} from "lucide-react"
import { DailyInsightCard } from "@/components/app/DailyInsightCard"
import { WeeklySummaryCard } from "@/components/app/WeeklySummaryCard"

// ── Greeting helper ──────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Guten Morgen"
  if (hour < 17) return "Guten Nachmittag"
  return "Guten Abend"
}

function getTodayStr(): string {
  return new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

// ── Weekly Goal Ring ─────────────────────────────────────────────────────────

function WochenzielRing({
  done,
  goal,
  size = 120,
  strokeWidth = 10,
}: {
  done: number
  goal: number
  size?: number
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const percent = goal > 0 ? Math.min(100, Math.round((done / goal) * 100)) : 0
  const dashOffset = circumference * (1 - percent / 100)

  const color =
    percent >= 100
      ? "#10b981"
      : percent >= 50
      ? "#14b8a6"
      : "#94a3b8"

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-800 leading-none">
          {done}/{goal}
        </span>
        <span className="text-[10px] text-slate-400 font-medium mt-1">
          Diese Woche
        </span>
      </div>
    </div>
  )
}

// ── Streak Card ──────────────────────────────────────────────────────────────

function StreakCard({ streak }: { streak: number }) {
  const hasStreak = streak > 0
  return (
    <div
      className={`rounded-2xl p-4 text-center ${
        hasStreak
          ? "bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200"
          : "bg-slate-50 border border-slate-200"
      }`}
    >
      <div
        className={`h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${
          hasStreak ? "bg-orange-100" : "bg-slate-100"
        }`}
      >
        <Flame
          className={`h-5 w-5 ${
            hasStreak ? "text-orange-500" : "text-slate-400"
          }`}
        />
      </div>
      <p className="text-2xl font-bold text-slate-800">{streak}</p>
      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
        {streak === 1 ? "Tag Streak" : "Tage Streak"}
      </p>
    </div>
  )
}

// ── Check-in Banner ──────────────────────────────────────────────────────────

function CheckInBanner({ hasCheckedInToday }: { hasCheckedInToday: boolean }) {
  if (hasCheckedInToday) {
    return (
      <div className="rounded-2xl bg-teal-50 border border-teal-200 p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
          <Heart className="h-5 w-5 text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-teal-700">Check-in erledigt</p>
          <p className="text-xs text-teal-500">Du hast heute schon eingetragen.</p>
        </div>
        <Link href="/app/befindlichkeit">
          <Button
            variant="ghost"
            size="sm"
            className="text-teal-600 hover:text-teal-700 hover:bg-teal-100"
          >
            Ändern
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <Link href="/app/befindlichkeit" className="block">
      <div className="rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 p-4 flex items-center gap-3 text-white shadow-sm hover:shadow-md transition-shadow">
        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Heart className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Wie geht es dir heute?</p>
          <p className="text-xs text-white/80">
            Trage dein Befinden ein — hilft deinem Therapeuten.
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-white/60 shrink-0" />
      </div>
    </Link>
  )
}

// ── Dashboard Page ───────────────────────────────────────────────────────────

export default function PatientDashboardPage() {
  const { assignments, isLoading, error } = usePatientApp()
  const {
    streak,
    weeklyGoal,
    weeklyDone,
    isLoading: streakLoading,
  } = useStreak()
  const { todayEntry, isLoading: diaryLoading } = usePainDiary()

  const todayAssignments = getTodayAssignments(assignments)
  const hasAnyAssignment = assignments.length > 0

  const isFullyLoaded = !isLoading && !streakLoading && !diaryLoading

  return (
    <div className="container mx-auto py-6 px-4 max-w-lg space-y-5">
      {/* Hero Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {getGreeting()}!
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">{getTodayStr()}</p>
        </div>
        <form action="/api/auth/signout" method="post">
          <Button
            variant="ghost"
            size="icon"
            type="submit"
            className="h-10 w-10 rounded-xl text-slate-400 hover:text-slate-600"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading skeleton */}
      {!isFullyLoaded && (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      )}

      {/* Main content */}
      {isFullyLoaded && !error && (
        <>
          {/* Weekly Goal + Streak Row */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-5">
              <WochenzielRing done={weeklyDone} goal={weeklyGoal} />
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Target className="h-4 w-4 text-teal-500" />
                    <p className="text-sm font-semibold text-slate-700">
                      Wochenziel
                    </p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {weeklyDone} von {weeklyGoal} Einheiten
                  </p>
                </div>
                <StreakCard streak={streak} />
              </div>
            </div>
          </div>

          {/* Daily Insight — KI Tipp des Tages */}
          <DailyInsightCard />

          {/* Check-in Banner */}
          <CheckInBanner hasCheckedInToday={!!todayEntry} />

          {/* Weekly Summary */}
          <WeeklySummaryCard />

          {/* Today's Training */}
          {hasAnyAssignment ? (
            <HeuteKarte
              todayAssignments={todayAssignments}
              allAssignments={assignments}
            />
          ) : (
            <NoAssignmentState />
          )}

          {/* Meine Kurse */}
          <MeineKurseKarte />

          {/* Appointments */}
          <MeineTermineKarte />

          {/* Wissens-Hub Link */}
          <Link href="/app/wissen" className="block">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-teal-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Mein Wissen</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Lektionen & Quiz zu deinen Beschwerden
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" aria-hidden="true" />
            </div>
          </Link>

          {/* Settings shortcut */}
          <Link href="/app/einstellungen" className="block">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Settings className="h-5 w-5 text-slate-500" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Einstellungen</p>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <Bell className="h-3 w-3" aria-hidden="true" />
                    App installieren & Benachrichtigungen
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" aria-hidden="true" />
            </div>
          </Link>
        </>
      )}
    </div>
  )
}
