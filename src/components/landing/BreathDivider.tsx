"use client"

import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { cn } from "@/lib/utils"

interface BreathDividerProps {
  className?: string
  color?: "sage" | "warm" | "subtle"
}

export function BreathDivider({ className, color = "sage" }: BreathDividerProps) {
  const { ref, isRevealed } = useScrollReveal(0.3)

  const strokeColor = {
    sage: "#2D6A4F",
    warm: "#C4956A",
    subtle: "#7CB69D",
  }[color]

  return (
    <div ref={ref} className={cn("relative w-full overflow-hidden py-4", className)}>
      <svg
        viewBox="0 0 1200 80"
        fill="none"
        preserveAspectRatio="none"
        className="w-full h-[50px] sm:h-[60px]"
      >
        {/* Organic breathing wave — smooth sine curve */}
        <path
          d={`M 0 40
            C 100 40, 150 20, 200 20
            C 250 20, 300 40, 350 40
            C 400 40, 450 60, 500 60
            C 550 60, 600 40, 650 40
            C 700 40, 750 20, 800 20
            C 850 20, 900 40, 950 40
            C 1000 40, 1050 60, 1100 60
            C 1150 60, 1200 40, 1200 40`}
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.25"
          className={cn(
            "transition-all duration-[2s] ease-out",
            isRevealed ? "opacity-25" : "opacity-0"
          )}
          style={{
            strokeDasharray: 2000,
            strokeDashoffset: isRevealed ? 0 : 2000,
            transition: "stroke-dashoffset 3s cubic-bezier(0.4, 0, 0.2, 1), opacity 1s ease-out",
          }}
        />

        {/* Second wave — slightly offset for depth */}
        <path
          d={`M 0 40
            C 80 40, 130 55, 200 55
            C 270 55, 320 40, 400 40
            C 480 40, 530 25, 600 25
            C 670 25, 720 40, 800 40
            C 880 40, 930 55, 1000 55
            C 1070 55, 1120 40, 1200 40`}
          stroke={strokeColor}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.12"
          className={cn(
            "transition-all duration-[2.5s] ease-out",
            isRevealed ? "opacity-12" : "opacity-0"
          )}
          style={{
            strokeDasharray: 2000,
            strokeDashoffset: isRevealed ? 0 : 2000,
            transition: "stroke-dashoffset 3.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s, opacity 1.5s ease-out 0.3s",
          }}
        />
      </svg>
    </div>
  )
}
