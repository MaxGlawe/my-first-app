"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { usePainDiary, type PainDiaryEntry } from "@/hooks/use-pain-diary"
import {
  Heart,
  Moon,
  Brain,
  Move,
  MapPin,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

// ── Body regions for pain location ──────────────────────────────────────────

const BODY_REGIONS = [
  "Nacken/HWS",
  "Oberer Rücken/BWS",
  "Unterer Rücken/LWS",
  "Schulter L",
  "Schulter R",
  "Knie L",
  "Knie R",
  "Hüfte L",
  "Hüfte R",
  "Ellenbogen L",
  "Ellenbogen R",
  "Handgelenk L",
  "Handgelenk R",
  "Sprunggelenk L",
  "Sprunggelenk R",
  "Kopf",
  "Sonstiges",
] as const

// ── Emoji & label maps ──────────────────────────────────────────────────────

const PAIN_EMOJIS: Record<number, string> = {
  0: "😊", 1: "🙂", 2: "😐", 3: "😕", 4: "😟",
  5: "😣", 6: "😖", 7: "😫", 8: "😩", 9: "😰", 10: "😭",
}
const WELLBEING_EMOJIS: Record<number, string> = {
  0: "😔", 1: "😕", 2: "😐", 3: "🙂", 4: "🙂",
  5: "😊", 6: "😊", 7: "😄", 8: "😄", 9: "🥰", 10: "🤩",
}
const SLEEP_EMOJIS: Record<number, string> = {
  0: "😵", 1: "😫", 2: "😩", 3: "😕", 4: "😐",
  5: "🙂", 6: "😊", 7: "😴", 8: "😴", 9: "🌙", 10: "🌟",
}
const STRESS_EMOJIS: Record<number, string> = {
  0: "😌", 1: "🙂", 2: "😐", 3: "😕", 4: "😟",
  5: "😣", 6: "😖", 7: "😫", 8: "😩", 9: "🤯", 10: "💥",
}
const MOVEMENT_EMOJIS: Record<number, string> = {
  0: "🏃", 1: "🚶", 2: "🚶", 3: "😐", 4: "😕",
  5: "😟", 6: "😣", 7: "😖", 8: "😫", 9: "🦽", 10: "🛑",
}

const PAIN_LABELS: Record<number, string> = {
  0: "Kein Schmerz", 1: "Minimal", 2: "Leicht", 3: "Erträglich", 4: "Mäßig",
  5: "Mittel", 6: "Stark", 7: "Sehr stark", 8: "Intensiv", 9: "Unerträglich", 10: "Maximum",
}
const WELLBEING_LABELS: Record<number, string> = {
  0: "Sehr schlecht", 1: "Schlecht", 2: "Eher schlecht", 3: "Mittelmäßig", 4: "Geht so",
  5: "Okay", 6: "Gut", 7: "Sehr gut", 8: "Richtig gut", 9: "Ausgezeichnet", 10: "Fantastisch",
}
const SLEEP_LABELS: Record<number, string> = {
  0: "Gar nicht geschlafen", 1: "Sehr schlecht", 2: "Schlecht", 3: "Eher schlecht", 4: "Mäßig",
  5: "Okay", 6: "Ganz gut", 7: "Gut", 8: "Sehr gut", 9: "Ausgezeichnet", 10: "Perfekt geschlafen",
}
const STRESS_LABELS: Record<number, string> = {
  0: "Kein Stress", 1: "Minimal", 2: "Leicht", 3: "Etwas", 4: "Mäßig",
  5: "Mittel", 6: "Erhöht", 7: "Hoch", 8: "Sehr hoch", 9: "Extrem", 10: "Maximaler Stress",
}
const MOVEMENT_LABELS: Record<number, string> = {
  0: "Keine Einschränkung", 1: "Kaum spürbar", 2: "Leicht", 3: "Etwas", 4: "Mäßig",
  5: "Mittel", 6: "Deutlich", 7: "Stark", 8: "Sehr stark", 9: "Massiv", 10: "Komplett eingeschränkt",
}

// ── NRS Slider Component ────────────────────────────────────────────────────

function NrsSlider({
  value,
  onChange,
  emojis,
  labels,
  lowLabel,
  highLabel,
  gradient,
}: {
  value: number
  onChange: (v: number) => void
  emojis: Record<number, string>
  labels: Record<number, string>
  lowLabel: string
  highLabel: string
  gradient: string
}) {
  return (
    <div className="space-y-3">
      <div className="text-center">
        <span className="text-5xl" role="img" aria-label={labels[value]}>
          {emojis[value]}
        </span>
        <p className="text-lg font-bold text-slate-800 mt-1">{value}/10</p>
        <p className="text-sm text-slate-500">{labels[value]}</p>
      </div>
      <div className="px-1">
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-3 rounded-full appearance-none cursor-pointer"
          style={{ background: gradient }}
          aria-label={`${lowLabel} bis ${highLabel}`}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-400">{lowLabel}</span>
          <span className="text-[10px] text-slate-400">{highLabel}</span>
        </div>
      </div>
    </div>
  )
}

// ── Progress Dots ───────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === current
              ? "w-6 bg-teal-500"
              : i < current
                ? "w-2 bg-teal-300"
                : "w-2 bg-slate-200"
          }`}
        />
      ))}
    </div>
  )
}

// ── Body Region Selector ────────────────────────────────────────────────────

function BodyRegionSelector({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (regions: string[]) => void
}) {
  function toggle(region: string) {
    if (selected.includes(region)) {
      onChange(selected.filter((r) => r !== region))
    } else {
      onChange([...selected, region])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {BODY_REGIONS.map((region) => {
        const isSelected = selected.includes(region)
        return (
          <button
            key={region}
            type="button"
            onClick={() => toggle(region)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              isSelected
                ? "bg-teal-100 text-teal-700 border-2 border-teal-400"
                : "bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200"
            }`}
          >
            {region}
          </button>
        )
      })}
    </div>
  )
}

// ── Main CheckInForm ────────────────────────────────────────────────────────

interface CheckInFormProps {
  onComplete?: () => void
  prefillEntry?: PainDiaryEntry | null
  compact?: boolean
}

export function CheckInForm({ onComplete, prefillEntry, compact }: CheckInFormProps) {
  const { saveEntry, isSaving, todayEntry } = usePainDiary()
  const entry = prefillEntry ?? todayEntry

  const [step, setStep] = useState(0)
  const [painLevel, setPainLevel] = useState(3)
  const [wellbeing, setWellbeing] = useState(5)
  const [sleepQuality, setSleepQuality] = useState(5)
  const [stressLevel, setStressLevel] = useState(3)
  const [movementRestriction, setMovementRestriction] = useState(3)
  const [painLocation, setPainLocation] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [saved, setSaved] = useState(false)

  const TOTAL_STEPS = 3

  // Pre-fill from existing entry
  useEffect(() => {
    if (entry) {
      setPainLevel(entry.pain_level)
      setWellbeing(entry.wellbeing)
      setSleepQuality(entry.sleep_quality ?? 5)
      setStressLevel(entry.stress_level ?? 3)
      setMovementRestriction(entry.movement_restriction ?? 3)
      setPainLocation(entry.pain_location ?? [])
      setNotes(entry.notes ?? "")
    }
  }, [entry])

  async function handleSave() {
    const success = await saveEntry({
      pain_level: painLevel,
      wellbeing,
      sleep_quality: sleepQuality,
      stress_level: stressLevel,
      movement_restriction: movementRestriction,
      pain_location: painLocation,
      notes: notes.trim() || null,
    })

    if (success) {
      setSaved(true)
      setTimeout(() => {
        onComplete?.()
      }, 1500)
    } else {
      toast.error("Eintrag konnte nicht gespeichert werden.")
    }
  }

  if (saved) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto animate-in zoom-in duration-300">
          <CheckCircle2 className="h-8 w-8 text-teal-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Gespeichert!</h2>
        <p className="text-sm text-slate-500 max-w-xs mx-auto">
          Dein Therapeut kann deinen Verlauf jetzt einsehen.
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-5 ${compact ? "" : "max-w-lg mx-auto"}`}>
      {/* Progress dots */}
      <StepDots current={step} total={TOTAL_STEPS} />

      {/* Step 1: Pain + Wellbeing */}
      {step === 0 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center">
                <Heart className="h-4 w-4 text-red-500" />
              </div>
              <h2 className="text-base font-semibold text-slate-700">Schmerzlevel</h2>
            </div>
            <NrsSlider
              value={painLevel}
              onChange={setPainLevel}
              emojis={PAIN_EMOJIS}
              labels={PAIN_LABELS}
              lowLabel="Kein Schmerz"
              highLabel="Maximum"
              gradient="linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)"
            />
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-teal-50 flex items-center justify-center">
                <span className="text-lg">✨</span>
              </div>
              <h2 className="text-base font-semibold text-slate-700">Wohlbefinden</h2>
            </div>
            <NrsSlider
              value={wellbeing}
              onChange={setWellbeing}
              emojis={WELLBEING_EMOJIS}
              labels={WELLBEING_LABELS}
              lowLabel="Sehr schlecht"
              highLabel="Fantastisch"
              gradient="linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%)"
            />
          </div>
        </div>
      )}

      {/* Step 2: Sleep + Stress + Movement */}
      {step === 1 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Moon className="h-4 w-4 text-indigo-500" />
              </div>
              <h2 className="text-base font-semibold text-slate-700">Schlafqualität</h2>
            </div>
            <NrsSlider
              value={sleepQuality}
              onChange={setSleepQuality}
              emojis={SLEEP_EMOJIS}
              labels={SLEEP_LABELS}
              lowLabel="Gar nicht geschlafen"
              highLabel="Perfekt"
              gradient="linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #6366f1 100%)"
            />
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <Brain className="h-4 w-4 text-orange-500" />
              </div>
              <h2 className="text-base font-semibold text-slate-700">Stresslevel</h2>
            </div>
            <NrsSlider
              value={stressLevel}
              onChange={setStressLevel}
              emojis={STRESS_EMOJIS}
              labels={STRESS_LABELS}
              lowLabel="Kein Stress"
              highLabel="Maximaler Stress"
              gradient="linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)"
            />
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Move className="h-4 w-4 text-purple-500" />
              </div>
              <h2 className="text-base font-semibold text-slate-700">Bewegungseinschränkung</h2>
            </div>
            <NrsSlider
              value={movementRestriction}
              onChange={setMovementRestriction}
              emojis={MOVEMENT_EMOJIS}
              labels={MOVEMENT_LABELS}
              lowLabel="Keine"
              highLabel="Komplett"
              gradient="linear-gradient(to right, #10b981 0%, #f59e0b 50%, #a855f7 100%)"
            />
          </div>
        </div>
      )}

      {/* Step 3: Pain location + Notes */}
      {step === 2 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-rose-500" />
              </div>
              <h2 className="text-base font-semibold text-slate-700">
                Wo tut es weh?
                <span className="text-xs text-slate-400 font-normal ml-1">(optional)</span>
              </h2>
            </div>
            <BodyRegionSelector selected={painLocation} onChange={setPainLocation} />
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <h2 className="text-base font-semibold text-slate-700 mb-3">
              Notiz <span className="text-xs text-slate-400 font-normal">(optional)</span>
            </h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Gibt es etwas Besonderes zu berichten? Medikamente, besondere Aktivitäten..."
              className="resize-none rounded-xl"
              rows={3}
              maxLength={2000}
            />
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3">
        {step > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="flex-1 h-12 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Zurück
          </Button>
        )}

        {step < TOTAL_STEPS - 1 ? (
          <Button
            type="button"
            onClick={() => setStep(step + 1)}
            className="flex-1 h-12 rounded-xl bg-teal-600 hover:bg-teal-700"
          >
            Weiter
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 h-12 rounded-xl bg-teal-600 hover:bg-teal-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Wird gespeichert...
              </>
            ) : (
              "Speichern"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
