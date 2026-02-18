"use client"

// PROJ-6: KI-Arztbericht-Generator

import { useState, useEffect, useCallback } from "react"
import type { MedicalReport, CreateReportPayload, UpdateReportPayload } from "@/types/arztbericht"

// ── List hook ─────────────────────────────────────────────────────────────────

interface UseReportsResult {
  reports: MedicalReport[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useReports(patientId: string): UseReportsResult {
  const [reports, setReports] = useState<MedicalReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    if (!patientId) return
    let cancelled = false

    async function fetchReports() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/patients/${patientId}/reports`)

        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Berichte konnten nicht geladen werden.")
          return
        }

        const json = await res.json()
        setReports(json.reports ?? [])
      } catch {
        if (!cancelled) setError("Ein unerwarteter Fehler ist aufgetreten.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchReports()
    return () => {
      cancelled = true
    }
  }, [patientId, refreshKey])

  return { reports, isLoading, error, refresh }
}

// ── Single report hook ────────────────────────────────────────────────────────

interface UseReportResult {
  report: MedicalReport | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useReport(
  patientId: string,
  reportId: string
): UseReportResult {
  const [report, setReport] = useState<MedicalReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    if (!patientId || !reportId) return
    let cancelled = false

    async function fetchReport() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/patients/${patientId}/reports/${reportId}`)

        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Bericht konnte nicht geladen werden.")
          return
        }

        const json = await res.json()
        setReport(json.report ?? null)
      } catch {
        if (!cancelled) setError("Ein unerwarteter Fehler ist aufgetreten.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchReport()
    return () => {
      cancelled = true
    }
  }, [patientId, reportId, refreshKey])

  return { report, isLoading, error, refresh }
}

// ── Data availability hook ────────────────────────────────────────────────────

interface DataAvailability {
  treatmentCount: number
  befundCount: number
  diagnosisCount: number
  anamnesisCount: number
}

interface UseDataAvailabilityResult {
  data: DataAvailability | null
  isLoading: boolean
}

export function useDataAvailability(
  patientId: string,
  dateFrom: string,
  dateTo: string
): UseDataAvailabilityResult {
  const [data, setData] = useState<DataAvailability | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!patientId || !dateFrom || !dateTo) {
      setData(null)
      return
    }
    let cancelled = false

    async function fetchAvailability() {
      setIsLoading(true)

      try {
        const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo })
        const res = await fetch(
          `/api/patients/${patientId}/reports/data-availability?${params}`
        )

        if (cancelled) return

        if (!res.ok) return

        const json = await res.json()
        setData(json)
      } catch {
        // Silently fail — non-critical
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchAvailability()
    return () => {
      cancelled = true
    }
  }, [patientId, dateFrom, dateTo])

  return { data, isLoading }
}
