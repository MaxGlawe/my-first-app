"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, ChevronRight } from "lucide-react"

interface SessionExerciseDoneScreenProps {
  exerciseName: string
  currentIndex: number
  totalExercises: number
  nextExerciseName: string | null
  onNext: () => void
}

export function SessionExerciseDoneScreen({
  exerciseName,
  currentIndex,
  totalExercises,
  nextExerciseName,
  onNext,
}: SessionExerciseDoneScreenProps) {
  const isLast = nextExerciseName === null

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />

      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-md mx-auto w-full text-center">
        <div className="h-20 w-20 rounded-3xl bg-emerald-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>

        <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-2">
          Übung {currentIndex + 1} von {totalExercises}
        </p>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {exerciseName}
        </h2>
        <p className="text-sm text-emerald-600 font-medium mb-10">
          abgeschlossen
        </p>

        {!isLast && nextExerciseName && (
          <div className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 mb-8 text-left">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-1">
              Als Nächstes
            </p>
            <p className="text-base font-semibold text-slate-700">
              {nextExerciseName}
            </p>
          </div>
        )}

        <Button
          onClick={onNext}
          className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-base shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98]"
        >
          {isLast ? "Training abschließen" : "Weiter zur nächsten Übung"}
          <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      </div>
    </div>
  )
}
