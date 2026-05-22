"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Send,
  MailCheck,
  ClipboardCheck,
  FileDown,
  CalendarCheck,
  AlertTriangle,
} from "lucide-react"

interface FunnelData {
  funnel: {
    visitors: number
    leads: number
    confirmed: number
    completed: number
    pdfDownloads: number
    booked: number
  }
  leads: {
    total: number
    byStatus: Record<string, number>
    consentConfirmed: number
    booked: number
    byUtmSource: Record<string, number>
  }
  results: { total: number; byCategory: Record<string, number>; bySeverity: Record<string, number> }
  emails: { sent: Record<string, number>; unsubscribed: number }
  devices: Record<string, number>
  recent: { first_name: string; email: string; status: string; consent_status: string; created_at: string }[]
}

const CATEGORY_LABELS: Record<string, string> = {
  needs_physician_assessment: "Ärztliche Abklärung",
  acute_severe: "Akut · ausgeprägt",
  chronic_severe: "Chronisch · ausgeprägt",
  acute_moderate: "Akut · moderat",
  chronic_moderate: "Chronisch · moderat",
  mild: "Leicht",
}
const SEVERITY_LABELS: Record<string, string> = {
  low: "Leicht",
  moderate: "Moderat",
  high: "Hoch",
  very_high: "Sehr hoch",
}
const EMAIL_LABELS: Record<string, string> = {
  T1: "T1 · Willkommen",
  T2: "T2 · Report",
  T3: "T3 · Red-Flag",
  D1: "Drip 1",
  D2: "Drip 2",
  D3: "Drip 3",
  D4: "Drip 4",
}
const STATUS_LABELS: Record<string, string> = {
  awaiting_check: "Wartet auf Check",
  check_started: "Check gestartet",
  check_completed: "Abgeschlossen",
  red_flag_routed: "Red-Flag (Arzt)",
  abandoned: "Abgebrochen",
}

const pct = (n: number, base: number) => (base > 0 ? Math.round((n / base) * 100) : 0)

export function SchmerzcheckFunnelTab() {
  const [data, setData] = useState<FunnelData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/schmerzcheck/funnel")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="py-8 text-center text-muted-foreground">Lade Funnel-Daten…</div>
  if (!data?.funnel)
    return <div className="py-8 text-center text-muted-foreground">Daten konnten nicht geladen werden.</div>

  const f = data.funnel
  const steps = [
    { label: "Besucher (Landing)", value: f.visitors, icon: Users },
    { label: "Lead abgeschickt", value: f.leads, icon: Send },
    { label: "E-Mail bestätigt", value: f.confirmed, icon: MailCheck },
    { label: "Check abgeschlossen", value: f.completed, icon: ClipboardCheck },
    { label: "PDF heruntergeladen", value: f.pdfDownloads, icon: FileDown },
    { label: "Video-Analyse gebucht", value: f.booked, icon: CalendarCheck },
  ]
  const top = Math.max(f.visitors, f.leads, 1)
  const redFlags = data.leads.byStatus.red_flag_routed ?? 0

  const utmSorted = Object.entries(data.leads.byUtmSource).sort((a, b) => b[1] - a[1])
  const devSorted = Object.entries(data.devices).sort((a, b) => b[1] - a[1])
  const catSorted = Object.entries(data.results.byCategory)
    .map(([k, v]) => [CATEGORY_LABELS[k] ?? k, v] as [string, number])
    .sort((a, b) => b[1] - a[1])
  const sevSorted = Object.entries(data.results.bySeverity)
    .map(([k, v]) => [SEVERITY_LABELS[k] ?? k, v] as [string, number])
    .sort((a, b) => b[1] - a[1])
  const emailSorted = Object.entries(data.emails.sent).sort((a, b) => a[0].localeCompare(b[0]))

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={<Users className="h-4 w-4" />} label="Besucher (Landing)" value={f.visitors} />
        <KpiCard icon={<Send className="h-4 w-4" />} label="Leads" value={f.leads} sub={`${pct(f.leads, f.visitors)}% der Besucher`} />
        <KpiCard icon={<ClipboardCheck className="h-4 w-4" />} label="Check abgeschlossen" value={f.completed} sub={`${pct(f.completed, f.leads)}% der Leads`} />
        <KpiCard icon={<CalendarCheck className="h-4 w-4" />} label="Gebucht" value={f.booked} sub={`${pct(f.booked, f.leads)}% der Leads`} />
      </div>

      {/* Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Funnel-Trichter</CardTitle>
          <CardDescription>Von Besucher bis Buchung — Übergang je Stufe rechts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {steps.map((s, i) => {
              const prev = i > 0 ? steps[i - 1].value : s.value
              const Icon = s.icon
              return (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="flex w-40 shrink-0 items-center gap-2 text-sm sm:w-48">
                    <Icon className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="truncate">{s.label}</span>
                  </div>
                  <div className="relative h-8 flex-1 overflow-hidden rounded bg-muted">
                    <div
                      className="absolute inset-y-0 left-0 rounded bg-emerald-500"
                      style={{ width: `${s.value > 0 ? Math.max(pct(s.value, top), 4) : 0}%` }}
                    />
                    <span className="absolute inset-y-0 left-2 flex items-center text-xs font-semibold text-slate-900">
                      {s.value.toLocaleString("de-DE")}
                    </span>
                  </div>
                  <span className="w-14 shrink-0 text-right text-xs text-muted-foreground">
                    {i === 0 ? "—" : `${pct(s.value, prev)}%`}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <ListCard title="Leads nach Quelle (UTM)" rows={utmSorted} empty="Noch keine Leads." />
        <ListCard title="Besucher nach Gerät" rows={devSorted} empty="Noch keine Besucher." />
        <ListCard title="Ergebnis-Kategorien" rows={catSorted} empty="Noch keine Abschlüsse." />
        <ListCard title="Schweregrad" rows={sevSorted} empty="Noch keine Abschlüsse." />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sicherheit & Abmeldungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-red-500" /> Red-Flag → Arzt-Verweis
              </span>
              <Badge variant={redFlags > 0 ? "destructive" : "secondary"}>{redFlags}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Abmeldungen / Buchungs-Stopps</span>
              <Badge variant="secondary">{data.emails.unsubscribed}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">E-Mail-Versand</CardTitle>
          </CardHeader>
          <CardContent>
            {emailSorted.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Noch keine Mails versendet.</p>
            ) : (
              <div className="space-y-2.5">
                {emailSorted.map(([code, n]) => (
                  <div key={code} className="flex items-center justify-between">
                    <span className="text-sm">{EMAIL_LABELS[code] ?? code}</span>
                    <Badge variant="secondary">{n}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Letzte Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recent.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Noch keine Leads.</p>
          ) : (
            <div className="space-y-2">
              {data.recent.map((r, i) => (
                <div key={i} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0 truncate">
                    <span className="font-medium">{r.first_name || "—"}</span>{" "}
                    <span className="text-muted-foreground">{r.email}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline">{STATUS_LABELS[r.status] ?? r.status}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("de-DE")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function KpiCard({ icon, label, value, sub }: { icon: ReactNode; label: string; value: number; sub?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-1.5">
          {icon}
          {label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value.toLocaleString("de-DE")}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function ListCard({ title, rows, empty }: { title: string; rows: [string, number][]; empty: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">{empty}</p>
        ) : (
          <div className="space-y-2.5">
            {rows.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-sm">{k}</span>
                <Badge variant="secondary">{v}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
