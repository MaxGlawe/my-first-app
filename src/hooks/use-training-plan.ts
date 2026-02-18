"use client"

import { useState, useEffect, useCallback } from "react"
import type { TrainingPlan } from "@/types/training-plan"

interface UseTrainingPlanResult {
  plan: TrainingPlan | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useTrainingPlan(id: string): UseTrainingPlanResult {
  const [plan, setPlan] = useState<TrainingPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    if (!id) return
    let cancelled = false

    async function fetchPlan() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/training-plans/${id}`)
        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Trainingsplan konnte nicht geladen werden.")
          return
        }

        const json = await res.json()
        setPlan(json.plan ?? null)
      } catch {
        if (!cancelled) {
          setError("Ein unerwarteter Fehler ist aufgetreten.")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchPlan()
    return () => {
      cancelled = true
    }
  }, [id, refreshKey])

  return { plan, isLoading, error, refresh }
}
