"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { VertragTier } from "@/types/bgf"

interface HrAuthResult {
  isLoading: boolean
  isAuthorized: boolean
  organizationId: string | null
  organizationName: string | null
  rolle: "hr_admin" | "hr_viewer" | "geschaeftsfuehrung" | null
  vertragTier: VertragTier | null
}

export function useHrAuth(): HrAuthResult {
  const router = useRouter()
  const [state, setState] = useState<HrAuthResult>({
    isLoading: true,
    isAuthorized: false,
    organizationId: null,
    organizationName: null,
    rolle: null,
    vertragTier: null,
  })

  useEffect(() => {
    let cancelled = false

    async function checkHrAuth() {
      try {
        // Use server-side API that bypasses RLS
        const res = await fetch("/api/bgf/hr-auth")
        const data = await res.json()

        if (cancelled) return

        if (!data.authorized) {
          setState((s) => ({ ...s, isLoading: false, isAuthorized: false }))
          router.push("/login")
          return
        }

        setState({
          isLoading: false,
          isAuthorized: true,
          organizationId: data.organizationId,
          organizationName: data.organizationName,
          rolle: data.rolle,
          vertragTier: data.vertragTier ?? null,
        })
      } catch {
        if (!cancelled) {
          setState((s) => ({ ...s, isLoading: false, isAuthorized: false }))
          router.push("/login")
        }
      }
    }

    checkHrAuth()
    return () => {
      cancelled = true
    }
  }, [router])

  return state
}
