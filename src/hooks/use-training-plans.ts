"use client"

import { useState, useEffect, useCallback } from "react"
import type { TrainingPlanListItem, PlanFilter } from "@/types/training-plan"

interface UseTrainingPlansOptions {
  filter: PlanFilter
  search: string
}

interface UseTrainingPlansResult {
  plans: TrainingPlanListItem[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useTrainingPlans({ filter, search }: UseTrainingPlansOptions): UseTrainingPlansResult {
  const [plans, setPlans] = useState<TrainingPlanListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false

    async function fetchPlans() {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({ filter })
        if (search.trim()) params.set("search", search.trim())

        const res = await fetch(`/api/training-plans?${params.toString()}`)
        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Trainingspläne konnten nicht geladen werden.")
          return
        }

        const json = await res.json()
        setPlans(json.plans ?? [])
      } catch {
        if (!cancelled) {
          setError("Ein unerwarteter Fehler ist aufgetreten.")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchPlans()
    return () => {
      cancelled = true
    }
  }, [filter, search, refreshKey])

  return { plans, isLoading, error, refresh }
}
