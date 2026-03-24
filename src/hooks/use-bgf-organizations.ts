"use client"

import { useState, useEffect, useCallback } from "react"
import type { Organization } from "@/types/bgf"

interface UseOrganizationsOptions {
  status?: string
}

interface UseOrganizationsResult {
  organizations: Organization[]
  totalCount: number
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useBgfOrganizations(options: UseOrganizationsOptions = {}): UseOrganizationsResult {
  const { status } = options

  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false

    async function fetchOrganizations() {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (status) params.set("status", status)

        const res = await fetch(`/api/bgf/organizations?${params.toString()}`)

        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Organisationen konnten nicht geladen werden.")
          return
        }

        const data = await res.json()
        if (!cancelled) {
          setOrganizations(data.organizations ?? [])
          setTotalCount(data.totalCount ?? 0)
        }
      } catch {
        if (!cancelled) {
          setError("Netzwerkfehler. Bitte erneut versuchen.")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchOrganizations()
    return () => { cancelled = true }
  }, [status, refreshKey])

  return { organizations, totalCount, isLoading, error, refresh }
}
