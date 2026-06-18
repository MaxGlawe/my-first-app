/**
 * PROJ-23 / Report v2: Ampel evaluation (traffic light + barometers).
 *
 * Turns the answers into an overall Ampel (rot/gelb/gruen) plus three barometer
 * dimensions — Schmerz, Beweglichkeit, Stress — each as a 0–100 health value
 * (higher = better → marker further right/green) with an individual,
 * HWG-safe einordnung sentence. Color convention matches PROJ-17:
 * gruen = emerald-500, gelb = amber-400, rot = red-500.
 */
import type { AnswerMap, ResultCategory } from "./scoring"

export type AmpelBand = "rot" | "gelb" | "gruen"

export interface BarometerDimension {
  key: "schmerz" | "beweglichkeit" | "stress"
  label: string
  /** 0–100, higher = healthier (marker position from the left). */
  value: number
  band: AmpelBand
  sentence: string
}

export interface AmpelResult {
  overall: AmpelBand
  headline: string
  actionLine: string
  dimensions: BarometerDimension[]
}

// ── helpers ───────────────────────────────────────────────────────────────
function asNumber(v: unknown): number {
  if (typeof v === "number") return v
  if (typeof v === "string") return Number(v) || 0
  return 0
}
function asString(v: unknown): string {
  return typeof v === "string" ? v : ""
}
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

function bandFromHealth(h: number): AmpelBand {
  if (h >= 67) return "gruen"
  if (h >= 34) return "gelb"
  return "rot"
}

const SEVERITY: Record<AmpelBand, number> = { gruen: 0, gelb: 1, rot: 2 }
function worse(a: AmpelBand, b: AmpelBand): AmpelBand {
  return SEVERITY[a] >= SEVERITY[b] ? a : b
}

const SHORT_REGION: Record<string, string> = {
  neck: "HWS",
  upper_back: "BWS",
  lower_back: "LWS",
  shoulder: "Schulter",
  hip: "Hüft",
  knee: "Knie",
  foot: "Fuß",
  multiple: "betroffenen",
  other: "genannten",
}

const FUNCTION_HEALTH: Record<string, number> = { none: 100, mild: 72, moderate: 42, severe: 12 }
const MOVEMENT_MOD: Record<string, number> = { athletic: 8, active: 4, mixed: 0, sedentary: -8 }

// ── dimension builders ──────────────────────────────────────────────────────
function schmerz(answers: AnswerMap): BarometerDimension {
  const cur = asNumber(answers["pain_current"])
  const worst = asNumber(answers["pain_worst_week"])
  const value = clamp(100 - (cur * 0.6 + worst * 0.4) * 10)
  const band = bandFromHealth(value)
  const sentence =
    band === "gruen"
      ? "Dein Schmerzniveau ist aktuell niedrig — eine gute Grundlage, um in Bewegung zu bleiben."
      : band === "gelb"
        ? "Dein Schmerz liegt im mittleren Bereich: spürbar, aber gut beeinflussbar. Achtsame Bewegung ist jetzt sinnvoll."
        : "Dein Schmerzniveau ist aktuell hoch und verdient klare Aufmerksamkeit sowie eine fachliche Einordnung."
  return { key: "schmerz", label: "Schmerz", value, band, sentence }
}

function beweglichkeit(answers: AnswerMap, regionShort: string): BarometerDimension {
  const fn = asString(answers["function_impact"])
  const ctx = asString(answers["movement_context"])
  const value = clamp((FUNCTION_HEALTH[fn] ?? 50) + (MOVEMENT_MOD[ctx] ?? 0))
  const band = bandFromHealth(value)
  const handlungsbedarf = band === "rot" ? "hohen" : band === "gelb" ? "mittleren" : "geringen"
  const sentence =
    band === "gruen"
      ? `Deine Beweglichkeit im ${regionShort}-Bereich wirkt solide — mit gezielter Routine hältst du das stabil (${handlungsbedarf}er Handlungsbedarf).`
      : band === "gelb"
        ? `Deine Beweglichkeit im ${regionShort}-Bereich ist nicht zwingend zufriedenstellend und zeigt einen ${handlungsbedarf} Handlungsbedarf.`
        : `Deine Beweglichkeit im ${regionShort}-Bereich ist aktuell deutlich eingeschränkt und zeigt einen ${handlungsbedarf} Handlungsbedarf.`
  return { key: "beweglichkeit", label: "Beweglichkeit", value, band, sentence }
}

function stress(answers: AnswerMap): BarometerDimension {
  // yellow-flag: fear_avoidance (höher = mehr Sorge) − self_efficacy (höher = mehr Vertrauen)
  const yellow = asNumber(answers["fear_avoidance"]) - asNumber(answers["self_efficacy"]) // -3..+3
  const value = clamp(((3 - yellow) / 6) * 100)
  const band = bandFromHealth(value)
  const sentence =
    band === "gruen"
      ? "Du gehst zuversichtlich mit Belastung um — ein starker, oft unterschätzter Faktor für deinen Verlauf."
      : band === "gelb"
        ? "Etwas Anspannung oder Sorge vor Bewegung klingt durch. Das lässt sich gut adressieren."
        : "Sorge vor Bewegung spielt gerade eine größere Rolle. Genau hier setzt eine verständnisorientierte Begleitung an."
  return { key: "stress", label: "Stress & Sicherheit", value, band, sentence }
}

// ── overall ────────────────────────────────────────────────────────────────
function categoryBand(category: ResultCategory): AmpelBand {
  if (["needs_physician_assessment", "acute_severe", "chronic_severe"].includes(category)) return "rot"
  if (["acute_moderate", "chronic_moderate"].includes(category)) return "gelb"
  return "gruen"
}

const HEADLINE: Record<AmpelBand, string> = {
  gruen: "Grün — alles im stabilen Bereich",
  gelb: "Gelb — beobachten und gezielt handeln",
  rot: "Rot — jetzt aktiv werden",
}
const ACTION: Record<AmpelBand, string> = {
  gruen: "Bleib mit deiner Bewegungs-Roadmap dran — kleine, regelmäßige Einheiten halten dich stabil.",
  gelb: "Nutze die 7-Tage-Strategie unten. Wenn sich nach 1–2 Wochen nichts bessert, hol dir eine fachliche Einordnung.",
  rot: "Hol dir jetzt deinen eigenen Physiotherapeuten — er ordnet deinen Weg ein und begleitet dich, statt dich allein weitermachen zu lassen.",
}

export function computeAmpel(
  answers: AnswerMap,
  category: ResultCategory,
  region: string
): AmpelResult {
  const regionShort = SHORT_REGION[region] ?? "betroffenen"
  const dimensions = [schmerz(answers), beweglichkeit(answers, regionShort), stress(answers)]

  // Overall = worst of category-derived band and the worst dimension band
  let overall = categoryBand(category)
  for (const d of dimensions) overall = worse(overall, d.band)

  return {
    overall,
    headline: HEADLINE[overall],
    actionLine: ACTION[overall],
    dimensions,
  }
}
