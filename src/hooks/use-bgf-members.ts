"use client"

import { useState, useEffect, useCallback } from "react"
import type { OrganizationMember } from "@/types/bgf"

interface UseMembersOptions {
  orgId: string
  search?: string
  status?: string
  abteilung?: string
}

interface UseMembersResult {
  members: OrganizationMember[]
  totalCount: number
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useBgfMembers(options: UseMembersOptions): UseMembersResult {
  const { orgId, search = "", status, abteilung } = options

  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    if (!orgId) return
    let cancelled = false

    async function fetchMembers() {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (search.trim()) params.set("search", search.trim())
        if (status) params.set("status", status)
        if (abteilung) params.set("abteilung", abteilung)

        const res = await fetch(`/api/bgf/organizations/${orgId}/members?${params.toString()}`)

        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Mitglieder konnten nicht geladen werden.")
          return
        }

        const data = await res.json()
        if (!cancelled) {
          setMembers(data.members ?? [])
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

    fetchMembers()
    return () => { cancelled = true }
  }, [orgId, search, status, abteilung, refreshKey])

  return { members, totalCount, isLoading, error, refresh }
}
