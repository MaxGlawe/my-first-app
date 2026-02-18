"use client"

import { useState, useEffect, useCallback } from "react"
import type { PatientAssignment, PatientComplianceRow } from "@/types/hausaufgaben"

// ── Patient Assignments (per patient) ─────────────────────────────────────────

interface UseAssignmentsResult {
  assignments: PatientAssignment[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useAssignments(patientId: string): UseAssignmentsResult {
  const [assignments, setAssignments] = useState<PatientAssignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    if (!patientId) return
    let cancelled = false

    async function fetchAssignments() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/patients/${patientId}/assignments`)
        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Hausaufgaben konnten nicht geladen werden.")
          return
        }

        const json = await res.json()
        setAssignments(json.assignments ?? [])
      } catch {
        if (!cancelled) setError("Ein unerwarteter Fehler ist aufgetreten.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchAssignments()
    return () => {
      cancelled = true
    }
  }, [patientId, refreshKey])

  return { assignments, isLoading, error, refresh }
}

// ── Compliance Dashboard ───────────────────────────────────────────────────────

interface UseComplianceDashboardResult {
  rows: PatientComplianceRow[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useComplianceDashboard(): UseComplianceDashboardResult {
  const [rows, setRows] = useState<PatientComplianceRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false

    async function fetchDashboard() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch("/api/hausaufgaben/dashboard")
        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Dashboard konnte nicht geladen werden.")
          return
        }

        const json = await res.json()
        setRows(json.rows ?? [])
      } catch {
        if (!cancelled) setError("Ein unerwarteter Fehler ist aufgetreten.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchDashboard()
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  return { rows, isLoading, error, refresh }
}
