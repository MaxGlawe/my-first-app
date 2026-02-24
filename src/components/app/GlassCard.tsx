"use client"

import { type ReactNode } from "react"
import { cx } from "./premium-styles"

interface GlassCardProps {
  children: ReactNode
  className?: string
  /** Klick-Handler (macht die Karte interaktiv) */
  onClick?: () => void
  /** Variante bestimmt Farbe + Hintergrund */
  variant?: "default" | "accent" | "success" | "warning" | "dark"
  /** Kompakteres Padding */
  compact?: boolean
  /** Glow-Effekt am Rand */
  glow?: boolean
  /** Animierter Eingang (mit delay-Index) */
  animateIndex?: number
}

const VARIANT_STYLES = {
  default:
    "bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm",
  accent:
    "bg-gradient-to-br from-teal-50/80 to-emerald-50/80 backdrop-blur-sm border border-teal-200/40 shadow-sm",
  success:
    "bg-gradient-to-br from-emerald-50/80 to-green-50/80 backdrop-blur-sm border border-emerald-200/40 shadow-sm",
  warning:
    "bg-gradient-to-br from-amber-50/80 to-orange-50/80 backdrop-blur-sm border border-amber-200/40 shadow-sm",
  dark:
    "bg-white/[0.06] backdrop-blur-xl border border-white/10 shadow-lg",
}

const GLOW_STYLES = {
  default: "",
  accent: "shadow-teal-500/10",
  success: "shadow-emerald-500/10",
  warning: "shadow-amber-500/10",
  dark: "",
}

const DELAYS = [
  "",
  "animation-delay-150",
  "animation-delay-300",
  "animation-delay-450",
  "animation-delay-600",
]

export function GlassCard({
  children,
  className,
  onClick,
  variant = "default",
  compact = false,
  glow = false,
  animateIndex,
}: GlassCardProps) {
  const isInteractive = !!onClick
  const padding = compact ? "p-3 sm:p-4" : "p-4 sm:p-5"
  const animClass =
    animateIndex !== undefined
      ? `animate-fade-in-up opacity-0 ${DELAYS[Math.min(animateIndex, DELAYS.length - 1)]}`
      : ""

  return (
    <div
      onClick={onClick}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={cx(
        "rounded-2xl",
        padding,
        VARIANT_STYLES[variant],
        isInteractive &&
          "cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98]",
        glow && GLOW_STYLES[variant],
        animClass,
        className
      )}
    >
      {children}
    </div>
  )
}
