"use client"

/**
 * PROJ-17: Patienten-Ampelsystem
 * AmpelDashboard — the full traffic-light section for the Therapeuten-Dashboard.
 *
 * Composed of:
 *   AmpelSummaryBar   — coloured badge counts (Rot / Gelb / Gruen)
 *   AmpelFilter       — Tabs: Alle / Rot / Gelb
 *   AmpelPatientenKarte[] — one card per patient with alerts
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
} from "lucide-react"
import { usePatientAlerts } from "@/hooks/use-patient-alerts"
import type { PatientAlert, AmpelStatus } from "@/hooks/use-patient-alerts"

// ── AmpelDot (shared, exported for PatientTable) ─────────────────────────────

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
  return (
    <span
      className={`inline-block rounded-full shrink-0 ${dim} ${colors[status]}`}
      title={status === "ROT" ? "Sofort handeln" : status === "GELB" ? "Beobachten" : "Alles gut"}
      aria-label={`Ampelstatus: ${status}`}
    />
  )
}

// ── AmpelSummaryBar ───────────────────────────────────────────────────────────

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
      {/* Rot badge */}
      {rotCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <span className="text-sm font-semibold text-red-700">
            {rotCount} {rotCount === 1 ? "Patient" : "Patienten"} — Sofort handeln
          </span>
        </div>
      )}

      {/* Gelb badge */}
      {gelbCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
          <span className="text-sm font-semibold text-amber-700">
            {gelbCount} {gelbCount === 1 ? "Patient" : "Patienten"} — Beobachten
          </span>
        </div>
      )}

      {/* Gruen badge */}
      {gruenCount > 0 && rotCount === 0 && gelbCount === 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span className="text-sm font-semibold text-emerald-700">
            Alle Patienten im gruenen Bereich
          </span>
        </div>
      )}

      {/* Refresh button */}
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

// ── SchnellAktionen ──────────────────────────────────────────────────────────

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
    router.push(`/os/training-plans?patientId=${alert.patientId}`)
  }, [router, alert.patientId])

  const handleErinnerungSenden = useCallback(async () => {
    if (!alert.userId) {
      // Button is already disabled when userId is null — this is a safety guard
      return
    }
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
      // Brief visual feedback — button stays disabled for a moment
      setTimeout(() => setSending(false), 1500)
    } catch {
      setSending(false)
      // Silently fail — therapist still navigated to correct state
    }
  }, [alert])

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-xs gap-1.5 border-slate-200 hover:border-emerald-300 hover:text-emerald-700"
        onClick={handleNachrichtSenden}
      >
        <MessageCircle className="h-3.5 w-3.5" />
        Nachricht senden
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-xs gap-1.5 border-slate-200 hover:border-teal-300 hover:text-teal-700"
        onClick={handlePlanAnpassen}
      >
        <ClipboardList className="h-3.5 w-3.5" />
        Plan anpassen
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={sending || !alert.userId}
        className="h-8 text-xs gap-1.5 border-slate-200 hover:border-amber-300 hover:text-amber-700 disabled:opacity-40"
        onClick={handleErinnerungSenden}
        title={!alert.userId ? "Kein App-Konto vorhanden" : undefined}
      >
        <Bell className="h-3.5 w-3.5" />
        {sending ? "Gesendet!" : "Erinnerung senden"}
      </Button>
    </div>
  )
}

// ── AmpelPatientenKarte ──────────────────────────────────────────────────────

interface AmpelPatientenKarteProps {
  alert: PatientAlert
}

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

const SEVERITY_ICON: Record<"ROT" | "GELB", React.ReactNode> = {
  ROT: <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />,
  GELB: <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />,
}

const STATUS_RING: Record<AmpelStatus, string> = {
  ROT: "ring-2 ring-red-200",
  GELB: "ring-2 ring-amber-200",
  GRUEN: "",
}

function AmpelPatientenKarte({ alert }: AmpelPatientenKarteProps) {
  const router = useRouter()

  return (
    <div
      className={`rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/60 shadow-sm p-5 hover:shadow-md transition-shadow ${STATUS_RING[alert.status]}`}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
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
          {/* Ampel dot overlay */}
          <span className="absolute -bottom-0.5 -right-0.5">
            <AmpelDot status={alert.status} size="md" />
          </span>
        </div>

        {/* Name + last check-in */}
        <div className="flex-1 min-w-0">
          <button
            className="text-sm font-semibold text-slate-800 hover:text-emerald-700 transition-colors text-left"
            onClick={() => router.push(`/os/patients/${alert.patientId}`)}
          >
            {alert.nachname}, {alert.vorname}
          </button>
          <p className="text-xs text-slate-400 mt-0.5">
            Letzter Check-In: {formatLastCheckIn(alert.letzterCheckIn)}
          </p>
        </div>

        {/* Status badge */}
        <div className="shrink-0">
          {alert.status === "ROT" ? (
            <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs">
              Sofort handeln
            </Badge>
          ) : alert.status === "GELB" ? (
            <Badge className="bg-amber-400 hover:bg-amber-500 text-white text-xs">
              Beobachten
            </Badge>
          ) : (
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs">
              OK
            </Badge>
          )}
        </div>
      </div>

      {/* Alert reasons */}
      {alert.gruende.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {alert.gruende.map((grund) => (
            <li key={grund.key} className="flex items-start gap-2 text-xs text-slate-600">
              {SEVERITY_ICON[grund.severity]}
              <span>{grund.label}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Quick actions */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <SchnellAktionen alert={alert} />
      </div>
    </div>
  )
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function AmpelSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-44 w-full rounded-2xl" />
      ))}
    </div>
  )
}

// ── AmpelDashboard (main export) ──────────────────────────────────────────────

type FilterTab = "alle" | "rot" | "gelb"

export function AmpelDashboard() {
  const { alerts, isLoading, error, refresh } = usePatientAlerts()
  const [activeFilter, setActiveFilter] = useState<FilterTab>("alle")

  const rotCount = alerts.filter((a) => a.status === "ROT").length
  const gelbCount = alerts.filter((a) => a.status === "GELB").length
  const gruenCount = alerts.filter((a) => a.status === "GRUEN").length

  const visibleAlerts = alerts.filter((a) => {
    if (activeFilter === "rot") return a.status === "ROT"
    if (activeFilter === "gelb") return a.status === "GELB"
    // "alle" — show ROT + GELB only (GRUEN = no action needed)
    return a.status !== "GRUEN"
  })

  const hasAlerts = rotCount > 0 || gelbCount > 0

  return (
    <section aria-label="Patienten-Ampelsystem">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Patienten-Ampel
        </p>
        {!isLoading && hasAlerts && (
          <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
            {rotCount + gelbCount}
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
            Retry
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
            onRefresh={refresh}
          />

          {/* All-green empty state */}
          {!hasAlerts && (
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

          {/* Filter tabs + card list */}
          {hasAlerts && (
            <>
              <Tabs
                value={activeFilter}
                onValueChange={(v) => setActiveFilter(v as FilterTab)}
              >
                <TabsList className="h-9 bg-slate-100/80">
                  <TabsTrigger value="alle" className="text-xs">
                    Alle ({rotCount + gelbCount})
                  </TabsTrigger>
                  <TabsTrigger value="rot" className="text-xs">
                    <span className="flex items-center gap-1.5">
                      <AmpelDot status="ROT" size="sm" />
                      Rot ({rotCount})
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="gelb" className="text-xs">
                    <span className="flex items-center gap-1.5">
                      <AmpelDot status="GELB" size="sm" />
                      Gelb ({gelbCount})
                    </span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Cards */}
              {visibleAlerts.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visibleAlerts.map((alert) => (
                    <AmpelPatientenKarte key={alert.patientId} alert={alert} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">
                  Keine Patienten in dieser Kategorie.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </section>
  )
}
