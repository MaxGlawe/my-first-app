// PROJ-15: Funktionsuntersuchung Types

export type FunktionsuntersuchungStatus = "entwurf" | "abgeschlossen"

export type JandaBefund = "normal" | "leicht_auffaellig" | "deutlich_auffaellig"

export type JandaKategorie = "verkuerzung" | "abschwaechung" | "muster" | "stabilitaet"

export interface JandaTestCatalogEntry {
  id: string
  region: string
  muskel: string
  kategorie: JandaKategorie
  test_name: string
  beschreibung: string
  normalbefund: string
  pathologischer_befund: string
  sort_order: number
}

export interface JandaTestResult {
  catalog_id: string
  befund: JandaBefund
  notiz?: string
}

// ── Orthopädische Spezialtests ──────────────────────────────────────────────

export type OrthoBefund = "positiv" | "negativ" | "fraglich"

export interface OrthoTestCatalogEntry {
  id: string
  region: string
  kategorie: string
  test_name: string
  beschreibung: string
  positiver_befund: string
  klinische_relevanz: string
  sort_order: number
}

export interface OrthoTestResult {
  catalog_id: string
  befund: OrthoBefund
  seite?: "rechts" | "links" | "beidseits"
  notiz?: string
}

export const ORTHO_BEFUND_LABELS: Record<OrthoBefund, string> = {
  positiv: "Positiv",
  negativ: "Negativ",
  fraglich: "Fraglich",
}

export const ORTHO_REGIONEN = [
  "Schulter",
  "Knie",
  "Hüfte",
  "HWS",
  "LWS",
  "Sprunggelenk",
] as const

// ── Neurologische Untersuchung ─────────────────────────────────────────────

export type DermatomBefund = "normal" | "hyperaesthesie" | "hypaesthesie" | "anaesthesie"
export type ReflexBefund = "normal" | "abgeschwacht" | "gesteigert" | "fehlend" | "pathologisch"

export interface DermatomEintrag {
  segment: string
  seite: "rechts" | "links" | "beidseits"
  befund: DermatomBefund
}

export interface ReflexEintrag {
  reflex: string
  seite: "rechts" | "links"
  befund: ReflexBefund
}

export interface KennmuskelEintrag {
  segment: string
  muskel: string
  kraftgrad: string
  seite: "rechts" | "links"
}

export interface NeurologischeUntersuchung {
  dermatome: DermatomEintrag[]
  reflexe: ReflexEintrag[]
  kennmuskeln: KennmuskelEintrag[]
  koordination: string
  notizen: string
}

export const DERMATOM_SEGMENTE = ["C5", "C6", "C7", "C8", "T1", "L2", "L3", "L4", "L5", "S1"] as const
export const REFLEXE = ["BSR", "TSR", "RPR", "PSR", "ASR", "Babinski"] as const
export const KENNMUSKELN: { segment: string; muskel: string }[] = [
  { segment: "C5", muskel: "M. deltoideus / M. biceps" },
  { segment: "C6", muskel: "M. brachioradialis / Handgelenk-Ext." },
  { segment: "C7", muskel: "M. triceps / Handgelenk-Flex." },
  { segment: "C8", muskel: "Fingerflexoren" },
  { segment: "T1", muskel: "Mm. interossei" },
  { segment: "L2", muskel: "M. iliopsoas" },
  { segment: "L3", muskel: "M. quadriceps" },
  { segment: "L4", muskel: "M. tibialis anterior" },
  { segment: "L5", muskel: "M. extensor hallucis longus" },
  { segment: "S1", muskel: "M. gastrocnemius / M. peroneus" },
]

// ── Main Data Interface ────────────────────────────────────────────────────

export interface FunktionsuntersuchungData {
  hauptbeschwerde: string
  beschwerdedauer: string
  sportliche_aktivitaet: string
  trainingsziele: string
  haltungsanalyse: string
  gangbildanalyse: string
  janda_tests: JandaTestResult[]
  trainingsempfehlung: string
  // New extended test sections (optional for backward compat)
  ortho_tests?: OrthoTestResult[]
  neurologische_untersuchung?: NeurologischeUntersuchung
}

export interface FunktionsuntersuchungRecord {
  id: string
  patient_id: string
  created_by: string
  version: number
  status: FunktionsuntersuchungStatus
  data: FunktionsuntersuchungData
  created_at: string
  updated_at: string
  created_by_name?: string
}

export const JANDA_REGIONEN = [
  "Hüfte & Becken",
  "LWS",
  "BWS & Schulter",
  "Nacken",
  "Knie & Unterschenkel",
  "Übergreifend",
] as const

export const JANDA_BEFUND_LABELS: Record<JandaBefund, string> = {
  normal: "Normal",
  leicht_auffaellig: "Leicht auffällig",
  deutlich_auffaellig: "Deutlich auffällig",
}

export const JANDA_KATEGORIE_LABELS: Record<JandaKategorie, string> = {
  verkuerzung: "Verkürzungstendenz",
  abschwaechung: "Abschwächungstendenz",
  muster: "Bewegungsmuster",
  stabilitaet: "Stabilität",
}

export const SPORTLICHE_AKTIVITAET_OPTIONS = [
  "Einsteiger",
  "Gelegentlich aktiv",
  "Regelmäßig aktiv",
  "Fortgeschritten",
  "Leistungssport",
] as const

export const BESCHWERDEDAUER_OPTIONS = [
  "Akut (< 1 Woche)",
  "Subakut (1-6 Wochen)",
  "Chronisch (> 6 Wochen)",
  "Rezidivierend",
  "Seit Kindheit/Jugend",
] as const

export function createEmptyFunktionsuntersuchungData(): FunktionsuntersuchungData {
  return {
    hauptbeschwerde: "",
    beschwerdedauer: "",
    sportliche_aktivitaet: "",
    trainingsziele: "",
    haltungsanalyse: "",
    gangbildanalyse: "",
    janda_tests: [],
    trainingsempfehlung: "",
  }
}
