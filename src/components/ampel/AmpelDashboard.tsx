"use client"

/**
 * PROJ-17: Patienten-Ampelsystem (V2 — Rich Interactive Dashboard)
 *
 * Features:
 * - Expandable patient cards with detailed info
 * - Mini pain sparkline chart
 * - Compliance progress bar
 * - Concrete action recommendations per alert
 * - "Reagiert" dismiss/acknowledge button
 * - Last activity timeline context
 */

import { useState, useCallback } from "react"
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
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Eye,
  Lightbulb,
  ExternalLink,
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

// -- AmpelSummaryBar ---------------------------------------------------------

interface AmpelSummaryBarProps {
  rotCount: number
  gelbCount: number
  gruenCount: number
  isLoading: boolean
  onRefresh: () => void
}

function AmpelSummaryBar({
  rotCount,
  gelbCount,
  gruenCount,
  isLoading,
  onRefresh,
}: AmpelSummaryBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {rotCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <span className="text-sm font-semibold text-red-700">
            {rotCount} {rotCount === 1 ? "Patient" : "Patienten"} — Sofort handeln
          </span>
        </div>
      )}

      {gelbCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
          <span className="text-sm font-semibold text-amber-700">
            {gelbCount} {gelbCount === 1 ? "Patient" : "Patienten"} — Beobachten
          </span>
        </div>
      )}

      {gruenCount > 0 && rotCount === 0 && gelbCount === 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span className="text-sm font-semibold text-emerald-700">
            Alle Patienten im gruenen Bereich
          </span>
        </div>
      )}

      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
        aria-label="Alerts aktualisieren"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
        Aktualisieren
      </button>
    </div>
  )
}

// -- Mini Pain Sparkline (CSS-based) -----------------------------------------

function PainSparkline({ history }: { history: Array<{ date: string; level: number }> }) {
  if (history.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Activity className="h-3.5 w-3.5" />
        <span>Keine Schmerzeintraege</span>
      </div>
    )
  }

  const maxLevel = 10
  const lastEntry = history[history.length - 1]
  const firstEntry = history[0]
  const trend = lastEntry.level - firstEntry.level

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5" />
          Schmerzverlauf (7 Tage)
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold">
          {trend > 0 ? (
            <span className="text-red-500 flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +{trend}
            </span>
          ) : trend < 0 ? (
            <span className="text-emerald-500 flex items-center gap-0.5">
              <TrendingDown className="h-3 w-3" /> {trend}
            </span>
          ) : (
            <span className="text-slate-400">Stabil</span>
          )}
        </span>
      </div>
      <div className="flex items-end gap-1 h-10">
        {history.map((entry, i) => {
          const heightPercent = (entry.level / maxLevel) * 100
          const barColor =
            entry.level >= 8
              ? "bg-red-400"
              : entry.level >= 5
                ? "bg-amber-400"
                : "bg-emerald-400"
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${entry.date}: ${entry.level}/10`}>
              <span className="text-[9px] text-slate-400 font-medium">{entry.level}</span>
              <div className="w-full rounded-t-sm relative" style={{ height: `${Math.max(heightPercent, 8)}%` }}>
                <div className={`absolute inset-0 rounded-t-sm ${barColor} opacity-80`} />
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-[9px] text-slate-300 px-0.5">
        <span>{formatShortDate(history[0].date)}</span>
        <span>{formatShortDate(history[history.length - 1].date)}</span>
      </div>
    </div>
  )
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("de-DE", { day: "numeric", month: "short" })
}

// -- Compliance Progress Bar -------------------------------------------------

function ComplianceBar({ compliance }: { compliance: { expected: number; done: number; percent: number } | null }) {
  if (!compliance) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <ClipboardList className="h-3.5 w-3.5" />
        <span>Keine aktive Zuweisung</span>
      </div>
    )
  }

  const barColor =
    compliance.percent < 25
      ? "bg-red-400"
      : compliance.percent < 50
        ? "bg-amber-400"
        : compliance.percent < 75
          ? "bg-teal-400"
          : "bg-emerald-400"

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
          <ClipboardList className="h-3.5 w-3.5" />
          Training-Compliance (7 Tage)
        </span>
        <span className="text-xs font-bold text-slate-700">
          {compliance.percent}%
        </span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${compliance.percent}%` }}
        />
      </div>
      <p className="text-[10px] text-slate-400">
        {compliance.done} von {compliance.expected} geplanten Einheiten absolviert
      </p>
    </div>
  )
}

// -- SchnellAktionen ---------------------------------------------------------

interface SchnellAktionenProps {
  alert: PatientAlert
}

function SchnellAktionen({ alert }: SchnellAktionenProps) {
  const router = useRouter()
  const [sending, setSending] = useState(false)

  const handleNachrichtSenden = useCallback(() => {
    router.push(`/os/chat?patientId=${alert.patientId}`)
  }, [router, alert.patientId])

  const handlePlanAnpassen = useCallback(() => {
    router.push(`/os/patients/${alert.patientId}?tab=hausaufgaben`)
  }, [router, alert.patientId])

  const handlePatientOeffnen = useCallback(() => {
    router.push(`/os/patients/${alert.patientId}?tab=befindlichkeit`)
  }, [router, alert.patientId])

  const handleErinnerungSenden = useCallback(async () => {
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
      if (!res.ok) throw new Error("Push fehlgeschlagen")
      setTimeout(() => setSending(false), 2000)
    } catch {
      setSending(false)
    }
  }, [alert])

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-xs gap-1.5 border-slate-200 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50"
        onClick={handleNachrichtSenden}
      >
        <MessageCircle className="h-3.5 w-3.5" />
        Nachricht senden
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-xs gap-1.5 border-slate-200 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50"
        onClick={handlePlanAnpassen}
      >
        <ClipboardList className="h-3.5 w-3.5" />
        Plan anpassen
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={sending || !alert.userId}
        className="h-8 text-xs gap-1.5 border-slate-200 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 disabled:opacity-40"
        onClick={handleErinnerungSenden}
        title={!alert.userId ? "Kein App-Konto vorhanden" : undefined}
      >
        <Bell className="h-3.5 w-3.5" />
        {sending ? "Gesendet!" : "Erinnerung senden"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-xs gap-1.5 border-slate-200 hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50"
        onClick={handlePatientOeffnen}
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Befindlichkeit
      </Button>
    </div>
  )
}

// -- AmpelPatientenKarte (Expandable) ----------------------------------------

function getInitials(vorname: string, nachname: string): string {
  return `${vorname.charAt(0)}${nachname.charAt(0)}`.toUpperCase()
}

function formatLastCheckIn(dateStr: string | null): string {
  if (!dateStr) return "Noch kein Check-In"
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const daysDiff = Math.floor(
    (today.getTime() - date.getTime()) / 86_400_000,
  )
  if (daysDiff === 0) return "Heute"
  if (daysDiff === 1) return "Gestern"
  return `vor ${daysDiff} Tagen`
}

function formatLastMessage(dateStr: string | null): string {
  if (!dateStr) return "Noch keine Nachricht"
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const daysDiff = Math.floor(
    (today.getTime() - date.getTime()) / 86_400_000,
  )
  if (daysDiff === 0) return "Heute"
  if (daysDiff === 1) return "Gestern"
  return `vor ${daysDiff} Tagen`
}

const SEVERITY_BORDER: Record<AmpelStatus, string> = {
  ROT: "border-l-red-500",
  GELB: "border-l-amber-400",
  GRUEN: "border-l-emerald-400",
}

const STATUS_BG: Record<AmpelStatus, string> = {
  ROT: "bg-red-50/50",
  GELB: "bg-amber-50/30",
  GRUEN: "bg-white/90",
}

interface AmpelPatientenKarteProps {
  alert: PatientAlert
  onDismiss: (patientId: string) => void
  isDismissed: boolean
}

function AmpelPatientenKarte({ alert, onDismiss, isDismissed }: AmpelPatientenKarteProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)

  if (isDismissed) {
    return (
      <div className="rounded-2xl bg-slate-50 border border-slate-200/60 p-4 opacity-60">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-slate-100 text-slate-400">
              {getInitials(alert.vorname, alert.nachname)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-500 line-through">
              {alert.nachname}, {alert.vorname}
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200">
            <Eye className="h-3 w-3 mr-1" /> Reagiert
          </Badge>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-2xl ${STATUS_BG[alert.status]} backdrop-blur-sm border border-slate-200/60 border-l-4 ${SEVERITY_BORDER[alert.status]} shadow-sm hover:shadow-md transition-all`}
    >
      {/* Collapsed header — always visible */}
      <div
        className="p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          {/* Avatar with ampel dot */}
          <div className="relative shrink-0">
            <Avatar className="h-10 w-10">
              {alert.avatarUrl && (
                <AvatarImage
                  src={alert.avatarUrl}
                  alt={`${alert.vorname} ${alert.nachname}`}
                />
              )}
              <AvatarFallback className="text-xs font-medium bg-slate-100 text-slate-600">
                {getInitials(alert.vorname, alert.nachname)}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5">
              <AmpelDot status={alert.status} size="md" />
            </span>
          </div>

          {/* Name + Meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <button
                className="text-sm font-semibold text-slate-800 hover:text-emerald-700 transition-colors text-left"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/os/patients/${alert.patientId}`)
                }}
              >
                {alert.nachname}, {alert.vorname}
              </button>
              {alert.status === "ROT" ? (
                <Badge className="bg-red-500 hover:bg-red-600 text-white text-[10px] px-2 py-0">
                  Sofort handeln
                </Badge>
              ) : (
                <Badge className="bg-amber-400 hover:bg-amber-500 text-white text-[10px] px-2 py-0">
                  Beobachten
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Check-In: {formatLastCheckIn(alert.letzterCheckIn)}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                Chat: {formatLastMessage(alert.lastMessageDate)}
              </span>
            </div>
          </div>

          {/* Expand toggle */}
          <button
            className="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-400"
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            aria-label={expanded ? "Zuklappen" : "Details anzeigen"}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Alert reasons — always visible as summary */}
        {alert.gruende.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {alert.gruende.map((grund) => (
              <span
                key={grund.key}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                  grund.severity === "ROT"
                    ? "bg-red-100/80 text-red-700"
                    : "bg-amber-100/80 text-amber-700"
                }`}
              >
                {grund.severity === "ROT" ? (
                  <AlertCircle className="h-3 w-3" />
                ) : (
                  <AlertTriangle className="h-3 w-3" />
                )}
                {grund.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expanded detail section */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
          {/* Recommendations */}
          {alert.gruende.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                Empfohlene Massnahmen
              </p>
              <div className="space-y-1.5">
                {alert.gruende.map((grund) => (
                  <div
                    key={`emp-${grund.key}`}
                    className={`rounded-lg p-3 text-xs leading-relaxed ${
                      grund.severity === "ROT"
                        ? "bg-red-50 text-red-800 border border-red-100"
                        : "bg-amber-50 text-amber-800 border border-amber-100"
                    }`}
                  >
                    <span className="font-semibold">{grund.label}:</span>{" "}
                    {grund.empfehlung}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pain Sparkline + Compliance side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-white border border-slate-100 p-3">
              <PainSparkline history={alert.painHistory} />
            </div>
            <div className="rounded-xl bg-white border border-slate-100 p-3">
              <ComplianceBar compliance={alert.compliance} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500">Schnellaktionen</p>
            <SchnellAktionen alert={alert} />
          </div>

          {/* Dismiss / Acknowledge */}
          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-[11px] text-slate-400 hover:text-emerald-600 gap-1.5"
              onClick={() => onDismiss(alert.patientId)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Als reagiert markieren
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
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-36 w-full rounded-2xl" />
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
  const dismissedCount = dismissed.size

  const visibleAlerts = alerts.filter((a) => {
    if (activeFilter === "rot") return a.status === "ROT"
    if (activeFilter === "gelb") return a.status === "GELB"
    // "alle" — show ROT + GELB (GRUEN = no action needed)
    return a.status !== "GRUEN"
  })

  // Sort: non-dismissed first, then dismissed
  const sortedAlerts = [...visibleAlerts].sort((a, b) => {
    const aDismissed = dismissed.has(a.patientId) ? 1 : 0
    const bDismissed = dismissed.has(b.patientId) ? 1 : 0
    return aDismissed - bDismissed
  })

  const hasAlerts = rotCount > 0 || gelbCount > 0

  return (
    <section aria-label="Patienten-Ampelsystem">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Patienten-Ampel
        </p>
        {!isLoading && (rotCount + gelbCount) > 0 && (
          <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
            {rotCount + gelbCount}
          </span>
        )}
        {!isLoading && dismissedCount > 0 && (
          <span className="text-[10px] text-slate-400 ml-1">
            ({dismissedCount} reagiert)
          </span>
        )}
      </div>

      {/* Loading */}
      {isLoading && <AmpelSkeleton />}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={refresh} className="text-red-600 hover:text-red-700">
            Erneut versuchen
          </Button>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {/* Summary bar */}
          <AmpelSummaryBar
            rotCount={rotCount}
            gelbCount={gelbCount}
            gruenCount={gruenCount}
            isLoading={isLoading}
            onRefresh={() => {
              setDismissed(new Set())
              refresh()
            }}
          />

          {/* All-green empty state */}
          {!hasAlerts && dismissed.size === 0 && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-emerald-800">
                  Alle Patienten im gruenen Bereich
                </p>
                <p className="text-sm text-emerald-600 mt-0.5">
                  Keine dringenden Handlungsempfehlungen momentan.
                </p>
              </div>
            </div>
          )}

          {/* All dismissed state */}
          {!hasAlerts && dismissed.size > 0 && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-emerald-800">
                  Alle Alerts bearbeitet
                </p>
                <p className="text-sm text-emerald-600 mt-0.5">
                  {dismissed.size} {dismissed.size === 1 ? "Patient" : "Patienten"} als reagiert markiert.
                </p>
              </div>
            </div>
          )}

          {/* Filter tabs + card list */}
          {(hasAlerts || dismissed.size > 0) && visibleAlerts.length > 0 && (
            <>
              <Tabs
                value={activeFilter}
                onValueChange={(v) => setActiveFilter(v as FilterTab)}
              >
                <TabsList className="h-9 bg-slate-100/80">
                  <TabsTrigger value="alle" className="text-xs">
                    Alle ({visibleAlerts.length})
                  </TabsTrigger>
                  <TabsTrigger value="rot" className="text-xs">
                    <span className="flex items-center gap-1.5">
                      <AmpelDot status="ROT" size="sm" />
                      Rot ({alerts.filter((a) => a.status === "ROT").length})
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="gelb" className="text-xs">
                    <span className="flex items-center gap-1.5">
                      <AmpelDot status="GELB" size="sm" />
                      Gelb ({alerts.filter((a) => a.status === "GELB").length})
                    </span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Cards */}
              <div className="space-y-3">
                {sortedAlerts.map((alert) => (
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
        </div>
      )}
    </section>
  )
}
