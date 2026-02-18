"use client"

import { useState, useEffect, useCallback } from "react"
import type { DiagnoseRecord } from "@/types/diagnose"

interface UseDiagnoseListResult {
  records: DiagnoseRecord[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useDiagnoseRecords(patientId: string): UseDiagnoseListResult {
  const [records, setRecords] = useState<DiagnoseRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    if (!patientId) return
    let cancelled = false

    async function fetchRecords() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/patients/${patientId}/diagnoses`)

        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Befunde konnten nicht geladen werden.")
          return
        }

        const json = await res.json()
        setRecords(json.records ?? [])
      } catch {
        if (!cancelled) setError("Ein unerwarteter Fehler ist aufgetreten.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchRecords()
    return () => {
      cancelled = true
    }
  }, [patientId, refreshKey])

  return { records, isLoading, error, refresh }
}

interface UseDiagnoseRecordResult {
  record: DiagnoseRecord | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useDiagnoseRecord(
  patientId: string,
  befundId: string
): UseDiagnoseRecordResult {
  const [record, setRecord] = useState<DiagnoseRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    if (!patientId || !befundId) return
    let cancelled = false

    async function fetchRecord() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/patients/${patientId}/diagnoses/${befundId}`)

        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Befund konnte nicht geladen werden.")
          return
        }

        const json = await res.json()
        setRecord(json.record ?? null)
      } catch {
        if (!cancelled) setError("Ein unerwarteter Fehler ist aufgetreten.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchRecord()
    return () => {
      cancelled = true
    }
  }, [patientId, befundId, refreshKey])

  return { record, isLoading, error, refresh }
}
