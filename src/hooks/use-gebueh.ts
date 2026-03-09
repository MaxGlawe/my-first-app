"use client"

import { useState, useEffect } from "react"
import type { GebuehCode } from "@/types/billing"

export function useGebueh() {
  const [codes, setCodes] = useState<GebuehCode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch("/api/admin/gebueh")
        if (!res.ok) throw new Error()
        const json = await res.json()
        if (!cancelled) setCodes(json.data || [])
      } catch {
        if (!cancelled) setCodes([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { codes, loading }
}
