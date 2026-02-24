// PROJ-3: Anamnese & Untersuchungsdokumentation

export type AnamnesisStatus = "entwurf" | "abgeschlossen"

export type MarkerType = "schmerz" | "taubheit" | "ausstrahlung" | "schwellung"

export interface PainPoint {
  x: number
  y: number
  view: "anterior" | "posterior"
  type?: MarkerType
  region?: string
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

// ── Neue Sub-Interfaces für tiefere Anamnese ────────────────────────────────

export interface SozialanameseData {
  beruf: string
  arbeitsbelastung: string
  arbeitsfaehig: boolean | null
  arbeitsunfaehig_seit: string
  lebenssituation: string
  freizeitaktivitaeten: string
}

export interface FamilienamneseData {
  relevante_erkrankungen: string[]
  freitext: string
  keine_relevanten: boolean
}

export interface OperationTraumaEntry {
  id: string
  art: string
  beschreibung: string
  datum: string
  region: string
}

export interface BisherigeTherapieEntry {
  id: string
  art: string
  zeitraum: string
  ergebnis: string
  details: string
}

export interface KontraindikationenData {
  vorhanden: boolean
  items: string[]
  freitext: string
}

export interface RedFlagEntry {
  flag: string
  present: boolean
  notiz: string
}

export interface RedFlagsData {
  checked: boolean
  items: RedFlagEntry[]
}

export interface YellowFlagsData {
  screened: boolean
  flags: string[]
  notizen: string
}

export interface AllgemeinzustandData {
  az_eindruck: string
  blutdruck: string
  puls: string
  temperatur: string
  gewicht: string
  groesse: string
  bmi_berechnet: number | null
  sonstiges: string
}

// ── Hauptinterface ──────────────────────────────────────────────────────────

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

  // Familienanamnese (NEU)
  familienanamnese?: FamilienamneseData

  // Operationen & Traumata (NEU)
  operationen_traumata?: OperationTraumaEntry[]

  // Medikamente
  medikamente: string

  // Sozial- & Berufsanamnese (NEU)
  sozialanamnese?: SozialanameseData

  // Bisherige Therapien (NEU)
  bisherige_therapien?: BisherigeTherapieEntry[]

  // Kontraindikationen (NEU)
  kontraindikationen?: KontraindikationenData

  // Bewegungsausmaß
  bewegungsausmass: RangeOfMotionEntry[]

  // Kraftgrad nach Janda
  kraftgrad: StrengthEntry[]

  // Heilpraktiker-Felder (nur befüllt wenn HP)
  red_flags?: RedFlagsData
  yellow_flags?: YellowFlagsData
  allgemeinzustand?: AllgemeinzustandData
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
