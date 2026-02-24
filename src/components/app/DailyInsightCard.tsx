"use client"

import { useDailyInsight } from "@/hooks/use-daily-insight"
import { Lightbulb, Loader2 } from "lucide-react"

export function DailyInsightCard() {
  const { insight, loading } = useDailyInsight()

  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-teal-50/80 to-cyan-50/80 backdrop-blur-sm border border-teal-100/60 p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
          <span className="text-sm text-teal-600">Tipp wird geladen...</span>
        </div>
      </div>
    )
  }

  if (!insight) return null

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-2xl" />
      <div className="relative m-[1px] rounded-[calc(1rem-1px)] bg-gradient-to-r from-teal-50/95 to-cyan-50/95 backdrop-blur-sm p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center shadow-sm shadow-teal-500/20">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-600 mb-1">
              Tipp des Tages
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {insight.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
