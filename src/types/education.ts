// ---- PROJ-17: Patienten-Edukation & Engagement Types ----

export const HAUPTPROBLEME = [
  "Bandscheibenvorfall",
  "LWS-Syndrom",
  "HWS-Syndrom",
  "Impingement-Syndrom",
  "Knie-TEP",
  "Hüft-TEP",
  "ISG-Blockade",
  "Frozen Shoulder",
  "Tennisellbogen",
  "Fersensporn",
  "Skoliose",
  "Arthrose",
  "Meniskusschaden",
  "Kreuzbandriss (Reha)",
  "Schulterluxation (Reha)",
  "Plantarfasziitis",
  "Karpaltunnelsyndrom",
  "Spinalkanalstenose",
  "Sonstiges",
] as const

export type Hauptproblem = (typeof HAUPTPROBLEME)[number]

export type ModuleStatus = "entwurf" | "freigegeben" | "archiviert"

export interface EducationQuiz {
  id: string
  module_id: string
  question_number: number
  question_text: string
  options: string[]
  correct_index: number
  explanation: string | null
}

export interface CurriculumTopic {
  number: number
  topic: string
}

export interface EducationModule {
  id: string
  hauptproblem: string
  title: string
  lesson_content: string
  generated_by: string
  status: ModuleStatus
  lesson_number: number
  total_lessons: number
  curriculum: CurriculumTopic[] | null
  created_at: string
  updated_at: string
  quizzes: EducationQuiz[]
}

export interface QuizAnswer {
  question_id: string
  selected_index: number
  is_correct: boolean
}

export interface QuizAttempt {
  id: string
  patient_id: string
  module_id: string
  answers: QuizAnswer[]
  score: number
  completed_at: string
}

export interface DailyInsight {
  id: string
  patient_id: string
  insight_date: string
  content: string
}

// For patient app: module with quiz completion status
export interface PatientEducationModule extends EducationModule {
  quiz_completed: boolean
  quiz_score: number | null
}

// Curriculum progress summary for the Wissens-Hub
export interface CurriculumProgress {
  hauptproblem: string
  total_lessons: number
  completed_lessons: number
  curriculum: CurriculumTopic[]
  lessons: PatientEducationModule[]
}
