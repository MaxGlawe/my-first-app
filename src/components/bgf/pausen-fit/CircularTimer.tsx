"use client"

import { useEffect, useRef, useState } from "react"

interface CircularTimerProps {
  /** Total duration in seconds */
  durationSeconds: number
  /** Called when timer reaches 0 */
  onComplete: () => void
  /** Whether timer is running */
  running?: boolean
  /** Accent color class (for ring) */
  colorClass?: string
}

export function CircularTimer({
  durationSeconds,
  onComplete,
  running = true,
  colorClass = "#2D6A4F",
}: CircularTimerProps) {
  const [remaining, setRemaining] = useState(durationSeconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Reset when duration changes (new exercise)
  useEffect(() => {
    setRemaining(durationSeconds)
  }, [durationSeconds])

  // Tick
  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          // Call after paint to avoid state update during render
          setTimeout(() => onCompleteRef.current(), 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, durationSeconds])

  // SVG ring math
  const size = 180
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = remaining / durationSeconds
  const strokeDashoffset = circumference * (1 - progress)

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E2DDD5"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colorClass}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.9s linear" }}
          />
        </svg>

        {/* Centered time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tabular-nums text-slate-900 font-display">
            {minutes > 0
              ? `${minutes}:${String(seconds).padStart(2, "0")}`
              : seconds}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            {minutes > 0 ? "min" : "sec"}
          </span>
        </div>
      </div>
    </div>
  )
}
