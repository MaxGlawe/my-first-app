"use client"

import { Badge } from "@/components/ui/badge"

interface NrsSliderProps {
  value: number
  onChange: (v: number) => void
  disabled?: boolean
  id?: string
  /** Show the "0 - Kein Schmerz ... 10 - Stärkster Schmerz" labels */
  showLabels?: boolean
  /** Compact display (no badge, just number) */
  compact?: boolean
}

function getNrsColor(value: number) {
  if (value <= 3) return { text: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200" }
  if (value <= 6) return { text: "text-amber-600", bg: "bg-amber-100", border: "border-amber-200" }
  return { text: "text-red-600", bg: "bg-red-100", border: "border-red-200" }
}

function getNrsLabel(value: number) {
  if (value === 0) return "Kein Schmerz"
  if (value <= 3) return "Leichter Schmerz"
  if (value <= 6) return "Mäßiger Schmerz"
  if (value <= 8) return "Starker Schmerz"
  return "Stärkster Schmerz"
}

export function NrsSlider({
  value,
  onChange,
  disabled = false,
  id,
  showLabels = true,
  compact = false,
}: NrsSliderProps) {
  const color = getNrsColor(value)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-400 w-4 text-center font-medium">0</span>
        <div className="relative flex-1">
          <input
            id={id}
            type="range"
            min={0}
            max={10}
            step={1}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={disabled}
            className="w-full h-2 cursor-pointer accent-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="NRS Schmerzwert 0 bis 10"
          />
        </div>
        <span className="text-xs text-slate-400 w-6 text-right font-medium">10</span>
      </div>

      {!compact && (
        <div className="flex justify-center">
          <Badge
            variant="outline"
            className={`text-lg font-bold px-4 py-1.5 ${color.text} ${color.bg} ${color.border}`}
          >
            {value} / 10
          </Badge>
        </div>
      )}

      {compact && (
        <div className="flex justify-center">
          <span className={`text-2xl font-bold tabular-nums ${color.text}`}>{value}</span>
        </div>
      )}

      {showLabels && (
        <div className="flex justify-between text-xs text-slate-400 px-1">
          <span>Kein Schmerz</span>
          <span className={`font-medium ${color.text}`}>{getNrsLabel(value)}</span>
          <span>Stärkster Schmerz</span>
        </div>
      )}
    </div>
  )
}

/** Read-only NRS display for View components */
export function NrsDisplay({ value, label }: { value: number; label?: string }) {
  const color = getNrsColor(value)
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm text-slate-500">{label}:</span>}
      <Badge
        variant="outline"
        className={`text-sm font-bold px-3 py-0.5 ${color.text} ${color.bg} ${color.border}`}
      >
        {value} / 10
      </Badge>
      <span className="text-xs text-slate-400">{getNrsLabel(value)}</span>
    </div>
  )
}
