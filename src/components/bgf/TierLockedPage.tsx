"use client"

import type { VertragTier } from "@/types/bgf"
import {
  getTierLabel,
  getTierPrice,
  getUpgradeFeatures,
  FEATURE_LABELS,
} from "@/lib/bgf-tiers"
import { Lock, Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface TierLockedPageProps {
  currentTier: VertragTier
  requiredTier: VertragTier
  featureTitle: string
  featureDescription: string
}

/**
 * Full-page tier lock screen.
 * Replaces entire page content when tier is insufficient.
 */
export function TierLockedPage({
  currentTier,
  requiredTier,
  featureTitle,
  featureDescription,
}: TierLockedPageProps) {
  const upgradeFeatures = getUpgradeFeatures(currentTier, requiredTier)

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
          {/* Lock icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-6">
            <Lock className="h-7 w-7 text-slate-400" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {featureTitle}
          </h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            {featureDescription}
          </p>

          {/* Tier comparison */}
          <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Aktueller Tarif
                </p>
                <p className="text-sm font-bold text-slate-700">
                  {getTierLabel(currentTier)} ({getTierPrice(currentTier)}€/MA)
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300" />
              <div>
                <p className="text-xs text-indigo-500 uppercase tracking-wider font-semibold">
                  Benötigt
                </p>
                <p className="text-sm font-bold text-indigo-600">
                  {getTierLabel(requiredTier)} ({getTierPrice(requiredTier)}€/MA)
                </p>
              </div>
            </div>

            {/* Features unlocked by upgrade */}
            {upgradeFeatures.length > 0 && (
              <>
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  Zusätzliche Features:
                </p>
                <ul className="space-y-1.5">
                  {upgradeFeatures.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-xs text-slate-600"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {FEATURE_LABELS[feature]}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* CTA */}
          <Link
            href={`mailto:physiotherapieglawe@gmx.de?subject=BGF%20Upgrade%20auf%20${getTierLabel(requiredTier)}&body=Wir%20möchten%20gerne%20auf%20den%20${getTierLabel(requiredTier)}-Tarif%20upgraden.`}
          >
            <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/20">
              Upgrade auf {getTierLabel(requiredTier)} anfragen
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <Link
            href="/app/bgf/dashboard"
            className="inline-block mt-4 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Zurück zum Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
