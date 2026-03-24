"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wind, X, Play } from "lucide-react"

// ── Breathing Pattern: 4-7-8 Technique ───────────────────────────────
// Einatmen 4s → Halten 7s → Ausatmen 8s = 19s per cycle
// 3 cycles ≈ 1 minute

const PHASES = [
  { label: "Einatmen", duration: 4, scale: 1.0, color: "from-cyan-400 to-blue-500" },
  { label: "Halten", duration: 7, scale: 1.0, color: "from-blue-400 to-indigo-500" },
  { label: "Ausatmen", duration: 8, scale: 0.6, color: "from-indigo-400 to-violet-500" },
] as const

const TOTAL_CYCLES = 3
const CYCLE_DURATION = PHASES.reduce((sum, p) => sum + p.duration, 0) // 19s

// ── Fullscreen Breathing Exercise ────────────────────────────────────

function BreathingExercise({ onClose }: { onClose: () => void }) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)
  const [countdown, setCountdown] = useState<number>(PHASES[0].duration)
  const [isComplete, setIsComplete] = useState(false)

  const phase = PHASES[phaseIndex]

  const advancePhase = useCallback(() => {
    const nextPhaseIndex = (phaseIndex + 1) % PHASES.length
    if (nextPhaseIndex === 0) {
      const nextCycle = cycleCount + 1
      if (nextCycle >= TOTAL_CYCLES) {
        setIsComplete(true)
        return
      }
      setCycleCount(nextCycle)
    }
    setPhaseIndex(nextPhaseIndex)
    setCountdown(PHASES[nextPhaseIndex].duration)
  }, [phaseIndex, cycleCount])

  useEffect(() => {
    if (isComplete) return
    if (countdown <= 0) {
      advancePhase()
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, isComplete, advancePhase])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors z-10"
        aria-label="Schließen"
      >
        <X className="w-5 h-5" />
      </button>

      {isComplete ? (
        /* ── Complete Screen ─────────────────────────── */
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center text-center px-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/30"
          >
            <span className="text-4xl">🧘</span>
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Gut gemacht!</h2>
          <p className="text-indigo-200/60 text-sm max-w-xs mb-8">
            {TOTAL_CYCLES} Atemzyklen abgeschlossen. Du solltest dich jetzt ruhiger und fokussierter fühlen.
          </p>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl transition-colors"
          >
            Zurück zum Dashboard
          </button>
        </motion.div>
      ) : (
        /* ── Breathing Animation ─────────────────────── */
        <>
          {/* Cycle counter */}
          <div className="absolute top-6 left-6">
            <p className="text-xs text-white/30 font-medium">
              Zyklus {cycleCount + 1}/{TOTAL_CYCLES}
            </p>
          </div>

          {/* Main breathing circle */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Outer glow */}
            <motion.div
              animate={{
                scale: phase.scale + 0.3,
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                scale: { duration: phase.duration, ease: "easeInOut" },
                opacity: { duration: phase.duration, repeat: 0 },
              }}
              className={`absolute w-full h-full rounded-full bg-gradient-to-br ${phase.color} blur-3xl`}
            />

            {/* Middle ring */}
            <motion.div
              animate={{ scale: phase.scale + 0.1 }}
              transition={{ duration: phase.duration, ease: "easeInOut" }}
              className={`absolute w-48 h-48 rounded-full bg-gradient-to-br ${phase.color} opacity-20`}
            />

            {/* Inner circle */}
            <motion.div
              animate={{ scale: phase.scale }}
              transition={{ duration: phase.duration, ease: "easeInOut" }}
              className={`w-36 h-36 rounded-full bg-gradient-to-br ${phase.color} shadow-2xl flex items-center justify-center`}
            >
              <span className="text-4xl font-bold text-white tabular-nums">
                {countdown}
              </span>
            </motion.div>
          </div>

          {/* Phase label */}
          <motion.div
            key={phase.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-1">{phase.label}</h2>
            <p className="text-sm text-indigo-200/50">
              {phaseIndex === 0 && "Tief durch die Nase einatmen"}
              {phaseIndex === 1 && "Atem sanft anhalten"}
              {phaseIndex === 2 && "Langsam durch den Mund ausatmen"}
            </p>
          </motion.div>

          {/* Phase dots */}
          <div className="flex items-center gap-3 mt-8">
            {PHASES.map((p, i) => (
              <div
                key={p.label}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === phaseIndex ? "w-8 bg-white" : i < phaseIndex ? "w-3 bg-white/40" : "w-3 bg-white/15"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}

// ── Dashboard Card ───────────────────────────────────────────────────

export function AtemPause() {
  const [isActive, setIsActive] = useState(false)

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        onClick={() => setIsActive(true)}
        className="w-full bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 rounded-2xl border border-indigo-100/60 p-5 shadow-sm text-left group hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-4">
          {/* Animated breathing icon */}
          <div className="relative w-14 h-14 flex-shrink-0">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-2xl opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200/40">
              <Wind className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-800">Atem-Pause</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              1 Minute Ruhe — 4-7-8 Atemtechnik
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors shadow-sm">
            <Play className="w-4 h-4 ml-0.5" />
          </div>
        </div>
      </motion.button>

      {/* Fullscreen exercise overlay */}
      <AnimatePresence>
        {isActive && <BreathingExercise onClose={() => setIsActive(false)} />}
      </AnimatePresence>
    </>
  )
}
