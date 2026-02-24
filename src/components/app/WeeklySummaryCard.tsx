"use client"

import { usePatientApp } from "@/hooks/use-patient-app"
import { AnimatedCounter } from "@/components/app/AnimatedCounter"
import { BarChart3, TrendingUp, TrendingDown, Minus, Activity } from "lucide-react"

export function WeeklySummaryCard() {
  const { assignments } = usePatientApp()

  const activeAssignments = assignments.filter((a) => a.status === "aktiv")
  if (activeAssignments.length === 0) return null

  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)
  const weekStart = sevenDaysAgo.toISOString().split("T")[0]
  const todayStr = today.toISOString().split("T")[0]

  let completedThisWeek = 0
  let avgCompliance = 0

  for (const a of activeAssignments) {
    const dates = a.completed_dates ?? []
    completedThisWeek += dates.filter((d: string) => d >= weekStart && d <= todayStr).length
    avgCompliance += (a.compliance_7days ?? 0)
  }

  if (activeAssignments.length > 0) {
    avgCompliance = Math.round(avgCompliance / activeAssignments.length)
  }

  const TrendIcon = avgCompliance >= 80
    ? TrendingUp
    : avgCompliance >= 50
      ? Minus
      : TrendingDown

  const trendColor = avgCompliance >= 80
    ? "text-emerald-600"
    : avgCompliance >= 50
      ? "text-amber-500"
      : "text-red-500"

  const trendBg = avgCompliance >= 80
    ? "bg-emerald-50"
    : avgCompliance >= 50
      ? "bg-amber-50"
      : "bg-red-50"

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="h-4 w-4 text-slate-400" />
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Deine Woche
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800 tabular-nums">
            <AnimatedCounter value={completedThisWeek} />
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Trainings</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800 tabular-nums">
            <AnimatedCounter value={avgCompliance} suffix="%" />
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Compliance</p>
        </div>
        <div className="text-center">
          <div className={`inline-flex items-center justify-center gap-1 ${trendColor} ${trendBg} rounded-lg px-2 py-1`}>
            <TrendIcon className="h-4 w-4" />
            <Activity className="h-3.5 w-3.5" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Trend</p>
        </div>
      </div>
    </div>
  )
}
