"use client"

import { useState, type ReactNode } from "react"
import { ChevronDown, type LucideIcon } from "lucide-react"

interface CollapsibleSectionProps {
  title: string
  description?: string
  icon?: LucideIcon
  children: ReactNode
  /** Start expanded? */
  defaultOpen?: boolean
  /** Accent for icon badge */
  accent?: "emerald" | "teal" | "blue" | "amber" | "purple" | "red"
  /** Badge text shown next to title (e.g. count of items) */
  badge?: string
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

export function CollapsibleSection({
  title,
  description,
  icon: Icon,
  children,
  defaultOpen = false,
  accent = "emerald",
  badge,
  className = "",
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      className={`bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm transition-all hover:shadow-md ${className}`}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-6 text-left"
      >
        {Icon && (
          <div
            className={`p-2.5 rounded-xl bg-gradient-to-br ${ACCENT_STYLES[accent]} shrink-0`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-800">{title}</h3>
            {badge && (
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
        <ChevronDown
          className={`h-5 w-5 text-slate-400 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6 pt-0">
          <div className="border-t border-slate-200/60 pt-5">{children}</div>
        </div>
      </div>
    </div>
  )
}
