"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useHrAuth } from "@/hooks/use-hr-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import {
  Users, Activity, Heart, Star, FileText, AlertCircle, ShieldCheck,
  TrendingUp, TrendingDown, Stethoscope, Mail, Receipt, Download,
  Lightbulb, ArrowUpRight, ArrowDownRight, Minus, CheckCircle2,
} from "lucide-react"
import { formatZeitraum, BGF_INVOICE_STATUS_CONFIG } from "@/types/bgf-invoice"
import { monatspreis } from "@/lib/bgf-pakete"

// ─── Types ───────────────────────────────────────────────────────────

interface DashboardData {
  zeitraum: number
  mitglieder: { total: number; aktiv: number; eingeladen: number; ist_analyse_quote: number }
  gesundheit: {
    avg_schmerz: number | null; avg_stress: number | null; avg_schlaf: number | null
    avg_risiko_score: number | null
    baseline_schmerz: number | null; baseline_stress: number | null; baseline_schlaf: number | null
    trend_schmerz: "up" | "down" | "stable"; trend_stress: "up" | "down" | "stable"; trend_schlaf: "up" | "down" | "stable"
    checkin_count: number
    top_beschwerden: { region: string; count: number; prozent: number }[]
  }
  pausen_fit: { total: number; completed: number; teilnahmequote: number; prev_teilnahmequote: number; trend_teilnahme: "up" | "down" | "stable" }
  feedback: { avg_sterne: number | null; anzahl_bewertungen: number }
  abteilungen: { name: string; total: number; aktiv: number; teilnahmequote: number; analyse_quote: number }[]
  roi: {
    paket_label: string | null; effektiv_pro_ma_monat: number | null
    lizenzen: number; monatlich_netto: number | null
    jaehrlich_netto: number | null; teilnahmequote: number; active_members: number
    fehltage_pro_ma: number; personalkosten_pro_tag: number; krankenquote: number
    daten_quelle: "eigene" | "branche"; branche: string | null
  }
}

interface InvoiceRow {
  id: string; invoice_number: string; zeitraum_monat: number; zeitraum_jahr: number
  gesamtbetrag: number; status: string; invoice_date: string; due_date: string; paid_at: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────

function healthColor(value: number | null, type: "schmerz" | "stress" | "schlaf"): string {
  if (value === null) return "bg-slate-200"
  if (type === "schlaf") return value >= 7 ? "bg-emerald-500" : value >= 5 ? "bg-amber-500" : "bg-red-500"
  return value <= 3 ? "bg-emerald-500" : value <= 6 ? "bg-amber-500" : "bg-red-500"
}

function StarRating({ value }: { value: number | null }) {
  if (value === null) return <span className="text-slate-400">–</span>
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-4 w-4 ${i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
      ))}
      <span className="ml-1.5 text-sm font-bold text-slate-700">{value.toFixed(1)}</span>
    </div>
  )
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const config = BGF_INVOICE_STATUS_CONFIG[status as keyof typeof BGF_INVOICE_STATUS_CONFIG]
  if (!config) return <Badge variant="secondary">{status}</Badge>
  return <Badge className={`${config.color} border-0 text-[11px]`}>{config.label}</Badge>
}

// ─── Loading ─────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    </div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────

const ZEITRAUM_OPTIONS = [
  { label: "7 Tage", value: 7 },
  { label: "30 Tage", value: 30 },
  { label: "90 Tage", value: 90 },
]

export default function HrDashboardPage() {
  const router = useRouter()
  const { isLoading: authLoading, isAuthorized, organizationId, organizationName } = useHrAuth()
  const [zeitraum, setZeitraum] = useState(30)
  const [data, setData] = useState<DashboardData | null>(null)
  const [dataLoading, setDataLoading] = useState(false)
  const [therapeut, setTherapeut] = useState<{ name: string; role: string; email: string } | null>(null)
  const [invoices, setInvoices] = useState<InvoiceRow[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    if (!organizationId) return
    setDataLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/bgf/organizations/${organizationId}/dashboard?zeitraum=${zeitraum}`)
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Fehler.")
      setData(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler.")
    } finally {
      setDataLoading(false)
    }
  }, [organizationId, zeitraum])

  useEffect(() => {
    if (!isAuthorized || !organizationId) return
    fetchDashboard()

    // Load therapeut
    fetch(`/api/bgf/organizations/${organizationId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.organization?.therapeut_id) {
          fetch("/api/bgf/therapeuten").then((r) => r.json()).then((tData) => {
            const t = (tData.therapeuten ?? []).find((t: { id: string }) => t.id === d.organization.therapeut_id)
            if (t) setTherapeut(t)
          }).catch(() => {})
        }
      }).catch(() => {})

    // Load invoices
    fetch(`/api/bgf/organizations/${organizationId}/invoices`)
      .then((r) => r.json())
      .then((d) => setInvoices(d.invoices ?? []))
      .catch(() => {})
  }, [isAuthorized, organizationId, fetchDashboard])

  if (authLoading) return <DashboardSkeleton />
  if (!isAuthorized) return null

  const isLoading = dataLoading || !data
  const d = data! // shorthand — null check handled by isLoading guard

  return (
    <div className="space-y-6">
      {/* ── Premium Dark Hero Header ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-indigo-300/70 uppercase tracking-widest mb-1">
              Betriebliche Gesundheitsförderung
            </p>
            <h1 className="text-2xl font-bold">{organizationName ?? "Ihr Unternehmen"}</h1>
            {d && (
              <p className="text-sm text-white/40 mt-1">
                {d.mitglieder.aktiv} aktive Mitarbeitende · {d.pausen_fit.teilnahmequote}% Teilnahme
              </p>
            )}
          </div>

          {/* Time filter */}
          <div className="flex items-center gap-1 rounded-xl bg-white/10 p-1">
            {ZEITRAUM_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setZeitraum(opt.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  zeitraum === opt.value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Key metric row */}
        {d && (
          <div className="relative flex items-center gap-4 mt-5">
            <div className="flex-1 bg-white/10 rounded-xl p-3">
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Teilnahme</p>
              <p className="text-2xl font-bold tabular-nums">{d.pausen_fit.teilnahmequote}%</p>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl p-3">
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Ø Risiko</p>
              <p className={`text-2xl font-bold tabular-nums ${
                (d.gesundheit.avg_risiko_score ?? 0) >= 60 ? "text-red-400" :
                (d.gesundheit.avg_risiko_score ?? 0) >= 30 ? "text-amber-400" : "text-emerald-400"
              }`}>{d.gesundheit.avg_risiko_score ?? "–"}<span className="text-sm text-white/30">/100</span></p>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl p-3">
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Zufriedenheit</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-2xl font-bold tabular-nums">{d.feedback.avg_sterne?.toFixed(1) ?? "–"}</span>
              </div>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl p-3">
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Sessions</p>
              <p className="text-2xl font-bold tabular-nums">{d.pausen_fit.completed}<span className="text-sm text-white/30">/{d.pausen_fit.total}</span></p>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Error ─────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={fetchDashboard} className="ml-auto font-medium underline">Erneut versuchen</button>
        </div>
      )}

      {/* ── Therapeuten-Steckbrief ─────────────────────────── */}
      {therapeut && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-emerald-200">
                  <AvatarFallback className="bg-emerald-600 text-white text-lg font-bold">
                    {therapeut.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Stethoscope className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Ihr betreuender Therapeut</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{therapeut.name}</h3>
                  <p className="text-sm text-slate-500">{therapeut.role}</p>
                </div>
                <a
                  href={`mailto:${therapeut.email}`}
                  className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 bg-white/80 rounded-xl px-4 py-2.5 border border-emerald-100 hover:border-emerald-200 transition-colors shadow-sm"
                >
                  <Mail className="h-4 w-4" />
                  Kontakt
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Gesundheitsprofil + Beschwerden ────────────────── */}
      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Health Profile */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="border-slate-200 bg-white shadow-sm rounded-2xl h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <Heart className="h-4 w-4 text-rose-500" />
                  Gesundheitsprofil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {d.gesundheit.checkin_count > 0 && (
                  <p className="text-[10px] text-slate-400 -mt-1">
                    Basierend auf {d.gesundheit.checkin_count} Check-Ins im Zeitraum
                  </p>
                )}
                {[
                  { label: "Ø Schmerz", value: d.gesundheit.avg_schmerz, baseline: d.gesundheit.baseline_schmerz, trend: d.gesundheit.trend_schmerz, type: "schmerz" as const, emoji: "🎯", lowerBetter: true },
                  { label: "Ø Stress", value: d.gesundheit.avg_stress, baseline: d.gesundheit.baseline_stress, trend: d.gesundheit.trend_stress, type: "stress" as const, emoji: "🧘", lowerBetter: true },
                  { label: "Ø Schlaf", value: d.gesundheit.avg_schlaf, baseline: d.gesundheit.baseline_schlaf, trend: d.gesundheit.trend_schlaf, type: "schlaf" as const, emoji: "😴", lowerBetter: false },
                ].map(({ label, value, baseline, trend, type, emoji, lowerBetter }) => {
                  const improved = baseline !== null && value !== null
                    ? (lowerBetter ? value < baseline : value > baseline)
                    : false
                  const diff = baseline !== null && value !== null
                    ? Math.round(Math.abs(value - baseline) * 10) / 10
                    : null

                  return (
                    <div key={type}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-slate-600 flex items-center gap-1.5">{emoji} {label}</span>
                        <div className="flex items-center gap-2">
                          {diff !== null && diff > 0.2 && (
                            <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
                              improved ? "text-emerald-600" : "text-red-500"
                            }`}>
                              {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : trend === "down" ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                              {improved ? "-" : "+"}{diff} vs. Start
                            </span>
                          )}
                          <span className="text-sm font-bold text-slate-900">
                            {value !== null ? `${value}/10` : "–"}
                          </span>
                        </div>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                        {value !== null && (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(value / 10) * 100}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full rounded-full ${healthColor(value, type)}`}
                          />
                        )}
                      </div>
                      {baseline !== null && value !== null && (
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-slate-300">Start: {baseline}/10</span>
                          <span className="text-[10px] text-slate-300">Aktuell: {value}/10</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Beschwerden */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-slate-200 bg-white shadow-sm rounded-2xl h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <Activity className="h-4 w-4 text-blue-500" />
                  Häufigste Beschwerden
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {d.gesundheit.top_beschwerden.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">Keine Daten verfügbar.</p>
                ) : (
                  d.gesundheit.top_beschwerden.map(({ region, prozent }, i) => (
                    <div key={region}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-sm capitalize text-slate-700 font-medium">{region}</span>
                        <span className="text-sm font-bold text-slate-900">{prozent}%</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${prozent}%` }}
                          transition={{ duration: 0.6, delay: i * 0.1 }}
                          className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* ── Abteilungs-Vergleich + Pausen-Fit ─────────────── */}
      {!isLoading && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Abteilungen */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="border-slate-200 bg-white shadow-sm rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <Users className="h-4 w-4 text-purple-500" />
                  Abteilungs-Vergleich
                </CardTitle>
              </CardHeader>
              <CardContent>
                {d.abteilungen.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">Mindestens 5 MA pro Abteilung erforderlich.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-100">
                        <TableHead className="text-xs">Abteilung</TableHead>
                        <TableHead className="text-right text-xs">MA</TableHead>
                        <TableHead className="text-right text-xs">Teilnahme</TableHead>
                        <TableHead className="text-right text-xs">Analyse</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {d.abteilungen.map((abt) => (
                        <TableRow key={abt.name} className="border-slate-50">
                          <TableCell className="text-sm font-medium">{abt.name}</TableCell>
                          <TableCell className="text-right text-sm text-slate-500">{abt.total}</TableCell>
                          <TableCell className="text-right">
                            <Badge className={`text-[10px] border-0 ${
                              abt.teilnahmequote >= 70 ? "bg-emerald-100 text-emerald-700" :
                              abt.teilnahmequote >= 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                            }`}>{abt.teilnahmequote}%</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge className={`text-[10px] border-0 ${
                              abt.analyse_quote >= 70 ? "bg-emerald-100 text-emerald-700" :
                              abt.analyse_quote >= 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                            }`}>{abt.analyse_quote}%</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Pausen-Fit Nutzung */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-slate-200 bg-white shadow-sm rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  Pausen-Fit Nutzung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-4 text-center">
                    <p className="text-3xl font-bold text-slate-900">{d.pausen_fit.total}</p>
                    <p className="text-xs text-slate-500 mt-1">Sessions gesamt</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-4 text-center">
                    <p className="text-3xl font-bold text-emerald-700">{d.pausen_fit.completed}</p>
                    <p className="text-xs text-slate-500 mt-1">Abgeschlossen</p>
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-slate-600">Abschlussquote</span>
                    <span className="text-sm font-bold text-slate-900">{d.pausen_fit.teilnahmequote}%</span>
                  </div>
                  <Progress value={d.pausen_fit.teilnahmequote} className="h-2.5" />
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span className="text-sm text-slate-600">Ø Bewertung</span>
                  <StarRating value={d.feedback.avg_sterne} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* ── ROI Einsparungen ─────────────────────────────── */}
      {!isLoading && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Geschätzte Einsparungen durch BGF
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const r = d.roi
                const costPerSickDay = r.personalkosten_pro_tag
                const avgSickDaysPerYear = r.fehltage_pro_ma
                const teilnahme = r.teilnahmequote / 100
                const reductionFactor = Math.min(0.35, teilnahme * 0.4)
                const activeMA = r.active_members
                const lizenzen = r.lizenzen

                // OHNE BGF: Das volle Ausmaß
                const totalSickDaysWithout = Math.round(avgSickDaysPerYear * lizenzen)
                const totalCostWithout = Math.round(totalSickDaysWithout * costPerSickDay)

                // MIT BGF: Reduziert
                const savedDays = Math.round(avgSickDaysPerYear * reductionFactor * activeMA)
                const savedEuro = Math.round(savedDays * costPerSickDay)
                const totalSickDaysWith = totalSickDaysWithout - savedDays
                const totalCostWith = totalCostWithout - savedEuro

                const yearlyBgfCost = r.jaehrlich_netto ?? monatspreis(lizenzen).preis * 12
                const nettoGewinn = savedEuro - yearlyBgfCost
                const roiPercent = yearlyBgfCost > 0 ? Math.round((savedEuro / yearlyBgfCost) * 100) : 0
                const isEigeneDaten = r.daten_quelle === "eigene"

                return (
                  <div className="space-y-5">
                    {/* Datenquelle + Bearbeiten */}
                    <div className="flex items-center justify-between">
                      <Badge className={`text-[10px] border-0 ${isEigeneDaten ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {isEigeneDaten ? "Basierend auf Ihren Unternehmensdaten" : `Schätzwerte für Branche: ${r.branche ?? "Allgemein"}`}
                      </Badge>
                      <HrKennzahlenDialog orgId={organizationId!} onSaved={fetchDashboard} />
                    </div>

                    {/* ── OHNE BGF: Das Problem ──────────────── */}
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-5 border border-red-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-red-800 uppercase tracking-wider">Ohne BGF-Programm</p>
                          <p className="text-[10px] text-red-500">Was Krankheit Ihr Unternehmen jährlich kostet</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/70 rounded-xl p-4 text-center border border-red-100">
                          <p className="text-4xl font-black text-red-600">{totalSickDaysWithout.toLocaleString("de-DE")}</p>
                          <p className="text-xs text-red-500 font-medium mt-1">Fehltage pro Jahr</p>
                          <p className="text-[10px] text-red-400 mt-0.5">{lizenzen} MA × {avgSickDaysPerYear} Tage</p>
                        </div>
                        <div className="bg-white/70 rounded-xl p-4 text-center border border-red-100">
                          <p className="text-4xl font-black text-red-600">{totalCostWithout.toLocaleString("de-DE")}<span className="text-xl"> €</span></p>
                          <p className="text-xs text-red-500 font-medium mt-1">Verlust durch Krankheit</p>
                          <p className="text-[10px] text-red-400 mt-0.5">{totalSickDaysWithout} Tage × {costPerSickDay} €/Tag</p>
                        </div>
                      </div>
                    </div>

                    {/* ── Pfeil ──────────────────────────────── */}
                    <div className="flex justify-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                        </div>
                        <p className="text-[10px] font-bold text-emerald-600">Mit BGF: -{Math.round(reductionFactor * 100)}% Reduktion</p>
                      </div>
                    </div>

                    {/* ── MIT BGF: Die Lösung ────────────────── */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Mit BGF-Programm</p>
                          <p className="text-[10px] text-emerald-500">Ihre geschätzte Einsparung</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/70 rounded-xl p-4 text-center border border-emerald-100">
                          <p className="text-3xl font-black text-emerald-600">{savedDays.toLocaleString("de-DE")}</p>
                          <p className="text-xs text-emerald-500 font-medium mt-1">Tage weniger krank</p>
                        </div>
                        <div className="bg-white/70 rounded-xl p-4 text-center border border-emerald-100">
                          <p className="text-3xl font-black text-emerald-600">{savedEuro.toLocaleString("de-DE")}<span className="text-lg"> €</span></p>
                          <p className="text-xs text-emerald-500 font-medium mt-1">Einsparung/Jahr</p>
                        </div>
                        <div className="bg-white/70 rounded-xl p-4 text-center border border-emerald-100">
                          <p className="text-3xl font-black text-emerald-600">{roiPercent}%</p>
                          <p className="text-xs text-emerald-500 font-medium mt-1">ROI</p>
                        </div>
                      </div>
                    </div>

                    {/* ── Netto-Ergebnis ─────────────────────── */}
                    <div className="rounded-2xl p-5 text-center bg-gradient-to-r from-emerald-600 to-teal-600 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                        backgroundSize: "16px 16px",
                      }} />
                      <div className="relative">
                        <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                          {nettoGewinn > 0 ? "Ihr Unternehmen gewinnt" : "Ihre BGF-Investition"}
                        </p>
                        {nettoGewinn > 0 ? (
                          <>
                            <p className="text-5xl font-black text-white">
                              {nettoGewinn.toLocaleString("de-DE")} <span className="text-2xl">€</span>
                            </p>
                            <p className="text-sm font-semibold text-emerald-200 mt-1">zusätzlich pro Jahr</p>
                            <p className="text-xs text-white/40 mt-3">
                              {savedEuro.toLocaleString("de-DE")} € Einsparung bei nur {yearlyBgfCost.toLocaleString("de-DE")} € Investition
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-5xl font-black text-white">
                              {yearlyBgfCost.toLocaleString("de-DE")} <span className="text-2xl">€/Jahr</span>
                            </p>
                            <p className="text-sm font-semibold text-emerald-200 mt-1">
                              amortisiert sich bei steigender Teilnahme
                            </p>
                            <p className="text-xs text-white/40 mt-3">
                              Bereits jetzt {savedEuro.toLocaleString("de-DE")} € Einsparung durch {d.pausen_fit.teilnahmequote}% Teilnahme
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* ── Szenario-Rechner ────────────────────── */}
                    <SzenarioRechner
                      baseMA={lizenzen}
                      baseFehltage={avgSickDaysPerYear}
                      baseKosten={costPerSickDay}
                      baseTeilnahme={d.pausen_fit.teilnahmequote}
                      bgfKosten={yearlyBgfCost}
                      isEigeneDaten={isEigeneDaten}
                      branche={r.branche}
                    />
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Handlungsempfehlungen für HR ───────────────────── */}
      {!isLoading && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Handlungsempfehlungen für Sie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(d.gesundheit.avg_schmerz ?? 0) >= 5 && (
                <div className="flex items-start gap-3 bg-white/80 rounded-xl p-4 border border-amber-100">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">🎯</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Ergonomie-Beratung buchen</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Der Ø Schmerz liegt bei {d.gesundheit.avg_schmerz}/10 — das ist überdurchschnittlich hoch.
                      <strong> Ihre nächsten Schritte:</strong> Kontaktieren Sie Ihren Therapeuten für eine Vor-Ort Ergonomie-Bewertung der Arbeitsplätze.
                      Diese Einzelleistung können Sie direkt über die Plattform anfragen (§2a Ihres Vertrages).
                    </p>
                  </div>
                </div>
              )}
              {d.pausen_fit.teilnahmequote < 50 && (
                <div className="flex items-start gap-3 bg-white/80 rounded-xl p-4 border border-amber-100">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">📢</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Interne Kommunikation aktivieren</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Nur {d.pausen_fit.teilnahmequote}% Ihres Teams nutzen das Programm aktiv.
                      <strong> Ihre nächsten Schritte:</strong> (1) Stellen Sie das BGF-Programm im nächsten Team-Meeting vor — 5 Minuten reichen.
                      (2) Ermöglichen Sie ausdrücklich 3×5 Min. Pausen-Fit während der Arbeitszeit.
                      (3) Benennen Sie einen "Gesundheitsbotschafter" pro Abteilung.
                    </p>
                  </div>
                </div>
              )}
              {(d.gesundheit.avg_stress ?? 0) >= 6 && (
                <div className="flex items-start gap-3 bg-white/80 rounded-xl p-4 border border-amber-100">
                  <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">🧠</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Stressmanagement prüfen</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Der Ø Stress liegt bei {d.gesundheit.avg_stress}/10 — Ihre Mitarbeitenden sind belastet.
                      <strong> Ihre nächsten Schritte:</strong> (1) Prüfen Sie Arbeitsbelastung und Deadlines in den betroffenen Abteilungen.
                      (2) Führen Sie ein anonymes Feedback-Gespräch mit den Abteilungsleitern.
                      (3) Erwägen Sie flexible Pausenregelungen.
                    </p>
                  </div>
                </div>
              )}
              {d.mitglieder.ist_analyse_quote < 70 && (
                <div className="flex items-start gap-3 bg-white/80 rounded-xl p-4 border border-amber-100">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">📋</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Ist-Analyse Quote erhöhen</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Nur {d.mitglieder.ist_analyse_quote}% haben die Gesundheits-Analyse abgeschlossen.
                      <strong> Ihre nächsten Schritte:</strong> Erinnern Sie nicht-teilnehmende Mitarbeitende per E-Mail.
                      Die Analyse dauert nur 3 Minuten und ist die Basis für personalisierte Empfehlungen.
                    </p>
                  </div>
                </div>
              )}
              {(d.gesundheit.avg_schmerz ?? 0) < 5 && d.pausen_fit.teilnahmequote >= 50 && (d.gesundheit.avg_stress ?? 0) < 6 && d.mitglieder.ist_analyse_quote >= 70 && (
                <div className="flex items-start gap-3 bg-white/80 rounded-xl p-4 border border-emerald-200">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">🎉</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Hervorragende Ergebnisse!</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Alle Gesundheitswerte im grünen Bereich, gute Teilnahme und niedrige Risiko-Scores.
                      <strong> Empfehlung:</strong> Teilen Sie diese Erfolge mit der Geschäftsleitung — das stärkt das Budget für BGF-Maßnahmen.
                      Nutzen Sie den Quartals-Report für eine professionelle Aufbereitung.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Rechnungen ────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-slate-200 bg-white shadow-sm rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Receipt className="h-4 w-4 text-slate-500" />
                Rechnungen
              </CardTitle>
              {invoices.length > 5 && (
                <Button variant="ghost" size="sm" className="text-xs text-slate-400">
                  Alle anzeigen
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">Noch keine Rechnungen vorhanden.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100">
                    <TableHead className="text-xs">Nr.</TableHead>
                    <TableHead className="text-xs">Zeitraum</TableHead>
                    <TableHead className="text-right text-xs">Netto</TableHead>
                    <TableHead className="text-right text-xs">Brutto</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-right text-xs">PDF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.slice(0, 5).map((inv) => (
                    <TableRow key={inv.id} className="border-slate-50">
                      <TableCell className="font-mono text-xs">{inv.invoice_number}</TableCell>
                      <TableCell className="text-sm">{formatZeitraum(inv.zeitraum_monat, inv.zeitraum_jahr)}</TableCell>
                      <TableCell className="text-right text-sm">{Number(inv.gesamtbetrag).toFixed(2)} €</TableCell>
                      <TableCell className="text-right text-sm font-semibold">{(Number(inv.gesamtbetrag) * 1.19).toFixed(2)} €</TableCell>
                      <TableCell><InvoiceStatusBadge status={inv.status} /></TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => window.open(`/api/admin/bgf-invoices/${inv.id}/pdf`, "_blank")}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Steuer-Tipp §3 Nr. 34 EStG ──────────────────── */}
      {!isLoading && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💶</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Steuervorteil: §3 Nr. 34 EStG</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Arbeitgeber können <strong>bis zu 600 € pro Mitarbeiter pro Jahr steuerfrei</strong> für
                    Maßnahmen der betrieblichen Gesundheitsförderung aufwenden. Ihre BGF-Investition fällt
                    in der Regel vollständig unter diese Steuerbefreiung.
                  </p>
                  <div className="mt-3 bg-white/70 rounded-xl p-3 border border-blue-100">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-xs text-slate-400">Freibetrag/MA</p>
                        <p className="text-lg font-bold text-blue-700">600 €</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Ihre MA</p>
                        <p className="text-lg font-bold text-slate-900">{d.roi.lizenzen}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Max. Steuerfrei</p>
                        <p className="text-lg font-bold text-emerald-700">{Math.min(600 * d.roi.lizenzen, d.roi.jaehrlich_netto ?? 600 * d.roi.lizenzen).toLocaleString("de-DE")} €</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Voraussetzung: Die Maßnahmen müssen den Anforderungen der §§ 20 und 20b SGB V entsprechen.
                    Praxis OS BGF erfüllt diese Anforderungen. Bitte sprechen Sie Ihren Steuerberater für die genaue Umsetzung an.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Report CTA + DSGVO ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700 flex-1">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>Datenschutzhinweis:</strong> Alle Daten sind anonymisiert und aggregiert. Individuelle Gesundheitsdaten einzelner Mitarbeiter sind nicht einsehbar.
          </span>
        </div>
        <Button
          onClick={() => router.push("/hr/reports")}
          className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-md flex-shrink-0"
          size="lg"
        >
          <FileText className="h-4 w-4" />
          Quartals-Report
        </Button>
      </div>
    </div>
  )
}

// ── Szenario-Rechner ─────────────────────────────────────────────────

function SzenarioRechner({
  baseMA, baseFehltage, baseKosten, baseTeilnahme, bgfKosten, isEigeneDaten, branche,
}: {
  baseMA: number; baseFehltage: number; baseKosten: number; baseTeilnahme: number
  bgfKosten: number; isEigeneDaten: boolean; branche: string | null
}) {
  const [simTeilnahme, setSimTeilnahme] = useState(baseTeilnahme)
  const [simReduktion, setSimReduktion] = useState(Math.round(Math.min(35, baseTeilnahme * 0.4)))
  const [open, setOpen] = useState(false)

  const simSavedDays = Math.round(baseFehltage * (simReduktion / 100) * baseMA)
  const simSavedEuro = Math.round(simSavedDays * baseKosten)
  const simNetto = simSavedEuro - bgfKosten
  const simRoi = bgfKosten > 0 ? Math.round((simSavedEuro / bgfKosten) * 100) : 0

  return (
    <details className="group" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-indigo-600 hover:text-indigo-800 py-2">
        <span className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-xs group-open:bg-indigo-600 group-open:text-white transition-colors">
          🎛️
        </span>
        Was-wäre-wenn Szenario-Rechner
        <span className="text-[10px] text-indigo-400 font-normal ml-1 group-open:hidden">— Klicken zum Öffnen</span>
      </summary>

      <div className="mt-3 bg-gradient-to-br from-indigo-50 via-white to-violet-50 rounded-2xl p-5 border border-indigo-100 space-y-5">
        <p className="text-xs text-slate-500">
          Spielen Sie mit den Werten und sehen Sie live, wie sich Teilnahme und Reduktion auf Ihre Einsparung auswirken.
        </p>

        {/* Slider: Teilnahmequote */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">Teilnahmequote</span>
            <span className="text-sm font-black text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-lg tabular-nums">{simTeilnahme}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={simTeilnahme}
            onChange={(e) => {
              const v = parseInt(e.target.value)
              setSimTeilnahme(v)
              setSimReduktion(Math.round(Math.min(35, v * 0.4)))
            }}
            className="w-full h-2 bg-indigo-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>10%</span>
            <span>Aktuell: {baseTeilnahme}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Slider: Reduktionsfaktor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">Fehltage-Reduktion</span>
            <span className="text-sm font-black text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-lg tabular-nums">{simReduktion}%</span>
          </div>
          <input
            type="range"
            min={5}
            max={50}
            step={1}
            value={simReduktion}
            onChange={(e) => setSimReduktion(parseInt(e.target.value))}
            className="w-full h-2 bg-indigo-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>5% (minimal)</span>
            <span>25-35% (Studien)</span>
            <span>50% (optimistisch)</span>
          </div>
        </div>

        {/* Live Ergebnis */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 text-center border border-indigo-100 shadow-sm">
            <p className="text-2xl font-black text-indigo-700 tabular-nums">{simSavedDays.toLocaleString("de-DE")}</p>
            <p className="text-[10px] text-indigo-500 font-medium mt-0.5">Tage eingespart</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-indigo-100 shadow-sm">
            <p className="text-2xl font-black text-indigo-700 tabular-nums">{simSavedEuro.toLocaleString("de-DE")} €</p>
            <p className="text-[10px] text-indigo-500 font-medium mt-0.5">Einsparung/Jahr</p>
          </div>
          <div className={`rounded-xl p-3 text-center border shadow-sm ${simNetto > 0 ? "bg-emerald-50 border-emerald-200" : "bg-white border-indigo-100"}`}>
            <p className={`text-2xl font-black tabular-nums ${simNetto > 0 ? "text-emerald-700" : "text-slate-700"}`}>
              {simNetto > 0 ? "+" : ""}{simNetto.toLocaleString("de-DE")} €
            </p>
            <p className={`text-[10px] font-medium mt-0.5 ${simNetto > 0 ? "text-emerald-500" : "text-slate-500"}`}>Netto-Gewinn</p>
          </div>
        </div>

        {/* Vergleich zum Ist */}
        {simTeilnahme !== baseTeilnahme && (
          <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100 text-center">
            <p className="text-xs text-indigo-700">
              {simTeilnahme > baseTeilnahme ? (
                <>Bei <strong>{simTeilnahme}%</strong> statt aktuell {baseTeilnahme}% Teilnahme sparen Sie <strong>{(simSavedEuro - Math.round(baseFehltage * Math.min(0.35, baseTeilnahme / 100 * 0.4) * baseMA * baseKosten)).toLocaleString("de-DE")} € mehr</strong> pro Jahr.</>
              ) : (
                <>Selbst bei nur {simTeilnahme}% Teilnahme sparen Sie bereits {simSavedEuro.toLocaleString("de-DE")} € pro Jahr.</>
              )}
            </p>
          </div>
        )}

        <p className="text-[10px] text-slate-400">
          {isEigeneDaten ? "Berechnung mit Ihren Unternehmensdaten." : `Branchenschätzung (${branche ?? "Allgemein"}).`}
          {" "}Basis: {baseMA} MA, {baseFehltage} Fehltage/MA, {baseKosten} €/Tag. BGF-Kosten: {bgfKosten.toLocaleString("de-DE")} €/Jahr.
        </p>
      </div>
    </details>
  )
}

// ── HR Kennzahlen Dialog ─────────────────────────────────────────────

function HrKennzahlenDialog({ orgId, onSaved }: { orgId: string; onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [krankenquote, setKrankenquote] = useState("")
  const [fehltage, setFehltage] = useState("")
  const [kosten, setKosten] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!open) return
    fetch(`/api/bgf/organizations/${orgId}/hr-kennzahlen`)
      .then((r) => r.json())
      .then((data) => {
        if (data.eigene_daten.krankenquote) setKrankenquote(String(data.eigene_daten.krankenquote))
        if (data.eigene_daten.fehltage_pro_ma) setFehltage(String(data.eigene_daten.fehltage_pro_ma))
        if (data.eigene_daten.personalkosten_pro_tag) setKosten(String(data.eigene_daten.personalkosten_pro_tag))
      })
      .catch(() => {})
  }, [open, orgId])

  async function handleSave() {
    setSaving(true)
    try {
      const body: Record<string, number> = {}
      if (krankenquote) body.krankenquote = parseFloat(krankenquote)
      if (fehltage) body.fehltage_pro_ma = parseFloat(fehltage)
      if (kosten) body.personalkosten_pro_tag = parseFloat(kosten)

      const res = await fetch(`/api/bgf/organizations/${orgId}/hr-kennzahlen`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => {
          setSaved(false)
          setOpen(false)
          // Fetch AFTER dialog closes to ensure fresh data
          onSaved()
        }, 1500)
      }
    } catch { /* */ } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs gap-1.5 h-7 rounded-lg">
          <FileText className="h-3 w-3" />
          Kennzahlen anpassen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Unternehmens-Kennzahlen</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500 -mt-2">
          Ihre echten Zahlen machen den ROI-Report aussagekräftig.
          Keine Sorge — wir helfen Ihnen bei jedem Feld, die richtige Zahl zu finden.
        </p>

        <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 text-xs text-amber-700">
          <strong>Hinweis:</strong> Dies ist keine betriebswirtschaftliche Beratung. Die Hilfestellungen dienen ausschließlich
          dazu, Ihnen die Zuordnung Ihrer bestehenden Unternehmensdaten zu erleichtern.
          Im Zweifelsfall wenden Sie sich an Ihren Steuerberater oder Ihre Lohnbuchhaltung.
        </div>

        <div className="space-y-5 py-2">
          {/* Fehltage */}
          <div>
            <Label htmlFor="ft" className="text-sm font-semibold">Ø Fehltage pro Mitarbeiter/Jahr</Label>
            <Input
              id="ft"
              type="number"
              step="0.5"
              min="0"
              max="100"
              value={fehltage}
              onChange={(e) => setFehltage(e.target.value)}
              placeholder="z.B. 18"
              className="mt-1.5"
            />
            <details className="mt-2 group">
              <summary className="text-[11px] text-blue-600 font-medium cursor-pointer hover:text-blue-800 flex items-center gap-1">
                💡 Wo finde ich diese Zahl?
              </summary>
              <div className="mt-2 bg-blue-50 rounded-lg p-3 border border-blue-100 text-[11px] text-blue-700 leading-relaxed space-y-2">
                <p><strong>Option 1 — Lohnbuchhaltung:</strong> Ihre Lohnbuchhaltung oder Ihr Steuerberater hat die Fehlzeiten-Statistik.
                Fragen Sie nach: "Wie viele Krankheitstage hatten wir durchschnittlich pro Mitarbeiter letztes Jahr?"</p>
                <p><strong>Option 2 — Selbst berechnen:</strong> Gesamte Krankheitstage aller Mitarbeiter ÷ Anzahl Mitarbeiter.
                Beispiel: 450 Krankheitstage bei 25 Mitarbeitern = <strong>18 Tage/MA</strong>.</p>
                <p><strong>Option 3 — Krankenkassen-Report:</strong> Viele Krankenkassen (AOK, TK, Barmer) erstellen für
                Unternehmen einen kostenlosen Gesundheitsreport mit genau dieser Zahl. Fragen Sie Ihren Ansprechpartner bei der Krankenkasse!</p>
                <p className="text-blue-500 italic">Bundesdurchschnitt 2024: ca. 15,1 Tage (BAuA). Handwerk/Produktion liegen meist höher (18-22), Büro meist niedriger (12-15).</p>
              </div>
            </details>
          </div>

          {/* Personalkosten */}
          <div>
            <Label htmlFor="pk" className="text-sm font-semibold">Ø Personalkosten pro Tag (€)</Label>
            <Input
              id="pk"
              type="number"
              step="10"
              min="0"
              max="2000"
              value={kosten}
              onChange={(e) => setKosten(e.target.value)}
              placeholder="z.B. 280"
              className="mt-1.5"
            />
            <details className="mt-2 group">
              <summary className="text-[11px] text-blue-600 font-medium cursor-pointer hover:text-blue-800 flex items-center gap-1">
                💡 Wie berechne ich das?
              </summary>
              <div className="mt-2 bg-blue-50 rounded-lg p-3 border border-blue-100 text-[11px] text-blue-700 leading-relaxed space-y-2">
                <p><strong>Schnelle Formel:</strong></p>
                <div className="bg-white/80 rounded-lg p-2 font-mono text-center">
                  Brutto-Jahresgehalt × 1,3 ÷ 220 = Kosten/Tag
                </div>
                <p>Der Faktor 1,3 berücksichtigt die Arbeitgeberanteile (Sozialversicherung, Umlagen).
                220 ist die durchschnittliche Anzahl Arbeitstage im Jahr.</p>
                <p><strong>Beispiele:</strong></p>
                <ul className="list-none space-y-1 ml-1">
                  <li>• 35.000 € Brutto × 1,3 ÷ 220 = <strong>207 €/Tag</strong> (Einstiegsgehalt)</li>
                  <li>• 45.000 € Brutto × 1,3 ÷ 220 = <strong>266 €/Tag</strong> (Fachkraft)</li>
                  <li>• 60.000 € Brutto × 1,3 ÷ 220 = <strong>355 €/Tag</strong> (Spezialist)</li>
                </ul>
                <p><strong>Tipp:</strong> Nehmen Sie den Durchschnitt über alle Mitarbeiter.
                Ihr Steuerberater kann Ihnen die exakten durchschnittlichen Personalkosten nennen.</p>
                <p className="text-blue-500 italic">Richtwerte: Büro 250-350 €, Handwerk 300-400 €, Pflege 280-330 €, IT 350-500 €.</p>
              </div>
            </details>
          </div>

          {/* Krankenquote */}
          <div>
            <Label htmlFor="kq" className="text-sm font-semibold">Krankenquote (%)</Label>
            <Input
              id="kq"
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={krankenquote}
              onChange={(e) => setKrankenquote(e.target.value)}
              placeholder="z.B. 5.2"
              className="mt-1.5"
            />
            <details className="mt-2 group">
              <summary className="text-[11px] text-blue-600 font-medium cursor-pointer hover:text-blue-800 flex items-center gap-1">
                💡 Was ist das und wie berechne ich es?
              </summary>
              <div className="mt-2 bg-blue-50 rounded-lg p-3 border border-blue-100 text-[11px] text-blue-700 leading-relaxed space-y-2">
                <p><strong>Definition:</strong> Die Krankenquote gibt an, welcher Anteil der Arbeitszeit durch Krankheit ausfällt.</p>
                <div className="bg-white/80 rounded-lg p-2 font-mono text-center">
                  Fehltage ÷ Soll-Arbeitstage × 100 = Krankenquote
                </div>
                <p><strong>Beispiel:</strong> 18 Fehltage ÷ 220 Arbeitstage × 100 = <strong>8,2%</strong></p>
                <p><strong>Wichtig zu wissen:</strong> Diese Zahl ist eine der wichtigsten Kennzahlen für Ihr Unternehmen.
                Sie zeigt direkt, wie viel Produktivität durch Krankheit verloren geht.</p>
                <p><strong>Kostenloser Tipp:</strong> Die AOK, TK und andere Krankenkassen erstellen für ihre
                Firmenkunden einen jährlichen Gesundheitsreport — dort steht Ihre Krankenquote drin. Einfach beim
                Firmenkundenberater Ihrer Krankenkasse anfordern!</p>
                <p className="text-blue-500 italic">Bundesdurchschnitt: 5,5%. Unter 4% = sehr gut, über 7% = Handlungsbedarf.</p>
              </div>
            </details>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {saved ? (
              <><CheckCircle2 className="h-4 w-4" /> Gespeichert</>
            ) : saving ? (
              "Speichern..."
            ) : (
              "Kennzahlen speichern"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
