"use client"

import { useState, useEffect, useCallback } from "react"
import type { DailyInsight } from "@/types/education"

interface UseDailyInsightResult {
  insight: DailyInsight | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useDailyInsight(): UseDailyInsightResult {
  const [insight, setInsight] = useState<DailyInsight | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/me/daily-insight")
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Fehler beim Laden des Tagesinsights.")
      }
      const data = await res.json()
      setInsight(data.insight ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch_()
  }, [fetch_])

  return { insight, loading, error, refresh: fetch_ }
}
