/**
 * PROJ-23 / Phase 3: Report content builder.
 *
 * Turns a stored result into a structured, HWG-safe view-model shared by the
 * web report and the PDF. Copy describes a *Standortbestimmung* (orientation),
 * never an outcome or healing.
 */
import { hasNightPain, hasSaddleTingling, type ResultCategory, type AnswerMap } from "./scoring"
import { getRecommendation, getCtaHref, type Recommendation } from "./recommendations"
import { getModulesForRegion, type MovementModule } from "./movement-modules"
import { computeAmpel, type AmpelResult } from "./ampel"

export interface SchmerzResult {
  region: string | null
  duration_bucket: "acute" | "subacute" | "chronic" | null
  severity_bucket: "mild" | "moderate" | "high" | "very_high" | null
  severity_score: number | null
  psychosocial_risk: "low" | "moderate" | "high" | null
  movement_readiness: "low" | "moderate" | "high" | null
  result_category: ResultCategory | null
  soft_flag: boolean
}

export interface ReportView {
  firstName: string
  regionLabel: string
  /** Spine section to highlight: cervical | thoracic | lumbar | "" */
  focusRegion: string
  intro: string
  severityPlain: string
  interpretation: string[]
  modules: MovementModule[]
  recommendation: Recommendation
  recommendationHref: string
  ampel: AmpelResult
}

const REGION_LABELS: Record<string, string> = {
  neck: "Nacken",
  shoulder: "Schulter",
  upper_back: "Oberer Rücken",
  lower_back: "Unterer Rücken (LWS)",
  hip: "Hüfte",
  knee: "Knie",
  foot: "Fuß",
  multiple: "mehrere Bereiche",
  other: "deinen genannten Bereich",
}

const SPINE_SECTION: Record<string, string> = {
  neck: "cervical",
  upper_back: "thoracic",
  lower_back: "lumbar",
}

const SEVERITY_WORD: Record<string, string> = {
  mild: "leicht",
  moderate: "moderat",
  high: "deutlich",
  very_high: "stark ausgeprägt",
}

function introFor(severity: string): string {
  switch (severity) {
    case "very_high":
    case "high":
      return "Deine Antworten zeichnen aktuell ein ausgeprägtes Bild. Das heißt nicht, dass nichts geht — es heißt, dass eine sorgfältige Einordnung jetzt besonders sinnvoll ist."
    case "moderate":
      return "Deine Antworten zeigen ein moderates Bild. Ein guter Moment, um bewusst hinzuschauen und behutsam in Bewegung zu kommen."
    default:
      return "Deine Antworten zeigen insgesamt ein leichtes Bild. Eine gute Ausgangslage, um mit kleinen, regelmäßigen Einheiten dranzubleiben."
  }
}

function chronicityParagraph(bucket: string | null): string {
  switch (bucket) {
    case "acute":
      return "Deine Beschwerden sind noch recht frisch. In dieser Phase reagiert der Körper oft gut auf behutsame, regelmäßige Bewegung."
    case "subacute":
      return "Deine Beschwerden bestehen seit einigen Wochen. Das ist ein guter Zeitpunkt, aktiv etwas einzuordnen, bevor sich Bewegungsmuster festigen."
    case "chronic":
      return "Du trägst die Beschwerden schon länger. Gerade dann hilft eine strukturierte Einordnung oft, wieder mehr Bewegung in den Alltag zu bringen."
    default:
      return ""
  }
}

function psychosocialParagraph(risk: string | null): string {
  if (risk === "high")
    return "Deine Antworten deuten darauf hin, dass Sorge vor Bewegung gerade eine Rolle spielt. Das ist völlig normal — und genau hier setzt eine verständnisorientierte Begleitung an."
  if (risk === "moderate")
    return "Ein gewisses Zögern bei Bewegung klingt in deinen Antworten an. Schritt für Schritt Vertrauen aufzubauen, ist hier ein sinnvoller Weg."
  return ""
}

function movementParagraph(readiness: string | null): string {
  if (readiness === "low")
    return "Im Alltag bewegst du dich aktuell eher wenig und fühlst dich spürbar eingeschränkt — kleine, regelmäßige Einheiten sind hier der sinnvollste Einstieg."
  if (readiness === "high")
    return "Du bist im Alltag gut in Bewegung — eine gezielte, ruhige Routine kann das gut ergänzen."
  return ""
}

/**
 * Hinweis bei nächtlichem Schmerz (Anpassung 07/2026).
 *
 * Nächtliches Aufwachen stoppt den Check nicht mehr — es hatte als alleiniges
 * Kriterium keine Trennschärfe und warf 45 Leute grundlos raus. Der klinische
 * Hinweis darf deshalb aber nicht verschwinden: Er wandert vom Hard-Stop in den
 * Report, sichtbar und mit klarer Grenze, ab wann es doch zum Arzt gehört.
 */
function nightPainAdvisory(answers: AnswerMap): string {
  if (!hasNightPain(answers)) return ""
  return (
    "Du hast angegeben, dass dich die Beschwerden nachts aufwecken. Für sich genommen ist das " +
    "bei anhaltenden Rückenbeschwerden häufig und kein Alarmzeichen — es hängt oft mit Anspannung " +
    "und Liegeposition zusammen. Lass es aber ärztlich abklären, wenn es über Wochen nicht besser " +
    "wird oder zusätzlich ungewollter Gewichtsverlust, Fieber oder Nachtschweiß dazukommen."
  )
}

/**
 * Hinweis bei Kribbeln im Sattelbereich (ohne Gefühllosigkeit).
 *
 * Kribbeln stoppt den Check nicht mehr — es begleitet ausstrahlende Beschwerden
 * sehr häufig. Die Grenze zum Notfall muss aber unmissverständlich dastehen:
 * Sobald echte Gefühllosigkeit oder Probleme mit Blase/Darm dazukommen, ist das
 * eine Cauda-equina-Symptomatik und gehört sofort in die Notaufnahme.
 */
function saddleTinglingAdvisory(answers: AnswerMap): string {
  if (!hasSaddleTingling(answers)) return ""
  return (
    "Du hast Kribbeln im Sattelbereich angegeben, ohne Gefühllosigkeit. Kribbeln begleitet " +
    "ausstrahlende Rückenbeschwerden häufig und ist für sich kein Notfall. Wichtig ist die " +
    "Grenze: Wenn der Bereich taub wird (wie beim Zahnarzt betäubt) oder du Probleme bekommst, " +
    "Blase oder Darm zu kontrollieren, geh bitte sofort in eine Notaufnahme — das ist dann kein " +
    "Fall zum Abwarten."
  )
}

export function buildReportView(
  result: SchmerzResult,
  firstName: string,
  answers: AnswerMap = {}
): ReportView {
  const region = result.region ?? "lower_back"
  const severity = result.severity_bucket ?? "moderate"
  const category: ResultCategory = result.result_category ?? "mild"
  const recommendation = getRecommendation(category)
  const ampel = computeAmpel(answers, category, region)

  const interpretation = [
    chronicityParagraph(result.duration_bucket),
    psychosocialParagraph(result.psychosocial_risk),
    movementParagraph(result.movement_readiness),
    nightPainAdvisory(answers),
    saddleTinglingAdvisory(answers),
  ].filter(Boolean)

  return {
    firstName,
    regionLabel: REGION_LABELS[region] ?? "deinen genannten Bereich",
    focusRegion: SPINE_SECTION[region] ?? "",
    intro: introFor(severity),
    severityPlain: `Auf Basis deiner Antworten liegt deine aktuelle Belastung im Bereich „${SEVERITY_WORD[severity] ?? "moderat"}".`,
    interpretation,
    modules: getModulesForRegion(region),
    recommendation,
    recommendationHref: getCtaHref(recommendation),
    ampel,
  }
}
