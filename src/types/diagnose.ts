// PROJ-4: Befund & Diagnose (Heilpraktiker)

export type DiagnoseStatus = "entwurf" | "abgeschlossen"

export type DiagnoseSicherheitsgrad = "gesichert" | "verdacht" | "ausschluss"

export interface Icd10Entry {
  code: string
  bezeichnung: string
}

export interface DiagnoseEintrag {
  icd10: Icd10Entry | null
  sicherheitsgrad: DiagnoseSicherheitsgrad
  freitextDiagnose?: string
  freitextNotiz?: string
}

export interface DiagnoseRecord {
  id: string
  patient_id: string
  created_by: string
  created_by_role: "heilpraktiker"
  status: DiagnoseStatus
  klinischer_befund: string
  hauptdiagnose: DiagnoseEintrag
  nebendiagnosen: DiagnoseEintrag[]
  therapieziel: string
  prognose: string
  therapiedauer_wochen: number | null
  created_at: string
  updated_at: string
  // joined from user_profiles
  created_by_name?: string
}
