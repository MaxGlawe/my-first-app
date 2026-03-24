"use client"

import { useState, useEffect, useCallback } from "react"
import type { VertragTier } from "@/types/bgf"

export interface BgfMembershipState {
  isMember: boolean
  organizationId: string | null
  istAnalyseAbgeschlossen: boolean
  memberStatus: "eingeladen" | "aktiv" | "pausiert" | "deaktiviert" | null
  vertragTier: VertragTier | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useBgfMembership(): BgfMembershipState {
  const [state, setState] = useState<Omit<BgfMembershipState, "refresh">>({
    isMember: false,
    organizationId: null,
    istAnalyseAbgeschlossen: false,
    memberStatus: null,
    vertragTier: null,
    isLoading: true,
    error: null,
  })
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false

    async function fetchMembership() {
      setState((s) => ({ ...s, isLoading: true, error: null }))

      try {
        const res = await fetch("/api/bgf/my-membership")
        const data = await res.json()

        if (cancelled) return

        if (data.isMember) {
          setState({
            isMember: true,
            organizationId: data.organizationId,
            istAnalyseAbgeschlossen: data.istAnalyseAbgeschlossen,
            memberStatus: data.memberStatus,
            vertragTier: data.vertragTier ?? null,
            isLoading: false,
            error: null,
          })
        } else {
          setState({
            isMember: false,
            organizationId: null,
            istAnalyseAbgeschlossen: false,
            memberStatus: null,
            vertragTier: null,
            isLoading: false,
            error: null,
          })
        }
      } catch {
        if (!cancelled) {
          setState((s) => ({
            ...s,
            isLoading: false,
            error: "Netzwerkfehler.",
          }))
        }
      }
    }

    fetchMembership()
    return () => { cancelled = true }
  }, [refreshKey])

  return { ...state, refresh }
}
