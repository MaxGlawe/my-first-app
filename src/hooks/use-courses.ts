"use client"

import { useState, useEffect, useCallback } from "react"
import type { CourseListItem, CourseFilter, CourseKategorie } from "@/types/course"

interface UseCoursesOptions {
  filter?: CourseFilter
  kategorie?: CourseKategorie | ""
  search?: string
}

interface UseCoursesResult {
  courses: CourseListItem[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useCourses(options: UseCoursesOptions = {}): UseCoursesResult {
  const { filter = "alle", kategorie = "", search = "" } = options

  const [courses, setCourses] = useState<CourseListItem[]>([])
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
        const params = new URLSearchParams()
        if (filter && filter !== "alle") params.set("status", filter)
        if (kategorie) params.set("kategorie", kategorie)
        if (search.trim()) params.set("search", search.trim())

        const res = await fetch(`/api/courses?${params.toString()}`)

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
  }, [filter, kategorie, search, refreshKey])

  return { courses, isLoading, error, refresh }
}
