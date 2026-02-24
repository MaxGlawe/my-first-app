"use client"

import { type ReactNode } from "react"

interface ClinicalCardProps {
  children: ReactNode
  className?: string
  /** Highlighted variant for important cards */
  highlighted?: boolean
  /** Warning variant (e.g., Red Flags) */
  warning?: boolean
}

export function ClinicalCard({
  children,
  className = "",
  highlighted = false,
  warning = false,
}: ClinicalCardProps) {
  const base = "rounded-xl border p-4 transition-all"
  const variant = warning
    ? "bg-red-50/60 border-red-200/60"
    : highlighted
    ? "bg-emerald-50/40 border-emerald-200/60"
    : "bg-white/60 border-slate-200/50"

  return <div className={`${base} ${variant} ${className}`}>{children}</div>
}
