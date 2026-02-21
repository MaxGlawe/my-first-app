"use client"

import { useState, useEffect, useCallback } from "react"
import type { CourseEnrollment } from "@/types/course"

interface UseCourseEnrollmentsResult {
  enrollments: CourseEnrollment[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useCourseEnrollments(courseId: string | null): UseCourseEnrollmentsResult {
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    if (!courseId) {
      setEnrollments([])
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function fetchEnrollments() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/courses/${courseId}/enrollments`)

        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Einschreibungen konnten nicht geladen werden.")
          return
        }

        const json = await res.json()
        setEnrollments(json.enrollments ?? [])
      } catch {
        if (!cancelled) {
          setError("Ein unerwarteter Fehler ist aufgetreten.")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchEnrollments()
    return () => { cancelled = true }
  }, [courseId, refreshKey])

  return { enrollments, isLoading, error, refresh }
}
