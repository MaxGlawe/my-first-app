"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Mic, Clock, Dumbbell } from "lucide-react"
import type { FlatExercise } from "@/lib/training-helpers"
import { formatExerciseParams } from "@/lib/training-helpers"

interface SessionStartScreenProps {
  planName: string
  exercises: FlatExercise[]
  estimatedMinutes: number
  ttsEnabled: boolean
  onToggleTts: (enabled: boolean) => void
  onStart: () => void
  onBack: () => void
}

export function SessionStartScreen({
  planName,
  exercises,
  estimatedMinutes,
  ttsEnabled,
  onToggleTts,
  onStart,
  onBack,
}: SessionStartScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-950 text-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-emerald-200/70 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </button>
      </div>

      {/* Hero */}
      <div className="px-6 pt-6 pb-4 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <Dumbbell className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{planName}</h1>
            <div className="flex items-center gap-3 text-sm text-emerald-200/70 mt-0.5">
              <span className="flex items-center gap-1">
                <Dumbbell className="h-3.5 w-3.5" />
                {exercises.length} Übungen
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                ca. {estimatedMinutes} Min.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise list */}
      <div className="px-6 pb-4 animate-fade-in-up animation-delay-150">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 divide-y divide-white/10">
          {exercises.map((ex, i) => (
            <div
              key={ex.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <span className="text-xs font-semibold text-emerald-400/70 w-5 shrink-0">
                {i + 1}
              </span>
              <span className="flex-1 text-sm font-medium text-white/90 truncate">
                {ex.name}
              </span>
              <span className="text-xs text-emerald-200/50 shrink-0">
                {formatExerciseParams(ex)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* TTS Toggle */}
      <div className="px-6 pb-6 animate-fade-in-up animation-delay-300">
        <button
          onClick={() => onToggleTts(!ttsEnabled)}
          className={`
            w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all
            ${ttsEnabled
              ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-200"
              : "bg-white/5 border-white/10 text-white/50"
            }
          `}
        >
          <Mic className={`h-5 w-5 ${ttsEnabled ? "text-emerald-400" : "text-white/30"}`} />
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">
              {ttsEnabled ? "Trainer-Stimme aktiv" : "Mit Trainer-Stimme"}
            </p>
            <p className="text-xs opacity-60">
              Persönliche Audio-Anleitung durch jede Übung
            </p>
          </div>
          <div
            className={`h-6 w-11 rounded-full transition-colors relative ${
              ttsEnabled ? "bg-emerald-500" : "bg-white/20"
            }`}
          >
            <div
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                ttsEnabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </div>
        </button>
      </div>

      {/* Start button */}
      <div className="px-6 pb-10 animate-fade-in-up animation-delay-450">
        <Button
          onClick={onStart}
          size="lg"
          className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-base shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98]"
        >
          <Play className="h-5 w-5 mr-2" />
          Training starten
        </Button>
      </div>
    </div>
  )
}
