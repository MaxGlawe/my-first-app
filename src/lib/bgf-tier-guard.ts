/**
 * BGF Tier Guard — Server-only API middleware
 * Use in API routes to enforce tier-based feature access.
 *
 * Usage:
 *   const access = await requireTierAccess(orgId, BgfFeature.IST_ANALYSE)
 *   if (!access.allowed) return access.response
 */

import { NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { hasFeature, getMinTier, getTierLabel, type BgfFeatureKey } from "@/lib/bgf-tiers"
import type { VertragTier } from "@/types/bgf"

type TierAccessResult =
  | { allowed: true; tier: VertragTier }
  | { allowed: false; response: NextResponse }

export async function requireTierAccess(
  orgId: string,
  feature: BgfFeatureKey
): Promise<TierAccessResult> {
  const sc = createSupabaseServiceClient()

  const { data: org } = await sc
    .from("organizations")
    .select("vertrag_tier")
    .eq("id", orgId)
    .single()

  if (!org) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "Organisation nicht gefunden." },
        { status: 404 }
      ),
    }
  }

  const tier = org.vertrag_tier as VertragTier

  if (!hasFeature(tier, feature)) {
    const requiredTier = getMinTier(feature)
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: `Diese Funktion ist ab dem ${getTierLabel(requiredTier)}-Tarif verfügbar.`,
          code: "TIER_INSUFFICIENT",
          current_tier: tier,
          required_tier: requiredTier,
        },
        { status: 403 }
      ),
    }
  }

  return { allowed: true, tier }
}
