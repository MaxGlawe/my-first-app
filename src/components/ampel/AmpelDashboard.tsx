"use client"

/**
 * PROJ-17: Patienten-Ampelsystem (V3 — Premium Design)
 *
 * Clean, modern dashboard with:
 * - SVG sparkline for pain trend
 * - Smooth expand/collapse
 * - Clear visual hierarchy
 * - Actionable recommendations
 */

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  MessageCircle,
  ClipboardList,
  Bell,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Eye,
  Lightbulb,
  ExternalLink,
  Activity,
  Heart,
  Users,
} from "lucide-react"
import { usePatientAlerts } from "@/hooks/use-patient-alerts"
import type { PatientAlert, AmpelStatus } from "@/hooks/use-patient-alerts"

// -- AmpelDot (shared, exported for PatientTable) ----------------------------

interface AmpelDotProps {
  status: AmpelStatus
  size?: "sm" | "md"
}

export function AmpelDot({ status, size = "md" }: AmpelDotProps) {
  const dim = size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"
  const colors: Record<AmpelStatus, string> = {
    ROT: "bg-red-500",
    GELB: "bg-amber-400",
    GRUEN: "bg-emerald-500",
  }
  const pulse = status === "ROT" ? "animate-pulse" : ""
  return (
    <span
      className={`inline-block rounded-full shrink-0 ${dim} ${colors[status]} ${pulse}`}
      title={status === "ROT" ? "Sofort handeln" : status === "GELB" ? "Beobachten" : "Alles gut"}
      aria-label={`Ampelstatus: ${status}`}
    />
  )
}

// -- Summary Stats Row -------------------------------------------------------

interface SummaryStatsProps {
  rotCount: number
  gelbCount: number
  gruenCount: number
  totalMonitored: number
  isLoading: boolean
  onRefresh: () => void
}

function SummaryStats({ rotCount, gelbCount, gruenCount, totalMonitored, isLoading, onRefresh }: SummaryStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <Users className="h-4 w-4 text-slate-500" />
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-400 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
        <p className="text-xl font-bold text-slate-800">{totalMonitored}</p>
        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Ueberwacht</p>
      </div>

      <div className={`rounded-2xl border p-4 ${rotCount > 0 ? "bg-red-50/80 border-red-200/60" : "bg-white/80 border-slate-200/60"}`}>
        <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center mb-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
        </div>
        <p className={`text-xl font-bold ${rotCount > 0 ? "text-red-700" : "text-slate-300"}`}>{rotCount}</p>
        <p className="text-[10px] text-red-500/70 font-medium mt-0.5">Kritisch</p>
      </div>

      <div className={`rounded-2xl border p-4 ${gelbCount > 0 ? "bg-amber-50/80 border-amber-200/60" : "bg-white/80 border-slate-200/60"}`}>
        <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center mb-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </div>
        <p className={`text-xl font-bold ${gelbCount > 0 ? "text-amber-700" : "text-slate-300"}`}>{gelbCount}</p>
        <p className="text-[10px] text-amber-500/70 font-medium mt-0.5">Beobachten</p>
      </div>

      <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 p-4">
        <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center mb-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </div>
        <p className={`text-xl font-bold ${gruenCount > 0 ? "text-emerald-700" : "text-slate-300"}`}>{gruenCount}</p>
        <p className="text-[10px] text-emerald-500/70 font-medium mt-0.5">Im Plan</p>
      </div>
    </div>
  )
}

// -- SVG Pain Sparkline ------------------------------------------------------

function PainSparkline({ history }: { history: Array<{ date: string; level: number }> }) {
  if (history.length === 0) {
    return (
      <p className="text-xs text-slate-400 italic">Keine Schmerzdaten vorhanden</p>
    )
  }

  const maxLevel = 10
  const width = 160
  const height = 40
  const padding = 2

  const lastEntry = history[history.length - 1]
  const firstEntry = history[0]
  const trend = lastEntry.level - firstEntry.level

  // Build SVG path
  const stepX = history.length > 1 ? (width - padding * 2) / (history.length - 1) : 0
  const points = history.map((e, i) => ({
    x: padding + i * stepX,
    y: padding + ((maxLevel - e.level) / maxLevel) * (height - padding * 2),
  }))

  // Line path
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  // Area path (fill under the line)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`

  // Gradient color based on last value
  const gradientColor = lastEntry.level >= 7 ? "#ef4444" : lastEntry.level >= 4 ? "#f59e0b" : "#10b981"

  return (
    <div className="flex items-center gap-3">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0">
        <defs>
          <linearGradient id={`pain-grad-${history.length}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={gradientColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#pain-grad-${history.length})`} />
        <path d={linePath} fill="none" stroke={gradientColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Current value dot */}
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill={gradientColor} />
      </svg>
      <div className="min-w-0">
        <p className="text-lg font-bold text-slate-800">{lastEntry.level}<span className="text-xs font-normal text-slate-400">/10</span></p>
        <div className="flex items-center gap-1">
          {trend > 0 ? (
            <span className="text-[10px] font-semibold text-red-500 flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +{trend} Punkte
            </span>
          ) : trend < 0 ? (
            <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5">
              <TrendingDown className="h-3 w-3" /> {trend} Punkte
            </span>
          ) : (
            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-0.5">
              <Minus className="h-3 w-3" /> Stabil
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// -- Compliance Ring ---------------------------------------------------------

function ComplianceRing({ compliance }: { compliance: { expected: number; done: number; percent: number } | null }) {
  if (!compliance) {
    return <p className="text-xs text-slate-400 italic">Keine Zuweisung</p>
  }

  const size = 44
  const strokeWidth = 5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashoffset = circumference * (1 - compliance.percent / 100)
  const color = compliance.percent < 25 ? "#ef4444" : compliance.percent < 50 ? "#f59e0b" : compliance.percent < 75 ? "#14b8a6" : "#10b981"

  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} className="shrink-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={dashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="min-w-0">
        <p className="text-lg font-bold text-slate-800">{compliance.percent}<span className="text-xs font-normal text-slate-400">%</span></p>
        <p className="text-[10px] text-slate-400">{compliance.done}/{compliance.expected} Einheiten</p>
      </div>
    </div>
  )
}

// -- Helpers -----------------------------------------------------------------

function getInitials(vorname: string, nachname: string): string {
  return `${vorname.charAt(0)}${nachname.charAt(0)}`.toUpperCase()
}

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "Nie"
  const date = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const days = Math.floor((now.getTime() - date.getTime()) / 86_400_000)
  if (days <= 0) return "Heute"
  if (days === 1) return "Gestern"
  return `Vor ${days}d`
}

// -- AmpelPatientenKarte (Premium) -------------------------------------------

interface AmpelPatientenKarteProps {
  alert: PatientAlert
  onDismiss: (patientId: string) => void
  isDismissed: boolean
}

function AmpelPatientenKarte({ alert, onDismiss, isDismissed }: AmpelPatientenKarteProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [sending, setSending] = useState(false)

  const handlePush = useCallback(async () => {
    if (!alert.userId) return
    setSending(true)
    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: alert.patientId,
          title: "Erinnerung von deinem Therapeuten",
          body: "Dein Therapeut moechte dich daran erinnern, dein Training zu erledigen.",
          tag: "therapeut-erinnerung",
          url: "/app/dashboard",
        }),
      })
      if (!res.ok) throw new Error()
      setTimeout(() => setSending(false), 2000)
    } catch { setSending(false) }
  }, [alert])

  // Dismissed state — compact
  if (isDismissed) {
    return (
      <div className="rounded-2xl bg-white/40 border border-slate-200/40 p-3.5 opacity-50 hover:opacity-70 transition-opacity">
        <div className="flex items-center gap-3">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-[10px] bg-slate-100 text-slate-400">
              {getInitials(alert.vorname, alert.nachname)}
            </AvatarFallback>
          </Avatar>
          <p className="text-xs text-slate-400 flex-1">{alert.vorname} {alert.nachname}</p>
          <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" /> Reagiert
          </span>
        </div>
      </div>
    )
  }

  // Primary alert reason (the most critical one)
  const primaryGrund = alert.gruende[0]

  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/60 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Main card content */}
      <div className="p-4 sm:p-5">
        {/* Top row: Avatar + Name + Status + Meta */}
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <Avatar className="h-11 w-11">
              {alert.avatarUrl && <AvatarImage src={alert.avatarUrl} alt="" />}
              <AvatarFallback className="text-xs font-medium bg-slate-100 text-slate-600">
                {getInitials(alert.vorname, alert.nachname)}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5">
              <AmpelDot status={alert.status} size="md" />
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                className="text-sm font-semibold text-slate-800 hover:text-emerald-700 transition-colors text-left"
                onClick={() => router.push(`/os/patients/${alert.patientId}`)}
              >
                {alert.vorname} {alert.nachname}
              </button>
              {alert.status === "ROT" && (
                <Badge className="bg-red-500/10 text-red-600 border-0 text-[10px] font-semibold px-2 py-0 h-5">
                  Kritisch
                </Badge>
              )}
              {alert.status === "GELB" && (
                <Badge className="bg-amber-400/10 text-amber-600 border-0 text-[10px] font-semibold px-2 py-0 h-5">
                  Beobachten
                </Badge>
              )}
            </div>

            {/* Primary alert reason as clear sentence */}
            {primaryGrund && (
              <p className={`text-xs mt-1 font-medium ${
                primaryGrund.severity === "ROT" ? "text-red-600" : "text-amber-600"
              }`}>
                {primaryGrund.label}
              </p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {formatTimeAgo(alert.letzterCheckIn)}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" /> {formatTimeAgo(alert.lastMessageDate)}
              </span>
              {alert.gruende.length > 1 && (
                <span className="flex items-center gap-1 text-slate-500 font-medium">
                  +{alert.gruende.length - 1} weitere
                </span>
              )}
            </div>
          </div>

          {/* Right side: Mini stats */}
          <div className="hidden sm:flex items-center gap-4 shrink-0">
            {/* Mini pain indicator */}
            {alert.painHistory.length > 0 && (
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Heart className={`h-3 w-3 ${alert.painHistory[alert.painHistory.length - 1].level >= 7 ? "text-red-400" : alert.painHistory[alert.painHistory.length - 1].level >= 4 ? "text-amber-400" : "text-emerald-400"}`} />
                  <span className="text-sm font-bold text-slate-700">{alert.painHistory[alert.painHistory.length - 1].level}</span>
                </div>
                <p className="text-[9px] text-slate-400">Schmerz</p>
              </div>
            )}
            {/* Mini compliance indicator */}
            {alert.compliance && (
              <div className="text-center">
                <span className={`text-sm font-bold ${alert.compliance.percent < 25 ? "text-red-500" : alert.compliance.percent < 50 ? "text-amber-500" : "text-emerald-500"}`}>
                  {alert.compliance.percent}%
                </span>
                <p className="text-[9px] text-slate-400">Compliance</p>
              </div>
            )}
          </div>

          {/* Expand chevron */}
          <button
            className="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-300 hover:text-slate-500"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Zuklappen" : "Details"}
          >
            <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`} />
          </button>
        </div>

        {/* Inline quick actions — always visible */}
        <div className="flex flex-wrap gap-1.5 mt-3 ml-14">
          <button
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-500 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
            onClick={() => router.push(`/os/chat?patientId=${alert.patientId}`)}
          >
            <MessageCircle className="h-3 w-3" /> Nachricht
          </button>
          <button
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-500 bg-slate-50 hover:bg-teal-50 hover:text-teal-600 transition-colors"
            onClick={() => router.push(`/os/patients/${alert.patientId}?tab=hausaufgaben`)}
          >
            <ClipboardList className="h-3 w-3" /> Plan anpassen
          </button>
          <button
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-500 bg-slate-50 hover:bg-amber-50 hover:text-amber-600 transition-colors disabled:opacity-30"
            disabled={sending || !alert.userId}
            onClick={handlePush}
          >
            <Bell className="h-3 w-3" /> {sending ? "Gesendet!" : "Push"}
          </button>
          <button
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 transition-colors ml-auto"
            onClick={() => onDismiss(alert.patientId)}
          >
            <CheckCircle2 className="h-3 w-3" /> Erledigt
          </button>
        </div>
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5 space-y-4">
          {/* Data panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Pain panel */}
            <div className="rounded-xl bg-white border border-slate-100 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Activity className="h-3 w-3" /> Schmerzverlauf
              </p>
              <PainSparkline history={alert.painHistory} />
            </div>
            {/* Compliance panel */}
            <div className="rounded-xl bg-white border border-slate-100 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <ClipboardList className="h-3 w-3" /> Compliance
              </p>
              <ComplianceRing compliance={alert.compliance} />
            </div>
          </div>

          {/* All alert reasons with recommendations */}
          {alert.gruende.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Lightbulb className="h-3 w-3" /> Handlungsempfehlungen
              </p>
              {alert.gruende.map((grund) => (
                <div key={grund.key} className="rounded-xl bg-white border border-slate-100 p-3.5">
                  <div className="flex items-start gap-2.5">
                    <div className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                      grund.severity === "ROT" ? "bg-red-100" : "bg-amber-100"
                    }`}>
                      {grund.severity === "ROT" ? (
                        <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold ${
                        grund.severity === "ROT" ? "text-red-700" : "text-amber-700"
                      }`}>
                        {grund.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {grund.empfehlung}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Open patient link */}
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5 border-slate-200"
              onClick={() => router.push(`/os/patients/${alert.patientId}?tab=befindlichkeit`)}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Patient oeffnen
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// -- Skeleton ----------------------------------------------------------------

function AmpelSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      {[1, 2].map((i) => (
        <Skeleton key={i} className="h-28 w-full rounded-2xl" />
      ))}
    </div>
  )
}

// -- AmpelDashboard (main export) --------------------------------------------

type FilterTab = "alle" | "rot" | "gelb"

export function AmpelDashboard() {
  const { alerts, isLoading, error, refresh } = usePatientAlerts()
  const [activeFilter, setActiveFilter] = useState<FilterTab>("alle")
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const handleDismiss = useCallback((patientId: string) => {
    setDismissed((prev) => new Set(prev).add(patientId))
  }, [])

  const rotCount = alerts.filter((a) => a.status === "ROT" && !dismissed.has(a.patientId)).length
  const gelbCount = alerts.filter((a) => a.status === "GELB" && !dismissed.has(a.patientId)).length
  const gruenCount = alerts.filter((a) => a.status === "GRUEN").length
  const totalMonitored = alerts.length

  const visibleAlerts = useMemo(() => {
    const filtered = alerts.filter((a) => {
      if (activeFilter === "rot") return a.status === "ROT"
      if (activeFilter === "gelb") return a.status === "GELB"
      return a.status !== "GRUEN"
    })
    // Non-dismissed first
    return filtered.sort((a, b) => {
      const ad = dismissed.has(a.patientId) ? 1 : 0
      const bd = dismissed.has(b.patientId) ? 1 : 0
      return ad - bd
    })
  }, [alerts, activeFilter, dismissed])

  const hasAlerts = rotCount > 0 || gelbCount > 0

  return (
    <section aria-label="Patienten-Ampelsystem" className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Patienten-Ampel
          </p>
          {!isLoading && (rotCount + gelbCount) > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5">
              {rotCount + gelbCount}
            </span>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && <AmpelSkeleton />}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm font-medium text-red-700 flex-1">{error}</p>
          <Button size="sm" variant="ghost" onClick={refresh} className="text-red-600 hover:text-red-700">
            Erneut versuchen
          </Button>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {/* Summary stat cards */}
          <SummaryStats
            rotCount={rotCount}
            gelbCount={gelbCount}
            gruenCount={gruenCount}
            totalMonitored={totalMonitored}
            isLoading={isLoading}
            onRefresh={() => { setDismissed(new Set()); refresh() }}
          />

          {/* All-green empty state */}
          {!hasAlerts && dismissed.size === 0 && (
            <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-emerald-800">Alle Patienten im gruenen Bereich</p>
                <p className="text-sm text-emerald-600/80 mt-0.5">Keine Handlungsempfehlungen momentan.</p>
              </div>
            </div>
          )}

          {/* All dismissed */}
          {!hasAlerts && dismissed.size > 0 && (
            <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-emerald-800">Alle Alerts bearbeitet</p>
                <p className="text-sm text-emerald-600/80 mt-0.5">{dismissed.size} {dismissed.size === 1 ? "Patient" : "Patienten"} als reagiert markiert.</p>
              </div>
            </div>
          )}

          {/* Filter + Cards */}
          {visibleAlerts.length > 0 && (
            <>
              <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as FilterTab)}>
                <TabsList className="h-9 bg-slate-100/80">
                  <TabsTrigger value="alle" className="text-xs">
                    Alle ({alerts.filter((a) => a.status !== "GRUEN").length})
                  </TabsTrigger>
                  <TabsTrigger value="rot" className="text-xs">
                    <span className="flex items-center gap-1.5">
                      <AmpelDot status="ROT" size="sm" /> Rot ({alerts.filter((a) => a.status === "ROT").length})
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="gelb" className="text-xs">
                    <span className="flex items-center gap-1.5">
                      <AmpelDot status="GELB" size="sm" /> Gelb ({alerts.filter((a) => a.status === "GELB").length})
                    </span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-3">
                {visibleAlerts.map((alert) => (
                  <AmpelPatientenKarte
                    key={alert.patientId}
                    alert={alert}
                    onDismiss={handleDismiss}
                    isDismissed={dismissed.has(alert.patientId)}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </section>
  )
}
