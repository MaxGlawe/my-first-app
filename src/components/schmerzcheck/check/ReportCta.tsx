"use client"

import { ArrowRight } from "lucide-react"
import { fireInitiateCheckout } from "@/components/schmerzcheck/MetaPixel"

/**
 * PROJ-23 / Report v2: recommendation CTA. For the external Video-Analyse
 * booking it fires the Meta `InitiateCheckout` event before navigating
 * (stronger tracking on the money step).
 */
export function ReportCta({
  href,
  label,
  variant,
  band,
}: {
  href: string
  label: string
  variant: "booking" | "roadmap" | "info"
  band?: string
}) {
  const external = variant === "booking"
  const solid =
    "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_10px_28px_rgba(6,95,70,0.32)] hover:shadow-[0_14px_34px_rgba(6,95,70,0.4)]"
  const outline =
    "border-2 border-emerald-700 bg-white text-emerald-800 hover:bg-emerald-50 shadow-[0_4px_14px_rgba(6,95,70,0.10)]"
  // booking + roadmap get the confident solid button; info (physician) stays soft
  const cls = variant === "info" ? outline : solid

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={external ? () => fireInitiateCheckout({ band }) : undefined}
      className={`group inline-flex items-center gap-2.5 rounded-2xl px-8 py-4 text-[17px] font-bold transition-all hover:-translate-y-0.5 ${cls}`}
    >
      {label}
      <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5" />
    </a>
  )
}
