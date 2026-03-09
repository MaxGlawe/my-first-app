"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Star, ChevronRight } from "lucide-react"

interface SessionFeedbackSheetProps {
  exerciseName: string
  onSubmit: (feedback: { difficulty?: number; pain_during?: number }) => void
  onSkip: () => void
}

export function SessionFeedbackSheet({
  exerciseName,
  onSubmit,
  onSkip,
}: SessionFeedbackSheetProps) {
  const [difficulty, setDifficulty] = useState(0)
  const [painDuring, setPainDuring] = useState<number | null>(null)

  const handleSubmit = () => {
    onSubmit({
      difficulty: difficulty > 0 ? difficulty : undefined,
      pain_during: painDuring ?? undefined,
    })
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Top gradient bar */}
      <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />

      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-md mx-auto w-full">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-slate-800">Wie war&apos;s?</h2>
          <p className="text-sm text-slate-400 mt-1">{exerciseName}</p>
        </div>

        {/* Difficulty (1-5 stars) */}
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-600 mb-3 text-center">
            Schwierigkeit
          </p>
          <div className="flex gap-3 justify-center">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${
                  level <= difficulty
                    ? "bg-amber-400 text-white shadow-md scale-110"
                    : "bg-slate-100 text-slate-300 hover:bg-slate-200"
                }`}
              >
                <Star
                  className="h-6 w-6"
                  fill={level <= difficulty ? "currentColor" : "none"}
                />
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-2">
            <span>Leicht</span>
            <span>Sehr schwer</span>
          </div>
        </div>

        {/* Pain during exercise (0-10) */}
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-600 mb-3 text-center">
            Schmerzen während der Übung
          </p>
          <div className="flex gap-1.5 justify-center flex-wrap">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
              const isSelected = painDuring === level
              const color =
                level === 0
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : level <= 3
                    ? "bg-green-100 text-green-700 border-green-200"
                    : level <= 6
                      ? "bg-amber-100 text-amber-700 border-amber-200"
                      : "bg-red-100 text-red-700 border-red-200"
              return (
                <button
                  key={level}
                  onClick={() => setPainDuring(level)}
                  className={`h-9 w-9 rounded-lg text-xs font-semibold border transition-all ${
                    isSelected
                      ? `${color} scale-110 shadow-sm`
                      : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {level}
                </button>
              )
            })}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-2">
            <span>Kein Schmerz</span>
            <span>Unerträglich</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 mt-auto">
          <Button
            onClick={handleSubmit}
            className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-base shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98]"
          >
            Weiter
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
          <button
            onClick={onSkip}
            className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors py-2"
          >
            Überspringen
          </button>
        </div>
      </div>
    </div>
  )
}
