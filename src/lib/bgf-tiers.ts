/**
 * BGF Tier Feature Gating — Central utility
 * Single source of truth for which features belong to which tiers.
 * Importable on both client and server.
 */

import type { VertragTier } from "@/types/bgf"

// ── Feature Enum ─────────────────────────────────────────────────────

export const BgfFeature = {
  // Basic tier (all tiers)
  PAUSEN_FIT: "pausen_fit",
  CHECK_IN: "check_in",
  ERGONOMIE: "ergonomie",
  HYDRATION: "hydration",
  STREAKS: "streaks",

  // Pro tier
  IST_ANALYSE: "ist_analyse",
  HR_DASHBOARD: "hr_dashboard",
  MEMBER_MANAGEMENT: "member_management",
  THERAPEUTEN_CHAT: "therapeuten_chat",
  ZIEL_TRACKING: "ziel_tracking",
  TEAM_PULS: "team_puls",

  // Enterprise tier
  QUARTALS_REPORTS: "quartals_reports",
  DEDIZIERTER_THERAPEUT: "dedizierter_therapeut",
  ZUSATZLEISTUNGEN: "zusatzleistungen",
} as const

export type BgfFeatureKey = (typeof BgfFeature)[keyof typeof BgfFeature]

// ── Tier Hierarchy ───────────────────────────────────────────────────

const TIER_LEVEL: Record<VertragTier, number> = {
  basic: 0,
  pro: 1,
  enterprise: 2,
}

const FEATURE_MIN_TIER: Record<BgfFeatureKey, VertragTier> = {
  [BgfFeature.PAUSEN_FIT]: "basic",
  [BgfFeature.CHECK_IN]: "basic",
  [BgfFeature.ERGONOMIE]: "basic",
  [BgfFeature.HYDRATION]: "basic",
  [BgfFeature.STREAKS]: "basic",

  [BgfFeature.IST_ANALYSE]: "pro",
  [BgfFeature.HR_DASHBOARD]: "pro",
  [BgfFeature.MEMBER_MANAGEMENT]: "pro",
  [BgfFeature.THERAPEUTEN_CHAT]: "pro",
  [BgfFeature.ZIEL_TRACKING]: "pro",
  [BgfFeature.TEAM_PULS]: "pro",

  [BgfFeature.QUARTALS_REPORTS]: "enterprise",
  [BgfFeature.DEDIZIERTER_THERAPEUT]: "enterprise",
  [BgfFeature.ZUSATZLEISTUNGEN]: "enterprise",
}

// ── Feature Labels (German) ──────────────────────────────────────────

export const FEATURE_LABELS: Record<BgfFeatureKey, string> = {
  [BgfFeature.PAUSEN_FIT]: "KI Pausen-Fit Sessions",
  [BgfFeature.CHECK_IN]: "Täglicher Gesundheits-Check-In",
  [BgfFeature.ERGONOMIE]: "Ergonomie-Tipps & Bildschirm-Pausen",
  [BgfFeature.HYDRATION]: "Hydration-Tracker",
  [BgfFeature.STREAKS]: "Wochen-Übersicht & Streak-System",

  [BgfFeature.IST_ANALYSE]: "Ist-Analyse & Risiko-Scoring",
  [BgfFeature.HR_DASHBOARD]: "HR-Dashboard mit anonymisierten Reports",
  [BgfFeature.MEMBER_MANAGEMENT]: "Mitarbeiter-Verwaltung",
  [BgfFeature.THERAPEUTEN_CHAT]: "Persönlicher Therapeuten-Chat",
  [BgfFeature.ZIEL_TRACKING]: "Ziel-Tracking mit Fortschrittsmessung",
  [BgfFeature.TEAM_PULS]: "Team-Puls (anonyme Team-Statistik)",

  [BgfFeature.QUARTALS_REPORTS]: "Quartals-Reports mit Handlungsempfehlungen",
  [BgfFeature.DEDIZIERTER_THERAPEUT]: "Dedizierter Therapeut als fester Ansprechpartner",
  [BgfFeature.ZUSATZLEISTUNGEN]: "Zugang zu Sonderkonditionen für Einzelleistungen",
}

// ── Core Functions ───────────────────────────────────────────────────

export function hasFeature(tier: VertragTier, feature: BgfFeatureKey): boolean {
  return TIER_LEVEL[tier] >= TIER_LEVEL[FEATURE_MIN_TIER[feature]]
}

export function getMinTier(feature: BgfFeatureKey): VertragTier {
  return FEATURE_MIN_TIER[feature]
}

export function getTierLabel(tier: VertragTier): string {
  const labels: Record<VertragTier, string> = {
    basic: "Basic",
    pro: "Professional",
    enterprise: "Enterprise",
  }
  return labels[tier]
}

export function getTierPrice(tier: VertragTier): number {
  const prices: Record<VertragTier, number> = {
    basic: 29,
    pro: 39,
    enterprise: 59,
  }
  return prices[tier]
}

/** Returns features the user would gain by upgrading from current to target tier */
export function getUpgradeFeatures(
  currentTier: VertragTier,
  targetTier: VertragTier
): BgfFeatureKey[] {
  return (Object.entries(FEATURE_MIN_TIER) as [BgfFeatureKey, VertragTier][])
    .filter(
      ([, minTier]) =>
        TIER_LEVEL[minTier] > TIER_LEVEL[currentTier] &&
        TIER_LEVEL[minTier] <= TIER_LEVEL[targetTier]
    )
    .map(([feature]) => feature)
}
