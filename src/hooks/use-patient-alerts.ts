"use client"

/**
 * PROJ-17: Patienten-Ampelsystem
 * Fetches and caches patient alert data from /api/os/patient-alerts.
 */

import { useState, useEffect, useCallback } from "react"
import type { PatientAlert } from "@/app/api/os/patient-alerts/route"

export type { PatientAlert }
export type { AmpelStatus } from "@/app/api/os/patient-alerts/route"

interface UsePatientAlertsResult {
  alerts: PatientAlert[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function usePatientAlerts(): UsePatientAlertsResult {
  const [alerts, setAlerts] = useState<PatientAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/os/patient-alerts")
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? "Alerts konnten nicht geladen werden.")
        return
      }
      const json = await res.json()
      setAlerts(json.alerts ?? [])
    } catch {
      setError("Ein unerwarteter Fehler ist aufgetreten.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  // Refresh when tab becomes visible again
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") fetchAlerts()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [fetchAlerts])

  return { alerts, isLoading, error, refresh: fetchAlerts }
}

/**
 * Lightweight hook that only returns each patient's Ampel status.
 * Used by PatientTable to show the colored dot without loading full alert data.
 */
export function usePatientAmpelStatus(): {
  statusMap: Map<string, "ROT" | "GELB" | "GRUEN">
  isLoading: boolean
} {
  const { alerts, isLoading } = usePatientAlerts()
  const statusMap = new Map(alerts.map((a) => [a.patientId, a.status]))
  return { statusMap, isLoading }
}
