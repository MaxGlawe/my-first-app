export type Schwierigkeitsgrad = "anfaenger" | "mittel" | "fortgeschritten"
export type MediaType = "image" | "video"

export const SCHWIERIGKEITSGRAD_LABELS: Record<Schwierigkeitsgrad, string> = {
  anfaenger: "Anfänger",
  mittel: "Mittel",
  fortgeschritten: "Fortgeschritten",
}

export const MUSKELGRUPPEN = [
  "Hüfte",
  "Knie",
  "Schulter",
  "BWS",
  "LWS",
  "HWS",
  "Core",
  "Oberschenkel",
  "Unterschenkel",
  "Rücken",
  "Brust",
  "Bizeps",
  "Trizeps",
  "Nacken",
  "Wade",
  "Gesäß",
] as const

export type Muskelgruppe = typeof MUSKELGRUPPEN[number]

export const EQUIPMENT_OPTIONS = [
  "Keine (Bodyweight)",
  "Faszienrolle",
  "Theraband",
  "Kettlebell",
  "Kurzhanteln",
  "Gymnastikmatte",
  "Pezziball",
  "Stab",
  "Balance Pad",
  "Schlingentrainer (TRX)",
  "Massageball",
  "Beinpresse",
  "Latzug",
  "Kabelzug",
  "Rudergerät",
  "Beinstrecker",
  "Beinbeuger",
  "Stuhl",
  "Wand/Türrahmen",
] as const

export type Equipment = typeof EQUIPMENT_OPTIONS[number]

export interface AusfuehrungsSchritt {
  nummer: number
  beschreibung: string
}

export interface Exercise {
  id: string
  created_at: string
  updated_at: string

  // Inhalt
  name: string
  beschreibung?: string | null
  ausfuehrung?: AusfuehrungsSchritt[] | null // JSONB array of steps

  // Kategorisierung
  muskelgruppen: string[]
  equipment: string[]
  schwierigkeitsgrad: Schwierigkeitsgrad

  // Medien
  media_url?: string | null
  media_type?: MediaType | null

  // Standard-Parameter (Vorlage für Trainingsplan)
  standard_saetze?: number | null
  standard_wiederholungen?: number | null
  standard_dauer_sekunden?: number | null
  standard_pause_sekunden?: number
  /** Übung pro Seite ausführen; NULL = aus Texten erkennen */
  standard_pro_seite?: boolean | null

  // System
  is_public: boolean        // true = Praxis-Bibliothek; false = persönliche Übung
  is_archived: boolean      // soft-delete für Übungen in aktiven Plänen
  created_by: string        // Therapeuten-ID

  // Favorit (computed from join, not in DB column)
  is_favorite?: boolean
}

export interface ExerciseFormValues {
  name: string
  beschreibung?: string
  ausfuehrung: AusfuehrungsSchritt[]
  muskelgruppen: string[]
  equipment?: string[]
  schwierigkeitsgrad: Schwierigkeitsgrad
  media_url?: string
  media_type?: MediaType
  standard_saetze?: number
  standard_wiederholungen?: number
  standard_dauer_sekunden?: number
  standard_pause_sekunden?: number
  /** Sätze gelten je Seite (Ausfallschritt, Einbeinstand …) */
  standard_pro_seite?: boolean
  is_public?: boolean
}

export type ExerciseQuelle = "alle" | "praxis" | "eigene" | "favoriten"

export interface ExerciseFilter {
  search: string
  muskelgruppen: string[]
  equipment: string[]
  schwierigkeitsgrad: Schwierigkeitsgrad | ""
  quelle: ExerciseQuelle
}
