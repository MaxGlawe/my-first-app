"use client"

import { useDailyInsight } from "@/hooks/use-daily-insight"
import { Lightbulb, Loader2 } from "lucide-react"

export function DailyInsightCard() {
  const { insight, loading } = useDailyInsight()

  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border border-teal-100 dark:border-teal-800 p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
          <span className="text-sm text-teal-600 dark:text-teal-400">Tipp wird geladen...</span>
        </div>
      </div>
    )
  }

  if (!insight) return null

  return (
    <div className="rounded-2xl bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border border-teal-100 dark:border-teal-800 p-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
            <Lightbulb className="h-5 w-5 text-teal-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">
            Tipp des Tages
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {insight.content}
          </p>
        </div>
      </div>
    </div>
  )
}
