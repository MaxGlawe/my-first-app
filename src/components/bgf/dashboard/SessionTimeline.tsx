"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Play,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  Loader2,
} from "lucide-react"
import type { PausenFitSession } from "@/types/bgf"
import { getTypLabel, getTypEmoji } from "@/components/bgf/pausen-fit/SessionCard"

// ── Helpers ──────────────────────────────────────────────────────────

function getScheduledTime(typ: string): string {
  switch (typ) {
    case "morgen_aktivierung": return "09:30"
    case "mittag_mobilisation": return "12:30"
    case "nachmittag_reset": return "15:00"
    default: return "—"
  }
}

function isSessionNow(typ: string): boolean {
  const hour = new Date().getHours()
  switch (typ) {
    case "morgen_aktivierung": return hour >= 9 && hour < 12
    case "mittag_mobilisation": return hour >= 12 && hour < 15
    case "nachmittag_reset": return hour >= 15 && hour < 18
    default: return false
  }
}

// ── Main Component ───────────────────────────────────────────────────

interface SessionTimelineProps {
  sessions: PausenFitSession[]
  onStart: (sessionId: string) => void
  isGenerating?: boolean
  onGenerate?: () => void
}

export function SessionTimeline({
  sessions,
  onStart,
  isGenerating,
  onGenerate,
}: SessionTimelineProps) {
  const completed = sessions.filter((s) => s.status === "abgeschlossen").length
  const total = sessions.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Dein Tagesplan
          </span>
        </div>
        {total > 0 && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
            {completed}/{total} erledigt
          </span>
        )}
      </div>

      {/* Timeline */}
      {sessions.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-slate-500 mb-3">Keine Sessions für heute</p>
          {onGenerate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerate}
              disabled={isGenerating}
              className="text-indigo-600 border-indigo-200"
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 mr-2" />
              )}
              Sessions generieren
            </Button>
          )}
        </div>
      ) : (
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[23px] top-2 bottom-2 w-px bg-slate-100" />

          <div className="space-y-1">
            {sessions.map((session, i) => {
              const isDone = session.status === "abgeschlossen"
              const isStarted = session.status === "gestartet"
              const isNow = isSessionNow(session.typ)
              const isNext = !isDone && !isStarted && isNow
              const durationMin = Math.ceil(
                session.uebungen.reduce((s, u) => s + u.dauer_sekunden, 0) / 60
              )

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className={`relative flex items-start gap-3 p-3 rounded-xl transition-all ${
                    isNext || isStarted
                      ? "bg-gradient-to-r from-emerald-50/80 to-white"
                      : isDone
                      ? "opacity-70"
                      : ""
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="relative z-10 flex-shrink-0">
                    {isDone ? (
                      <div className="w-[18px] h-[18px] rounded-full bg-emerald-500 flex items-center justify-center mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    ) : isNext || isStarted ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-[18px] h-[18px] rounded-full bg-emerald-400 ring-4 ring-emerald-100 mt-0.5"
                      />
                    ) : (
                      <div className="w-[18px] h-[18px] rounded-full bg-slate-200 mt-0.5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono font-medium tabular-nums">
                        {getScheduledTime(session.typ)}
                      </span>
                      <span className="text-base">{getTypEmoji(session.typ)}</span>
                      <span
                        className={`text-sm font-semibold truncate ${
                          isDone ? "text-slate-500 line-through" : "text-slate-800"
                        }`}
                      >
                        {getTypLabel(session.typ)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400">
                        {session.uebungen.length} Übungen · {durationMin} Min.
                      </span>
                      {isDone && session.feedback_sterne && (
                        <span className="text-xs text-amber-500">
                          {"★".repeat(session.feedback_sterne)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  {(isNext || isStarted) && (
                    <Button
                      size="sm"
                      onClick={() => onStart(session.id)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-9 text-xs font-bold shadow-sm flex-shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 mr-1" />
                      {isStarted ? "Weiter" : "Start"}
                    </Button>
                  )}

                  {!isDone && !isNext && !isStarted && (
                    <button
                      onClick={() => onStart(session.id)}
                      className="text-slate-400 hover:text-slate-600 p-1 flex-shrink-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}
