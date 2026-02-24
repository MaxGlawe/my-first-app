"use client"

import { type ReactNode } from "react"
import { type LucideIcon } from "lucide-react"

interface ClinicalSectionProps {
  title: string
  description?: string
  icon?: LucideIcon
  children: ReactNode
  /** Optional accent color for the icon badge */
  accent?: "emerald" | "teal" | "blue" | "amber" | "purple" | "red"
  /** Render without the card wrapper (flat) */
  flat?: boolean
  className?: string
}

const ACCENT_STYLES = {
  emerald: "from-emerald-50 to-teal-50 text-emerald-600",
  teal: "from-teal-50 to-cyan-50 text-teal-600",
  blue: "from-blue-50 to-cyan-50 text-blue-600",
  amber: "from-amber-50 to-orange-50 text-amber-600",
  purple: "from-purple-50 to-violet-50 text-purple-600",
  red: "from-red-50 to-rose-50 text-red-600",
} as const

export function ClinicalSection({
  title,
  description,
  icon: Icon,
  children,
  accent = "emerald",
  flat = false,
  className = "",
}: ClinicalSectionProps) {
  const content = (
    <>
      <div className="flex items-center gap-3 mb-5">
        {Icon && (
          <div
            className={`p-2.5 rounded-xl bg-gradient-to-br ${ACCENT_STYLES[accent]}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="border-t border-slate-200/60 pt-5">{children}</div>
    </>
  )

  if (flat) {
    return <div className={className}>{content}</div>
  }

  return (
    <div
      className={`bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm p-6 transition-all hover:shadow-md ${className}`}
    >
      {content}
    </div>
  )
}
