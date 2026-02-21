"use client"

/**
 * PROJ-16: Befindlichkeits-Tab für Therapeuten
 * Zeigt Schmerz- und Wohlbefindlichkeits-Verlauf eines Patienten.
 */

import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePatientPainDiary } from "@/hooks/use-pain-diary"
import type { PainDiaryEntry } from "@/hooks/use-pain-diary"
import { Heart, TrendingDown, TrendingUp, Minus, Calendar, MessageSquare, Moon, Brain, Move, MapPin } from "lucide-react"

interface BefindlichkeitTabProps {
  patientId: string
}

// ── Trend helper ─────────────────────────────────────────────────────────────

type NumericKey = "pain_level" | "wellbeing" | "sleep_quality" | "stress_level" | "movement_restriction"

function getTrend(entries: PainDiaryEntry[], key: NumericKey): "up" | "down" | "stable" {
  // Filter entries that have a value for this key
  const valid = entries.filter((e) => e[key] != null)
  if (valid.length < 3) return "stable"
  const recent = valid.slice(-7)
  const first = recent.slice(0, Math.ceil(recent.length / 2))
  const last = recent.slice(Math.ceil(recent.length / 2))
  const avgFirst = first.reduce((s, e) => s + (e[key] ?? 0), 0) / first.length
  const avgLast = last.reduce((s, e) => s + (e[key] ?? 0), 0) / last.length
  const diff = avgLast - avgFirst
  if (Math.abs(diff) < 0.5) return "stable"
  return diff > 0 ? "up" : "down"
}

function getAvg(entries: PainDiaryEntry[], key: NumericKey): number | null {
  const valid = entries.filter((e) => e[key] != null)
  if (valid.length === 0) return null
  return Math.round((valid.reduce((s, e) => s + (e[key] ?? 0), 0) / valid.length) * 10) / 10
}

function getTopLocations(entries: PainDiaryEntry[], max = 5): { label: string; count: number }[] {
  const counts: Record<string, number> = {}
  for (const e of entries) {
    for (const loc of e.pain_location ?? []) {
      counts[loc] = (counts[loc] || 0) + 1
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([label, count]) => ({ label, count }))
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

const CHART_LINES: {
  key: NumericKey
  label: string
  color: string
  fillAlpha: string
  defaultOn: boolean
}[] = [
  { key: "pain_level", label: "Schmerz", color: "#ef4444", fillAlpha: "0.06", defaultOn: true },
  { key: "wellbeing", label: "Wohlbefinden", color: "#14b8a6", fillAlpha: "0.08", defaultOn: true },
  { key: "sleep_quality", label: "Schlaf", color: "#3b82f6", fillAlpha: "0.06", defaultOn: false },
  { key: "stress_level", label: "Stress", color: "#f97316", fillAlpha: "0.06", defaultOn: false },
  { key: "movement_restriction", label: "Bewegung", color: "#8b5cf6", fillAlpha: "0.06", defaultOn: false },
]

function VerlaufChart({ entries }: { entries: PainDiaryEntry[] }) {
  const [activeLines, setActiveLines] = useState<Set<NumericKey>>(() =>
    new Set(CHART_LINES.filter((l) => l.defaultOn).map((l) => l.key))
  )

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

  function buildPath(key: NumericKey) {
    const segments: string[] = []
    let started = false
    sorted.forEach((e, i) => {
      const val = e[key]
      if (val == null) return
      const x = padding.left + i * xStep
      const y = toY(val)
      segments.push(`${!started ? "M" : "L"} ${x} ${y}`)
      started = true
    })
    return segments.join(" ")
  }

  function toggleLine(key: NumericKey) {
    setActiveLines((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const yLabels = [0, 2, 4, 6, 8, 10]

  const labelInterval = Math.max(1, Math.floor(sorted.length / 5))
  const xLabels: { x: number; label: string }[] = sorted
    .filter((_, i) => i % labelInterval === 0 || i === sorted.length - 1)
    .map((e) => {
      const idx = sorted.indexOf(e)
      return {
        x: padding.left + idx * xStep,
        label: new Date(e.entry_date).toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
        }),
      }
    })

  // Check which optional lines have data
  const hasData = (key: NumericKey) => sorted.some((e) => e[key] != null)

  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">
        Verlauf (letzte {sorted.length} Tage)
      </h3>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" aria-label="Befindlichkeitsverlauf">
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

        {/* Lines for active metrics */}
        {CHART_LINES.filter((l) => activeLines.has(l.key) && hasData(l.key)).map((line) => {
          const path = buildPath(line.key)
          return (
            <g key={line.key}>
              <path d={path} fill="none" stroke={line.color} strokeWidth={2.5} strokeLinecap="round" />
              {sorted.map((e, i) => {
                const val = e[line.key]
                if (val == null) return null
                return (
                  <circle
                    key={i}
                    cx={padding.left + i * xStep}
                    cy={toY(val)}
                    r={3}
                    fill={line.color}
                  />
                )
              })}
            </g>
          )
        })}
      </svg>

      {/* Legend with toggles */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {CHART_LINES.filter((l) => l.key === "pain_level" || l.key === "wellbeing" || hasData(l.key)).map((line) => (
          <button
            key={line.key}
            type="button"
            onClick={() => toggleLine(line.key)}
            className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border transition-colors ${
              activeLines.has(line.key)
                ? "border-slate-300 bg-white text-slate-600"
                : "border-transparent bg-slate-100 text-slate-400"
            }`}
          >
            <span
              className="h-2 w-4 rounded"
              style={{ backgroundColor: activeLines.has(line.key) ? line.color : "#cbd5e1" }}
            />
            {line.label}
          </button>
        ))}
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
              <div className="flex items-center gap-3 text-sm flex-wrap">
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
              {/* Extra metrics row */}
              {(entry.sleep_quality != null || entry.stress_level != null || entry.movement_restriction != null) && (
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  {entry.sleep_quality != null && (
                    <span className="flex items-center gap-1">
                      <Moon className="h-3 w-3 text-blue-400" />
                      {entry.sleep_quality}/10
                    </span>
                  )}
                  {entry.stress_level != null && (
                    <span className="flex items-center gap-1">
                      <Brain className="h-3 w-3 text-orange-400" />
                      {entry.stress_level}/10
                    </span>
                  )}
                  {entry.movement_restriction != null && (
                    <span className="flex items-center gap-1">
                      <Move className="h-3 w-3 text-purple-400" />
                      {entry.movement_restriction}/10
                    </span>
                  )}
                </div>
              )}
              {/* Pain locations */}
              {entry.pain_location && entry.pain_location.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {entry.pain_location.map((loc) => (
                    <span
                      key={loc}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600"
                    >
                      {loc}
                    </span>
                  ))}
                </div>
              )}
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
  const sleepTrend = getTrend(entries, "sleep_quality")
  const stressTrend = getTrend(entries, "stress_level")
  const movementTrend = getTrend(entries, "movement_restriction")

  const avgPain = getAvg(entries, "pain_level")
  const avgWellbeing = getAvg(entries, "wellbeing")
  const avgSleep = getAvg(entries, "sleep_quality")
  const avgStress = getAvg(entries, "stress_level")
  const avgMovement = getAvg(entries, "movement_restriction")

  const topLocations = getTopLocations(entries)
  const hasSleepData = entries.some((e) => e.sleep_quality != null)
  const hasStressData = entries.some((e) => e.stress_level != null)
  const hasMovementData = entries.some((e) => e.movement_restriction != null)

  return (
    <div className="space-y-6">
      {/* Primary stats — Pain + Wellbeing */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

        <div className="border rounded-lg p-3 bg-white text-center">
          <p className="text-xs text-slate-400 font-medium">Durchschnitt (S)</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{avgPain ?? "–"}</p>
          <p className="text-[10px] text-slate-400">letzte {entries.length} Tage</p>
        </div>

        <div className="border rounded-lg p-3 bg-white text-center">
          <p className="text-xs text-slate-400 font-medium">Durchschnitt (WB)</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{avgWellbeing ?? "–"}</p>
          <p className="text-[10px] text-slate-400">letzte {entries.length} Tage</p>
        </div>
      </div>

      {/* Secondary stats — Sleep, Stress, Movement (only if data exists) */}
      {(hasSleepData || hasStressData || hasMovementData) && (
        <div className="grid grid-cols-3 gap-3">
          {hasSleepData && (
            <div className="border rounded-lg p-3 bg-white text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Moon className="h-3.5 w-3.5 text-blue-400" />
                <p className="text-xs text-slate-400 font-medium">Schlaf</p>
              </div>
              <p className="text-xl font-bold text-blue-500">{avgSleep ?? "–"}</p>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <TrendIcon trend={sleepTrend} goodDirection="up" />
                <span className="text-[10px] text-slate-400">
                  {sleepTrend === "up" ? "Besser" : sleepTrend === "down" ? "Schlechter" : "Stabil"}
                </span>
              </div>
            </div>
          )}
          {hasStressData && (
            <div className="border rounded-lg p-3 bg-white text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Brain className="h-3.5 w-3.5 text-orange-400" />
                <p className="text-xs text-slate-400 font-medium">Stress</p>
              </div>
              <p className="text-xl font-bold text-orange-500">{avgStress ?? "–"}</p>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <TrendIcon trend={stressTrend} goodDirection="down" />
                <span className="text-[10px] text-slate-400">
                  {stressTrend === "down" ? "Weniger" : stressTrend === "up" ? "Mehr" : "Stabil"}
                </span>
              </div>
            </div>
          )}
          {hasMovementData && (
            <div className="border rounded-lg p-3 bg-white text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Move className="h-3.5 w-3.5 text-purple-400" />
                <p className="text-xs text-slate-400 font-medium">Bewegung</p>
              </div>
              <p className="text-xl font-bold text-purple-500">{avgMovement ?? "–"}</p>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <TrendIcon trend={movementTrend} goodDirection="down" />
                <span className="text-[10px] text-slate-400">
                  {movementTrend === "down" ? "Besser" : movementTrend === "up" ? "Eingeschränkter" : "Stabil"}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top pain locations */}
      {topLocations.length > 0 && (
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700">Häufigste Schmerzlokalisationen</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {topLocations.map(({ label, count }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200"
              >
                {label}
                <span className="text-[10px] font-semibold text-slate-400">
                  {count}x
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <VerlaufChart entries={entries} />

      {/* Recent entries with notes */}
      <RecentEntries entries={entries} />
    </div>
  )
}
