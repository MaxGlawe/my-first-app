"use client"

/**
 * Patient Dashboard — Premium Redesign
 * Emerald/Teal Gradients, Glassmorphismus, animierte Zähler
 */

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { HeuteKarte, NoAssignmentState } from "@/components/app/HeuteKarte"
import { MeineTermineKarte } from "@/components/app/MeineTermineKarte"
import { MeineKurseKarte } from "@/components/app/MeineKurseKarte"
import { DailyInsightCard } from "@/components/app/DailyInsightCard"
import { WeeklySummaryCard } from "@/components/app/WeeklySummaryCard"
import { GlassCard } from "@/components/app/GlassCard"
import { AnimatedCounter } from "@/components/app/AnimatedCounter"
import { ProgressRing } from "@/components/app/ProgressRing"
import { Sparkline } from "@/components/app/charts/Sparkline"
import {
  usePatientApp,
  getTodayAssignments,
} from "@/hooks/use-patient-app"
import { useStreak } from "@/hooks/use-streak"
import { usePainDiary } from "@/hooks/use-pain-diary"
import {
  AlertTriangle,
  Flame,
  Heart,
  ChevronRight,
  Settings,
  Bell,
  LogOut,
  BookOpen,
  Receipt,
  MessageCircle,
  TrendingUp,
} from "lucide-react"

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── Dashboard Page ───────────────────────────────────────────────────────────

export default function PatientDashboardPage() {
  const { assignments, isLoading, error } = usePatientApp()
  const {
    streak,
    weeklyGoal,
    weeklyDone,
    isLoading: streakLoading,
  } = useStreak()
  const { entries: diaryEntries, todayEntry, isLoading: diaryLoading } = usePainDiary()

  const todayAssignments = getTodayAssignments(assignments)
  const hasAnyAssignment = assignments.length > 0
  const isFullyLoaded = !isLoading && !streakLoading && !diaryLoading

  // Sparkline data: last 7 pain diary entries (pain + wellbeing)
  const recentPain = diaryEntries
    .slice(0, 7)
    .reverse()
    .map((e) => e.pain_level)
  const recentWellbeing = diaryEntries
    .slice(0, 7)
    .reverse()
    .map((e) => e.wellbeing)

  const hasStreak = streak > 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f7" }}>
      {/* ── Premium Dark Header ─────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 pt-6 pb-20 px-4">
        {/* Decorative glow orbs */}
        <div className="absolute top-[-40px] right-[-30px] w-40 h-40 rounded-full bg-emerald-500/10 blur-[80px]" />
        <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 rounded-full bg-teal-500/8 blur-[60px]" />

        <div className="container mx-auto max-w-lg relative z-10">
          <div className="flex items-start justify-between">
            <div className="animate-fade-in-up">
              <h1 className="text-2xl font-bold text-white">
                {getGreeting()}!
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">{getTodayStr()}</p>
            </div>
            <form action="/api/auth/signout" method="post">
              <Button
                variant="ghost"
                size="icon"
                type="submit"
                className="h-10 w-10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Content (overlaps header) ────────────────────────────── */}
      <div className="container mx-auto px-4 max-w-lg -mt-14 pb-24 space-y-4 relative z-10">
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
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-36 rounded-2xl" />
              <Skeleton className="h-36 rounded-2xl" />
            </div>
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        )}

        {/* Main content */}
        {isFullyLoaded && !error && (
          <>
            {/* ── Streak + Weekly Goal Row ────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 animate-fade-in-up">
              {/* Streak Card */}
              <GlassCard
                variant={hasStreak ? "warning" : "default"}
                className="flex flex-col items-center justify-center text-center"
                glow={hasStreak}
              >
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center mb-2 ${
                    hasStreak
                      ? "bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg shadow-orange-500/20"
                      : "bg-slate-100"
                  }`}
                >
                  <Flame
                    className={`h-6 w-6 ${
                      hasStreak ? "text-white" : "text-slate-400"
                    }`}
                  />
                </div>
                <p className="text-3xl font-bold text-slate-800 tabular-nums">
                  <AnimatedCounter value={streak} />
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {streak === 1 ? "Tag Streak" : "Tage Streak"}
                </p>
              </GlassCard>

              {/* Weekly Goal Ring */}
              <GlassCard className="flex flex-col items-center justify-center">
                <ProgressRing
                  done={weeklyDone}
                  goal={weeklyGoal}
                  size={100}
                  strokeWidth={8}
                  label="Wochenziel"
                />
              </GlassCard>
            </div>

            {/* ── Today's Training (hero CTA) ───────────────────── */}
            <div className="animate-fade-in-up animation-delay-150">
              {hasAnyAssignment ? (
                <HeuteKarte
                  todayAssignments={todayAssignments}
                  allAssignments={assignments}
                />
              ) : (
                <NoAssignmentState />
              )}
            </div>

            {/* ── Pain/Wellbeing Sparkline ───────────────────────── */}
            {recentPain.length >= 2 && (
              <GlassCard className="animate-fade-in-up animation-delay-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-teal-100 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Befindlichkeit</p>
                      <p className="text-[11px] text-slate-400">Letzte 7 Tage</p>
                    </div>
                  </div>
                  {todayEntry && (
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Heute</p>
                      <p className="text-sm font-bold text-slate-700">NRS {todayEntry.pain_level}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="text-[10px] text-slate-400">Schmerz</span>
                    </div>
                    <Sparkline
                      data={recentPain}
                      width={200}
                      height={40}
                      color="#f87171"
                      min={0}
                      max={10}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[10px] text-slate-400">Wohlbefinden</span>
                    </div>
                    <Sparkline
                      data={recentWellbeing}
                      width={200}
                      height={40}
                      color="#10b981"
                      min={0}
                      max={10}
                      className="w-full"
                    />
                  </div>
                </div>
                {!todayEntry && (
                  <Link href="/app/befindlichkeit" className="block mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-teal-600 border-teal-200 hover:bg-teal-50 rounded-xl h-9"
                    >
                      Heutiges Check-in starten
                    </Button>
                  </Link>
                )}
              </GlassCard>
            )}

            {/* ── Check-in done banner ──────────────────────────── */}
            {todayEntry && recentPain.length < 2 && (
              <div className="rounded-2xl bg-teal-50/80 border border-teal-200/60 p-3 flex items-center gap-3 animate-fade-in-up animation-delay-300">
                <div className="h-8 w-8 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                  <Heart className="h-4 w-4 text-teal-600" />
                </div>
                <p className="text-sm text-teal-700 font-medium flex-1">Check-in erledigt</p>
                <Link href="/app/befindlichkeit">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-teal-600 hover:text-teal-700 hover:bg-teal-100 text-xs h-7"
                  >
                    Bearbeiten
                  </Button>
                </Link>
              </div>
            )}

            {/* ── Daily Insight ──────────────────────────────────── */}
            <div className="animate-fade-in-up animation-delay-300">
              <DailyInsightCard />
            </div>

            {/* ── Weekly Summary ─────────────────────────────────── */}
            <div className="animate-fade-in-up animation-delay-450">
              <WeeklySummaryCard />
            </div>

            {/* ── Quick-Link Grid (2×2) ─────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 animate-fade-in-up animation-delay-450">
              <QuickLink
                href="/app/courses"
                icon={<BookOpen className="h-5 w-5 text-teal-600" />}
                iconBg="bg-teal-100"
                title="Kurse"
                subtitle="Weiterlernen"
              />
              <QuickLink
                href="/app/progress"
                icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
                iconBg="bg-emerald-100"
                title="Fortschritt"
                subtitle="Dein Verlauf"
              />
              <QuickLink
                href="/app/wissen"
                icon={<BookOpen className="h-5 w-5 text-cyan-600" />}
                iconBg="bg-cyan-100"
                title="Wissen"
                subtitle="Lektionen & Quiz"
              />
              <QuickLink
                href="/app/chat"
                icon={<MessageCircle className="h-5 w-5 text-blue-600" />}
                iconBg="bg-blue-100"
                title="Nachrichten"
                subtitle="Therapeut"
              />
            </div>

            {/* ── Kurse & Termine ────────────────────────────────── */}
            <div className="animate-fade-in-up animation-delay-600">
              <MeineKurseKarte />
            </div>
            <div className="animate-fade-in-up animation-delay-600">
              <MeineTermineKarte />
            </div>

            {/* ── Bottom Links ───────────────────────────────────── */}
            <div className="space-y-3 animate-fade-in-up animation-delay-600">
              <LinkCard
                href="/app/rechnungen"
                icon={<Receipt className="h-5 w-5 text-emerald-600" />}
                iconBg="bg-emerald-100"
                title="Meine Rechnungen"
                subtitle="Rechnungen einsehen & als PDF herunterladen"
              />
              <LinkCard
                href="/app/einstellungen"
                icon={<Settings className="h-5 w-5 text-slate-500" />}
                iconBg="bg-slate-100"
                title="Einstellungen"
                subtitle={
                  <span className="flex items-center gap-1">
                    <Bell className="h-3 w-3" aria-hidden="true" />
                    App installieren & Benachrichtigungen
                  </span>
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Quick-Link (compact 2-col grid) ──────────────────────────────────────────

function QuickLink({
  href,
  icon,
  iconBg,
  title,
  subtitle,
}: {
  href: string
  icon: React.ReactNode
  iconBg: string
  title: string
  subtitle: string
}) {
  return (
    <Link href={href} className="block group">
      <GlassCard
        className="flex flex-col items-center text-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
        compact
      >
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700">{title}</p>
          <p className="text-[10px] text-slate-400">{subtitle}</p>
        </div>
      </GlassCard>
    </Link>
  )
}

// ── Link Card (full-width row) ───────────────────────────────────────────────

function LinkCard({
  href,
  icon,
  iconBg,
  title,
  subtitle,
}: {
  href: string
  icon: React.ReactNode
  iconBg: string
  title: string
  subtitle: React.ReactNode
}) {
  return (
    <Link href={href} className="block group">
      <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm p-4 flex items-center justify-between hover:shadow-md hover:border-slate-300/60 transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">{title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" aria-hidden="true" />
      </div>
    </Link>
  )
}
