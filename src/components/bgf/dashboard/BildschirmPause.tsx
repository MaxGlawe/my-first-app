"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, X, RotateCcw } from "lucide-react"

// ── Fullscreen Eye Break ─────────────────────────────────────────────

function EyeBreakOverlay({ onClose }: { onClose: () => void }) {
  const [countdown, setCountdown] = useState(20)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (countdown <= 0) {
      setIsComplete(true)
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-b from-sky-900 via-cyan-900 to-slate-900 flex flex-col items-center justify-center px-8"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        aria-label="Schließen"
      >
        <X className="w-5 h-5" />
      </button>

      {isComplete ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">👀</div>
          <h2 className="text-2xl font-bold text-white mb-2">Perfekt!</h2>
          <p className="text-cyan-200/60 text-sm mb-8">Deine Augen danken es dir.</p>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl transition-colors"
          >
            Fertig
          </button>
        </motion.div>
      ) : (
        <div className="text-center">
          {/* Animated eye */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-sky-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-cyan-500/30"
          >
            <Eye className="w-12 h-12 text-white" />
          </motion.div>

          <h2 className="text-xl font-bold text-white mb-2">
            Schau in die Ferne
          </h2>
          <p className="text-cyan-200/50 text-sm mb-8 max-w-xs">
            Fokussiere einen Punkt mindestens 6 Meter entfernt und entspanne deine Augen
          </p>

          {/* Countdown ring */}
          <div className="relative w-20 h-20 mx-auto">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
              <motion.circle
                cx="40" cy="40" r="34"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 34}
                animate={{ strokeDashoffset: 2 * Math.PI * 34 * (countdown / 20) }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white tabular-nums">{countdown}</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ── Dashboard Card ───────────────────────────────────────────────────

export function BildschirmPause() {
  const [isActive, setIsActive] = useState(false)
  const [lastBreak, setLastBreak] = useState<Date | null>(null)
  const [minutesAgo, setMinutesAgo] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Update "minutes ago" every 30s
  useEffect(() => {
    function update() {
      if (lastBreak) {
        setMinutesAgo(Math.floor((Date.now() - lastBreak.getTime()) / 60000))
      }
    }
    update()
    intervalRef.current = setInterval(update, 30000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [lastBreak])

  function handleClose() {
    setIsActive(false)
    setLastBreak(new Date())
  }

  const needsBreak = minutesAgo !== null && minutesAgo >= 20

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={() => setIsActive(true)}
        className={`w-full rounded-2xl border p-4 shadow-sm text-left group hover:shadow-md transition-all ${
          needsBreak
            ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/60"
            : "bg-gradient-to-br from-sky-50 via-white to-cyan-50 border-sky-100/60"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
              needsBreak
                ? "bg-gradient-to-br from-amber-400 to-orange-500"
                : "bg-gradient-to-br from-sky-400 to-cyan-500"
            }`}
          >
            <Eye className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">Bildschirm-Pause</h3>
              {needsBreak && (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                  Fällig
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {lastBreak
                ? `Letzte Pause vor ${minutesAgo} Min.`
                : "20-20-20 Regel für deine Augen"
              }
            </p>
          </div>

          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              needsBreak
                ? "bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white"
                : "bg-white/80 text-sky-500 group-hover:bg-sky-500 group-hover:text-white"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </div>
        </div>
      </motion.button>

      <AnimatePresence>
        {isActive && <EyeBreakOverlay onClose={handleClose} />}
      </AnimatePresence>
    </>
  )
}
