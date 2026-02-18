"use client"

import { useState, useEffect, useCallback } from "react"

export interface Appointment {
  id: string
  patient_id: string
  booking_system_appointment_id: string
  scheduled_at: string
  duration_minutes: number
  therapist_name: string | null
  service_name: string | null
  status: "scheduled" | "cancelled" | "completed"
  synced_at: string
}

export interface AppointmentsResult {
  appointments: Appointment[]
  isLoading: boolean
  error: string | null
  isStale: boolean
  lastSyncedAt: string | null
  refresh: () => void
}

const STALE_HOURS = 24

function isSynced(syncedAt: string): boolean {
  const diff = Date.now() - new Date(syncedAt).getTime()
  return diff < STALE_HOURS * 60 * 60 * 1000
}

export function useAppointments(patientId: string): AppointmentsResult {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    if (!patientId) return

    let cancelled = false

    async function fetchAppointments() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/patients/${patientId}/appointments`)

        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Termine konnten nicht geladen werden.")
          return
        }

        const json = await res.json()
        const fetched: Appointment[] = json.appointments ?? []
        setAppointments(fetched)

        // Derive the most recent synced_at timestamp
        const syncedAts = fetched.map((a) => a.synced_at).filter(Boolean)
        if (syncedAts.length > 0) {
          const latest = syncedAts.reduce((a, b) =>
            new Date(a) > new Date(b) ? a : b
          )
          setLastSyncedAt(latest)
        } else {
          setLastSyncedAt(null)
        }
      } catch {
        if (!cancelled) {
          setError("Buchungstool nicht erreichbar.")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchAppointments()
    return () => {
      cancelled = true
    }
  }, [patientId, refreshKey])

  const isStale =
    lastSyncedAt !== null ? !isSynced(lastSyncedAt) : appointments.length > 0

  return { appointments, isLoading, error, isStale, lastSyncedAt, refresh }
}

export interface WebhookEvent {
  id: string
  event_type: string
  received_at: string
  payload: Record<string, unknown>
  processing_status: "success" | "error" | "duplicate"
  error_message: string | null
}

export interface WebhookEventsResult {
  events: WebhookEvent[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useWebhookEvents(): WebhookEventsResult {
  const [events, setEvents] = useState<WebhookEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false

    async function fetchEvents() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch("/api/admin/webhook-events")

        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Events konnten nicht geladen werden.")
          return
        }

        const json = await res.json()
        setEvents(json.events ?? [])
      } catch {
        if (!cancelled) {
          setError("Ein unerwarteter Fehler ist aufgetreten.")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchEvents()
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  return { events, isLoading, error, refresh }
}
