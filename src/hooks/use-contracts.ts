"use client"

import { useState, useEffect, useCallback } from "react"
import type { ContractWithPatient } from "@/types/contract"

interface UseContractsOptions {
  status?: string
  patientId?: string
}

export function useContracts(options?: UseContractsOptions) {
  const [contracts, setContracts] = useState<ContractWithPatient[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (options?.status) params.set("status", options.status)
        if (options?.patientId) params.set("patient_id", options.patientId)

        const url = `/api/admin/contracts${params.toString() ? `?${params}` : ""}`
        const res = await fetch(url)
        if (!res.ok) throw new Error()
        const json = await res.json()
        if (!cancelled) setContracts(json.data || [])
      } catch {
        if (!cancelled) setContracts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [refreshKey, options?.status, options?.patientId])

  return { contracts, loading, refresh }
}
