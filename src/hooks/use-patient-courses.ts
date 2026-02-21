"use client"

import { useState, useEffect, useCallback } from "react"
import type { PatientCourseEnrollment } from "@/types/course"

interface UsePatientCoursesResult {
  courses: PatientCourseEnrollment[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function usePatientCourses(): UsePatientCoursesResult {
  const [courses, setCourses] = useState<PatientCourseEnrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false

    async function fetchCourses() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch("/api/me/courses")

        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Kurse konnten nicht geladen werden.")
          return
        }

        const json = await res.json()
        setCourses(json.courses ?? [])
      } catch {
        if (!cancelled) {
          setError("Ein unerwarteter Fehler ist aufgetreten.")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchCourses()
    return () => { cancelled = true }
  }, [refreshKey])

  return { courses, isLoading, error, refresh }
}
