"use client"

import { useState, useEffect, useCallback } from "react"
import type { PatientAssignment } from "@/types/hausaufgaben"

// Extended assignment type for PROJ-11 patient app
export interface PatientAppAssignment extends PatientAssignment {
  plan: {
    id: string
    name: string
    beschreibung: string | null
    plan_phases: Array<{
      id: string
      name: string
      dauer_wochen: number
      order: number
      plan_units: Array<{
        id: string
        name: string
        order: number
        plan_exercises: Array<{
          id: string
          unit_id: string
          exercise_id: string
          order: number
          params: {
            saetze: number
            wiederholungen?: number | null
            dauer_sekunden?: number | null
            pause_sekunden: number
            intensitaet_prozent?: number | null
            anmerkung?: string | null
          }
          is_archived_exercise: boolean
          exercises: {
            id: string
            name: string
            beschreibung: string | null
            ausfuehrung: Array<{ nummer: number; beschreibung: string }> | null
            muskelgruppen: string[]
            media_url: string | null
            media_type: "image" | "video" | null
          } | null
        }>
      }>
    }>
  } | null
  completed_dates: string[]
  is_training_today: boolean
  completed_today: boolean
  next_training_day: string | null
}

// ── usePatientApp ─────────────────────────────────────────────────────────────

interface UsePatientAppResult {
  assignments: PatientAppAssignment[]
  patientId: string | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function usePatientApp(): UsePatientAppResult {
  const [assignments, setAssignments] = useState<PatientAppAssignment[]>([])
  const [patientId, setPatientId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false

    async function fetch_() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/me/assignments")
        if (cancelled) return
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Trainingsdaten konnten nicht geladen werden.")
          return
        }
        const json = await res.json()
        setAssignments(json.assignments ?? [])
        setPatientId(json.patientId ?? null)
      } catch {
        if (!cancelled) setError("Ein unerwarteter Fehler ist aufgetreten.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetch_()
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  return { assignments, patientId, isLoading, error, refresh }
}

// ── Derived selectors ─────────────────────────────────────────────────────────

/** Returns only assignments that are active AND have training today */
export function getTodayAssignments(
  assignments: PatientAppAssignment[]
): PatientAppAssignment[] {
  return assignments.filter(
    (a) => a.status === "aktiv" && a.is_training_today
  )
}

/** Returns all active assignments */
export function getActiveAssignments(
  assignments: PatientAppAssignment[]
): PatientAppAssignment[] {
  return assignments.filter((a) => a.status === "aktiv")
}

/** Returns expired / inactive assignments */
export function getPastAssignments(
  assignments: PatientAppAssignment[]
): PatientAppAssignment[] {
  return assignments.filter((a) => a.status !== "aktiv")
}

/** 7-day compliance averaged across all active assignments */
export function overallCompliance7Days(
  assignments: PatientAppAssignment[]
): number {
  const active = getActiveAssignments(assignments)
  if (active.length === 0) return 0
  const sum = active.reduce((acc, a) => acc + (a.compliance_7days ?? 0), 0)
  return Math.round(sum / active.length)
}
