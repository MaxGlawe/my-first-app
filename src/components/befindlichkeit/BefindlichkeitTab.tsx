"use client"

/**
 * PROJ-16: Befindlichkeits-Tab für Therapeuten
 * Zeigt Schmerz- und Wohlbefindlichkeits-Verlauf eines Patienten.
 */

import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePatientPainDiary } from "@/hooks/use-pain-diary"
import type { PainDiaryEntry } from "@/hooks/use-pain-diary"
import { Heart, TrendingDown, TrendingUp, Minus, Calendar, MessageSquare } from "lucide-react"

interface BefindlichkeitTabProps {
  patientId: string
}

// ── Trend helper ─────────────────────────────────────────────────────────────

function getTrend(entries: PainDiaryEntry[], key: "pain_level" | "wellbeing"): "up" | "down" | "stable" {
  if (entries.length < 3) return "stable"
  const recent = entries.slice(-7)
  const first = recent.slice(0, Math.ceil(recent.length / 2))
  const last = recent.slice(Math.ceil(recent.length / 2))
  const avgFirst = first.reduce((s, e) => s + e[key], 0) / first.length
  const avgLast = last.reduce((s, e) => s + e[key], 0) / last.length
  const diff = avgLast - avgFirst
  if (Math.abs(diff) < 0.5) return "stable"
  return diff > 0 ? "up" : "down"
}

function TrendIcon({ trend, goodDirection }: { trend: "up" | "down" | "stable"; goodDirection: "up" | "down" }) {
  if (trend === "stable") return <Minus className="h-4 w-4 text-slate-400" />
  const isGood = trend === goodDirection
  if (trend === "up") {
    return <TrendingUp className={`h-4 w-4 ${isGood ? "text-emerald-500" : "text-red-500"}`} />
  }
  return <TrendingDown className={`h-4 w-4 ${isGood ? "text-emerald-500" : "text-red-500"}`} />
}

// ── SVG Line Chart ───────────────────────────────────────────────────────────

function VerlaufChart({ entries }: { entries: PainDiaryEntry[] }) {
  if (entries.length === 0) return null

  const sorted = [...entries].sort(
    (a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
  )

  const width = 500
  const height = 180
  const padding = { top: 15, right: 15, bottom: 30, left: 35 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const xStep = sorted.length > 1 ? chartW / (sorted.length - 1) : chartW / 2

  function toY(val: number) {
    return padding.top + chartH - (val / 10) * chartH
  }

  function buildPath(key: "pain_level" | "wellbeing") {
    return sorted
      .map((e, i) => {
        const x = padding.left + i * xStep
        const y = toY(e[key])
        return `${i === 0 ? "M" : "L"} ${x} ${y}`
      })
      .join(" ")
  }

  const painPath = buildPath("pain_level")
  const wellbeingPath = buildPath("wellbeing")

  const yLabels = [0, 2, 4, 6, 8, 10]

  // Show date labels every ~7 entries
  const labelInterval = Math.max(1, Math.floor(sorted.length / 5))
  const xLabels: { x: number; label: string }[] = sorted
    .filter((_, i) => i % labelInterval === 0 || i === sorted.length - 1)
    .map((e, _, arr) => {
      const idx = sorted.indexOf(e)
      return {
        x: padding.left + idx * xStep,
        label: new Date(e.entry_date).toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
        }),
      }
    })

  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">
        Verlauf (letzte {sorted.length} Tage)
      </h3>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" aria-label="Schmerz- und Wohlbefindlichkeitsverlauf">
        {/* Grid */}
        {yLabels.map((v) => (
          <g key={v}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={toY(v)}
              y2={toY(v)}
              stroke="#f1f5f9"
              strokeWidth={1}
            />
            <text x={padding.left - 8} y={toY(v) + 3} textAnchor="end" fontSize={9} fill="#94a3b8">
              {v}
            </text>
          </g>
        ))}

        {/* X labels */}
        {xLabels.map((xl, i) => (
          <text key={i} x={xl.x} y={height - 5} textAnchor="middle" fontSize={9} fill="#94a3b8">
            {xl.label}
          </text>
        ))}

        {/* Wellbeing area */}
        <path
          d={`${wellbeingPath} L ${padding.left + (sorted.length - 1) * xStep} ${toY(0)} L ${padding.left} ${toY(0)} Z`}
          fill="rgba(20, 184, 166, 0.08)"
        />
        <path d={wellbeingPath} fill="none" stroke="#14b8a6" strokeWidth={2.5} strokeLinecap="round" />

        {/* Pain area */}
        <path
          d={`${painPath} L ${padding.left + (sorted.length - 1) * xStep} ${toY(0)} L ${padding.left} ${toY(0)} Z`}
          fill="rgba(239, 68, 68, 0.06)"
        />
        <path d={painPath} fill="none" stroke="#ef4444" strokeWidth={2.5} strokeLinecap="round" />

        {/* Data points */}
        {sorted.map((e, i) => (
          <g key={i}>
            <circle cx={padding.left + i * xStep} cy={toY(e.wellbeing)} r={3} fill="#14b8a6" />
            <circle cx={padding.left + i * xStep} cy={toY(e.pain_level)} r={3} fill="#ef4444" />
          </g>
        ))}
      </svg>

      <div className="flex items-center gap-5 mt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-5 rounded bg-red-500" />
          Schmerz (NRS)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-5 rounded bg-teal-500" />
          Wohlbefinden
        </span>
      </div>
    </div>
  )
}

// ── Recent Entries List ──────────────────────────────────────────────────────

function RecentEntries({ entries }: { entries: PainDiaryEntry[] }) {
  if (entries.length === 0) return null

  const recent = [...entries]
    .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())
    .slice(0, 10)

  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Letzte Einträge</h3>
      <div className="space-y-2">
        {recent.map((entry) => (
          <div
            key={entry.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-slate-50"
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 shrink-0">
              <Calendar className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium text-slate-700">
                  {new Date(entry.entry_date).toLocaleDateString("de-DE", {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
                <span className="text-red-500 font-semibold">
                  NRS {entry.pain_level}/10
                </span>
                <span className="text-teal-600 font-semibold">
                  WB {entry.wellbeing}/10
                </span>
              </div>
              {entry.notes && (
                <div className="flex items-start gap-1.5 mt-1">
                  <MessageSquare className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {entry.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Tab ─────────────────────────────────────────────────────────────────

export function BefindlichkeitTab({ patientId }: BefindlichkeitTabProps) {
  const { entries, isLoading, error } = usePatientPainDiary(patientId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Heart className="h-7 w-7 text-slate-300" />
        </div>
        <h3 className="text-base font-semibold text-slate-700 mb-2">
          Noch keine Befindlichkeitsdaten
        </h3>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Der Patient hat noch keine Einträge im Schmerztagebuch gemacht.
          Einträge erscheinen hier automatisch, sobald der Patient den Tages-Check-in in der App nutzt.
        </p>
      </div>
    )
  }

  // Calculate summary stats
  const latest = entries[entries.length - 1]
  const painTrend = getTrend(entries, "pain_level")
  const wellbeingTrend = getTrend(entries, "wellbeing")
  const avgPain = Math.round((entries.reduce((s, e) => s + e.pain_level, 0) / entries.length) * 10) / 10
  const avgWellbeing = Math.round((entries.reduce((s, e) => s + e.wellbeing, 0) / entries.length) * 10) / 10

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Latest pain */}
        <div className="border rounded-lg p-3 bg-white text-center">
          <p className="text-xs text-slate-400 font-medium">Aktuell (Schmerz)</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{latest.pain_level}/10</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <TrendIcon trend={painTrend} goodDirection="down" />
            <span className="text-[10px] text-slate-400">
              {painTrend === "down" ? "Besserung" : painTrend === "up" ? "Verschlechterung" : "Stabil"}
            </span>
          </div>
        </div>

        {/* Latest wellbeing */}
        <div className="border rounded-lg p-3 bg-white text-center">
          <p className="text-xs text-slate-400 font-medium">Aktuell (Wohlbef.)</p>
          <p className="text-2xl font-bold text-teal-600 mt-1">{latest.wellbeing}/10</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <TrendIcon trend={wellbeingTrend} goodDirection="up" />
            <span className="text-[10px] text-slate-400">
              {wellbeingTrend === "up" ? "Besserung" : wellbeingTrend === "down" ? "Verschlechterung" : "Stabil"}
            </span>
          </div>
        </div>

        {/* Average pain */}
        <div className="border rounded-lg p-3 bg-white text-center">
          <p className="text-xs text-slate-400 font-medium">Durchschnitt (S)</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{avgPain}</p>
          <p className="text-[10px] text-slate-400">letzte {entries.length} Tage</p>
        </div>

        {/* Average wellbeing */}
        <div className="border rounded-lg p-3 bg-white text-center">
          <p className="text-xs text-slate-400 font-medium">Durchschnitt (WB)</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{avgWellbeing}</p>
          <p className="text-[10px] text-slate-400">letzte {entries.length} Tage</p>
        </div>
      </div>

      {/* Chart */}
      <VerlaufChart entries={entries} />

      {/* Recent entries with notes */}
      <RecentEntries entries={entries} />
    </div>
  )
}
