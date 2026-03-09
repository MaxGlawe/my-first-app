"use client"

import { CheckCircle2 } from "lucide-react"
import type { FlatExercise } from "@/lib/training-helpers"

interface SessionTransitionProps {
  currentExercise: FlatExercise | undefined
  nextExercise: FlatExercise | null
}

export function SessionTransition({
  currentExercise,
  nextExercise,
}: SessionTransitionProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-white overflow-hidden">
      <div className="relative w-full max-w-md px-6">
        {/* Completed exercise sliding out */}
        {currentExercise && (
          <div className="animate-slide-out-left absolute inset-x-6 text-center">
            <div className="animate-checkmark-pop mb-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            </div>
            <p className="text-sm text-slate-400">{currentExercise.name}</p>
            <p className="text-xs text-emerald-500 font-medium">Geschafft!</p>
          </div>
        )}

        {/* Next exercise sliding in */}
        {nextExercise && (
          <div className="animate-slide-in-right text-center">
            <p className="text-xs text-slate-400 mb-1">Nächste Übung</p>
            <p className="text-lg font-bold text-slate-800">
              {nextExercise.name}
            </p>
          </div>
        )}

        {/* No next exercise — completing */}
        {!nextExercise && (
          <div className="animate-slide-in-right text-center">
            <div className="animate-checkmark-pop mb-3">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
            </div>
            <p className="text-lg font-bold text-slate-800">
              Alle Übungen geschafft!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
