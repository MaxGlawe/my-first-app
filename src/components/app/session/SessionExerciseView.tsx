"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Play, SkipForward, ImageOff, ChevronDown, ChevronUp } from "lucide-react"
import type { FlatExercise } from "@/lib/training-helpers"
import type { SessionPhase } from "@/hooks/use-session-mode"
import { SessionSetIndicator } from "./SessionSetIndicator"
import { SessionRepCounter } from "./SessionRepCounter"
import { SessionHoldTimer } from "./SessionHoldTimer"

interface SessionExerciseViewProps {
  exercise: FlatExercise
  currentSet: number
  phase: SessionPhase
  onCompleteSet: () => void
  onStartHold: () => void
  onHoldComplete: () => void
  onSkip: () => void
  ttsEnabled?: boolean
}

export function SessionExerciseView({
  exercise,
  currentSet,
  phase,
  onCompleteSet,
  onStartHold,
  onHoldComplete,
  onSkip,
  ttsEnabled,
}: SessionExerciseViewProps) {
  const [showSteps, setShowSteps] = useState(false)
  const [mediaError, setMediaError] = useState(false)

  const { params } = exercise
  const isHold = !!params.dauer_sekunden && !params.wiederholungen
  const isRep = !!params.wiederholungen
  const isSetDone = phase === "set-done"

  return (
    <div
      className={`flex-1 flex flex-col ${
        isSetDone ? "animate-set-done-flash" : ""
      }`}
    >
      {/* Media area */}
      <div className="relative bg-slate-50 flex-shrink-0" style={{ height: "40vh" }}>
        {exercise.media_url && !mediaError ? (
          exercise.media_type === "video" ? (
            <video
              src={exercise.media_url}
              className="h-full w-full object-contain"
              playsInline
              loop
              muted
              autoPlay
            />
          ) : (
            <img
              src={exercise.media_url}
              alt={exercise.name}
              className="h-full w-full object-contain"
              onError={() => setMediaError(true)}
            />
          )
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center">
              <ImageOff className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              {exercise.beschreibung && (
                <p className="text-sm text-slate-400 max-w-xs px-4">
                  {exercise.beschreibung}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Skip button overlay */}
        <button
          onClick={onSkip}
          className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white/80 text-xs hover:bg-black/50 transition-colors"
        >
          <SkipForward className="h-3.5 w-3.5" />
          Überspringen
        </button>
      </div>

      {/* Controls area */}
      <div className="flex-1 flex flex-col items-center justify-between px-6 py-6">
        {/* Set indicator */}
        <SessionSetIndicator
          currentSet={currentSet}
          totalSets={params.saetze}
        />

        {/* Counter / Timer */}
        <div className="flex-1 flex items-center justify-center py-4">
          {isSetDone ? (
            <div className="animate-checkmark-pop">
              <CheckCircle2 className="h-20 w-20 text-emerald-500" />
            </div>
          ) : isHold ? (
            <SessionHoldTimer
              seconds={params.dauer_sekunden!}
              isRunning={phase === "holding"}
              onComplete={onHoldComplete}
            />
          ) : isRep ? (
            <SessionRepCounter reps={params.wiederholungen!} />
          ) : (
            <div className="text-center">
              <p className="text-lg font-medium text-slate-700">
                {params.saetze} Sätze
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Führe die Übung durch
              </p>
            </div>
          )}
        </div>

        {/* Execution steps toggle */}
        {exercise.ausfuehrung && exercise.ausfuehrung.length > 0 && (
          <div className="w-full mb-4">
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mx-auto"
            >
              {showSteps ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              Ausführung {showSteps ? "verbergen" : "anzeigen"}
            </button>

            {showSteps && (
              <div className="mt-3 bg-slate-50 rounded-xl p-4 space-y-2">
                {exercise.ausfuehrung.map((step) => (
                  <div key={step.nummer} className="flex gap-2.5 text-sm">
                    <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                      {step.nummer}
                    </span>
                    <span className="text-slate-600">{step.beschreibung}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Anmerkung */}
        {params.anmerkung && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2 w-full text-center mb-4">
            {params.anmerkung}
          </p>
        )}

        {/* Action button (hidden in TTS-guided mode) */}
        {!isSetDone && !ttsEnabled && (
          <Button
            size="lg"
            onClick={isHold && phase !== "holding" ? onStartHold : onCompleteSet}
            className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-base shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98]"
          >
            {isHold && phase !== "holding" ? (
              <>
                <Play className="h-5 w-5 mr-2" />
                Halten starten
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Satz erledigt
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
