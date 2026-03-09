// ============================================================
// Billing System Types
// ============================================================

/** GebüH-Katalog Eintrag */
export interface GebuehCode {
  id: string
  ziffer: string
  bezeichnung: string
  kategorie: string
  preis_min: number
  preis_max: number
  preis_default: number | null
  hinweis: string | null
  aktiv: boolean
  sort_order: number
}

/** Rechnungsposition */
export interface InvoiceLineItem {
  id: string
  invoice_id: string
  sort_order: number
  gebueh_ziffer: string | null
  beschreibung: string
  anzahl: number
  einzelpreis: number
  gesamtpreis: number
  created_at: string
}

/** Rechnungsstatus */
export type InvoiceStatus = "entwurf" | "offen" | "bezahlt" | "ueberfaellig" | "storniert"

/** Rechnung */
export interface Invoice {
  id: string
  created_at: string
  updated_at: string
  invoice_number: string
  patient_id: string
  created_by: string
  invoice_date: string
  treatment_date: string
  due_date: string
  patient_name: string
  patient_address: string | null
  praxis_name: string
  praxis_address: string
  praxis_steuernr: string | null
  subtotal: number
  total: number
  diagnose_text: string | null
  status: InvoiceStatus
  paid_at: string | null
  cancelled_at: string | null
  notes: string | null
}

/** Rechnung mit Positionen (für Detail-Ansicht) */
export interface InvoiceWithItems extends Invoice {
  line_items: InvoiceLineItem[]
}

/** Rechnung mit Patient-Info (für Listview) */
export interface InvoiceWithPatient extends Invoice {
  patient?: {
    vorname: string
    nachname: string
    email: string | null
  }
}

/** Praxis-Stammdaten */
export interface PraxisSettings {
  id: string
  praxis_name: string
  inhaber_name: string
  strasse: string
  plz: string
  ort: string
  telefon: string | null
  email: string | null
  website: string | null
  steuernummer: string | null
  iban: string
  bic: string | null
  bank_name: string | null
  zulassungsnummer: string | null
  updated_at: string
}

/** Formular-Daten für neue Rechnungsposition */
export interface LineItemFormData {
  gebueh_ziffer: string | null
  beschreibung: string
  anzahl: number
  einzelpreis: number
}

/** Formular-Daten für neue Rechnung */
export interface InvoiceFormData {
  patient_id: string
  treatment_date: string
  invoice_date: string
  diagnose_text: string | null
  notes: string | null
  line_items: LineItemFormData[]
}

/** Revenue-Summary für Dashboard */
export interface BillingSummary {
  total_revenue: number
  revenue_this_month: number
  outstanding_amount: number
  overdue_amount: number
  invoice_count: number
  paid_count: number
  open_count: number
  overdue_count: number
}
