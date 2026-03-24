"use client"

import { useState, useEffect, useCallback } from "react"
import type { Organization } from "@/types/bgf"

interface OrgStats {
  total_members: number
  aktive_members: number
  ist_analyse_quote: number
}

interface UseOrganizationResult {
  organization: Organization | null
  stats: OrgStats | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useBgfOrganization(orgId: string): UseOrganizationResult {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [stats, setStats] = useState<OrgStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    if (!orgId) return
    let cancelled = false

    async function fetchOrganization() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/bgf/organizations/${orgId}`)

        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Organisation konnte nicht geladen werden.")
          return
        }

        const data = await res.json()
        if (!cancelled) {
          setOrganization(data.organization ?? null)
          setStats(data.stats ?? null)
        }
      } catch {
        if (!cancelled) {
          setError("Netzwerkfehler. Bitte erneut versuchen.")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchOrganization()
    return () => { cancelled = true }
  }, [orgId, refreshKey])

  return { organization, stats, isLoading, error, refresh }
}
