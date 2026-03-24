"use client"

import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { cn } from "@/lib/utils"

interface EKGDividerProps {
  className?: string
  color?: "dark" | "light" | "warm"
}

export function EKGDivider({ className, color = "light" }: EKGDividerProps) {
  const { ref, isRevealed } = useScrollReveal(0.3)

  const strokeColor = {
    dark: "#3D7A66",
    light: "#2D5A4C",
    warm: "#C4956A",
  }[color]

  const opacity = color === "dark" ? "0.4" : "0.25"

  return (
    <div ref={ref} className={cn("relative w-full overflow-hidden py-2", className)}>
      <svg
        viewBox="0 0 1200 60"
        fill="none"
        preserveAspectRatio="none"
        className="w-full h-[40px] sm:h-[50px]"
      >
        {/* EKG heartbeat path */}
        <path
          d="M 0 30 L 350 30 L 380 30 L 400 28 L 420 32 L 440 10 L 460 50 L 480 5 L 500 55 L 520 20 L 540 30 L 560 30 L 580 28 L 600 30 L 620 30 L 800 30 L 830 30 L 850 28 L 870 32 L 890 12 L 910 48 L 930 8 L 950 52 L 970 22 L 990 30 L 1010 30 L 1030 28 L 1050 30 L 1200 30"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={opacity}
          className={cn("ekg-line", isRevealed && "revealed")}
          style={{ "--ekg-length": "1600" } as React.CSSProperties}
        />
      </svg>
    </div>
  )
}
