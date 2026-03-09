"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  PartyPopper,
  Clock,
  Dumbbell,
  CheckCircle2,
  SkipForward,
  Star,
} from "lucide-react"
import type { FlatExercise } from "@/lib/training-helpers"

interface SessionCompletionScreenProps {
  exercises: FlatExercise[]
  completedSets: number[]
  skipped: number[]
  startedAt: string
  onSubmit: (overall: {
    difficulty?: number
    pain_during?: number
    notes?: string
  }) => void
}

export function SessionCompletionScreen({
  exercises,
  completedSets,
  skipped,
  startedAt,
  onSubmit,
}: SessionCompletionScreenProps) {
  const [difficulty, setDifficulty] = useState(0)
  const [painDuring, setPainDuring] = useState<number | null>(null)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const stats = useMemo(() => {
    const durationSec = Math.round(
      (Date.now() - new Date(startedAt).getTime()) / 1000
    )
    const mins = Math.floor(durationSec / 60)
    const secs = durationSec % 60
    const totalSets = completedSets.reduce((a, b) => a + b, 0)

    return {
      duration: `${mins}:${secs.toString().padStart(2, "0")}`,
      exercisesDone: exercises.length - skipped.length,
      totalExercises: exercises.length,
      totalSets,
      skippedCount: skipped.length,
    }
  }, [exercises, completedSets, skipped, startedAt])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await onSubmit({
      difficulty: difficulty > 0 ? difficulty : undefined,
      pain_during: painDuring ?? undefined,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-950 text-white">
      {/* Confetti-like header dots */}
      <div className="relative overflow-hidden pt-12 pb-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: `${8 + Math.random() * 12}px`,
              height: `${8 + Math.random() * 12}px`,
              left: `${5 + (i / 12) * 90}%`,
              top: `${10 + Math.random() * 60}%`,
              backgroundColor: [
                "#10b981",
                "#14b8a6",
                "#fbbf24",
                "#f97316",
                "#a78bfa",
              ][i % 5],
              animation: `float ${3 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}

        <div className="relative text-center px-6">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30 animate-checkmark-pop">
            <PartyPopper className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold animate-fade-in-up">
            Training abgeschlossen!
          </h1>
          <p className="text-emerald-200/60 text-sm mt-1 animate-fade-in-up animation-delay-150">
            Großartige Arbeit!
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="px-6 pb-6 animate-fade-in-up animation-delay-300">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Clock className="h-5 w-5 text-emerald-400" />}
            value={stats.duration}
            label="Minuten"
          />
          <StatCard
            icon={<Dumbbell className="h-5 w-5 text-emerald-400" />}
            value={String(stats.exercisesDone)}
            label={`von ${stats.totalExercises} Übungen`}
          />
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
            value={String(stats.totalSets)}
            label="Sätze"
          />
          <StatCard
            icon={<SkipForward className="h-5 w-5 text-amber-400" />}
            value={String(stats.skippedCount)}
            label="Übersprungen"
          />
        </div>
      </div>

      {/* Overall feedback */}
      <div className="px-6 pb-6 animate-fade-in-up animation-delay-450">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-5 space-y-5">
          <p className="text-sm font-semibold text-white/90">
            Wie war das Training insgesamt?
          </p>

          {/* Difficulty */}
          <div>
            <p className="text-xs text-emerald-200/50 mb-2">Schwierigkeit</p>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                    level <= difficulty
                      ? "bg-amber-400 text-white shadow-sm scale-110"
                      : "bg-white/10 text-white/30 hover:bg-white/20"
                  }`}
                >
                  <Star
                    className="h-5 w-5"
                    fill={level <= difficulty ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Pain */}
          <div>
            <p className="text-xs text-emerald-200/50 mb-2">Schmerz-Level</p>
            <div className="flex gap-1.5 justify-center flex-wrap">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
                const isSelected = painDuring === level
                return (
                  <button
                    key={level}
                    onClick={() => setPainDuring(level)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? level <= 3
                          ? "bg-emerald-400 text-white scale-110"
                          : level <= 6
                            ? "bg-amber-400 text-white scale-110"
                            : "bg-red-400 text-white scale-110"
                        : "bg-white/10 text-white/40 hover:bg-white/20"
                    }`}
                  >
                    {level}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs text-emerald-200/50 mb-2">
              Notizen (optional)
            </p>
            <Textarea
              placeholder="Wie hast du dich gefühlt?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="resize-none rounded-xl text-sm bg-white/10 border-white/10 text-white placeholder:text-white/30"
              maxLength={2000}
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="px-6 pb-10 animate-fade-in-up animation-delay-600">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          size="lg"
          className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-base shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting ? "Wird gespeichert..." : "Abschließen"}
          {!isSubmitting && <CheckCircle2 className="h-5 w-5 ml-2" />}
        </Button>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string
  label: string
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-4 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-2xl font-bold tabular-nums text-white">{value}</p>
      <p className="text-xs text-emerald-200/50 mt-0.5">{label}</p>
    </div>
  )
}
