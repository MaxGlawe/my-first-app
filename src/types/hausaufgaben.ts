// ---- Hausaufgaben / Assignment Types (PROJ-10) ----

export type Wochentag = "mo" | "di" | "mi" | "do" | "fr" | "sa" | "so"
export type AssignmentStatus = "aktiv" | "abgelaufen" | "deaktiviert"

export interface PatientAssignment {
  id: string
  created_at: string
  updated_at: string

  patient_id: string
  plan_id: string | null
  therapist_id: string

  start_date: string // ISO date YYYY-MM-DD
  end_date: string   // ISO date YYYY-MM-DD
  active_days: Wochentag[]

  status: AssignmentStatus
  adhoc_exercises: AdhocExercise[] | null
  notiz: string | null

  // Joined fields
  plan_name?: string | null
  plan_beschreibung?: string | null

  // Computed fields from API
  compliance_7days?: number | null   // 0–100
  completion_count?: number
  expected_count?: number
}

export interface AdhocExercise {
  exercise_id: string
  exercise_name?: string
  saetze: number
  wiederholungen?: number | null
  dauer_sekunden?: number | null
  pause_sekunden: number
  anmerkung?: string | null
}

export interface AssignmentCompletion {
  id: string
  assignment_id: string
  unit_id: string | null
  completed_date: string  // ISO date YYYY-MM-DD
  completed_at: string    // ISO timestamp
  patient_id: string
}

// For the dashboard
export interface PatientComplianceRow {
  patient_id: string
  patient_name: string
  avatar_url: string | null
  active_plans_count: number
  trained_today: boolean
  compliance_7days: number // 0–100
}

export interface AssignmentFormValues {
  plan_id: string | null
  start_date: string
  end_date: string
  active_days: Wochentag[]
  notiz: string
  adhoc_exercises: AdhocExercise[]
}
