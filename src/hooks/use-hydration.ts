"use client"

import { useCallback, useEffect, useState } from "react"

export interface HydrationHistoryEntry {
  entry_date: string
  glasses_count: number
  goal_glasses: number
}

interface HydrationState {
  glasses: number
  goal: number
  today: string
  history: HydrationHistoryEntry[]
}

interface UseHydrationResult {
  state: HydrationState | null
  isLoading: boolean
  isUpdating: boolean
  error: string | null
  add: () => Promise<void>
  remove: () => Promise<void>
  refresh: () => void
}

export function useHydration(): UseHydrationResult {
  const [state, setState] = useState<HydrationState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetch("/api/me/hydration")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return
        if (json.error) {
          setError(json.error)
        } else {
          setState(json)
          setError(null)
        }
      })
      .catch(() => {
        if (!cancelled) setError("Netzwerkfehler beim Laden der Hydration.")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const update = useCallback(async (action: "add" | "remove") => {
    setIsUpdating(true)
    try {
      // Optimistic UI — snappier feel on mobile
      setState((prev) => {
        if (!prev) return prev
        const next =
          action === "add"
            ? Math.min(prev.glasses + 1, 20)
            : Math.max(prev.glasses - 1, 0)
        return { ...prev, glasses: next }
      })

      const res = await fetch("/api/me/hydration", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? "Aktualisierung fehlgeschlagen.")
        // Rollback by re-fetching
        refresh()
        return
      }
      setState((prev) => (prev ? { ...prev, glasses: json.glasses, goal: json.goal } : prev))
    } catch {
      setError("Netzwerkfehler.")
      refresh()
    } finally {
      setIsUpdating(false)
    }
  }, [refresh])

  const add = useCallback(() => update("add"), [update])
  const remove = useCallback(() => update("remove"), [update])

  return { state, isLoading, isUpdating, error, add, remove, refresh }
}
