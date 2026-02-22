"use client"

import { useState, useEffect, useCallback } from "react"
import type { InvoiceWithPatient } from "@/types/billing"

interface UseInvoicesOptions {
  status?: string
  patientId?: string
}

export function useInvoices(options?: UseInvoicesOptions) {
  const [invoices, setInvoices] = useState<InvoiceWithPatient[]>([])
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

        const url = `/api/admin/invoices${params.toString() ? `?${params}` : ""}`
        const res = await fetch(url)
        if (!res.ok) throw new Error()
        const json = await res.json()
        if (!cancelled) setInvoices(json.data || [])
      } catch {
        if (!cancelled) setInvoices([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [refreshKey, options?.status, options?.patientId])

  return { invoices, loading, refresh }
}
