// PROJ-5: Behandlungsdokumentation

export type BehandlungStatus = "entwurf" | "abgeschlossen"

export const MASSNAHMEN_KATALOG = [
  { id: "KG", label: "KG (Krankengymnastik)" },
  { id: "MT", label: "MT (Manuelle Therapie)" },
  { id: "MLD", label: "MLD (Manuelle Lymphdrainage)" },
  { id: "US", label: "US (Ultraschall)" },
  { id: "TENS", label: "TENS" },
  { id: "Wärme", label: "Wärme" },
  { id: "Kälte", label: "Kälte" },
  { id: "Elektrotherapie", label: "Elektrotherapie" },
  { id: "Atemtherapie", label: "Atemtherapie" },
] as const

export type MassnahmeId = (typeof MASSNAHMEN_KATALOG)[number]["id"]

export interface TreatmentSession {
  id: string
  patient_id: string
  therapist_id: string
  session_date: string // DATE string "YYYY-MM-DD"
  duration_minutes: number | null
  measures: string[] // array of MassnahmeId + optional freitext entries
  nrs_before: number
  nrs_after: number | null
  notes: string
  next_steps: string
  status: BehandlungStatus
  confirmed_at: string | null
  locked_at: string | null // created_at + 24h, set by server
  created_at: string
  updated_at: string
  // joined from user_profiles
  therapist_name?: string
}

export interface NrsDataPoint {
  date: string
  nrs_before: number
  nrs_after: number | null
}

// ── Extended Treatment Data (stored in JSONB `data` column) ──────────────

export type MassnahmeIntensitaet = "leicht" | "mittel" | "intensiv"

export interface MassnahmeDetail {
  massnahme_id: string
  dauer_minuten?: number
  region?: string
  intensitaet?: MassnahmeIntensitaet
  notiz?: string
}

export interface SoapVerlauf {
  subjektiv: string
  objektiv: string
  assessment: string
  plan: string
}

export interface PostRomEintrag {
  gelenk: string
  richtung: string
  grad_vorher?: number
  grad_nachher?: number
}

export interface BehandlungExtendedData {
  massnahmen_detail?: MassnahmeDetail[]
  soap?: SoapVerlauf
  post_rom?: PostRomEintrag[]
  schmerzreaktion?: string
  vertraeglichkeit?: string
}

export const INTENSITAET_OPTIONS: { value: MassnahmeIntensitaet; label: string }[] = [
  { value: "leicht", label: "Leicht" },
  { value: "mittel", label: "Mittel" },
  { value: "intensiv", label: "Intensiv" },
]

export const GELENK_OPTIONS = [
  "HWS", "BWS", "LWS",
  "Schulter", "Ellenbogen", "Handgelenk",
  "Hüfte", "Knie", "Sprunggelenk",
] as const

export const RICHTUNG_OPTIONS = [
  "Flexion", "Extension", "Abduktion", "Adduktion",
  "Innenrotation", "Außenrotation", "Lateralflexion",
] as const

export function createEmptySoap(): SoapVerlauf {
  return { subjektiv: "", objektiv: "", assessment: "", plan: "" }
}
