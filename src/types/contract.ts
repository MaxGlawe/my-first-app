// ============================================================
// PROJ-18: Treatment Contract Types
// ============================================================

export type ContractType = "einzelsitzung" | "mini_reha_post_op" | "chronik_programm"

export type ContractStatus =
  | "entwurf"
  | "versendet"
  | "unterschrieben"
  | "widerrufen"
  | "abgelaufen"
  | "storniert"

export interface Leistung {
  beschreibung: string
  preis: number
  details?: string
}

export interface VertragText {
  vertragsparteien: string
  praeambel: string
  leistungsbeschreibung: string
  app_nutzung: string
  rechtsgrundlage: string
  fernbehandlung: string
  verguetung: string
  terminregelung: string
  mitwirkungspflichten: string
  schweigepflicht: string
  haftungsausschluss: string
  datenschutz: string
  widerrufsrecht: string
  kuendigung: string
  urheberrecht: string
  schlussbestimmungen: string
}

export interface TreatmentContract {
  id: string
  created_at: string
  updated_at: string
  contract_number: string
  patient_id: string
  created_by: string
  contract_type: ContractType
  leistungen: Leistung[]
  gesamtpreis: number
  zahlungsweise: "einmalig" | "pro_sitzung"
  dauer_wochen: number | null
  sitzungen_anzahl: number | null
  vertrag_text: VertragText
  praxis_name: string
  praxis_address: string
  praxis_inhaber: string
  praxis_zulassung: string | null
  patient_name: string
  patient_address: string | null
  patient_email: string
  patient_geburtsdatum: string | null
  signing_token: string | null
  token_expires_at: string | null
  status: ContractStatus
  sent_at: string | null
  sent_to_email: string | null
  signed_at: string | null
  praxis_signature_png: string | null
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

export interface ContractWithPatient extends TreatmentContract {
  patient?: {
    vorname: string
    nachname: string
    email: string | null
  }
}

export interface ContractFormData {
  patient_id: string
  contract_type: ContractType
  leistungen: Leistung[]
  gesamtpreis: number
  zahlungsweise: "einmalig" | "pro_sitzung"
  dauer_wochen?: number
  sitzungen_anzahl?: number
  notes?: string
}

/** Contract type display config */
export const CONTRACT_TYPE_CONFIG: Record<ContractType, {
  label: string
  description: string
  defaultLeistungen: Leistung[]
  defaultZahlungsweise: "einmalig" | "pro_sitzung"
}> = {
  einzelsitzung: {
    label: "Einzelsitzung",
    description: "Video-Behandlung (45 Min.) mit Trainingsplan und Chat-Support",
    defaultLeistungen: [
      { beschreibung: "Video-Behandlung (45 Min.)", preis: 89 },
      { beschreibung: "Individuelle Befunderhebung & Diagnose", preis: 0 },
      { beschreibung: "Persönlicher Trainingsplan mit Video-Anleitungen", preis: 0 },
      { beschreibung: "Chat-Support bis zum nächsten Termin", preis: 0 },
    ],
    defaultZahlungsweise: "pro_sitzung",
  },
  mini_reha_post_op: {
    label: "Mini-Reha Post-OP",
    description: "Strukturierte Nachbehandlung nach Operationen (6–8 Wochen)",
    defaultLeistungen: [
      { beschreibung: "Mini-Reha Post-OP Programm (6–8 Wochen)", preis: 449, details: "6–8 Video-Sitzungen à 45 Min." },
      { beschreibung: "Individuelle Reha-Phasen nach OP-Protokoll", preis: 0 },
      { beschreibung: "Täglicher Trainingsplan mit progressiver Steigerung", preis: 0 },
      { beschreibung: "Unbegrenzter Chat-Support", preis: 0 },
      { beschreibung: "Abschlussbefund & Übergabe an Arzt", preis: 0 },
    ],
    defaultZahlungsweise: "einmalig",
  },
  chronik_programm: {
    label: "Chronik-Programm",
    description: "Für langjährige Beschwerden mit Struktur und Konsequenz (8–12 Wochen)",
    defaultLeistungen: [
      { beschreibung: "Chronik-Programm (8–12 Wochen)", preis: 649, details: "8–10 Video-Sitzungen à 45 Min." },
      { beschreibung: "Umfassende Schmerzanalyse & Zielsetzung", preis: 0 },
      { beschreibung: "Individueller Trainingsplan mit wöchentlicher Anpassung", preis: 0 },
      { beschreibung: "Schmerztagebuch & Verlaufskontrolle", preis: 0 },
      { beschreibung: "Unbegrenzter Chat-Support", preis: 0 },
    ],
    defaultZahlungsweise: "einmalig",
  },
}

/** Status display config */
export const CONTRACT_STATUS_CONFIG: Record<ContractStatus, {
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
