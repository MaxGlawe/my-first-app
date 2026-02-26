"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"

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

const POLL_INTERVAL = 30_000 // 30 seconds

export function useDashboardStats(): UseDashboardStatsResult {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const initialLoadDone = useRef(false)

  // Silent fetch — only shows loading spinner on first load
  const fetchStats = useCallback(async () => {
    if (!initialLoadDone.current) {
      setIsLoading(true)
      setError(null)
    }

    try {
      const res = await fetch("/api/os/dashboard-stats")
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        if (!initialLoadDone.current) {
          setError(body.error ?? "Dashboard-Daten konnten nicht geladen werden.")
        }
        return
      }
      const json = await res.json()
      setStats(json)
    } catch {
      if (!initialLoadDone.current) {
        setError("Ein unerwarteter Fehler ist aufgetreten.")
      }
    } finally {
      if (!initialLoadDone.current) {
        setIsLoading(false)
        initialLoadDone.current = true
      }
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Polling: refresh every 30 seconds (reliable fallback)
  useEffect(() => {
    const interval = setInterval(fetchStats, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchStats])

  // Realtime: instant refresh when new chat messages arrive
  useEffect(() => {
    const channel = supabase
      .channel("dashboard:chat-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        () => fetchStats()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchStats])

  const refresh = useCallback(() => { fetchStats() }, [fetchStats])

  return { stats, isLoading, error, refresh }
}
