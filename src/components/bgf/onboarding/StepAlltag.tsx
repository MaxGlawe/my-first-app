"use client"

import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { IstAnalyseFormValues } from "@/types/bgf"
import { cn } from "@/lib/utils"

// ── Pain / Stress Slider ───────────────────────────────────────────────────────

function getScoreColor(value: number, inverse = false): string {
  // For schlaf: higher = better (inverse)
  const effective = inverse ? 10 - value : value
  if (effective <= 3) return "text-emerald-600"
  if (effective <= 6) return "text-amber-600"
  return "text-red-600"
}

function getScoreLabel(value: number, type: "schmerz" | "stress" | "schlaf"): string {
  if (type === "schlaf") {
    if (value >= 8) return "Sehr gut"
    if (value >= 6) return "Gut"
    if (value >= 4) return "Mittel"
    return "Schlecht"
  }
  if (value === 0) return "Keiner"
  if (value <= 3) return "Leicht"
  if (value <= 6) return "Mittel"
  if (value <= 8) return "Stark"
  return "Sehr stark"
}

function getScoreGradient(value: number, inverse = false): string {
  const effective = inverse ? 10 - value : value
  if (effective <= 3) return "from-emerald-400 to-green-500"
  if (effective <= 6) return "from-amber-400 to-yellow-500"
  return "from-orange-500 to-red-500"
}

// ── Slider Row ────────────────────────────────────────────────────────────────

interface SliderRowProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
  type?: "schmerz" | "stress" | "schlaf" | "hours" | "movement"
  description?: string
}

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  type,
  description,
}: SliderRowProps) {
  const showColorScore = type === "schmerz" || type === "stress" || type === "schlaf"
  const inverse = type === "schlaf"

  return (
    <div className="bg-white/70 border border-slate-100 rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
        <div className="text-right ml-3 shrink-0">
          <span className={cn(
            "text-xl font-bold tabular-nums",
            showColorScore ? getScoreColor(value, inverse) : "text-slate-800"
          )}>
            {value}
          </span>
          {unit && <span className="text-xs text-slate-500 ml-0.5">{unit}</span>}
          {showColorScore && (
            <p className={cn("text-[10px] font-medium mt-0.5", getScoreColor(value, inverse))}>
              {getScoreLabel(value, type!)}
            </p>
          )}
        </div>
      </div>

      {/* Color gradient track indicator */}
      {showColorScore && (
        <div className="relative h-1.5 rounded-full mb-3 overflow-hidden">
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r",
            inverse ? "from-red-400 via-amber-400 to-emerald-400" : "from-emerald-400 via-amber-400 to-red-400"
          )} />
          <div
            className="absolute top-0 bottom-0 right-0 bg-slate-100/60"
            style={{ width: `${((max - value) / max) * 100}%` }}
          />
        </div>
      )}

      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
        aria-label={label}
      />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-slate-400">{min}{unit}</span>
        <span className="text-[10px] text-slate-400">{max}{unit}</span>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

interface Props {
  values: IstAnalyseFormValues
  onChange: (partial: Partial<IstAnalyseFormValues>) => void
}

export function IstAnalyseStepAlltag({ values, onChange }: Props) {
  return (
    <div className="space-y-3">
      {/* Bildschirmarbeit */}
      <SliderRow
        label="Bildschirmarbeit"
        description="Stunden am Tag vor Bildschirm / PC"
        value={values.bildschirmarbeit_stunden ?? 8}
        min={0}
        max={16}
        step={0.5}
        unit=" Std."
        onChange={(v) => onChange({ bildschirmarbeit_stunden: v })}
      />

      {/* Sitzen */}
      <SliderRow
        label="Sitzzeit"
        description="Gesamte Sitzstunden pro Tag"
        value={values.sitz_stunden_pro_tag ?? 6}
        min={0}
        max={16}
        step={0.5}
        unit=" Std."
        onChange={(v) => onChange({ sitz_stunden_pro_tag: v })}
      />

      {/* Bewegung */}
      <SliderRow
        label="Bewegung / Sport"
        description="Minuten pro Woche (Spazieren, Sport, etc.)"
        value={values.bewegung_minuten_pro_woche}
        min={0}
        max={600}
        step={15}
        unit=" Min."
        onChange={(v) => onChange({ bewegung_minuten_pro_woche: v })}
      />

      {/* Heben/Tragen Toggle */}
      <div className="bg-white/70 border border-slate-100 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="heben-tragen" className="text-sm font-semibold text-slate-800 cursor-pointer">
              Heben & Tragen
            </Label>
            <p className="text-xs text-slate-500 mt-0.5">
              Ich hebe oder trage regelmäßig schwere Lasten (&gt; 5 kg)
            </p>
          </div>
          <Switch
            id="heben-tragen"
            checked={values.heben_tragen ?? false}
            onCheckedChange={(checked) => onChange({ heben_tragen: checked })}
            className="data-[state=checked]:bg-indigo-600"
          />
        </div>
      </div>

      {/* --- Separator --- */}
      <div className="pt-1 pb-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Wie geht es Ihnen gerade?
        </p>
      </div>

      {/* Schmerz */}
      <SliderRow
        label="Aktueller Schmerz"
        description="Wie stark schmerzt es gerade? (0 = kein Schmerz)"
        value={values.schmerz_aktuell}
        min={0}
        max={10}
        onChange={(v) => onChange({ schmerz_aktuell: v })}
        type="schmerz"
      />

      {/* Stress */}
      <SliderRow
        label="Stress-Level"
        description="Wie gestresst fühlen Sie sich aktuell?"
        value={values.stress_level}
        min={0}
        max={10}
        onChange={(v) => onChange({ stress_level: v })}
        type="stress"
      />

      {/* Schlaf */}
      <SliderRow
        label="Schlafqualität"
        description="Wie gut schlafen Sie in letzter Zeit?"
        value={values.schlaf_qualitaet}
        min={0}
        max={10}
        onChange={(v) => onChange({ schlaf_qualitaet: v })}
        type="schlaf"
      />
    </div>
  )
}
