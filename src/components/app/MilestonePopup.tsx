"use client"

import { useEffect, useState, useCallback } from "react"

interface MilestonePopupProps {
  achievement: {
    id: string
    name: string
    description: string
    icon: string
  } | null
  onClose: () => void
}

// ── Confetti Particle ────────────────────────────────────────────────────────

interface Particle {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
  color: string
  delay: number
  duration: number
  drift: number
}

const CONFETTI_COLORS = [
  "#10b981", // emerald
  "#14b8a6", // teal
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#ef4444", // red
  "#06b6d4", // cyan
]

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10 - Math.random() * 20,
    rotation: Math.random() * 360,
    scale: 0.5 + Math.random() * 0.8,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 0.6,
    duration: 1.5 + Math.random() * 1.5,
    drift: -30 + Math.random() * 60,
  }))
}

// ── Component ────────────────────────────────────────────────────────────────

export function MilestonePopup({ achievement, onClose }: MilestonePopupProps) {
  const [visible, setVisible] = useState(false)
  const [particles] = useState(() => generateParticles(40))

  useEffect(() => {
    if (!achievement) {
      setVisible(false)
      return
    }

    // Animate in
    const showTimer = setTimeout(() => setVisible(true), 50)

    // Auto-dismiss after 5s
    const dismissTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 400)
    }, 5000)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(dismissTimer)
    }
  }, [achievement, onClose])

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 400)
  }, [onClose])

  if (!achievement) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      />

      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute w-2.5 h-2.5 rounded-sm"
            style={{
              left: `${p.x}%`,
              backgroundColor: p.color,
              transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
              animation: visible
                ? `confetti-fall ${p.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay}s forwards`
                : "none",
              opacity: 0,
              ["--confetti-drift" as string]: `${p.drift}px`,
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl p-8 mx-6 max-w-sm w-full text-center"
        style={{
          transform: visible ? "scale(1) translateY(0)" : "scale(0.8) translateY(20px)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ring behind icon */}
        <div className="relative mx-auto mb-5 w-24 h-24">
          <div
            className="absolute inset-0 rounded-full animate-pulse"
            style={{
              background:
                "radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-5xl"
              style={{
                animation: visible ? "icon-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both" : "none",
              }}
            >
              {achievement.icon}
            </span>
          </div>
        </div>

        {/* Title */}
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">
          Achievement freigeschaltet!
        </p>
        <h3 className="text-xl font-bold text-slate-800 mb-1">
          {achievement.name}
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          {achievement.description}
        </p>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="inline-flex items-center justify-center h-11 px-8 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.97] transition-all duration-200"
        >
          Weiter so!
        </button>
      </div>

    </div>
  )
}
