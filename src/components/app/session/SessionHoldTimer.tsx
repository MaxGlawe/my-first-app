"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface SessionHoldTimerProps {
  seconds: number
  isRunning: boolean
  onComplete: () => void
}

export function SessionHoldTimer({ seconds, isRunning, onComplete }: SessionHoldTimerProps) {
  const [remaining, setRemaining] = useState(seconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Reset when seconds change
  useEffect(() => {
    setRemaining(seconds)
  }, [seconds])

  // Countdown logic
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          onCompleteRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  const progress = seconds > 0 ? (seconds - remaining) / seconds : 0
  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference * (1 - progress)

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const timeStr = mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}`

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="54"
            stroke="#e2e8f0"
            strokeWidth="6"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="54"
            stroke="url(#holdGradient)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
          <defs>
            <linearGradient id="holdGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`text-4xl font-bold tabular-nums text-slate-900 ${
              isRunning && remaining <= 5 ? "animate-countdown-pulse text-red-500" : ""
            }`}
          >
            {timeStr}
          </span>
          {!isRunning && remaining === seconds && (
            <span className="text-xs text-slate-400 mt-0.5">Sekunden</span>
          )}
        </div>
      </div>
    </div>
  )
}
