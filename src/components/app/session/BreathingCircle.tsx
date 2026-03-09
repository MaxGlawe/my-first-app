"use client"

import { useState, useEffect } from "react"

interface BreathingCircleProps {
  variant?: "emerald" | "blue"
}

export function BreathingCircle({ variant = "emerald" }: BreathingCircleProps) {
  const [isInhaling, setIsInhaling] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsInhaling((prev) => !prev)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const isBlue = variant === "blue"

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-40 w-40 flex items-center justify-center">
        {/* Outer glow ring */}
        <div
          className={`absolute inset-0 rounded-full ${
            isBlue
              ? "bg-blue-400/10 animate-breathing-glow-blue"
              : "bg-emerald-400/10 animate-breathing"
          }`}
        />

        {/* Main breathing circle */}
        <div
          className={`relative h-28 w-28 rounded-full animate-breathing flex items-center justify-center ${
            isBlue
              ? "bg-gradient-to-br from-blue-400/30 to-indigo-400/30"
              : "bg-gradient-to-br from-emerald-400/30 to-teal-400/30"
          }`}
        >
          <div
            className={`h-16 w-16 rounded-full animate-breathing ${
              isBlue
                ? "bg-gradient-to-br from-blue-400/50 to-indigo-400/50"
                : "bg-gradient-to-br from-emerald-400/50 to-teal-400/50"
            }`}
            style={{ animationDelay: "0.3s" }}
          />
        </div>
      </div>

      <p
        className={`text-sm font-medium transition-opacity duration-1000 ${
          isBlue ? "text-blue-200/80" : "text-emerald-200/80"
        }`}
      >
        {isInhaling ? "Einatmen..." : "Ausatmen..."}
      </p>
    </div>
  )
}
