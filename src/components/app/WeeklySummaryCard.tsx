"use client"

import { usePatientApp } from "@/hooks/use-patient-app"
import { BarChart3, TrendingUp, TrendingDown, Minus, Activity } from "lucide-react"

export function WeeklySummaryCard() {
  const { assignments } = usePatientApp()

  // Calculate weekly stats from active assignments
  const activeAssignments = assignments.filter((a) => a.status === "aktiv")

  if (activeAssignments.length === 0) return null

  // Total completions this week (last 7 days)
  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)
  const weekStart = sevenDaysAgo.toISOString().split("T")[0]
  const todayStr = today.toISOString().split("T")[0]

  let completedThisWeek = 0
  let expectedThisWeek = 0
  let avgCompliance = 0

  for (const a of activeAssignments) {
    const dates = a.completed_dates ?? []
    completedThisWeek += dates.filter((d: string) => d >= weekStart && d <= todayStr).length
    expectedThisWeek += (a.expected_count ?? 0)
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
    ? "text-green-600"
    : avgCompliance >= 50
      ? "text-amber-600"
      : "text-red-500"

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="h-4 w-4 text-slate-500" />
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Deine Woche
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800 dark:text-white">
            {completedThisWeek}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Trainings</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {avgCompliance}%
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Compliance</p>
        </div>
        <div className="text-center">
          <div className={`flex items-center justify-center gap-1 ${trendColor}`}>
            <TrendIcon className="h-5 w-5" />
            <Activity className="h-4 w-4" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Trend</p>
        </div>
      </div>
    </div>
  )
}
