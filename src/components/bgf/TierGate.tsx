"use client"

import type { VertragTier } from "@/types/bgf"
import {
  hasFeature,
  getMinTier,
  getTierLabel,
  FEATURE_LABELS,
  type BgfFeatureKey,
} from "@/lib/bgf-tiers"
import { Lock, ArrowUpRight } from "lucide-react"
import Link from "next/link"

interface TierGateProps {
  tier: VertragTier | null
  requiredFeature: BgfFeatureKey
  children: React.ReactNode
}

/**
 * Section-level tier gate.
 * Wraps a section — shows children if tier is sufficient,
 * otherwise shows a styled lock card.
 */
export function TierGate({ tier, requiredFeature, children }: TierGateProps) {
  // Still loading — show nothing to avoid flash
  if (tier === null) return null

  if (hasFeature(tier, requiredFeature)) {
    return <>{children}</>
  }

  const minTier = getMinTier(requiredFeature)
  const featureLabel = FEATURE_LABELS[requiredFeature]

  return (
    <div className="relative rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-slate-100/50 p-6 overflow-hidden">
      {/* Blur overlay effect */}
      <div className="absolute inset-0 backdrop-blur-[1px]" />

      <div className="relative flex flex-col items-center text-center py-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-200/80 flex items-center justify-center mb-4">
          <Lock className="h-5 w-5 text-slate-400" />
        </div>

        <p className="text-sm font-semibold text-slate-700 mb-1">
          {featureLabel}
        </p>

        <p className="text-xs text-slate-500 mb-4">
          Verfügbar ab dem{" "}
          <span className="font-semibold text-indigo-600">
            {getTierLabel(minTier)}
          </span>
          -Tarif
        </p>

        <Link
          href="mailto:physiotherapieglawe@gmx.de?subject=BGF%20Upgrade%20anfragen"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Upgrade anfragen
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
