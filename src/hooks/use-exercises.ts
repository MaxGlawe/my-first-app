"use client"

import { useState, useEffect, useCallback } from "react"
import type { Exercise, ExerciseFilter } from "@/types/exercise"

const PAGE_SIZE = 24

interface UseExercisesOptions {
  filter: ExerciseFilter
  page?: number
}

interface UseExercisesResult {
  exercises: Exercise[]
  totalCount: number
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useExercises(options: UseExercisesOptions): UseExercisesResult {
  const { filter, page = 1 } = options

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false

    async function fetchExercises() {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(PAGE_SIZE),
          quelle: filter.quelle,
        })

        if (filter.search.trim()) {
          params.set("search", filter.search.trim())
        }
        if (filter.schwierigkeitsgrad) {
          params.set("schwierigkeitsgrad", filter.schwierigkeitsgrad)
        }
        if (filter.muskelgruppen.length > 0) {
          params.set("muskelgruppen", filter.muskelgruppen.join(","))
        }

        const res = await fetch(`/api/exercises?${params.toString()}`)

        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Übungen konnten nicht geladen werden.")
          return
        }

        const json = await res.json()
        setExercises(json.exercises ?? [])
        setTotalCount(json.totalCount ?? 0)
      } catch {
        if (!cancelled) {
          setError("Ein unerwarteter Fehler ist aufgetreten.")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchExercises()
    return () => {
      cancelled = true
    }
  }, [filter.search, filter.schwierigkeitsgrad, filter.muskelgruppen, filter.quelle, page, refreshKey])

  return { exercises, totalCount, isLoading, error, refresh }
}
