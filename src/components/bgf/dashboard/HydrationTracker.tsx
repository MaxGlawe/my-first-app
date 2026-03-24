"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Droplets, Minus } from "lucide-react"

interface HydrationTrackerProps {
  current: number
  goal?: number
  onAdd: () => void
  onRemove: () => void
  isUpdating?: boolean
}

// ── Splash Particle ──────────────────────────────────────────────────

function SplashParticle({ index }: { index: number }) {
  const angle = (index / 6) * Math.PI * 2 + Math.random() * 0.5
  const distance = 20 + Math.random() * 25
  const x = Math.cos(angle) * distance
  const y = Math.sin(angle) * distance - 15
  const size = 3 + Math.random() * 4

  return (
    <motion.circle
      cx={40}
      cy={20}
      r={size / 2}
      fill="#67e8f9"
      initial={{ opacity: 1, cx: 40, cy: 20 }}
      animate={{ opacity: 0, cx: 40 + x, cy: 20 + y }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    />
  )
}

// ── Main Component ───────────────────────────────────────────────────

export function HydrationTracker({
  current,
  goal = 8,
  onAdd,
  onRemove,
  isUpdating,
}: HydrationTrackerProps) {
  const fillPercent = Math.min((current / goal) * 100, 100)
  const [showSplash, setShowSplash] = useState(false)
  const isFull = current >= goal

  function handleAdd() {
    if (isFull || isUpdating) return
    setShowSplash(true)
    onAdd()
    setTimeout(() => setShowSplash(false), 700)
  }

  // Motivational message
  function getMessage() {
    if (isFull) return "Tagesziel erreicht!"
    if (current === 0) return "Trink dein erstes Glas"
    if (fillPercent < 40) return "Weiter trinken!"
    if (fillPercent < 75) return "Gut dabei!"
    return "Fast geschafft!"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-cyan-50 via-white to-sky-50 rounded-2xl border border-cyan-100/60 p-5 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-100 flex items-center justify-center">
            <Droplets className="w-4 h-4 text-cyan-600" />
          </div>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Hydration
          </span>
        </div>
        <span className="text-xs text-slate-400 font-medium">{getMessage()}</span>
      </div>

      <div className="flex items-center gap-5">
        {/* ── Water Glass SVG ───────────────────────────────── */}
        <button
          onClick={handleAdd}
          disabled={isFull || isUpdating}
          className="relative w-[88px] h-[120px] flex-shrink-0 group disabled:cursor-default cursor-pointer"
          aria-label="Glas Wasser trinken"
        >
          <svg viewBox="0 0 80 112" className="w-full h-full overflow-visible">
            <defs>
              {/* Glass clip path — slightly tapered glass shape */}
              <clipPath id="hydration-glass-clip">
                <path d="M14 6 Q14 2 18 2 L62 2 Q66 2 66 6 L63 96 Q62.5 104 56 104 L24 104 Q17.5 104 17 96 Z" />
              </clipPath>
              {/* Water gradient */}
              <linearGradient id="hydration-water-grad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>

            {/* Glass background (subtle inner glow) */}
            <path
              d="M14 6 Q14 2 18 2 L62 2 Q66 2 66 6 L63 96 Q62.5 104 56 104 L24 104 Q17.5 104 17 96 Z"
              fill="#f8fafc"
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />

            {/* Water fill group (clipped to glass) */}
            <g clipPath="url(#hydration-glass-clip)">
              {/* Water body */}
              <motion.rect
                x="0"
                width="80"
                height="110"
                fill="url(#hydration-water-grad)"
                initial={false}
                animate={{ y: 110 - (fillPercent / 100) * 108 }}
                transition={{ type: "spring", stiffness: 40, damping: 12 }}
              />

              {/* Wave 1 — front wave */}
              <motion.path
                d="M-80 0 Q-60 -6 -40 0 T0 0 T40 0 T80 0 T120 0 T160 0 V16 H-80 Z"
                fill="rgba(255,255,255,0.35)"
                initial={false}
                animate={{
                  y: 110 - (fillPercent / 100) * 108 - 3,
                  x: [-80, 0],
                }}
                transition={{
                  y: { type: "spring", stiffness: 40, damping: 12 },
                  x: { duration: 2.5, repeat: Infinity, ease: "linear" },
                }}
              />

              {/* Wave 2 — back wave (slower, opposite) */}
              <motion.path
                d="M-80 0 Q-60 5 -40 0 T0 0 T40 0 T80 0 T120 0 T160 0 V16 H-80 Z"
                fill="rgba(255,255,255,0.2)"
                initial={false}
                animate={{
                  y: 110 - (fillPercent / 100) * 108 - 1,
                  x: [0, -80],
                }}
                transition={{
                  y: { type: "spring", stiffness: 40, damping: 12 },
                  x: { duration: 3.5, repeat: Infinity, ease: "linear" },
                }}
              />
            </g>

            {/* Glass highlight (reflection) */}
            <path
              d="M20 8 L22 90 Q22 94 24 94"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.5"
            />

            {/* Splash particles */}
            <AnimatePresence>
              {showSplash &&
                Array.from({ length: 8 }).map((_, i) => (
                  <SplashParticle key={`splash-${i}`} index={i} />
                ))}
            </AnimatePresence>
          </svg>

          {/* Tap hint on hover */}
          {!isFull && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center backdrop-blur-sm"
              >
                <Plus className="w-5 h-5 text-cyan-700" />
              </motion.div>
            </div>
          )}
        </button>

        {/* ── Info & Controls ───────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Counter */}
          <div className="flex items-baseline gap-1">
            <motion.span
              key={current}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl font-bold text-slate-900 tabular-nums"
            >
              {current}
            </motion.span>
            <span className="text-lg text-slate-400 font-medium">/{goal}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Gläser Wasser</p>

          {/* Progress bar */}
          <div className="mt-3 h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                isFull
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                  : "bg-gradient-to-r from-cyan-400 to-cyan-500"
              }`}
              initial={false}
              animate={{ width: `${fillPercent}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleAdd}
              disabled={isFull || isUpdating}
              className="flex items-center gap-1.5 text-sm font-semibold text-cyan-600 hover:text-cyan-700 disabled:opacity-30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Glas trinken
            </button>
            {current > 0 && (
              <button
                onClick={onRemove}
                disabled={isUpdating}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors ml-2"
              >
                <Minus className="w-3 h-3" />
                Korrektur
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
