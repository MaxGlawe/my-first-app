"use client"

import { useState, useEffect, useCallback } from "react"
import type { PatientEducationModule, CurriculumProgress } from "@/types/education"

interface UseMyEducationResult {
  modules: PatientEducationModule[]
  curricula: CurriculumProgress[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useMyEducation(): UseMyEducationResult {
  const [modules, setModules] = useState<PatientEducationModule[]>([])
  const [curricula, setCurricula] = useState<CurriculumProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/me/education")
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Fehler beim Laden der Module.")
      }
      const data = await res.json()
      setModules(data.modules ?? [])
      setCurricula(data.curricula ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch_()
  }, [fetch_])

  return { modules, curricula, loading, error, refresh: fetch_ }
}

interface SubmitQuizParams {
  module_id: string
  answers: Array<{ question_id: string; selected_index: number }>
}

interface QuizResult {
  attempt: { id: string; module_id: string; score: number; completed_at: string }
  results: Array<{
    question_id: string
    selected_index: number
    is_correct: boolean
    correct_index: number | null
    explanation: string | null
  }>
  score: number
  total: number
}

export function useSubmitQuiz() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(async (params: SubmitQuizParams): Promise<QuizResult | null> => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/me/quiz-attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Fehler beim Absenden des Quiz.")
      }
      return data as QuizResult
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler")
      return null
    } finally {
      setSubmitting(false)
    }
  }, [])

  return { submit, submitting, error }
}
