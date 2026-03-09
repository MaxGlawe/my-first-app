"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { X } from "lucide-react"

interface SessionHeaderProps {
  exerciseName: string
  currentIndex: number
  totalExercises: number
  onExit: () => void
}

export function SessionHeader({
  exerciseName,
  currentIndex,
  totalExercises,
  onExit,
}: SessionHeaderProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const progress = totalExercises > 0 ? ((currentIndex) / totalExercises) * 100 : 0

  if (showConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Training beenden?</h3>
          <p className="text-sm text-slate-600">
            Dein Fortschritt wird gespeichert. Du kannst jederzeit weitermachen.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setShowConfirm(false)}
            >
              Weitermachen
            </Button>
            <Button
              variant="default"
              className="flex-1 rounded-xl bg-slate-900 hover:bg-slate-800"
              onClick={onExit}
            >
              Beenden
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="flex items-center gap-3 px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 text-slate-500 hover:bg-slate-100 rounded-full"
          onClick={() => setShowConfirm(true)}
          aria-label="Training beenden"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {exerciseName}
          </p>
        </div>

        <span className="text-sm font-medium text-slate-500 shrink-0">
          {currentIndex + 1} / {totalExercises}
        </span>
      </div>

      <Progress
        value={progress}
        className="h-1 rounded-none [&>div]:bg-emerald-500 [&>div]:transition-all [&>div]:duration-500"
      />
    </div>
  )
}
