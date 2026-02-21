"use client"

import { useState, useEffect, useCallback } from "react"

export interface DashboardStats {
  patientCount: number
  activeAssignments: number
  trainedTodayCount: number
  avgCompliance7d: number
  unreadMessages: number
  firstName: string
}

interface UseDashboardStatsResult {
  stats: DashboardStats | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useDashboardStats(): UseDashboardStatsResult {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch("/api/os/dashboard-stats")
        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Dashboard-Daten konnten nicht geladen werden.")
          return
        }

        const json = await res.json()
        setStats(json)
      } catch {
        if (!cancelled) setError("Ein unerwarteter Fehler ist aufgetreten.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [refreshKey])

  return { stats, isLoading, error, refresh }
}
