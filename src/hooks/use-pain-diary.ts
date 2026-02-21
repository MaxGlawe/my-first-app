"use client"

import { useState, useEffect, useCallback } from "react"

export interface PainDiaryEntry {
  id: string
  entry_date: string
  pain_level: number
  wellbeing: number
  notes: string | null
  created_at: string
}

interface UsePainDiaryResult {
  entries: PainDiaryEntry[]
  todayEntry: PainDiaryEntry | null
  isLoading: boolean
  error: string | null
  refresh: () => void
  saveEntry: (data: {
    pain_level: number
    wellbeing: number
    notes?: string | null
  }) => Promise<boolean>
  isSaving: boolean
}

export function usePainDiary(): UsePainDiaryResult {
  const [entries, setEntries] = useState<PainDiaryEntry[]>([])
  const [todayEntry, setTodayEntry] = useState<PainDiaryEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/me/pain-diary")
        if (cancelled) return
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Einträge konnten nicht geladen werden.")
          return
        }
        const json = await res.json()
        setEntries(json.entries ?? [])
        setTodayEntry(json.todayEntry ?? null)
      } catch {
        if (!cancelled) setError("Verbindungsfehler.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [refreshKey])

  const saveEntry = useCallback(
    async (data: {
      pain_level: number
      wellbeing: number
      notes?: string | null
    }): Promise<boolean> => {
      setIsSaving(true)
      try {
        const res = await fetch("/api/me/pain-diary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!res.ok) return false
        refresh()
        return true
      } catch {
        return false
      } finally {
        setIsSaving(false)
      }
    },
    [refresh]
  )

  return { entries, todayEntry, isLoading, error, refresh, saveEntry, isSaving }
}

// ── Therapist hook: fetch pain diary for a specific patient ──────────────────

interface UsePatientPainDiaryResult {
  entries: PainDiaryEntry[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function usePatientPainDiary(patientId: string): UsePatientPainDiaryResult {
  const [entries, setEntries] = useState<PainDiaryEntry[]>([])
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
        const res = await fetch(`/api/patients/${patientId}/pain-diary`)
        if (cancelled) return
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Einträge konnten nicht geladen werden.")
          return
        }
        const json = await res.json()
        setEntries(json.entries ?? [])
      } catch {
        if (!cancelled) setError("Verbindungsfehler.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [patientId, refreshKey])

  return { entries, isLoading, error, refresh }
}
