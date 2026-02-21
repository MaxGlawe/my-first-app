"use client"

import { useState, useEffect, useCallback } from "react"

interface QuizResultItem {
  id: string
  module_id: string
  score: number
  total: number
  completed_at: string
  answers: Array<{
    question_id: string
    selected_index: number
    is_correct: boolean
  }>
  module: {
    id: string
    hauptproblem: string
    title: string
    status: string
  } | null
}

interface UsePatientQuizResultsResult {
  results: QuizResultItem[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function usePatientQuizResults(patientId: string | null): UsePatientQuizResultsResult {
  const [results, setResults] = useState<QuizResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    if (!patientId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/patients/${patientId}/quiz-results`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Fehler beim Laden der Quiz-Ergebnisse.")
      }
      const data = await res.json()
      setResults(data.results ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler")
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    fetch_()
  }, [fetch_])

  return { results, loading, error, refresh: fetch_ }
}
