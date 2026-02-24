"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt: string | null
  progress: number
  target: number
  current: number
}

interface StreakData {
  streak: number
  weeklyGoal: number
  weeklyDone: number
  totalCompletions: number
  achievements: Achievement[]
}

interface UseStreakResult extends StreakData {
  isLoading: boolean
  error: string | null
  refresh: () => void
  /** Newly unlocked achievement (for MilestonePopup), null if none */
  newUnlock: Achievement | null
  /** Dismiss the current milestone popup */
  dismissUnlock: () => void
}

const STORAGE_KEY = "praxis_unlocked_achievements"

/** Get previously seen unlocked achievement IDs from localStorage */
function getSeenUnlocks(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return new Set(JSON.parse(stored) as string[])
  } catch { /* ignore */ }
  return new Set()
}

/** Save seen unlocked achievement IDs to localStorage */
function saveSeenUnlocks(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
  } catch { /* ignore */ }
}

export function useStreak(): UseStreakResult {
  const [data, setData] = useState<StreakData>({
    streak: 0,
    weeklyGoal: 0,
    weeklyDone: 0,
    totalCompletions: 0,
    achievements: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [newUnlock, setNewUnlock] = useState<Achievement | null>(null)

  // Queue of newly unlocked achievements to show one-by-one
  const unlockQueue = useRef<Achievement[]>([])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  const dismissUnlock = useCallback(() => {
    setNewUnlock(null)
    // Show next in queue if any
    if (unlockQueue.current.length > 0) {
      const next = unlockQueue.current.shift()!
      setTimeout(() => setNewUnlock(next), 500)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/me/streak")
        if (cancelled) return
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Streak konnte nicht geladen werden.")
          return
        }
        const json = await res.json()
        const achievements: Achievement[] = json.achievements ?? []

        setData({
          streak: json.streak ?? 0,
          weeklyGoal: json.weeklyGoal ?? 0,
          weeklyDone: json.weeklyDone ?? 0,
          totalCompletions: json.totalCompletions ?? 0,
          achievements,
        })

        // Detect newly unlocked achievements
        const seen = getSeenUnlocks()
        const newlyUnlocked = achievements.filter(
          (a) => a.unlocked && !seen.has(a.id)
        )

        if (newlyUnlocked.length > 0) {
          // Mark all as seen
          for (const a of newlyUnlocked) seen.add(a.id)
          saveSeenUnlocks(seen)

          // Queue them for display
          unlockQueue.current = newlyUnlocked.slice(1)
          if (!cancelled) setNewUnlock(newlyUnlocked[0])
        }
      } catch {
        if (!cancelled) setError("Verbindungsfehler.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [refreshKey])

  return { ...data, isLoading, error, refresh, newUnlock, dismissUnlock }
}
