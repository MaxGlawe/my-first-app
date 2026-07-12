/**
 * PROJ-23 / Phase 2: Red-flag detection + scoring (spec §5.5 / §5.6).
 *
 * ⚠️ CLINICAL SIGN-OFF REQUIRED before production (thresholds + weights are
 * spec defaults; the spec itself flags soft-flag tuning as open — §14 #14).
 * The hard red-flag rules are intentionally conservative: when in doubt, route
 * to a physician. Never monetise/upsell a red-flag user.
 */

export type AnswerValue = string | number | string[]
export type AnswerMap = Record<string, AnswerValue>

// ── value coercion helpers ───────────────────────────────────────────────────
function asNumber(v: AnswerValue | undefined): number {
  if (typeof v === "number") return v
  if (typeof v === "string") return Number(v) || 0
  return 0
}
function asString(v: AnswerValue | undefined): string {
  return typeof v === "string" ? v : ""
}
function asArray(v: AnswerValue | undefined): string[] {
  if (Array.isArray(v)) return v
  if (typeof v === "string" && v) return [v]
  return []
}

// ── Red flags ─────────────────────────────────────────────────────────────────

/**
 * Angaben, die für sich allein KEINEN Abbruch mehr auslösen (Anpassung 07/2026).
 *
 * Das Screening warf 39,7 % aller Check-Starter raus — für ein Screening absurd
 * hoch. Zwei Kriterien waren dafür verantwortlich und hatten beide zu wenig
 * Trennschärfe. Beide bleiben erfasst und werden im Report angesprochen; sie
 * beenden den Check nur nicht mehr.
 *
 * `night_pain_severe` — „Beschwerden, die dich nachts aufwecken": häufigster
 * Stopp-Grund (50 von 117; bei 45 der EINZIGE). Bei chronischem Rückenschmerz
 * ist nächtliches Aufwachen der Normalfall. Leitliniennah ist es ein Warnzeichen
 * nur IN KOMBINATION mit Gewichtsverlust, Fieber/Nachtschweiß oder Krebsanamnese
 * — und diese drei bleiben harte Flags, jede Kombination stoppt also weiterhin.
 *
 * `saddle_tingling` — Kribbeln/Ameisenlaufen ohne Gefühllosigkeit. Das Warnzeichen
 * einer Cauda-equina-Symptomatik ist die echte Sattel-ANÄSTHESIE, nicht Kribbeln.
 * `saddle_numbness` (jetzt eindeutig als Gefühllosigkeit formuliert) stoppt
 * unverändert hart.
 *
 * Ergebnis an den Bestandsdaten gerechnet: 117 → 72 Stopps (24,4 % statt 39,7 %).
 */
const NON_STOPPING_CODES = new Set(["none", "night_pain_severe", "saddle_tingling"])

/**
 * Die maßgebliche Region eines Checks — für Report, Bewegungsmodule und die
 * Frage, ob die Masterclass (LWS-Kurs) überhaupt angeboten werden darf.
 *
 * Muss ZWEI Datenformate lesen:
 *   NEU (ab 07/2026): `region` ist eine Mehrfachauswahl, `main_region` nennt den
 *                     Schwerpunkt. Der Schwerpunkt gewinnt.
 *   ALT:              `region` war eine Einfachauswahl (String), teils mit dem
 *                     Wert 'multiple' — dem Wert, der 77 Leads unauswertbar
 *                     gemacht hat. Er wird unverändert durchgereicht, damit alte
 *                     Reports weiter funktionieren.
 */
export function resolveRegion(answers: AnswerMap): string {
  const main = asString(answers["main_region"])
  if (main) return main

  const region = answers["region"]
  if (Array.isArray(region)) {
    // Mehrfachauswahl ohne Schwerpunkt (sollte nicht vorkommen — die Antwort-
    // Route füllt main_region bei nur einer Wahl automatisch). Defensiv: erste.
    return region.length === 1 ? String(region[0]) : String(region[0] ?? "")
  }
  return asString(region)
}

/** Nächtliches Aufwachen angegeben? (kein Stopp, aber ein Hinweis im Report) */
export function hasNightPain(answers: AnswerMap): boolean {
  return asArray(answers["rf_systemic"]).includes("night_pain_severe")
}

/** Kribbeln im Sattelbereich angegeben? (kein Stopp, aber ein Hinweis im Report) */
export function hasSaddleTingling(answers: AnswerMap): boolean {
  return asArray(answers["rf_cauda_equina"]).includes("saddle_tingling")
}

/**
 * Evaluate a single answer for a hard red flag (used by /api/check/answer for
 * the immediate stop after items 7/8/9).
 */
export function evaluateAnswerRedFlag(
  itemId: string,
  value: AnswerValue
): { hardFlag: boolean; codes: string[] } {
  if (itemId === "rf_cauda_equina" || itemId === "rf_systemic") {
    const codes = asArray(value).filter((v) => !NON_STOPPING_CODES.has(v))
    return { hardFlag: codes.length > 0, codes }
  }
  if (itemId === "rf_neuro") {
    const hit = asString(value) === "progressive"
    return { hardFlag: hit, codes: hit ? ["neuro_progressive"] : [] }
  }
  return { hardFlag: false, codes: [] }
}

/** Hard red flag across all collected answers (defensive re-check at complete). */
export function detectHardRedFlag(answers: AnswerMap): { hardFlag: boolean; codes: string[] } {
  const codes: string[] = []
  for (const id of ["rf_cauda_equina", "rf_systemic", "rf_neuro"]) {
    const r = evaluateAnswerRedFlag(id, answers[id])
    if (r.hardFlag) codes.push(...r.codes)
  }
  return { hardFlag: codes.length > 0, codes }
}

/** Soft flag — urgent referral, not emergency (spec §5.5). */
export function detectSoftFlag(answers: AnswerMap): boolean {
  const painCurrent = asNumber(answers["pain_current"])
  const onset = asString(answers["onset"])
  const fn = asString(answers["function_impact"])
  return (onset === "trauma" && painCurrent >= 7) || (painCurrent >= 9 && fn === "severe")
}

// ── Scoring (spec §5.6) ────────────────────────────────────────────────────────

const FUNCTION_SCORE: Record<string, number> = { none: 0, mild: 1, moderate: 2, severe: 3 }
const SLEEP_SCORE: Record<string, number> = { none: 0, mild: 1, moderate: 2, severe: 3 }

export type SeverityBucket = "mild" | "moderate" | "high" | "very_high"
export type ChronicityBucket = "acute" | "subacute" | "chronic"
export type RiskBucket = "low" | "moderate" | "high"
export type ResultCategory =
  | "needs_physician_assessment"
  | "acute_severe"
  | "chronic_severe"
  | "acute_moderate"
  | "chronic_moderate"
  | "mild"

export interface ResultComputation {
  region: string
  duration_bucket: ChronicityBucket
  severity_score: number
  severity_bucket: SeverityBucket
  yellow_flag_score: number
  psychosocial_risk: RiskBucket
  movement_readiness: RiskBucket
  soft_flag: boolean
  result_category: ResultCategory
}

function severityBucket(score: number): SeverityBucket {
  if (score <= 2.5) return "mild"
  if (score <= 5.0) return "moderate"
  if (score <= 7.5) return "high"
  return "very_high"
}

function chronicityBucket(duration: string): ChronicityBucket {
  if (duration === "acute") return "acute"
  if (duration === "subacute_early" || duration === "subacute_late") return "subacute"
  return "chronic" // chronic | over_year | recurring
}

function psychosocialRisk(yellow: number): RiskBucket {
  if (yellow >= 2) return "high"
  if (yellow >= 0) return "moderate"
  return "low"
}

function movementReadiness(movementContext: string, fn: string): RiskBucket {
  if (movementContext === "sedentary" && (fn === "moderate" || fn === "severe")) return "low"
  if (movementContext === "active" || movementContext === "athletic") return "high"
  return "moderate"
}

function resultCategory(
  softFlag: boolean,
  severity: SeverityBucket,
  chronicity: ChronicityBucket
): ResultCategory {
  if (softFlag) return "needs_physician_assessment"
  const severe = severity === "high" || severity === "very_high"
  if (severe && chronicity === "acute") return "acute_severe"
  if (severe) return "chronic_severe" // subacute | chronic
  if (severity === "moderate" && chronicity === "acute") return "acute_moderate"
  if (severity === "moderate") return "chronic_moderate"
  return "mild"
}

/** Full result computation from all answers (no hard red flag present). */
export function computeResult(answers: AnswerMap): ResultComputation {
  const painCurrent = asNumber(answers["pain_current"])
  const painWorst = asNumber(answers["pain_worst_week"])
  const fn = asString(answers["function_impact"])
  const sleep = asString(answers["sleep_impact"])

  const severity_score = Number(
    (
      painCurrent * 0.3 +
      painWorst * 0.2 +
      (FUNCTION_SCORE[fn] ?? 0) * 1.0 +
      (SLEEP_SCORE[sleep] ?? 0) * 0.5
    ).toFixed(2)
  )

  const severity_bucket = severityBucket(severity_score)
  const duration_bucket = chronicityBucket(asString(answers["duration"]))
  const yellow_flag_score = asNumber(answers["fear_avoidance"]) - asNumber(answers["self_efficacy"])
  const psychosocial_risk = psychosocialRisk(yellow_flag_score)
  const movement_readiness = movementReadiness(asString(answers["movement_context"]), fn)
  const soft_flag = detectSoftFlag(answers)
  const result_category = resultCategory(soft_flag, severity_bucket, duration_bucket)

  return {
    region: resolveRegion(answers),
    duration_bucket,
    severity_score,
    severity_bucket,
    yellow_flag_score,
    psychosocial_risk,
    movement_readiness,
    soft_flag,
    result_category,
  }
}
