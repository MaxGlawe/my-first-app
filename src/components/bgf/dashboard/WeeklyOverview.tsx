"use client"

import { motion } from "framer-motion"
import { CalendarDays, CheckCircle2, Moon } from "lucide-react"

interface DayStatus {
  label: string
  completed: number
  total: number
  isToday: boolean
  isRestDay?: boolean
}

interface WeeklyOverviewProps {
  days: DayStatus[]
  weekTotal: { completed: number; total: number }
}

export function WeeklyOverview({ days, weekTotal }: WeeklyOverviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Diese Woche
          </span>
        </div>
        <span className="text-xs font-bold text-slate-500">
          {weekTotal.completed}/{weekTotal.total} Sessions
        </span>
      </div>

      {/* Day dots — Mo-So */}
      <div className="flex items-center justify-between">
        {days.map((day, i) => {
          const allDone = day.total > 0 && day.completed === day.total
          const partial = day.completed > 0 && day.completed < day.total
          const hasData = day.total > 0
          const isRestDay = day.isRestDay && !hasData

          return (
            <motion.div
              key={day.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.04 }}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  day.isToday ? "text-indigo-600" : "text-slate-400"
                }`}
              >
                {day.label}
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  day.isToday
                    ? allDone
                      ? "bg-emerald-500 shadow-md shadow-emerald-200"
                      : "bg-indigo-100 ring-2 ring-indigo-300"
                    : allDone
                    ? "bg-emerald-100"
                    : partial
                    ? "bg-amber-50 border border-amber-200"
                    : isRestDay
                    ? "bg-violet-50 border border-violet-100"
                    : hasData
                    ? "bg-slate-50 border border-slate-200"
                    : "bg-slate-50"
                }`}
              >
                {allDone ? (
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      day.isToday ? "text-white" : "text-emerald-500"
                    }`}
                  />
                ) : partial ? (
                  <span className="text-[10px] font-bold text-amber-600">
                    {day.completed}/{day.total}
                  </span>
                ) : isRestDay ? (
                  <Moon className="w-3.5 h-3.5 text-violet-400" />
                ) : hasData ? (
                  <span className="text-[10px] font-bold text-slate-400">
                    0/{day.total}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-300">—</span>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
