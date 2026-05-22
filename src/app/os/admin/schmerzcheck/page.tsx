"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

/** PROJ-23 / Phase 4: Schmerzcheck-Funnel-Übersicht (Admin). */

interface FunnelData {
  leads: { total: number; byStatus: Record<string, number>; consentConfirmed: number }
  results: { total: number; byCategory: Record<string, number>; bySeverity: Record<string, number> }
  emails: { sent: Record<string, number>; unsubscribed: number }
  recent: { first_name: string; email: string; status: string; consent_status: string; created_at: string }[]
}

const STATUS_LABEL: Record<string, string> = {
  awaiting_check: "Wartet auf Check",
  check_started: "Check gestartet",
  check_completed: "Check abgeschlossen",
  red_flag_routed: "Red-Flag (Arzt-Verweis)",
  abandoned: "Abgebrochen",
}
const CATEGORY_LABEL: Record<string, string> = {
  needs_physician_assessment: "Ärztliche Abklärung",
  acute_severe: "Akut · ausgeprägt",
  chronic_severe: "Chronisch · ausgeprägt",
  acute_moderate: "Akut · moderat",
  chronic_moderate: "Chronisch · moderat",
  mild: "Leicht",
}

function Metric({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <Card className="p-5">
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="mt-1 text-sm font-medium text-slate-600">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </Card>
  )
}

export default function AdminSchmerzcheckPage() {
  const [data, setData] = useState<FunnelData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/schmerzcheck/funnel")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Fehler")
        setData(await r.json())
      })
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <div className="p-8 text-red-600">{error}</div>
  if (!data) return <div className="p-8 text-slate-400">Lädt…</div>

  const { leads, results, emails, recent } = data
  const completed = leads.byStatus.check_completed ?? 0
  const convRate = leads.total ? Math.round((completed / leads.total) * 100) : 0

  return (
    <div className="mx-auto max-w-6xl p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Schmerzcheck — Funnel</h1>
      <p className="mt-1 text-sm text-slate-500">Leads, Check-Abschlüsse und E-Mail-Versand im Überblick.</p>

      {/* Funnel */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label="Leads gesamt" value={leads.total} />
        <Metric label="Double-Opt-in bestätigt" value={leads.consentConfirmed} />
        <Metric label="Check abgeschlossen" value={completed} sub={`${convRate}% der Leads`} />
        <Metric label="Red-Flag → Arzt" value={leads.byStatus.red_flag_routed ?? 0} />
      </div>

      {/* Status breakdown */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Status</h2>
          <ul className="space-y-2">
            {Object.entries(STATUS_LABEL).map(([k, label]) => (
              <li key={k} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{label}</span>
                <span className="font-semibold text-slate-900">{leads.byStatus[k] ?? 0}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Ergebnis-Kategorie</h2>
          <ul className="space-y-2">
            {Object.entries(CATEGORY_LABEL).map(([k, label]) => (
              <li key={k} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{label}</span>
                <span className="font-semibold text-slate-900">{results.byCategory[k] ?? 0}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Emails */}
      <Card className="mt-6 p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">E-Mail-Versand (gesendet)</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          {["T1", "T2", "T3", "D1", "D2", "D3", "D4"].map((code) => (
            <div key={code} className="rounded-lg bg-slate-50 px-3 py-2">
              <span className="font-semibold text-slate-900">{code}</span>{" "}
              <span className="text-slate-500">{emails.sent[code] ?? 0}</span>
            </div>
          ))}
          <div className="rounded-lg bg-amber-50 px-3 py-2">
            <span className="font-semibold text-amber-700">Abgemeldet</span>{" "}
            <span className="text-amber-600">{emails.unsubscribed}</span>
          </div>
        </div>
      </Card>

      {/* Recent leads */}
      <Card className="mt-6 overflow-hidden">
        <h2 className="border-b border-slate-100 p-5 text-sm font-bold uppercase tracking-wide text-slate-500">
          Letzte Leads
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-semibold">Vorname</th>
                <th className="px-5 py-3 font-semibold">E-Mail</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">DOI</th>
                <th className="px-5 py-3 font-semibold">Erstellt</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((l, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3 text-slate-900">{l.first_name}</td>
                  <td className="px-5 py-3 text-slate-600">{l.email}</td>
                  <td className="px-5 py-3 text-slate-600">{STATUS_LABEL[l.status] ?? l.status}</td>
                  <td className="px-5 py-3 text-slate-600">{l.consent_status === "confirmed" ? "✓" : "—"}</td>
                  <td className="px-5 py-3 text-slate-400">
                    {new Date(l.created_at).toLocaleDateString("de-DE")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
