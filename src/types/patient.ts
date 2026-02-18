export type Geschlecht = "maennlich" | "weiblich" | "divers" | "unbekannt"

export interface Patient {
  id: string
  created_at: string
  updated_at: string

  // Person (Pflichtfelder)
  vorname: string
  nachname: string
  geburtsdatum: string // ISO date string YYYY-MM-DD
  geschlecht: Geschlecht

  // Kontakt (optional)
  telefon?: string | null
  email?: string | null
  strasse?: string | null
  plz?: string | null
  ort?: string | null

  // Krankenkasse (optional)
  krankenkasse?: string | null
  versichertennummer?: string | null

  // Sonstiges
  avatar_url?: string | null
  interne_notizen?: string | null

  // System
  therapeut_id: string
  archived_at?: string | null
  booking_system_id?: string | null
}

export interface PatientFormValues {
  vorname: string
  nachname: string
  geburtsdatum: string
  geschlecht: Geschlecht
  telefon?: string
  email?: string
  strasse?: string
  plz?: string
  ort?: string
  krankenkasse?: string
  versichertennummer?: string
  interne_notizen?: string
}
