"use client"

import { useCallback, useEffect, useState } from "react"

export interface PathSummary {
  id: string
  slug: string
  name: string
  subtitle: string | null
  description: string | null
  icon: string | null
  color: string
  duration_days: number
  target_audience: string | null
  sort_order: number
  hero_image: string | null
  enrollment: {
    id: string
    status: "active" | "completed" | "abandoned"
    enrolled_at: string
    completed_at: string | null
    current_day: number
    completed_days: number
  } | null
}

interface UsePathsResult {
  paths: PathSummary[] | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function usePaths(): UsePathsResult {
  const [paths, setPaths] = useState<PathSummary[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetch("/api/me/paths")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return
        if (json.error) {
          setError(json.error)
        } else {
          setPaths(json.paths ?? [])
          setError(null)
        }
      })
      .catch(() => {
        if (!cancelled) setError("Netzwerkfehler beim Laden.")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  return { paths, isLoading, error, refresh }
}

// ── Detail hook ────────────────────────────────────────────────────────────

export interface PathQuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string | null
}

export interface PathLesson {
  day_number: number
  title: string
  content: string
  task: string | null
  reflection_question: string | null
  quizzes: PathQuizQuestion[]
}

export interface PathDetail {
  path: {
    id: string
    slug: string
    name: string
    subtitle: string | null
    description: string | null
    icon: string | null
    color: string
    duration_days: number
    target_audience: string | null
    intro_content: string | null
    hero_image: string | null
  }
  patient_name: string
  lessons: PathLesson[]
  enrollment: {
    id: string
    status: "active" | "completed"
    enrolled_at: string
    completed_at: string | null
    current_day: number
    completed_days: number[]
    progress: Array<{ day_number: number; completed_at: string; reflection_answer: string | null }>
    next_available_at: string | null
  } | null
}

interface UsePathDetailResult {
  data: PathDetail | null
  isLoading: boolean
  error: string | null
  enroll: () => Promise<void>
  completeDay: (
    dayNumber: number,
    reflection: string | null,
    quizScore: number,
    quizTotal: number
  ) => Promise<{ pathCompleted: boolean }>
  abandon: () => Promise<void>
  refresh: () => void
}

export function usePathDetail(slug: string): UsePathDetailResult {
  const [data, setData] = useState<PathDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetch(`/api/me/paths/${slug}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return
        if (json.error) {
          setError(json.error)
        } else {
          setData(json)
          setError(null)
        }
      })
      .catch(() => {
        if (!cancelled) setError("Netzwerkfehler.")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug, refreshKey])

  const enroll = useCallback(async () => {
    const res = await fetch(`/api/me/paths/${slug}/enroll`, { method: "POST" })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j.error ?? "Anmeldung fehlgeschlagen.")
    }
    refresh()
  }, [slug, refresh])

  const completeDay = useCallback(
    async (
      dayNumber: number,
      reflection: string | null,
      quizScore: number,
      quizTotal: number
    ) => {
      const res = await fetch(`/api/me/paths/${slug}/complete-day`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day_number: dayNumber,
          reflection_answer: reflection,
          quiz_score: quizScore,
          quiz_total: quizTotal,
        }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error ?? "Speichern fehlgeschlagen.")
      refresh()
      return { pathCompleted: !!j.path_completed }
    },
    [slug, refresh]
  )

  const abandon = useCallback(async () => {
    const res = await fetch(`/api/me/paths/${slug}/enroll`, { method: "DELETE" })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j.error ?? "Abbruch fehlgeschlagen.")
    }
    refresh()
  }, [slug, refresh])

  return { data, isLoading, error, enroll, completeDay, abandon, refresh }
}
