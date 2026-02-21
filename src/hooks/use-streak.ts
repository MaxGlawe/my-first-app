"use client"

import { useState, useEffect, useCallback } from "react"

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt: string | null
  progress: number
  target: number
  current: number
}

interface StreakData {
  streak: number
  weeklyGoal: number
  weeklyDone: number
  totalCompletions: number
  achievements: Achievement[]
}

interface UseStreakResult extends StreakData {
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useStreak(): UseStreakResult {
  const [data, setData] = useState<StreakData>({
    streak: 0,
    weeklyGoal: 0,
    weeklyDone: 0,
    totalCompletions: 0,
    achievements: [],
  })
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
        const res = await fetch("/api/me/streak")
        if (cancelled) return
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Streak konnte nicht geladen werden.")
          return
        }
        const json = await res.json()
        setData({
          streak: json.streak ?? 0,
          weeklyGoal: json.weeklyGoal ?? 0,
          weeklyDone: json.weeklyDone ?? 0,
          totalCompletions: json.totalCompletions ?? 0,
          achievements: json.achievements ?? [],
        })
      } catch {
        if (!cancelled) setError("Verbindungsfehler.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [refreshKey])

  return { ...data, isLoading, error, refresh }
}
