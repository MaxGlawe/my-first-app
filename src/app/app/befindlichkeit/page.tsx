"use client"

/**
 * PROJ-16: Schmerztagebuch — Tages-Check-in
 * Patient records daily pain level (NRS 0-10), wellbeing (0-10), optional notes.
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { usePainDiary } from "@/hooks/use-pain-diary"
import { ArrowLeft, Heart, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

// ── Emoji mapping for NRS scale ──────────────────────────────────────────────

const PAIN_EMOJIS: Record<number, string> = {
  0: "😊",
  1: "🙂",
  2: "😐",
  3: "😕",
  4: "😟",
  5: "😣",
  6: "😖",
  7: "😫",
  8: "😩",
  9: "😰",
  10: "😭",
}

const WELLBEING_EMOJIS: Record<number, string> = {
  0: "😔",
  1: "😕",
  2: "😐",
  3: "🙂",
  4: "🙂",
  5: "😊",
  6: "😊",
  7: "😄",
  8: "😄",
  9: "🥰",
  10: "🤩",
}

const PAIN_LABELS: Record<number, string> = {
  0: "Kein Schmerz",
  1: "Minimal",
  2: "Leicht",
  3: "Erträglich",
  4: "Mäßig",
  5: "Mittel",
  6: "Stark",
  7: "Sehr stark",
  8: "Intensiv",
  9: "Unerträglich",
  10: "Maximum",
}

const WELLBEING_LABELS: Record<number, string> = {
  0: "Sehr schlecht",
  1: "Schlecht",
  2: "Eher schlecht",
  3: "Mittelmäßig",
  4: "Geht so",
  5: "Okay",
  6: "Gut",
  7: "Sehr gut",
  8: "Richtig gut",
  9: "Ausgezeichnet",
  10: "Fantastisch",
}

// ── NRS Slider ───────────────────────────────────────────────────────────────

function NrsSlider({
  value,
  onChange,
  emojis,
  labels,
  lowLabel,
  highLabel,
  color,
}: {
  value: number
  onChange: (v: number) => void
  emojis: Record<number, string>
  labels: Record<number, string>
  lowLabel: string
  highLabel: string
  color: "red" | "teal"
}) {
  const colorClasses =
    color === "red"
      ? "accent-red-500"
      : "accent-teal-500"

  const bgGradient =
    color === "red"
      ? `linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)`
      : `linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%)`

  return (
    <div className="space-y-4">
      {/* Emoji + Value */}
      <div className="text-center">
        <span className="text-5xl" role="img" aria-label={labels[value]}>
          {emojis[value]}
        </span>
        <p className="text-lg font-bold text-slate-800 mt-2">{value}/10</p>
        <p className="text-sm text-slate-500">{labels[value]}</p>
      </div>

      {/* Slider */}
      <div className="px-1">
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full h-3 rounded-full appearance-none cursor-pointer ${colorClasses}`}
          style={{
            background: bgGradient,
          }}
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

// ── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-lg">
      <div className="text-center py-16 space-y-4">
        <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-teal-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Gespeichert!</h2>
        <p className="text-sm text-slate-500 max-w-xs mx-auto">
          Dein Therapeut kann deinen Verlauf jetzt einsehen.
          Das hilft bei der Behandlungsplanung.
        </p>
        <Link href="/app/dashboard">
          <Button className="mt-4 bg-teal-600 hover:bg-teal-700 h-12 px-8 rounded-xl">
            Zurück zum Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function BefindlichkeitPage() {
  const router = useRouter()
  const { todayEntry, isLoading, saveEntry, isSaving } = usePainDiary()
  const [painLevel, setPainLevel] = useState(3)
  const [wellbeing, setWellbeing] = useState(5)
  const [notes, setNotes] = useState("")
  const [saved, setSaved] = useState(false)

  // Pre-fill from today's entry if it exists
  useEffect(() => {
    if (todayEntry) {
      setPainLevel(todayEntry.pain_level)
      setWellbeing(todayEntry.wellbeing)
      setNotes(todayEntry.notes ?? "")
    }
  }, [todayEntry])

  async function handleSave() {
    const success = await saveEntry({
      pain_level: painLevel,
      wellbeing,
      notes: notes.trim() || null,
    })

    if (success) {
      setSaved(true)
    } else {
      toast.error("Eintrag konnte nicht gespeichert werden.")
    }
  }

  if (saved) return <SuccessScreen />

  return (
    <div className="container mx-auto py-6 px-4 max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/app/dashboard">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl text-slate-400"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Tages-Check-in</h1>
          <p className="text-xs text-slate-400">
            {new Date().toLocaleDateString("de-DE", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Pain Level */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center">
                <Heart className="h-4 w-4 text-red-500" />
              </div>
              <h2 className="text-base font-semibold text-slate-700">
                Schmerzlevel
              </h2>
            </div>
            <NrsSlider
              value={painLevel}
              onChange={setPainLevel}
              emojis={PAIN_EMOJIS}
              labels={PAIN_LABELS}
              lowLabel="Kein Schmerz"
              highLabel="Maximum"
              color="red"
            />
          </div>

          {/* Wellbeing */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-8 w-8 rounded-lg bg-teal-50 flex items-center justify-center">
                <span className="text-lg">✨</span>
              </div>
              <h2 className="text-base font-semibold text-slate-700">
                Wohlbefinden
              </h2>
            </div>
            <NrsSlider
              value={wellbeing}
              onChange={setWellbeing}
              emojis={WELLBEING_EMOJIS}
              labels={WELLBEING_LABELS}
              lowLabel="Sehr schlecht"
              highLabel="Fantastisch"
              color="teal"
            />
          </div>

          {/* Notes */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-3">
              Notiz <span className="text-xs text-slate-400 font-normal">(optional)</span>
            </h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Wie war dein Tag? Gibt es etwas Besonderes zu berichten?"
              className="resize-none rounded-xl"
              rows={3}
              maxLength={2000}
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-14 text-base font-semibold rounded-2xl bg-teal-600 hover:bg-teal-700"
          >
            {isSaving ? "Wird gespeichert..." : todayEntry ? "Eintrag aktualisieren" : "Eintrag speichern"}
          </Button>
        </>
      )}
    </div>
  )
}
