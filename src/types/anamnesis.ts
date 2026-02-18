// PROJ-3: Anamnese & Untersuchungsdokumentation

export type AnamnesisStatus = "entwurf" | "abgeschlossen"

export interface PainPoint {
  x: number
  y: number
  view: "anterior" | "posterior"
}

export interface RangeOfMotionEntry {
  id: string
  gelenk: string
  richtung: string
  grad: string
}

export interface StrengthEntry {
  id: string
  muskelgruppe: string
  grad: string // 0-5 nach Janda
}

export interface AnamnesisData {
  // Hauptbeschwerde
  hauptbeschwerde: string
  schmerzdauer: string
  schmerzcharakter: string

  // Schmerzintensität
  nrs: number // 0-10

  // Schmerzlokalisation
  schmerzlokalisation: PainPoint[]

  // Vorerkrankungen
  vorerkrankungen: string[]
  vorerkrankungenFreitext: string
  keineVorerkrankungen: boolean

  // Medikamente
  medikamente: string

  // Bewegungsausmaß
  bewegungsausmass: RangeOfMotionEntry[]

  // Kraftgrad nach Janda
  kraftgrad: StrengthEntry[]

  // Heilpraktiker-Felder (nur befüllt wenn HP)
  differentialdiagnosen: string
  erweiterte_tests: string
}

export interface AnamnesisRecord {
  id: string
  patient_id: string
  created_by: string
  version: number
  status: AnamnesisStatus
  data: AnamnesisData
  created_at: string
  updated_at: string
  // joined from user_profiles
  created_by_name?: string
}
