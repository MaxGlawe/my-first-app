// ============================================================
// PROJ-18: BGF Contract Types (B2B Dienstleistungsvertrag)
// ============================================================

export type BgfContractType = "basic" | "pro" | "enterprise"

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
  preis_pro_ma_monat: number
  lizenzen: number
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
  contract_type: BgfContractType
  lizenzen: number
  preis_pro_ma_monat: number
  laufzeit_monate: number
  vertrag_start: string
  notes?: string
}

/** BGF tier configs */
export const BGF_CONTRACT_TYPE_CONFIG: Record<BgfContractType, {
  label: string
  description: string
  defaultPreis: number
  defaultLeistungen: BgfLeistung[]
}> = {
  basic: {
    label: "Basic",
    description: "Digitale Pausen-Fit Sessions + Ergonomie-Tipps",
    defaultPreis: 29,
    defaultLeistungen: [
      { beschreibung: "KI-generierte Pausen-Fit Sessions (3x täglich)", enthalten: true },
      { beschreibung: "Täglicher Gesundheits-Check-In", enthalten: true },
      { beschreibung: "Ergonomie-Tipps & Bildschirm-Pausen", enthalten: true },
      { beschreibung: "Hydration-Tracker", enthalten: true },
      { beschreibung: "Wochen-Übersicht & Streak-System", enthalten: true },
      { beschreibung: "Ist-Analyse & Risiko-Scoring", enthalten: false },
      { beschreibung: "HR-Dashboard mit anonymisierten Reports", enthalten: false },
      { beschreibung: "Persönlicher Therapeuten-Chat", enthalten: false },
    ],
  },
  pro: {
    label: "Professional",
    description: "Vollständige BGF-Plattform mit Analyse & Dashboard",
    defaultPreis: 39,
    defaultLeistungen: [
      { beschreibung: "KI-generierte Pausen-Fit Sessions (3x täglich)", enthalten: true },
      { beschreibung: "Täglicher Gesundheits-Check-In", enthalten: true },
      { beschreibung: "Ergonomie-Tipps & Bildschirm-Pausen", enthalten: true },
      { beschreibung: "Hydration-Tracker", enthalten: true },
      { beschreibung: "Wochen-Übersicht & Streak-System", enthalten: true },
      { beschreibung: "Ist-Analyse & Risiko-Scoring", enthalten: true },
      { beschreibung: "HR-Dashboard mit anonymisierten Reports", enthalten: true },
      { beschreibung: "Persönlicher Therapeuten-Chat", enthalten: true },
      { beschreibung: "Ziel-Tracking mit Fortschrittsmessung", enthalten: true },
      { beschreibung: "Team-Puls (anonyme Team-Statistik)", enthalten: true },
      { beschreibung: "Quartals-Reports mit Handlungsempfehlungen", enthalten: false },
    ],
  },
  enterprise: {
    label: "Enterprise",
    description: "Premium BGF mit Vor-Ort-Betreuung & individuellen Reports",
    defaultPreis: 59,
    defaultLeistungen: [
      { beschreibung: "KI-generierte Pausen-Fit Sessions (3x täglich)", enthalten: true },
      { beschreibung: "Täglicher Gesundheits-Check-In", enthalten: true },
      { beschreibung: "Ergonomie-Tipps & Bildschirm-Pausen", enthalten: true },
      { beschreibung: "Hydration-Tracker", enthalten: true },
      { beschreibung: "Wochen-Übersicht & Streak-System", enthalten: true },
      { beschreibung: "Ist-Analyse & Risiko-Scoring", enthalten: true },
      { beschreibung: "HR-Dashboard mit anonymisierten Reports", enthalten: true },
      { beschreibung: "Persönlicher Therapeuten-Chat", enthalten: true },
      { beschreibung: "Ziel-Tracking mit Fortschrittsmessung", enthalten: true },
      { beschreibung: "Team-Puls (anonyme Team-Statistik)", enthalten: true },
      { beschreibung: "Quartals-Reports mit Handlungsempfehlungen", enthalten: true },
      { beschreibung: "Dedizierter Therapeut als fester Ansprechpartner", enthalten: true },
      { beschreibung: "Zugang zu Sonderkonditionen für individuelle Übungsprogramme (gem. §2a)", enthalten: true },
    ],
  },
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
