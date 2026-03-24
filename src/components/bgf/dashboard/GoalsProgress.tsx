"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Target, TrendingDown, TrendingUp, Minus, ArrowDown, ArrowUp } from "lucide-react"

// ── Types ────────────────────────────────────────────────────────────

interface GoalProgress {
  ziel: string
  baseline: number
  current: number
  improvement_percent: number
  trend: "up" | "down" | "stable"
  metric_label: string
  detail: string
}

interface GoalsProgressProps {
  organizationId: string | null
}

// ── Goal Visual Config ───────────────────────────────────────────────

interface GoalVisual {
  icon: string
  bgColor: string
  barColor: string
}

const GOAL_VISUALS: Record<string, GoalVisual> = {
  schmerz: { icon: "🎯", bgColor: "bg-rose-50", barColor: "from-rose-400 to-rose-500" },
  stress: { icon: "🧘", bgColor: "bg-violet-50", barColor: "from-violet-400 to-violet-500" },
  schlaf: { icon: "😴", bgColor: "bg-sky-50", barColor: "from-sky-400 to-sky-500" },
  bewegung: { icon: "🏃", bgColor: "bg-emerald-50", barColor: "from-emerald-400 to-emerald-500" },
  rücken: { icon: "💪", bgColor: "bg-blue-50", barColor: "from-blue-400 to-blue-500" },
  haltung: { icon: "🧍", bgColor: "bg-indigo-50", barColor: "from-indigo-400 to-indigo-500" },
  flexib: { icon: "🤸", bgColor: "bg-amber-50", barColor: "from-amber-400 to-amber-500" },
  energie: { icon: "⚡", bgColor: "bg-orange-50", barColor: "from-orange-400 to-orange-500" },
  entspann: { icon: "🧘", bgColor: "bg-violet-50", barColor: "from-violet-400 to-violet-500" },
}

const DEFAULT_VISUAL: GoalVisual = { icon: "🎯", bgColor: "bg-slate-50", barColor: "from-slate-400 to-slate-500" }

function getGoalVisual(ziel: string): GoalVisual {
  const lower = ziel.toLowerCase()
  for (const [key, visual] of Object.entries(GOAL_VISUALS)) {
    if (lower.includes(key)) return visual
  }
  return DEFAULT_VISUAL
}

// ── Trend Badge ──────────────────────────────────────────────────────

function TrendBadge({ trend, percent }: { trend: "up" | "down" | "stable"; percent: number }) {
  if (trend === "up") {
    return (
      <div className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
        <TrendingUp className="w-3 h-3" />
        Verbessert
      </div>
    )
  }
  if (trend === "down") {
    return (
      <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
        <TrendingDown className="w-3 h-3" />
        Dran bleiben
      </div>
    )
  }
  return (
    <div className="flex items-center gap-0.5 text-[10px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded-md">
      <Minus className="w-3 h-3" />
      Stabil
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────

export function GoalsProgress({ organizationId }: GoalsProgressProps) {
  const [goals, setGoals] = useState<GoalProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!organizationId) return
    async function loadGoals() {
      try {
        const res = await fetch(`/api/bgf/goals-progress?organization_id=${organizationId}`)
        if (res.ok) {
          const data = await res.json()
          setGoals(data.goals ?? [])
        }
      } catch {
        // Non-critical
      } finally {
        setIsLoading(false)
      }
    }
    loadGoals()
  }, [organizationId])

  if (isLoading || goals.length === 0) return null

  // Overall trend
  const overallTrend = goals.filter((g) => g.trend === "up").length >= goals.length / 2
    ? "up"
    : goals.filter((g) => g.trend === "down").length >= goals.length / 2
    ? "down"
    : "stable"

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Deine Ziele
          </span>
        </div>
        <TrendBadge trend={overallTrend} percent={0} />
      </div>

      {/* Goals list */}
      <div className="space-y-4">
        {goals.map((goal, i) => {
          const visual = getGoalVisual(goal.ziel)
          const progressWidth = Math.max(3, Math.min(100, Math.abs(goal.improvement_percent)))
          const isPositive = goal.improvement_percent > 0

          return (
            <motion.div
              key={goal.ziel}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl ${visual.bgColor} flex items-center justify-center text-lg flex-shrink-0`}>
                  {visual.icon}
                </div>
                <div className="flex-1 min-w-0">
                  {/* Title + improvement badge */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-slate-800 truncate">
                      {goal.ziel}
                    </span>
                    <div className={`flex items-center gap-0.5 text-xs font-bold ml-2 flex-shrink-0 ${
                      isPositive ? "text-emerald-600" : goal.improvement_percent === 0 ? "text-slate-400" : "text-amber-600"
                    }`}>
                      {isPositive ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : goal.improvement_percent < 0 ? (
                        <ArrowDown className="w-3 h-3" />
                      ) : null}
                      {isPositive ? "+" : ""}{goal.improvement_percent}%
                    </div>
                  </div>

                  {/* Progress bar — green when improving, red when worsening */}
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${
                        isPositive
                          ? "from-emerald-400 to-emerald-500"
                          : goal.improvement_percent < 0
                          ? "from-rose-400 to-rose-500"
                          : "from-slate-300 to-slate-400"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressWidth}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                    />
                  </div>

                  {/* Detail: baseline → current */}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-slate-400">
                      {goal.metric_label}: {goal.detail}
                    </span>
                    {goal.trend === "up" && (
                      <span className="text-[10px] text-emerald-500 font-semibold">
                        ↗ Trend positiv
                      </span>
                    )}
                    {goal.trend === "down" && (
                      <span className="text-[10px] text-amber-500 font-semibold">
                        ↘ Weiter dranbleiben
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
