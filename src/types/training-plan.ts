// ---- Training Plan Types (PROJ-9) ----

export interface PlanExerciseParams {
  saetze: number
  wiederholungen?: number | null
  dauer_sekunden?: number | null
  pause_sekunden: number
  intensitaet_prozent?: number | null
  anmerkung?: string | null
}

export interface PlanExercise {
  id: string
  unit_id: string
  exercise_id: string
  order: number
  params: PlanExerciseParams
  is_archived_exercise: boolean
  // Joined from exercises table:
  exercise_name?: string
  exercise_beschreibung?: string | null
  exercise_ausfuehrung?: { nummer: number; beschreibung: string }[] | null
  exercise_media_url?: string | null
  exercise_media_type?: "image" | "video" | null
  exercise_muskelgruppen?: string[]
}

export interface PlanUnit {
  id: string
  plan_id: string
  phase_id: string | null
  name: string
  order: number
  exercises: PlanExercise[]
}

export interface PlanPhase {
  id: string
  plan_id: string
  name: string
  dauer_wochen: number
  order: number
  units: PlanUnit[]
}

export interface TrainingPlan {
  id: string
  created_at: string
  updated_at: string
  name: string
  beschreibung?: string | null
  created_by: string
  is_template: boolean
  is_archived: boolean
  phases: PlanPhase[]
  // Summary fields (for list view):
  uebungen_anzahl?: number
  phasen_anzahl?: number
}

export type PlanFilter = "alle" | "meine" | "templates"

export interface TrainingPlanListItem {
  id: string
  created_at: string
  updated_at: string
  name: string
  beschreibung?: string | null
  created_by: string
  is_template: boolean
  is_archived: boolean
  uebungen_anzahl: number
  phasen_anzahl: number
}

// Undo stack entry — BUG-14 FIX: includes full plan state, not just phases
export interface UndoEntry {
  phases: PlanPhase[]
  name: string
  beschreibung: string
  isTemplate: boolean
}
