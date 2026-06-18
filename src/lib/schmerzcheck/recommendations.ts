/**
 * PROJ-23 / Phase 3: Recommendation engine (spec §6.5).
 *
 * Exactly ONE recommendation per result_category. Verbatim copy. HWG-safe:
 * these suggest *next steps* / *what makes sense*, never an outcome or healing.
 * Red-flag / physician-assessment categories get NO commercial upsell.
 */
import type { ResultCategory } from "./scoring"

export type CtaType = "booking" | "roadmap" | "info"

export interface Recommendation {
  text: string
  ctaLabel: string
  ctaType: CtaType
}

/** External Video-Analyse booking (existing calendar). Env-overridable. */
export const VIDEO_ANALYSE_URL =
  process.env.SCHMERZCHECK_VIDEO_ANALYSE_URL ||
  "https://physiotherapie-glawe.de/termin-buchen.html?service=video-sprechstunde-praxis-os&utm_source=schmerzcheck&utm_medium=report&utm_campaign=video-analyse"

/**
 * Build a Video-Analyse booking URL with per-touchpoint UTM tagging so we can
 * attribute bookings to the exact source (report page, PDF, or a specific drip
 * email). Overrides utm_medium/utm_content on the base URL; keeps the rest.
 */
export function buildBookingUrl(opts: { medium: string; content?: string }): string {
  try {
    const url = new URL(VIDEO_ANALYSE_URL)
    url.searchParams.set("utm_source", "schmerzcheck")
    url.searchParams.set("utm_medium", opts.medium)
    url.searchParams.set("utm_campaign", "video-analyse")
    if (opts.content) url.searchParams.set("utm_content", opts.content)
    return url.toString()
  } catch {
    return VIDEO_ANALYSE_URL
  }
}

export const RECOMMENDATIONS: Record<ResultCategory, Recommendation> = {
  needs_physician_assessment: {
    text: "Wir empfehlen dir, deine Beschwerden zeitnah ärztlich abklären zu lassen, bevor du mit Bewegungs-Routinen startest.",
    ctaLabel: "Mehr zur ärztlichen Einordnung",
    ctaType: "info",
  },
  acute_severe: {
    text: "Deine Beschwerden sind aktuell ausgeprägt. Jetzt ist es sinnvoll, dass ein Physiotherapeut persönlich draufschaut — am besten dein eigener Physiotherapeut, der dich von der Erstanalyse an begleitet und nicht allein lässt.",
    ctaLabel: "Mit deinem Physiotherapeuten starten",
    ctaType: "booking",
  },
  chronic_severe: {
    text: "Du trägst die Beschwerden schon eine Weile. Jetzt ist der Moment, das nicht länger allein zu tragen: Dein eigener Physiotherapeut ordnet deine Standortbestimmung ein, gibt dir einen Plan und geht den Weg mit dir.",
    ctaLabel: "Mit deinem Physiotherapeuten starten",
    ctaType: "booking",
  },
  acute_moderate: {
    text: "Deine Beschwerden sind moderat und noch nicht alt. Starte mit der Bewegungs-Roadmap. Wenn nach 2–3 Wochen keine Besserung — melde dich gern.",
    ctaLabel: "Bewegungs-Roadmap starten",
    ctaType: "roadmap",
  },
  chronic_moderate: {
    text: "Strukturierte Bewegung wird dir helfen, Klarheit zu gewinnen — die Roadmap ist ein guter Einstieg. Und wenn du nicht allein weitermachen willst, begleitet dich dein eigener Physiotherapeut von der Erstanalyse an.",
    ctaLabel: "Mit deinem Physiotherapeuten starten",
    ctaType: "booking",
  },
  mild: {
    text: "Deine Beschwerden sind leicht. Die Bewegungs-Roadmap ist genau der richtige Schritt. Bleib dran — und wenn etwas unklar bleibt, melde dich.",
    ctaLabel: "Bewegungs-Roadmap starten",
    ctaType: "roadmap",
  },
}

export function getRecommendation(category: ResultCategory): Recommendation {
  return RECOMMENDATIONS[category] ?? RECOMMENDATIONS.mild
}

/** Resolve the CTA target for a recommendation. */
export function getCtaHref(rec: Recommendation): string {
  if (rec.ctaType === "booking") return VIDEO_ANALYSE_URL
  if (rec.ctaType === "roadmap") return "#roadmap"
  return "/anfrage" // info — non-commercial contact
}
