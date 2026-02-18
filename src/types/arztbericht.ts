// PROJ-6: KI-Arztbericht-Generator

export type ReportType = "arztbericht" | "therapiebericht"
export type ReportStatus = "entwurf" | "finalisiert"

export interface MedicalReport {
  id: string
  patient_id: string
  generated_by: string
  generated_by_role: "heilpraktiker" | "physiotherapeut" | "admin"
  report_type: ReportType
  date_from: string // ISO date "YYYY-MM-DD"
  date_to: string   // ISO date "YYYY-MM-DD"
  recipient_name: string
  recipient_address: string
  extra_instructions: string | null
  draft_content: string  // original KI draft (immutable audit trail)
  final_content: string  // edited version
  status: ReportStatus
  created_at: string
  updated_at: string
  // joined
  generated_by_name?: string | null
}

export interface CreateReportPayload {
  date_from: string
  date_to: string
  recipient_name: string
  recipient_address: string
  extra_instructions?: string
}

export interface UpdateReportPayload {
  final_content?: string
  status?: ReportStatus
}

export interface DataAvailabilitySummary {
  treatmentCount: number
  befundCount: number
  diagnosisCount: number
  anamnesisCount: number
}
