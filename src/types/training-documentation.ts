// PROJ-15: Trainingsdokumentation Types

export type TrainingDocTyp = "training" | "therapeutisch"
export type TrainingDocStatus = "entwurf" | "abgeschlossen"

/** Simplified training mode data (Prävention / Training) */
export interface TrainingModeData {
  trainingsart: string
  schwerpunkt: string
  uebungen: TrainingExerciseEntry[]
  anmerkung: string
  naechstes_training: string
}

/** Full clinical mode data (Therapeutisch / KG / KGG) */
export interface TherapeutischModeData {
  massnahmen: string[]
  nrs_before: number | null
  nrs_after: number | null
  befund: string
  notizen: string
  naechste_schritte: string
}

export interface TrainingExerciseEntry {
  name: string
  saetze?: number
  wiederholungen?: number
  dauer_sekunden?: number
  gewicht?: string
  anmerkung?: string
}

export interface TrainingDocumentation {
  id: string
  patient_id: string
  created_by: string
  typ: TrainingDocTyp
  session_date: string
  duration_minutes: number | null
  status: TrainingDocStatus
  data: TrainingModeData | TherapeutischModeData
  confirmed_at: string | null
  locked_at: string
  created_at: string
  updated_at: string
  created_by_name?: string
}

export const TRAININGSART_OPTIONS = [
  "Krafttraining",
  "Ausdauertraining",
  "Mobility / Flexibilität",
  "Koordination / Balance",
  "Funktionelles Training",
  "Zirkeltraining",
  "Gruppentraining",
  "Reha-Training",
  "Sonstiges",
] as const

export const MASSNAHMEN_OPTIONS = [
  "KG (Krankengymnastik)",
  "KG-Gerät (KGG)",
  "MT (Manuelle Therapie)",
  "MLD (Manuelle Lymphdrainage)",
  "Wärmetherapie",
  "Kältetherapie",
  "Elektrotherapie",
  "Ultraschall",
  "PNF",
  "Sonstiges",
] as const

export function createEmptyTrainingData(): TrainingModeData {
  return {
    trainingsart: "",
    schwerpunkt: "",
    uebungen: [],
    anmerkung: "",
    naechstes_training: "",
  }
}

export function createEmptyTherapeutischData(): TherapeutischModeData {
  return {
    massnahmen: [],
    nrs_before: null,
    nrs_after: null,
    befund: "",
    notizen: "",
    naechste_schritte: "",
  }
}
