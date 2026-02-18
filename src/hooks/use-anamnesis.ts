"use client"

import { useState, useEffect, useCallback } from "react"
import type { AnamnesisRecord } from "@/types/anamnesis"

interface UseAnamnesisListResult {
  records: AnamnesisRecord[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useAnamnesisRecords(patientId: string): UseAnamnesisListResult {
  const [records, setRecords] = useState<AnamnesisRecord[]>([])
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
        const res = await fetch(`/api/patients/${patientId}/anamnesis`)

        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Anamnesen konnten nicht geladen werden.")
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

interface UseAnamnesisRecordResult {
  record: AnamnesisRecord | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useAnamnesisRecord(
  patientId: string,
  recordId: string
): UseAnamnesisRecordResult {
  const [record, setRecord] = useState<AnamnesisRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    if (!patientId || !recordId) return
    let cancelled = false

    async function fetchRecord() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/patients/${patientId}/anamnesis/${recordId}`)

        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Anamnesebogen konnte nicht geladen werden.")
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
  }, [patientId, recordId, refreshKey])

  return { record, isLoading, error, refresh }
}
