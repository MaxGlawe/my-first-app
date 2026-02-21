// ── PROJ-13: Kurs-System — Type Definitions ────────────────────────────────────

export type CourseStatus = "entwurf" | "aktiv" | "archiviert"
export type CourseUnlockMode = "sequentiell" | "alle_sofort"
export type CourseKategorie = "ruecken" | "schulter" | "knie" | "huefte" | "nacken" | "ganzkoerper" | "sonstiges"
export type EnrollmentStatus = "aktiv" | "abgeschlossen" | "abgebrochen"

export const KATEGORIE_LABELS: Record<CourseKategorie, string> = {
  ruecken: "Rücken",
  schulter: "Schulter",
  knie: "Knie",
  huefte: "Hüfte",
  nacken: "Nacken",
  ganzkoerper: "Ganzkörper",
  sonstiges: "Sonstiges",
}

export const STATUS_LABELS: Record<CourseStatus, string> = {
  entwurf: "Entwurf",
  aktiv: "Aktiv",
  archiviert: "Archiviert",
}

export const UNLOCK_MODE_LABELS: Record<CourseUnlockMode, string> = {
  sequentiell: "Sequentiell (Lektion für Lektion)",
  alle_sofort: "Alle sofort verfügbar",
}

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  aktiv: "Aktiv",
  abgeschlossen: "Abgeschlossen",
  abgebrochen: "Abgebrochen",
}

// ── Lesson Exercise (linked from exercise database) ──────────────────────────

export interface LessonExercise {
  exercise_id: string
  exercise_name?: string
  exercise_media_url?: string | null
  params: {
    saetze: number
    wiederholungen?: number | null
    dauer_sekunden?: number | null
    pause_sekunden: number
    anmerkung?: string | null
  }
}

// ── Course ──────────────────────────────────────────────────────────────────────

export interface Course {
  id: string
  created_by: string
  name: string
  beschreibung: string | null
  cover_image_url: string | null
  dauer_wochen: number
  kategorie: CourseKategorie
  unlock_mode: CourseUnlockMode
  status: CourseStatus
  version: number
  invite_token: string | null
  invite_enabled: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
  // Computed (list view)
  lesson_count?: number
  enrollment_count?: number
  created_by_name?: string | null
}

export interface CourseListItem {
  id: string
  name: string
  beschreibung: string | null
  cover_image_url: string | null
  kategorie: CourseKategorie
  status: CourseStatus
  version: number
  dauer_wochen: number
  unlock_mode: CourseUnlockMode
  lesson_count: number
  enrollment_count: number
  created_at: string
  updated_at: string
}

// ── Course Lesson (editable by therapist) ────────────────────────────────────

export interface CourseLesson {
  id: string
  course_id: string
  title: string
  beschreibung: string | null
  video_url: string | null
  exercise_unit: LessonExercise[] | null
  order: number
  created_at: string
  updated_at: string
}

// ── Course Lesson Snapshot (immutable, per version) ──────────────────────────

export interface CourseLessonSnapshot {
  id: string
  course_id: string
  lesson_id: string
  version: number
  title: string
  beschreibung: string | null
  video_url: string | null
  exercise_unit: LessonExercise[] | null
  order: number
}

// ── Course Enrollment ────────────────────────────────────────────────────────

export interface CourseEnrollment {
  id: string
  course_id: string
  patient_id: string
  enrolled_by: string
  enrolled_version: number
  status: EnrollmentStatus
  enrolled_at: string
  completed_at: string | null
  cancelled_at: string | null
  // Joined
  patient_name?: string
  // Computed
  progress_percent?: number
  completed_lessons?: number
  total_lessons?: number
}

// ── Lesson Completion ────────────────────────────────────────────────────────

export interface LessonCompletion {
  id: string
  enrollment_id: string
  lesson_id: string
  patient_id: string
  completed_at: string
}

// ── Patient App Types ────────────────────────────────────────────────────────

export interface PatientCourseEnrollment {
  enrollment_id: string
  course_id: string
  course_name: string
  course_beschreibung: string | null
  cover_image_url: string | null
  kategorie: CourseKategorie
  unlock_mode: CourseUnlockMode
  dauer_wochen: number
  enrolled_version: number
  status: EnrollmentStatus
  enrolled_at: string
  lessons: PatientCourseLesson[]
  progress_percent: number
  completed_count: number
  total_count: number
}

export interface PatientCourseLesson {
  lesson_id: string
  snapshot_id: string
  title: string
  beschreibung: string | null
  video_url: string | null
  exercise_unit: LessonExercise[] | null
  order: number
  is_completed: boolean
  is_unlocked: boolean
  completed_at: string | null
}

// ── Filter Types ─────────────────────────────────────────────────────────────

export type CourseFilter = "alle" | "entwurf" | "aktiv" | "archiviert"
