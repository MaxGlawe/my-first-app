"use client"

import { useState, useEffect, useRef } from "react"
import { SkipForward } from "lucide-react"
import type { FlatExercise } from "@/lib/training-helpers"
import { formatExerciseParams } from "@/lib/training-helpers"
import { BreathingCircle } from "./BreathingCircle"

interface SessionPauseScreenProps {
  seconds: number
  nextExercise: FlatExercise | null
  currentSet: number
  totalSets: number
  onDone: () => void
  onSkip: () => void
}

export function SessionPauseScreen({
  seconds,
  nextExercise,
  currentSet,
  totalSets,
  onDone,
  onSkip,
}: SessionPauseScreenProps) {
  const [remaining, setRemaining] = useState(seconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          onDoneRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const timeStr =
    mins > 0
      ? `${mins}:${secs.toString().padStart(2, "0")}`
      : `0:${secs.toString().padStart(2, "0")}`

  const moreSets = currentSet < totalSets

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-950 text-white">
      {/* Top label */}
      <div className="text-center pt-8 pb-2">
        <p className="text-sm font-medium text-emerald-200/60 uppercase tracking-wider">
          Pause
        </p>
        {moreSets && (
          <p className="text-xs text-emerald-200/40 mt-1">
            Satz {currentSet} von {totalSets} geschafft
          </p>
        )}
      </div>

      {/* Breathing circle */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        <BreathingCircle />

        {/* Countdown */}
        <div className="text-center">
          <p className="text-5xl font-bold tabular-nums text-white">
            {timeStr}
          </p>
        </div>
      </div>

      {/* Next exercise preview */}
      {nextExercise && !moreSets && (
        <div className="px-6 pb-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
            <p className="text-xs text-emerald-200/50 mb-1">Nächste Übung</p>
            <p className="text-sm font-semibold text-white">
              {nextExercise.name}
            </p>
            <p className="text-xs text-emerald-200/50 mt-0.5">
              {formatExerciseParams(nextExercise)}
            </p>
          </div>
        </div>
      )}

      {/* Skip button */}
      <div className="px-6 pb-8">
        <button
          onClick={onSkip}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm text-emerald-200/60 hover:text-white transition-colors"
        >
          <SkipForward className="h-4 w-4" />
          Pause überspringen
        </button>
      </div>
    </div>
  )
}
