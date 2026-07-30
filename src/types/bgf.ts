// ── BGF Types (PROJ-18) ─────────────────────────────────────────────

// Enums
export type OrgStatus = "pilot" | "aktiv" | "pausiert" | "gekuendigt"
/** „voll" = aktuelles Modell; die übrigen Werte nur noch für Altbestand. */
export type VertragTier = "basic" | "pro" | "enterprise" | "voll"
export type OrgGroesse = "1-49" | "50-99" | "100-249" | "250-499" | "500+"
export type OrgAdminRolle = "hr_admin" | "hr_viewer" | "geschaeftsfuehrung"
export type MemberStatus = "eingeladen" | "aktiv" | "pausiert" | "deaktiviert"
export type ArbeitsplatzTyp = "buero" | "homeoffice" | "lager" | "produktion" | "handwerk" | "pflege" | "mischform"
export type PausenFitTyp = "morgen_aktivierung" | "mittag_mobilisation" | "nachmittag_reset"
export type PausenFitStatus = "geplant" | "gestartet" | "abgeschlossen" | "verpasst"
export type BgfLevel = "gesperrt" | "berechtigt" | "lead"
export type ErgonomieTippKategorie = "bildschirm" | "sitzen" | "stehen" | "heben" | "pausen" | "ernaehrung" | "stress" | "allgemein"

// ── Organization ────────────────────────────────────────────────────

export interface Organization {
  id: string
  name: string
  logo_url?: string | null
  branche?: string | null
  groesse?: OrgGroesse | null

  // Kontakt
  kontakt_name: string
  kontakt_email: string
  kontakt_telefon?: string | null

  // Adresse
  adresse_strasse?: string | null
  adresse_plz?: string | null
  adresse_ort?: string | null

  // Vertrag
  vertrag_tier: VertragTier
  vertrag_lizenzen: number
  vertrag_start?: string | null
  vertrag_ende?: string | null
  /** Obergrenze der Preisstaffel (NULL = individuelles Paket) */
  vertrag_paket_max_ma: number | null
  /** Fester Monatspreis netto */
  vertrag_monatspreis: number | null
  /** ALTLAST: Pro-Kopf-Preis der Tarif-Ära */
  vertrag_preis_pro_ma_monat: number | null
  status: OrgStatus

  // Konfiguration
  pausen_fit_zeiten: string[] // ["10:00", "13:00", "15:30"]
  abteilungen: string[]

  // Zuordnung
  therapeut_id?: string | null

  // Timestamps
  created_at: string
  updated_at: string
}

// ── Organization Admin (HR) ─────────────────────────────────────────

export interface OrganizationAdmin {
  id: string
  organization_id: string
  user_id: string
  rolle: OrgAdminRolle
  created_at: string
}

// ── Organization Member (Mitarbeiter) ───────────────────────────────

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id?: string | null
  email: string
  vorname?: string | null
  nachname?: string | null
  abteilung?: string | null
  arbeitsplatz_typ: ArbeitsplatzTyp
  status: MemberStatus
  freigeschaltet_am?: string | null
  freigeschaltet_von?: string | null
  ist_analyse_abgeschlossen: boolean
  invite_token: string
  created_at: string
  updated_at: string
}

// ── Ist-Analyse ─────────────────────────────────────────────────────

export interface IstAnalyse {
  id: string
  user_id: string
  organization_id: string

  // Arbeitsplatz
  arbeitsplatz_typ: ArbeitsplatzTyp
  bildschirmarbeit_stunden?: number | null
  sitz_stunden_pro_tag?: number | null
  heben_tragen: boolean

  // Beschwerden
  beschwerden_regionen: string[]
  schmerz_aktuell?: number | null
  stress_level?: number | null
  schlaf_qualitaet?: number | null
  bewegungseinschraenkung?: number | null

  // Bewegung & Lebensstil
  bewegung_minuten_pro_woche: number
  sport_art?: string | null
  vorerkrankungen: string[]
  medikamente?: string | null

  // Ziele
  ziele: string[]

  // Berechnete Werte
  risiko_score?: number | null
  ki_empfehlung?: string | null
  pausen_fit_fokus: string[]

  // Timestamps
  created_at: string
  updated_at: string
}

// ── Pausen-Fit ──────────────────────────────────────────────────────

export interface PausenFitUebung {
  name: string
  beschreibung: string
  dauer_sekunden: number
  wiederholungen?: number | null
  position: "sitzend" | "stehend" | "liegend"
  schwierigkeit: "leicht" | "mittel" | "fordernd"
}

export interface PausenFitSession {
  id: string
  user_id: string
  organization_id: string
  geplant_um: string
  gestartet_um?: string | null
  abgeschlossen_um?: string | null
  typ: PausenFitTyp
  uebungen: PausenFitUebung[]
  ergonomie_tipp?: string | null
  dauer_sekunden?: number | null
  feedback_sterne?: number | null
  feedback_text?: string | null
  status: PausenFitStatus
  check_in_schmerz_bei_erstellung?: number | null
  created_at: string
}

// ── Ergonomie-Tipp ──────────────────────────────────────────────────

export interface ErgonomieTipp {
  id: string
  kategorie: ErgonomieTippKategorie
  arbeitsplatz_typen: string[]
  tipp: string
  quelle?: string | null
  aktiv: boolean
  created_at: string
}

// ── Dashboard / Aggregates ──────────────────────────────────────────

export interface OrgDashboardStats {
  total_members: number
  aktive_members: number
  eingeladene_members: number
  teilnahmequote: number // 0-100
  avg_schmerz: number | null
  avg_stress: number | null
  ist_analyse_quote: number // 0-100
}

// ── Daily Check-In ──────────────────────────────────────────────────

export interface BgfDailyCheckin {
  id: string
  user_id: string
  organization_id: string
  datum: string // DATE as ISO string
  stimmung: 1 | 2 | 3 | 4 | 5
  schmerz_aktuell: number
  schlaf_qualitaet: number
  arbeitstag_typ: "buero" | "homeoffice" | "unterwegs" | "frei"
  arbeitszeit_stunden: number
  wasser_glaeser: number
  created_at: string
}

// ── Form Values ─────────────────────────────────────────────────────

export interface CreateOrganizationValues {
  name: string
  branche?: string
  groesse?: OrgGroesse
  kontakt_name: string
  kontakt_email: string
  kontakt_telefon?: string
  adresse_strasse?: string
  adresse_plz?: string
  adresse_ort?: string
  vertrag_tier?: VertragTier
  vertrag_lizenzen?: number
  vertrag_paket_max_ma?: number | null
  vertrag_monatspreis?: number
  vertrag_preis_pro_ma_monat?: number
}

export interface FreischaltungValues {
  email: string
  vorname?: string
  nachname?: string
  abteilung?: string
  arbeitsplatz_typ?: ArbeitsplatzTyp
}

export interface IstAnalyseFormValues {
  arbeitsplatz_typ: ArbeitsplatzTyp
  bildschirmarbeit_stunden?: number
  sitz_stunden_pro_tag?: number
  heben_tragen?: boolean
  beschwerden_regionen: string[]
  schmerz_aktuell: number
  stress_level: number
  schlaf_qualitaet: number
  bewegungseinschraenkung?: number
  bewegung_minuten_pro_woche: number
  sport_art?: string
  vorerkrankungen?: string[]
  medikamente?: string
  ziele: string[]
}
