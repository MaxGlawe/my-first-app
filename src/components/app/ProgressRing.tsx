"use client"

import { useEffect, useRef, useState } from "react"

interface ProgressRingProps {
  /** Erledigte Einheiten */
  done: number
  /** Ziel-Einheiten */
  goal: number
  /** Durchmesser in px */
  size?: number
  /** Strichbreite */
  strokeWidth?: number
  /** Zusätzliche CSS-Klassen */
  className?: string
  /** Label unter dem Zähler */
  label?: string
  /** Zeige den Glow-Effekt bei ≥80% */
  glow?: boolean
}

export function ProgressRing({
  done,
  goal,
  size = 120,
  strokeWidth = 10,
  className = "",
  label = "Diese Woche",
  glow = true,
}: ProgressRingProps) {
  const [animated, setAnimated] = useState(false)
  const ref = useRef<SVGCircleElement>(null)

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const percent = goal > 0 ? Math.min(100, Math.round((done / goal) * 100)) : 0
  const dashOffset = circumference * (1 - (animated ? percent : 0) / 100)

  // Gradient IDs (unique per instance)
  const gradId = `ring-grad-${size}`

  // Start animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Update animation when values change
  useEffect(() => {
    setAnimated(true)
  }, [done, goal])

  const showGlow = glow && percent >= 80

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Glow effect */}
      {showGlow && (
        <div
          className="absolute inset-0 rounded-full opacity-40 animate-pulse"
          style={{
            background: `radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)`,
          }}
        />
      )}

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>

        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />

        {/* Progress ring */}
        <circle
          ref={ref}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={percent >= 50 ? `url(#${gradId})` : "#94a3b8"}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-800 leading-none tabular-nums">
          {done}<span className="text-base font-medium text-slate-400">/{goal}</span>
        </span>
        {label && (
          <span className="text-[10px] text-slate-400 font-medium mt-1">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
