"use client"

import { useState, useEffect, useCallback } from "react"
import type { Course, CourseLesson } from "@/types/course"

interface UseCourseResult {
  course: Course | null
  lessons: CourseLesson[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useCourse(courseId: string | null): UseCourseResult {
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<CourseLesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    if (!courseId) {
      setCourse(null)
      setLessons([])
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function fetchCourse() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/courses/${courseId}`)

        if (cancelled) return

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Kurs konnte nicht geladen werden.")
          return
        }

        const json = await res.json()
        setCourse(json.course ?? null)
        setLessons(json.lessons ?? [])
      } catch {
        if (!cancelled) {
          setError("Ein unerwarteter Fehler ist aufgetreten.")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchCourse()
    return () => { cancelled = true }
  }, [courseId, refreshKey])

  return { course, lessons, isLoading, error, refresh }
}
