"use client"

import { useState, useEffect, useCallback } from "react"
import type { Patient } from "@/types/patient"

const PAGE_SIZE = 20

interface UsePatientsOptions {
  search?: string
  showArchived?: boolean
  page?: number
}

interface UsePatientsResult {
  patients: Patient[]
  totalCount: number
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function usePatients(options: UsePatientsOptions = {}): UsePatientsResult {
  const { search = "", showArchived = false, page = 1 } = options

  const [patients, setPatients] = useState<Patient[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false

    async function fetchPatients() {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(PAGE_SIZE),
          archived: String(showArchived),
        })
        if (search.trim()) {
          params.set("search", search.trim())
        }

        const res = await fetch(`/api/patients?${params.toString()}`)

        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Patienten konnten nicht geladen werden.")
          return
        }

        const json = await res.json()
        setPatients(json.patients ?? [])
        setTotalCount(json.totalCount ?? 0)
      } catch {
        if (!cancelled) {
          setError("Ein unerwarteter Fehler ist aufgetreten.")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchPatients()
    return () => {
      cancelled = true
    }
  }, [search, showArchived, page, refreshKey])

  return { patients, totalCount, isLoading, error, refresh }
}

interface UsePatientResult {
  patient: Patient | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function usePatient(id: string): UsePatientResult {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function fetchPatient() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/patients/${id}`)

        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Patient konnte nicht geladen werden.")
          return
        }

        const json = await res.json()
        setPatient(json.patient ?? null)
      } catch {
        if (!cancelled) setError("Ein unerwarteter Fehler ist aufgetreten.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchPatient()
    return () => {
      cancelled = true
    }
  }, [id, refreshKey])

  return { patient, isLoading, error, refresh }
}
