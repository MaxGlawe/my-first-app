"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, TrendingUp } from "lucide-react"

interface TeamPulsData {
  active_percent: number
  total_members: number
  active_members: number
  sessions_this_week: number
}

export function TeamPuls({ organizationId }: { organizationId: string | null }) {
  const [data, setData] = useState<TeamPulsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!organizationId) return
    async function fetch_data() {
      try {
        const res = await fetch(`/api/bgf/team-puls?organization_id=${organizationId}`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch {
        // Non-critical
      } finally {
        setIsLoading(false)
      }
    }
    fetch_data()
  }, [organizationId])

  if (isLoading || !data) return null

  const percent = data.active_percent

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-2xl border border-emerald-100/60 p-5 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Team-Puls
          </span>
        </div>
        {percent >= 60 && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
            <TrendingUp className="w-3 h-3" />
            Stark
          </div>
        )}
      </div>

      {/* Main stat */}
      <div className="flex items-center gap-4">
        {/* Circular progress */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
            <circle
              cx="32" cy="32" r="26"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="6"
            />
            <motion.circle
              cx="32" cy="32" r="26"
              fill="none"
              stroke="url(#team-puls-gradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 26}
              initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - percent / 100) }}
              transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="team-puls-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-slate-900 tabular-nums">{percent}%</span>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800">
            deines Teams war diese Woche aktiv
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {data.active_members} von {data.total_members} Kolleg:innen · {data.sessions_this_week} Sessions
          </p>
        </div>
      </div>
    </motion.div>
  )
}
