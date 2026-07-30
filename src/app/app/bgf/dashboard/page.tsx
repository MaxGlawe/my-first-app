"use client"

/**
 * PROJ-18: BGF Premium Dashboard
 *
 * Flow:
 *  1. Check if daily check-in exists → if not, show CheckInFlow
 *  2. After check-in → auto-generate Pausen-Fit sessions
 *  3. Show premium dashboard: Timeline, Hydration, Goals, Weekly
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useBgfMembership } from "@/hooks/use-bgf-membership"
import { CheckInFlow } from "@/components/bgf/dashboard/CheckInFlow"
import { SessionTimeline } from "@/components/bgf/dashboard/SessionTimeline"
import { PausenFitReminderPrompt } from "@/components/bgf/dashboard/PausenFitReminderPrompt"
import { HydrationTracker } from "@/components/bgf/dashboard/HydrationTracker"
import { GoalsProgress } from "@/components/bgf/dashboard/GoalsProgress"
import { WeeklyOverview } from "@/components/bgf/dashboard/WeeklyOverview"
import { AtemPause } from "@/components/bgf/dashboard/AtemPause"
import { TeamPuls } from "@/components/bgf/dashboard/TeamPuls"
import { BildschirmPause } from "@/components/bgf/dashboard/BildschirmPause"
import { DashboardTutorial } from "@/components/bgf/dashboard/DashboardTutorial"
import { Skeleton } from "@/components/ui/skeleton"
import type { PausenFitSession, BgfDailyCheckin } from "@/types/bgf"
import { supabase } from "@/lib/supabase"
import {
  LogOut,
  Flame,
  Heart,
  RefreshCw,
} from "lucide-react"

// ── Helpers ──────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Guten Morgen"
  if (hour < 17) return "Guten Tag"
  return "Guten Abend"
}

function getSessionTypes(arbeitszeit: number, arbeitstag: string): string[] {
  if (arbeitstag === "frei") return []
  if (arbeitszeit <= 4) return ["morgen_aktivierung"]
  if (arbeitszeit <= 6) return ["morgen_aktivierung", "mittag_mobilisation"]
  return ["morgen_aktivierung", "mittag_mobilisation", "nachmittag_reset"]
}

function getWeekDays(): { label: string; date: string; isToday: boolean }[] {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))

  const labels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
  return labels.map((label, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    return {
      label,
      date: date.toISOString().split("T")[0],
      isToday: date.toDateString() === today.toDateString(),
    }
  })
}

// ── Page ─────────────────────────────────────────────────────────────

export default function BgfDashboardPage() {
  const router = useRouter()
  const { organizationId, isLoading: membershipLoading } = useBgfMembership()

  // State
  const [isLoading, setIsLoading] = useState(true)
  const [checkin, setCheckin] = useState<BgfDailyCheckin | null>(null)
  const [sessions, setSessions] = useState<PausenFitSession[]>([])
  const [ziele, setZiele] = useState<string[]>([])
  const [beschwerdenRegionen, setBeschwerdenRegionen] = useState<string[]>([])
  const [weekSessions, setWeekSessions] = useState<Record<string, { completed: number; total: number }>>({})
  const [streak, setStreak] = useState(0)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [hydrationUpdating, setHydrationUpdating] = useState(false)

  // ── Fetch all data ─────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!organizationId) return
    setIsLoading(true)

    try {
      // Parallel fetches
      const [checkinRes, sessionsRes, analyseRes] = await Promise.all([
        fetch("/api/bgf/check-in"),
        fetch("/api/bgf/pausen-fit/today"),
        fetch(`/api/bgf/ist-analyse?organization_id=${organizationId}`),
      ])

      const [checkinData, sessionsData, analyseData] = await Promise.all([
        checkinRes.json(),
        sessionsRes.json(),
        analyseRes.json(),
      ])

      setCheckin(checkinData.checkin ?? null)
      setSessions(sessionsData.sessions ?? [])

      // Extract goals and beschwerden from IST-Analyse
      const analyse = analyseData.analysen?.[0]
      if (analyse) {
        setZiele(analyse.ziele ?? [])
        setBeschwerdenRegionen(analyse.beschwerden_regionen ?? [])
      }

      // Calculate streak (simplified: count consecutive days with check-ins)
      // For now, we'll use a simple counter based on sessions
      await fetchWeekData()
    } catch (err) {
      console.error("Dashboard fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [organizationId])

  async function fetchWeekData() {
    try {
      const res = await fetch("/api/bgf/pausen-fit/week")
      if (res.ok) {
        const data = await res.json()
        setWeekSessions(data.days ?? {})
        setStreak(data.streak ?? 0)
      }
    } catch {
      // Non-critical
    }
  }

  useEffect(() => {
    if (!membershipLoading && organizationId) {
      fetchData()
    }
  }, [membershipLoading, organizationId, fetchData])

  // ── Push-Deeplink: ?slot=<typ> aus der Erinnerung → direkt in die Session ──
  const deeplinkHandled = useRef(false)

  useEffect(() => {
    if (membershipLoading || !organizationId || deeplinkHandled.current) return

    const slot = new URLSearchParams(window.location.search).get("slot")
    const VALID = ["morgen_aktivierung", "mittag_mobilisation", "nachmittag_reset"]
    if (!slot || !VALID.includes(slot)) return

    deeplinkHandled.current = true
    ;(async () => {
      try {
        const res = await fetch("/api/bgf/pausen-fit/ensure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ organization_id: organizationId, typ: slot }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.session?.id) {
            router.replace(`/app/bgf/pausen-fit/${data.session.id}`)
            return
          }
        }
      } catch {
        /* Fallback: normales Dashboard anzeigen */
      }
      // Slot-Param entfernen, damit er beim Zurücknavigieren nicht erneut feuert
      window.history.replaceState(null, "", "/app/bgf/dashboard")
    })()
  }, [membershipLoading, organizationId, router])

  // ── Check-In Handler ───────────────────────────────────────────────

  async function handleCheckIn(values: {
    stimmung: number
    schlaf_qualitaet: number
    schmerz_aktuell: number
    arbeitstag_typ: "buero" | "homeoffice" | "unterwegs" | "frei"
    arbeitszeit_stunden: number
  }) {
    if (!organizationId) return
    setIsCheckingIn(true)

    try {
      // 1. Save check-in
      const res = await fetch("/api/bgf/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, organization_id: organizationId }),
      })

      if (!res.ok) throw new Error("Check-In fehlgeschlagen")
      const { checkin: newCheckin } = await res.json()
      setCheckin(newCheckin)

      // 2. Auto-generate sessions based on work schedule
      const types = getSessionTypes(values.arbeitszeit_stunden, values.arbeitstag_typ)

      if (types.length > 0) {
        const generatePromises = types.map((typ) =>
          fetch("/api/bgf/pausen-fit/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ organization_id: organizationId, typ }),
          }).then((r) => r.json()).catch(() => null)
        )

        await Promise.all(generatePromises)

        // Reload sessions
        const sessionsRes = await fetch("/api/bgf/pausen-fit/today")
        const sessionsData = await sessionsRes.json()
        setSessions(sessionsData.sessions ?? [])
      }
    } catch (err) {
      console.error("Check-in error:", err)
    } finally {
      setIsCheckingIn(false)
    }
  }

  // ── Hydration Handler ──────────────────────────────────────────────

  async function handleHydration(action: "add" | "remove") {
    setHydrationUpdating(true)
    try {
      const res = await fetch("/api/bgf/hydration", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        const data = await res.json()
        setCheckin((prev) =>
          prev ? { ...prev, wasser_glaeser: data.wasser_glaeser } : prev
        )
      }
    } catch {
      // Non-critical
    } finally {
      setHydrationUpdating(false)
    }
  }

  // ── Navigate to session ────────────────────────────────────────────

  function handleStartSession(sessionId: string) {
    router.push(`/app/bgf/pausen-fit/${sessionId}`)
  }

  // ── Loading ────────────────────────────────────────────────────────

  if (membershipLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
        <div className="max-w-lg mx-auto space-y-4">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  // ── Check-In Flow (if no check-in today) ───────────────────────────

  if (!checkin) {
    return (
      <CheckInFlow
        hasBeschwerden={beschwerdenRegionen.length > 0}
        onComplete={handleCheckIn}
        isSubmitting={isCheckingIn}
      />
    )
  }

  // ── Dashboard ──────────────────────────────────────────────────────

  const completedToday = sessions.filter((s) => s.status === "abgeschlossen").length
  const totalToday = sessions.length
  const weekDays = getWeekDays()

  const weekDayData = weekDays.map((day) => ({
    ...day,
    completed: weekSessions[day.date]?.completed ?? 0,
    total: weekSessions[day.date]?.total ?? 0,
    isRestDay: (weekSessions[day.date] as { isRestDay?: boolean })?.isRestDay ?? false,
  }))

  const weekCompleted = Object.values(weekSessions).reduce((s, d) => s + d.completed, 0)
  const weekTotal = Object.values(weekSessions).reduce((s, d) => s + d.total, 0)

  const waterProgress = checkin.wasser_glaeser ?? 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* ── Premium Header ──────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white px-4 pt-7 pb-6 relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

        <div className="max-w-lg mx-auto relative">
          {/* Top row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <Heart className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                Betriebliche Gesundheit
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchData()}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                aria-label="Aktualisieren"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={async () => { await supabase.auth.signOut(); window.location.href = "/login" }}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                title="Abmelden"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-bold font-display">{getGreeting()}!</h1>
            <p className="text-sm text-white/50 mt-0.5">
              {new Date().toLocaleDateString("de-DE", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 mt-4"
          >
            {/* Water */}
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/5">
              <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider mb-0.5">
                Wasser
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-lg">💧</span>
                <span className="text-2xl font-bold tabular-nums">{waterProgress}</span>
                <span className="text-xs text-white/40">/8</span>
              </div>
            </div>

            {/* Sessions today */}
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/5">
              <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider mb-0.5">
                Heute
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tabular-nums">{completedToday}</span>
                <span className="text-xs text-white/40">/{totalToday}</span>
              </div>
            </div>

            {/* Streak */}
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/5">
              <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider mb-0.5">
                Streak
              </p>
              <div className="flex items-baseline gap-1">
                <Flame className="w-4 h-4 text-amber-400 mr-0.5" />
                <span className="text-2xl font-bold tabular-nums">{streak}</span>
                <span className="text-xs text-white/40">Tage</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4 -mt-2">
        {/* Push-Opt-in: Pausen-Fit Erinnerungen (verschwindet sobald aktiv) */}
        <PausenFitReminderPrompt />

        {/* Sessions Timeline */}
        <div data-tutorial="sessions">
          <SessionTimeline
            sessions={sessions}
            onStart={handleStartSession}
          />
        </div>

        {/* Quick Actions: Atem-Pause + Bildschirm-Pause */}
        <div className="grid grid-cols-1 gap-3">
          <div data-tutorial="atem-pause">
            <AtemPause />
          </div>
          <div data-tutorial="bildschirm-pause">
            <BildschirmPause />
          </div>
        </div>

        {/* Hydration Tracker */}
        <div data-tutorial="hydration">
          <HydrationTracker
            current={checkin.wasser_glaeser ?? 0}
            goal={8}
            onAdd={() => handleHydration("add")}
            onRemove={() => handleHydration("remove")}
            isUpdating={hydrationUpdating}
          />
        </div>

        {/* Team Puls */}
        <div data-tutorial="team-puls">
          <TeamPuls organizationId={organizationId} />
        </div>

        {/* Goals Progress */}
        <div data-tutorial="goals">
          <GoalsProgress organizationId={organizationId} />
        </div>

        {/* Weekly Overview */}
        <div data-tutorial="weekly">
          <WeeklyOverview
            days={weekDayData}
            weekTotal={{ completed: weekCompleted, total: weekTotal }}
          />
        </div>

        {/* Bottom spacing */}
        <div className="h-4" />
      </div>

      {/* Guided Tutorial (first visit only) */}
      <DashboardTutorial />
    </div>
  )
}
