// ============================================================
// PROJ-18: BGF Contract Types (B2B Dienstleistungsvertrag)
// ============================================================

/**
 * "voll" = aktuelles Modell (ein Produkt, Preis nach Teamgröße).
 * basic/pro/enterprise existieren nur noch für Bestandsverträge aus der
 * Tarif-Ära, damit alte PDFs reproduzierbar bleiben.
 */
export type BgfContractType = "basic" | "pro" | "enterprise" | "voll"

export type BgfContractStatus =
  | "entwurf"
  | "versendet"
  | "unterschrieben"
  | "widerrufen"
  | "abgelaufen"
  | "storniert"

export interface BgfLeistung {
  beschreibung: string
  enthalten: boolean
  details?: string
}

export interface BgfVertragText {
  vertragsparteien: string
  praeambel: string
  vertragsgegenstand: string
  leistungsumfang: string
  zusatzleistungen: string
  app_nutzung: string
  verguetung: string
  laufzeit_kuendigung: string
  datenschutz: string
  vertraulichkeit: string
  haftung: string
  mitwirkungspflichten: string
  widerrufsrecht: string
  geistiges_eigentum: string
  abwerbeverbot: string
  schlussbestimmungen: string
}

export interface BgfContract {
  id: string
  created_at: string
  updated_at: string
  contract_number: string
  organization_id: string
  created_by: string
  contract_type: BgfContractType
  leistungen: BgfLeistung[]
  /** Obergrenze der Preisstaffel (NULL = individuell verhandelt) */
  paket_max_ma: number | null
  /** z. B. „bis 20 Mitarbeitende“ */
  paket_label: string | null
  /** Kopfpreis je Mitarbeitendem über der Paketgrenze (Nachbesetzung) */
  zusatz_ma_preis: number | null
  /** ALTLAST: Pro-Kopf-Preis der Tarif-Ära, bei neuen Verträgen null */
  preis_pro_ma_monat: number | null
  lizenzen: number
  /** Fester Monatspreis netto (Paketpreis) */
  monatlicher_gesamtpreis: number
  laufzeit_monate: number
  vertrag_start: string | null
  vertrag_text: BgfVertragText

  // Org snapshot
  org_name: string
  org_address: string | null
  org_branche: string | null
  org_groesse: string | null
  kontakt_name: string
  kontakt_email: string

  // Praxis snapshot
  praxis_name: string
  praxis_address: string
  praxis_inhaber: string
  praxis_zulassung: string | null
  praxis_signature_png: string | null

  // Signing
  signing_token: string | null
  token_expires_at: string | null
  status: BgfContractStatus
  sent_at: string | null
  sent_to_email: string | null
  signed_at: string | null
  signature_png: string | null
  signer_ip: string | null
  signer_user_agent: string | null
  signer_consent: boolean
  widerruf_bis: string | null
  widerrufen_at: string | null
  pdf_path: string | null
  signed_pdf_path: string | null
  notes: string | null
}

export interface BgfContractFormData {
  organization_id: string
  /** Obergrenze der Preisstaffel; null = individuelles Paket */
  paket_max_ma: number | null
  /** Fester Monatspreis netto */
  monatspreis: number
  /** Kopfpreis je Nachbesetzung über der Paketgrenze */
  zusatz_ma_preis?: number | null
  /** Abgedeckte Mitarbeitende */
  lizenzen: number
  laufzeit_monate: number
  vertrag_start: string
  notes?: string
}

/**
 * Leistungsumfang — gilt für JEDEN Vertrag (ein Produkt für alle).
 * Es gibt keine „nicht enthalten"-Positionen mehr; der Preis richtet sich
 * ausschließlich nach der Teamgröße (src/lib/bgf-pakete.ts).
 */
export const BGF_VOLL_LEISTUNGEN: BgfLeistung[] = [
  { beschreibung: "Fester, namentlicher Therapeut als Ansprechpartner", enthalten: true },
  { beschreibung: "Therapeuten-Chat bei Beschwerden (vertraulich)", enthalten: true },
  { beschreibung: "KI-generierte Pausen-Fit Sessions (3x täglich)", enthalten: true },
  { beschreibung: "Täglicher Gesundheits-Check-In", enthalten: true },
  { beschreibung: "Ergonomie-Tipps & Bildschirm-Pausen", enthalten: true },
  { beschreibung: "Hydration-Tracker", enthalten: true },
  { beschreibung: "Wochen-Übersicht & Streak-System", enthalten: true },
  { beschreibung: "Ist-Analyse & Risiko-Scoring je Mitarbeitendem", enthalten: true },
  { beschreibung: "Individuelle Übungspläne vom Therapeuten", enthalten: true },
  { beschreibung: "Ziel-Tracking mit Fortschrittsmessung", enthalten: true },
  { beschreibung: "Ampel-System zur Früherkennung kritischer Fälle", enthalten: true },
  { beschreibung: "Anonymisierter Nutzungs-Report für die Geschäftsführung", enthalten: true },
  { beschreibung: "Team-Puls (anonyme Team-Statistik)", enthalten: true },
  { beschreibung: "Quartals-Reports mit Handlungsempfehlungen", enthalten: true },
  { beschreibung: "Onboarding-Workshop für das Team", enthalten: true },
  { beschreibung: "Zugang zu Sonderkonditionen für individuelle Leistungen (gem. §2a)", enthalten: true },
]

/**
 * Unterscheidet Paket- von Altverträgen — EINZIGE Stelle für diese Regel.
 *
 * Maßgeblich ist der Pro-Kopf-Preis: Altverträge aus der Tarif-Ära haben ihn
 * gesetzt, Paketverträge schreiben NULL. Nicht an `paket_label` festmachen —
 * das trägt nach dem Backfill auch mancher Altvertrag.
 */
export function istPaketVertrag(contract: {
  contract_type: string
  preis_pro_ma_monat: number | null
}): boolean {
  return contract.preis_pro_ma_monat == null && contract.contract_type === "voll"
}

/** Anzeige-Label historischer Tarif-Verträge (nur noch für Altbestand). */
export const BGF_CONTRACT_TYPE_LABELS: Record<BgfContractType, string> = {
  basic: "Basic",
  pro: "Professional",
  enterprise: "Enterprise",
  voll: "Vollzugriff",
}

export const BGF_CONTRACT_STATUS_CONFIG: Record<BgfContractStatus, {
  label: string
  color: string
}> = {
  entwurf: { label: "Entwurf", color: "bg-slate-100 text-slate-700" },
  versendet: { label: "Versendet", color: "bg-blue-100 text-blue-700" },
  unterschrieben: { label: "Unterschrieben", color: "bg-emerald-100 text-emerald-700" },
  widerrufen: { label: "Widerrufen", color: "bg-orange-100 text-orange-700" },
  abgelaufen: { label: "Abgelaufen", color: "bg-red-100 text-red-700" },
  storniert: { label: "Storniert", color: "bg-red-100 text-red-700" },
}
