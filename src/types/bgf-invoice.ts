// ============================================================
// PROJ-18: BGF Invoice Types (Rechnungen & Mahnwesen)
// ============================================================

export type BgfInvoiceStatus =
  | "entwurf"
  | "versendet"
  | "bezahlt"
  | "ueberfaellig"
  | "gemahnt_1"
  | "gemahnt_2"

export interface BgfInvoice {
  id: string
  invoice_number: string
  organization_id: string
  contract_id: string | null
  created_by: string

  // Billing period
  zeitraum_monat: number
  zeitraum_jahr: number

  // Amounts
  lizenzen: number
  preis_pro_ma: number
  gesamtbetrag: number

  // Org snapshot
  org_name: string
  org_address: string | null
  kontakt_name: string
  kontakt_email: string

  // Praxis snapshot
  praxis_name: string
  praxis_address: string
  praxis_inhaber: string
  praxis_steuernr: string | null
  praxis_iban: string
  praxis_bic: string | null
  praxis_bank_name: string | null

  // Status
  status: BgfInvoiceStatus
  invoice_date: string
  due_date: string
  sent_at: string | null
  paid_at: string | null
  reminder_sent_at: string | null
  mahnung1_sent_at: string | null
  mahnung2_sent_at: string | null

  // Fees
  mahngebuehr_1: number
  mahngebuehr_2: number

  notes: string | null
  pdf_path: string | null
  created_at: string
  updated_at: string
}

export const BGF_INVOICE_STATUS_CONFIG: Record<BgfInvoiceStatus, {
  label: string
  color: string
}> = {
  entwurf: { label: "Entwurf", color: "bg-slate-100 text-slate-700" },
  versendet: { label: "Offen", color: "bg-blue-100 text-blue-700" },
  bezahlt: { label: "Bezahlt", color: "bg-emerald-100 text-emerald-700" },
  ueberfaellig: { label: "Überfällig", color: "bg-amber-100 text-amber-700" },
  gemahnt_1: { label: "1. Mahnung", color: "bg-orange-100 text-orange-700" },
  gemahnt_2: { label: "2. Mahnung", color: "bg-red-100 text-red-700" },
}

const MONAT_NAMEN = [
  "", "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
]

export function formatZeitraum(monat: number, jahr: number): string {
  return `${MONAT_NAMEN[monat]} ${jahr}`
}
