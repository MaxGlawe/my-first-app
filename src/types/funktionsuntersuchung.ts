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

export interface FunktionsuntersuchungData {
  hauptbeschwerde: string
  beschwerdedauer: string
  sportliche_aktivitaet: string
  trainingsziele: string
  haltungsanalyse: string
  gangbildanalyse: string
  janda_tests: JandaTestResult[]
  trainingsempfehlung: string
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
