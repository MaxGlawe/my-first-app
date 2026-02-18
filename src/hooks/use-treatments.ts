"use client"

import { useState, useEffect, useCallback } from "react"
import type { TreatmentSession } from "@/types/behandlung"

// ── List hook ─────────────────────────────────────────────────────────────────

interface UseTreatmentsResult {
  sessions: TreatmentSession[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useTreatments(patientId: string): UseTreatmentsResult {
  const [sessions, setSessions] = useState<TreatmentSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    if (!patientId) return
    let cancelled = false

    async function fetchSessions() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/patients/${patientId}/treatments`)

        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Behandlungen konnten nicht geladen werden.")
          return
        }

        const json = await res.json()
        setSessions(json.sessions ?? [])
      } catch {
        if (!cancelled) setError("Ein unerwarteter Fehler ist aufgetreten.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchSessions()
    return () => {
      cancelled = true
    }
  }, [patientId, refreshKey])

  return { sessions, isLoading, error, refresh }
}

// ── Single session hook ────────────────────────────────────────────────────────

interface UseTreatmentResult {
  session: TreatmentSession | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useTreatment(
  patientId: string,
  sessionId: string
): UseTreatmentResult {
  const [session, setSession] = useState<TreatmentSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    if (!patientId || !sessionId) return
    let cancelled = false

    async function fetchSession() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(
          `/api/patients/${patientId}/treatments/${sessionId}`
        )

        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Behandlung konnte nicht geladen werden.")
          return
        }

        const json = await res.json()
        setSession(json.session ?? null)
      } catch {
        if (!cancelled) setError("Ein unerwarteter Fehler ist aufgetreten.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchSession()
    return () => {
      cancelled = true
    }
  }, [patientId, sessionId, refreshKey])

  return { session, isLoading, error, refresh }
}
