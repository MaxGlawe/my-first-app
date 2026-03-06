"use client"

/**
 * /os/ampel — Patienten-Ampel Kontrollzentrum
 * Full-page view showing only patients that need attention (ROT + GELB).
 * Table layout for scalability (100+ patients), inline quick-message templates.
 */

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  MessageCircle,
  ClipboardList,
  Bell,
  Send,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Heart,
  Activity,
  Lightbulb,
  ExternalLink,
  X,
} from "lucide-react"
import { usePatientAlerts } from "@/hooks/use-patient-alerts"
import type { PatientAlert, AmpelStatus } from "@/hooks/use-patient-alerts"

// -- Quick message templates -------------------------------------------------

const QUICK_MESSAGES = [
  { id: "checkin", label: "Check-In Erinnerung", text: "Hallo! Wie geht es dir heute? Bitte vergiss nicht, deinen taeglichen Check-In zu machen." },
  { id: "training", label: "Training nachholen", text: "Hallo! Mir ist aufgefallen, dass du in den letzten Tagen nicht trainiert hast. Alles in Ordnung? Melde dich gerne, falls du Hilfe brauchst." },
  { id: "schmerz", label: "Schmerzen nachfragen", text: "Hallo! Ich habe gesehen, dass deine Schmerzen zugenommen haben. Lass uns das besprechen - hast du eine Idee, was der Ausloeser sein koennte?" },
  { id: "motivation", label: "Motivation", text: "Hey! Du machst das super mit deinem Training. Bleib dran - Konstanz ist der Schluessel zum Erfolg!" },
  { id: "plancheck", label: "Plan-Anpassung", text: "Hallo! Ich moechte deinen Trainingsplan anpassen. Bitte melde dich, damit wir das gemeinsam besprechen koennen." },
]

// -- Helpers -----------------------------------------------------------------

function getInitials(vorname: string, nachname: string) {
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
  return `vor ${days}d`
}

// -- SVG Mini Sparkline (compact for table) ----------------------------------

function MiniSparkline({ history }: { history: Array<{ date: string; level: number }> }) {
  if (history.length < 2) return <span className="text-xs text-slate-300">-</span>

  const w = 64
  const h = 20
  const max = 10
  const stepX = (w - 4) / (history.length - 1)
  const points = history.map((e, i) => ({
    x: 2 + i * stepX,
    y: 2 + ((max - e.level) / max) * (h - 4),
  }))
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const last = history[history.length - 1]
  const color = last.level >= 7 ? "#ef4444" : last.level >= 4 ? "#f59e0b" : "#10b981"

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="2" fill={color} />
    </svg>
  )
}

// -- Inline Quick Message Composer -------------------------------------------

interface QuickMessageProps {
  patientId: string
  patientName: string
  onClose: () => void
  onSent: () => void
}

function QuickMessageComposer({ patientId, patientName, onClose, onSent }: QuickMessageProps) {
  const [sending, setSending] = useState(false)
  const [customText, setCustomText] = useState("")
  const [sentMsg, setSentMsg] = useState<string | null>(null)

  const sendMessage = useCallback(async (text: string) => {
    setSending(true)
    try {
      const res = await fetch(`/api/patients/${patientId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      })
      if (!res.ok) throw new Error()
      setSentMsg(text)
      setTimeout(() => {
        onSent()
        onClose()
      }, 1500)
    } catch {
      setSending(false)
    }
  }, [patientId, onSent, onClose])

  if (sentMsg) {
    return (
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
        <p className="text-xs text-emerald-700 font-medium">Nachricht an {patientName} gesendet!</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600">
          Schnellnachricht an {patientName}
        </p>
        <button onClick={onClose} className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-400">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Template buttons */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_MESSAGES.map((tmpl) => (
          <button
            key={tmpl.id}
            disabled={sending}
            onClick={() => sendMessage(tmpl.text)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors disabled:opacity-40"
          >
            <Send className="h-3 w-3" />
            {tmpl.label}
          </button>
        ))}
      </div>

      {/* Custom message */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Eigene Nachricht..."
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && customText.trim()) sendMessage(customText.trim()) }}
          className="flex-1 h-8 rounded-lg border border-slate-200 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
          disabled={sending}
        />
        <Button
          size="sm"
          disabled={!customText.trim() || sending}
          onClick={() => sendMessage(customText.trim())}
          className="h-8 text-xs gap-1 bg-emerald-500 hover:bg-emerald-600"
        >
          <Send className="h-3 w-3" />
          Senden
        </Button>
      </div>
    </div>
  )
}

// -- Alert Row (table-style) -------------------------------------------------

interface AlertRowProps {
  alert: PatientAlert
  onDismiss: (id: string) => void
  isDismissed: boolean
}

function AlertRow({ alert, onDismiss, isDismissed }: AlertRowProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [showMessage, setShowMessage] = useState(false)

  const primaryGrund = alert.gruende[0]
  const lastPain = alert.painHistory.length > 0 ? alert.painHistory[alert.painHistory.length - 1] : null
  const firstPain = alert.painHistory.length > 0 ? alert.painHistory[0] : null
  const painTrend = lastPain && firstPain ? lastPain.level - firstPain.level : 0

  const [pushStatus, setPushStatus] = useState<"idle" | "sending" | "sent" | "no_sub" | "error">("idle")

  const handlePush = useCallback(async () => {
    setPushStatus("sending")
    try {
      const res = await fetch("/api/os/push-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: alert.patientId }),
      })
      const data = await res.json()
      if (data.ok) {
        setPushStatus(data.pushSent ? "sent" : "no_sub")
        setTimeout(() => setPushStatus("idle"), 3000)
      } else {
        setPushStatus("error")
        setTimeout(() => setPushStatus("idle"), 3000)
      }
    } catch {
      setPushStatus("error")
      setTimeout(() => setPushStatus("idle"), 3000)
    }
  }, [alert])

  if (isDismissed) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 opacity-40">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="text-[10px] bg-slate-100 text-slate-400">
            {getInitials(alert.vorname, alert.nachname)}
          </AvatarFallback>
        </Avatar>
        <p className="text-xs text-slate-400 flex-1">{alert.vorname} {alert.nachname}</p>
        <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-medium">
          <CheckCircle2 className="h-3 w-3" /> Erledigt
        </span>
      </div>
    )
  }

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/50 transition-colors">
        {/* Status dot */}
        <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${alert.status === "ROT" ? "bg-red-500 animate-pulse" : "bg-amber-400"}`} />

        {/* Avatar */}
        <Avatar className="h-9 w-9 shrink-0">
          {alert.avatarUrl && <AvatarImage src={alert.avatarUrl} />}
          <AvatarFallback className="text-[10px] font-medium bg-slate-100 text-slate-600">
            {getInitials(alert.vorname, alert.nachname)}
          </AvatarFallback>
        </Avatar>

        {/* Name + Reason */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              className="text-sm font-semibold text-slate-800 hover:text-emerald-700 transition-colors text-left truncate"
              onClick={() => router.push(`/os/patients/${alert.patientId}`)}
            >
              {alert.vorname} {alert.nachname}
            </button>
            <Badge className={`text-[9px] px-1.5 py-0 h-4 border-0 font-semibold ${
              alert.status === "ROT" ? "bg-red-500/10 text-red-600" : "bg-amber-400/10 text-amber-600"
            }`}>
              {alert.status === "ROT" ? "Kritisch" : "Beobachten"}
            </Badge>
          </div>
          {primaryGrund && (
            <p className={`text-[11px] mt-0.5 truncate ${
              primaryGrund.severity === "ROT" ? "text-red-500" : "text-amber-500"
            }`}>
              {primaryGrund.label}
              {alert.gruende.length > 1 && <span className="text-slate-400"> +{alert.gruende.length - 1}</span>}
            </p>
          )}
        </div>

        {/* Pain sparkline */}
        <div className="hidden md:flex items-center gap-2 shrink-0 w-28">
          <MiniSparkline history={alert.painHistory} />
          {lastPain && (
            <div className="text-right">
              <span className="text-xs font-bold text-slate-700">{lastPain.level}</span>
              {painTrend > 0 && <TrendingUp className="h-3 w-3 text-red-400 inline ml-0.5" />}
              {painTrend < 0 && <TrendingDown className="h-3 w-3 text-emerald-400 inline ml-0.5" />}
              {painTrend === 0 && lastPain && <Minus className="h-3 w-3 text-slate-300 inline ml-0.5" />}
            </div>
          )}
        </div>

        {/* Compliance */}
        <div className="hidden sm:block shrink-0 w-16 text-right">
          {alert.compliance ? (
            <span className={`text-sm font-bold ${
              alert.compliance.percent < 25 ? "text-red-500"
                : alert.compliance.percent < 50 ? "text-amber-500"
                  : "text-emerald-500"
            }`}>
              {alert.compliance.percent}%
            </span>
          ) : (
            <span className="text-xs text-slate-300">-</span>
          )}
        </div>

        {/* Last Check-In */}
        <div className="hidden lg:block shrink-0 w-16 text-right">
          <span className="text-[11px] text-slate-400">{formatTimeAgo(alert.letzterCheckIn)}</span>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
            title="Nachricht senden"
            onClick={(e) => { e.stopPropagation(); setShowMessage(!showMessage); setExpanded(false) }}
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </button>
          <button
            className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-teal-50 text-slate-400 hover:text-teal-600 transition-colors"
            title="Plan anpassen"
            onClick={() => router.push(`/os/patients/${alert.patientId}?tab=hausaufgaben`)}
          >
            <ClipboardList className="h-3.5 w-3.5" />
          </button>
          <button
            className={`h-7 w-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-30 ${
              pushStatus === "sent" ? "bg-emerald-50 text-emerald-500"
              : pushStatus === "no_sub" ? "bg-red-50 text-red-400"
              : pushStatus === "error" ? "bg-red-50 text-red-400"
              : "hover:bg-amber-50 text-slate-400 hover:text-amber-600"
            }`}
            title={
              !alert.userId ? "Kein App-Konto"
              : pushStatus === "sent" ? "Push + Chat gesendet!"
              : pushStatus === "no_sub" ? "Chat gesendet (Push nicht aktiviert)"
              : pushStatus === "error" ? "Fehler beim Senden"
              : "Erinnerung senden (Push + Chat)"
            }
            disabled={pushStatus === "sending"}
            onClick={handlePush}
          >
            {pushStatus === "sent" ? <CheckCircle2 className="h-3.5 w-3.5" />
            : pushStatus === "no_sub" ? <AlertCircle className="h-3.5 w-3.5" />
            : <Bell className={`h-3.5 w-3.5 ${pushStatus === "sending" ? "animate-pulse" : ""}`} />}
          </button>
          <button
            className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
            title="Erledigt"
            onClick={() => onDismiss(alert.patientId)}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
          </button>
          <button
            className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-300 hover:text-slate-500 transition-colors"
            onClick={() => { setExpanded(!expanded); setShowMessage(false) }}
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Inline quick-message composer */}
      {showMessage && (
        <div className="px-4 pb-3">
          <QuickMessageComposer
            patientId={alert.patientId}
            patientName={`${alert.vorname} ${alert.nachname}`}
            onClose={() => setShowMessage(false)}
            onSent={() => {}}
          />
        </div>
      )}

      {/* Expanded detail panel */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* All alert reasons with recommendations */}
          {alert.gruende.map((grund) => (
            <div key={grund.key} className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 flex items-start gap-2.5">
              <div className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${
                grund.severity === "ROT" ? "bg-red-100" : "bg-amber-100"
              }`}>
                {grund.severity === "ROT" ? (
                  <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                )}
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-semibold ${grund.severity === "ROT" ? "text-red-700" : "text-amber-700"}`}>
                  {grund.label}
                </p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{grund.empfehlung}</p>
              </div>
            </div>
          ))}

          {/* Pain + Compliance detail row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Pain panel */}
            {alert.painHistory.length > 0 && (
              <div className="rounded-xl bg-white border border-slate-100 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                  <Activity className="h-3 w-3" /> Schmerzverlauf 7 Tage
                </p>
                <div className="flex items-center gap-3">
                  <PainChart history={alert.painHistory} />
                  <div>
                    <p className="text-lg font-bold text-slate-800">{lastPain?.level}<span className="text-xs text-slate-400">/10</span></p>
                    {painTrend > 0 && <span className="text-[10px] text-red-500 font-semibold flex items-center gap-0.5"><TrendingUp className="h-3 w-3" /> +{painTrend}</span>}
                    {painTrend < 0 && <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5"><TrendingDown className="h-3 w-3" /> {painTrend}</span>}
                    {painTrend === 0 && <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Minus className="h-3 w-3" /> Stabil</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Compliance panel */}
            {alert.compliance && (
              <div className="rounded-xl bg-white border border-slate-100 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                  <ClipboardList className="h-3 w-3" /> Compliance 7 Tage
                </p>
                <div className="flex items-center gap-3">
                  <ComplianceRing compliance={alert.compliance} />
                  <div>
                    <p className="text-lg font-bold text-slate-800">{alert.compliance.percent}<span className="text-xs text-slate-400">%</span></p>
                    <p className="text-[10px] text-slate-400">{alert.compliance.done}/{alert.compliance.expected} Einheiten</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => router.push(`/os/patients/${alert.patientId}?tab=befindlichkeit`)}>
              <ExternalLink className="h-3 w-3" /> Patient oeffnen
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// -- SVG Pain Chart (slightly larger for detail panel) -----------------------

function PainChart({ history }: { history: Array<{ date: string; level: number }> }) {
  const w = 120
  const h = 36
  const max = 10
  const pad = 2
  const stepX = history.length > 1 ? (w - pad * 2) / (history.length - 1) : 0
  const points = history.map((e, i) => ({
    x: pad + i * stepX,
    y: pad + ((max - e.level) / max) * (h - pad * 2),
  }))
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`
  const last = history[history.length - 1]
  const color = last.level >= 7 ? "#ef4444" : last.level >= 4 ? "#f59e0b" : "#10b981"

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id="pcg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#pcg)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="2.5" fill={color} />
    </svg>
  )
}

// -- Compliance Ring ---------------------------------------------------------

function ComplianceRing({ compliance }: { compliance: { expected: number; done: number; percent: number } }) {
  const size = 36
  const sw = 4
  const r = (size - sw) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - compliance.percent / 100)
  const color = compliance.percent < 25 ? "#ef4444" : compliance.percent < 50 ? "#f59e0b" : "#10b981"

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={sw} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  )
}

// -- Skeleton ----------------------------------------------------------------

function AmpelPageSkeleton() {
  return (
    <div className="space-y-0">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Skeleton className="h-2.5 w-2.5 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  )
}

// -- Page --------------------------------------------------------------------

type FilterTab = "alle" | "rot" | "gelb"
type SortKey = "status" | "pain" | "compliance" | "checkin"

export default function AmpelPage() {
  const { alerts, isLoading, error, refresh } = usePatientAlerts()
  const [filter, setFilter] = useState<FilterTab>("alle")
  const [sortKey, setSortKey] = useState<SortKey>("status")
  const [sortAsc, setSortAsc] = useState(true)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const handleDismiss = useCallback((id: string) => {
    setDismissed((prev) => new Set(prev).add(id))
  }, [])

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(true) }
  }, [sortKey, sortAsc])

  // Only ROT + GELB — never show GRUEN
  const actionableAlerts = useMemo(() => {
    let list = alerts.filter((a) => a.status !== "GRUEN")
    if (filter === "rot") list = list.filter((a) => a.status === "ROT")
    if (filter === "gelb") list = list.filter((a) => a.status === "GELB")

    // Sort
    list = [...list].sort((a, b) => {
      // Dismissed always at the end
      const ad = dismissed.has(a.patientId) ? 1 : 0
      const bd = dismissed.has(b.patientId) ? 1 : 0
      if (ad !== bd) return ad - bd

      let cmp = 0
      switch (sortKey) {
        case "status": {
          const order: Record<AmpelStatus, number> = { ROT: 0, GELB: 1, GRUEN: 2 }
          cmp = order[a.status] - order[b.status]
          break
        }
        case "pain": {
          const ap = a.painHistory.length > 0 ? a.painHistory[a.painHistory.length - 1].level : -1
          const bp = b.painHistory.length > 0 ? b.painHistory[b.painHistory.length - 1].level : -1
          cmp = bp - ap
          break
        }
        case "compliance": {
          const ac = a.compliance?.percent ?? 999
          const bc = b.compliance?.percent ?? 999
          cmp = ac - bc
          break
        }
        case "checkin": {
          const aDate = a.letzterCheckIn ? new Date(a.letzterCheckIn).getTime() : 0
          const bDate = b.letzterCheckIn ? new Date(b.letzterCheckIn).getTime() : 0
          cmp = aDate - bDate
          break
        }
      }
      return sortAsc ? cmp : -cmp
    })

    return list
  }, [alerts, filter, sortKey, sortAsc, dismissed])

  const rotCount = alerts.filter((a) => a.status === "ROT" && !dismissed.has(a.patientId)).length
  const gelbCount = alerts.filter((a) => a.status === "GELB" && !dismissed.has(a.patientId)).length

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f7" }}>
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white">
        <div className="container mx-auto max-w-7xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Patienten-Ampel</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {rotCount + gelbCount > 0
                  ? `${rotCount + gelbCount} ${rotCount + gelbCount === 1 ? "Patient braucht" : "Patienten brauchen"} Aufmerksamkeit`
                  : "Alle Patienten im gruenen Bereich"}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5"
              onClick={() => { setDismissed(new Set()); refresh() }}
              disabled={isLoading}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Aktualisieren
            </Button>
          </div>

          {/* Summary + Filters */}
          <div className="flex items-center gap-4 mt-4">
            {/* Compact stat pills */}
            <div className="flex items-center gap-2">
              {rotCount > 0 && (
                <div className="flex items-center gap-1.5 bg-red-50 border border-red-200/60 rounded-lg px-3 py-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-xs font-bold text-red-700">{rotCount}</span>
                  <span className="text-[10px] text-red-500">Kritisch</span>
                </div>
              )}
              {gelbCount > 0 && (
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 rounded-lg px-3 py-1.5">
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="text-xs font-bold text-amber-700">{gelbCount}</span>
                  <span className="text-[10px] text-amber-500">Beobachten</span>
                </div>
              )}
              {rotCount === 0 && gelbCount === 0 && !isLoading && (
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 rounded-lg px-3 py-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-700">Alles gut</span>
                </div>
              )}
            </div>

            <div className="ml-auto">
              <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
                <TabsList className="h-8 bg-slate-100/80">
                  <TabsTrigger value="alle" className="text-[11px] h-6">Alle</TabsTrigger>
                  <TabsTrigger value="rot" className="text-[11px] h-6">Rot</TabsTrigger>
                  <TabsTrigger value="gelb" className="text-[11px] h-6">Gelb</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="container mx-auto max-w-7xl px-6 py-4">
        <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            <div className="w-2.5" /> {/* dot */}
            <div className="w-9" /> {/* avatar */}
            <button className="flex-1 text-left hover:text-slate-600 transition-colors" onClick={() => handleSort("status")}>
              Patient / Grund {sortKey === "status" && (sortAsc ? "^" : "v")}
            </button>
            <button className="hidden md:block w-28 text-left hover:text-slate-600 transition-colors" onClick={() => handleSort("pain")}>
              Schmerz {sortKey === "pain" && (sortAsc ? "^" : "v")}
            </button>
            <button className="hidden sm:block w-16 text-right hover:text-slate-600 transition-colors" onClick={() => handleSort("compliance")}>
              Compliance {sortKey === "compliance" && (sortAsc ? "^" : "v")}
            </button>
            <button className="hidden lg:block w-16 text-right hover:text-slate-600 transition-colors" onClick={() => handleSort("checkin")}>
              Check-In {sortKey === "checkin" && (sortAsc ? "^" : "v")}
            </button>
            <div className="w-[168px]">Aktionen</div>
          </div>

          {/* Loading */}
          {isLoading && <AmpelPageSkeleton />}

          {/* Empty state */}
          {!isLoading && actionableAlerts.length === 0 && (
            <div className="p-12 text-center">
              <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <p className="text-base font-semibold text-slate-700">Keine offenen Alerts</p>
              <p className="text-sm text-slate-400 mt-1">Alle Patienten sind im gruenen Bereich.</p>
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-sm text-red-600">{error}</p>
              <Button size="sm" variant="ghost" onClick={refresh} className="mt-2 text-red-600">Erneut versuchen</Button>
            </div>
          )}

          {/* Rows */}
          {!isLoading && !error && actionableAlerts.map((alert) => (
            <AlertRow
              key={alert.patientId}
              alert={alert}
              onDismiss={handleDismiss}
              isDismissed={dismissed.has(alert.patientId)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
