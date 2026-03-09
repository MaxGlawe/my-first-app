"use client"

import { useState, useCallback, useRef, useEffect } from "react"

// ── Session Phase State Machine ──────────────────────────────────────────────

export type SessionPhase =
  | "start"      // Overview + start button
  | "exercise"   // Active exercise (waiting for user action or hold start)
  | "holding"    // Hold timer running
  | "set-done"   // Brief celebration (auto-advances after 500ms)
  | "resting"    // Rest between sets (breathing circle + countdown)
  | "feedback"   // Per-exercise feedback (bottom sheet)
  | "transition" // Slide to next exercise (auto-advances after 600ms)
  | "complete"   // Completion screen

interface SessionModeState {
  phase: SessionPhase
  exerciseIndex: number
  currentSet: number          // 0-indexed current set
  completedSets: number[]     // per exercise: how many sets done
  skipped: number[]
  skipReasons: Record<number, string>
  exerciseFeedback: Record<number, { difficulty?: number; pain_during?: number }>
  startedAt: string | null
  ttsEnabled: boolean
}

interface UseSessionModeOptions {
  totalExercises: number
  getSetsForExercise: (index: number) => number
  getPauseForExercise: (index: number) => number
  storageKey: string
}

const SET_DONE_DELAY = 600
const TRANSITION_DELAY = 700

export function useSessionMode(options: UseSessionModeOptions) {
  const { totalExercises, getSetsForExercise, getPauseForExercise, storageKey } = options

  const [state, setState] = useState<SessionModeState>(() => {
    // Try to restore in-progress session from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.phase === "complete") {
            // Previous session was completed — discard and start fresh
            localStorage.removeItem(storageKey)
          } else {
            return { ...parsed, phase: "start" }
          }
        } catch { /* ignore */ }
      }
    }
    return {
      phase: "start",
      exerciseIndex: 0,
      currentSet: 0,
      completedSets: Array(totalExercises).fill(0),
      skipped: [],
      skipReasons: {},
      exerciseFeedback: {},
      startedAt: null,
      ttsEnabled: false,
    }
  })

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Persist to localStorage on state change
  useEffect(() => {
    if (state.startedAt) {
      localStorage.setItem(storageKey, JSON.stringify(state))
    }
  }, [state, storageKey])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // ── Actions ──────────────────────────────────────────────────────────────

  const startSession = useCallback((ttsEnabled: boolean) => {
    // Clear any stale timers from a previous session (prevents phantom phase changes)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    const fresh = {
      phase: "exercise" as SessionPhase,
      exerciseIndex: 0,
      currentSet: 0,
      completedSets: Array(totalExercises).fill(0),
      skipped: [] as number[],
      skipReasons: {} as Record<number, string>,
      exerciseFeedback: {} as Record<number, { difficulty?: number; pain_during?: number }>,
      startedAt: new Date().toISOString(),
      ttsEnabled,
    }
    console.log("[Session] startSession →", JSON.stringify(fresh))
    setState(fresh)
  }, [totalExercises])

  const completeSet = useCallback(() => {
    setState((s) => {
      const totalSets = getSetsForExercise(s.exerciseIndex)
      const newCompleted = [...s.completedSets]
      newCompleted[s.exerciseIndex] = (newCompleted[s.exerciseIndex] ?? 0) + 1
      const setsNow = newCompleted[s.exerciseIndex]

      return {
        ...s,
        phase: "set-done",
        completedSets: newCompleted,
        currentSet: setsNow,
      }
    })

    // Auto-advance from set-done
    timerRef.current = setTimeout(() => {
      setState((s) => {
        const totalSets = getSetsForExercise(s.exerciseIndex)
        const setsDone = s.completedSets[s.exerciseIndex] ?? 0

        if (setsDone >= totalSets) {
          // All sets done → feedback
          return { ...s, phase: "feedback" }
        }

        // In TTS mode, skip resting — audio stream handles pauses
        if (s.ttsEnabled) {
          return { ...s, phase: "exercise" }
        }

        const pauseSec = getPauseForExercise(s.exerciseIndex)
        if (pauseSec > 0) {
          return { ...s, phase: "resting" }
        }

        // No pause → next set
        return { ...s, phase: "exercise" }
      })
    }, SET_DONE_DELAY)
  }, [getSetsForExercise, getPauseForExercise])

  const startHold = useCallback(() => {
    setState((s) => ({ ...s, phase: "holding" }))
  }, [])

  const holdComplete = useCallback(() => {
    completeSet()
  }, [completeSet])

  const restComplete = useCallback(() => {
    setState((s) => ({ ...s, phase: "exercise" }))
  }, [])

  const skipRest = useCallback(() => {
    setState((s) => ({ ...s, phase: "exercise" }))
  }, [])

  const submitFeedback = useCallback(
    (feedback: { difficulty?: number; pain_during?: number }) => {
      setState((s) => {
        const newFeedback = { ...s.exerciseFeedback, [s.exerciseIndex]: feedback }
        const nextIndex = s.exerciseIndex + 1

        if (nextIndex >= totalExercises) {
          return { ...s, phase: "complete", exerciseFeedback: newFeedback }
        }

        return {
          ...s,
          phase: "transition",
          exerciseFeedback: newFeedback,
        }
      })

      // Auto-advance from transition
      timerRef.current = setTimeout(() => {
        setState((s) => {
          if (s.phase !== "transition") return s
          return {
            ...s,
            phase: "exercise",
            exerciseIndex: s.exerciseIndex + 1,
            currentSet: 0,
          }
        })
      }, TRANSITION_DELAY)
    },
    [totalExercises]
  )

  const skipFeedback = useCallback(() => {
    submitFeedback({})
  }, [submitFeedback])

  const skipExercise = useCallback(
    (reason?: string) => {
      setState((s) => {
        const newSkipped = [...s.skipped, s.exerciseIndex]
        const newReasons = reason
          ? { ...s.skipReasons, [s.exerciseIndex]: reason }
          : s.skipReasons
        const nextIndex = s.exerciseIndex + 1

        if (nextIndex >= totalExercises) {
          return {
            ...s,
            phase: "complete",
            skipped: newSkipped,
            skipReasons: newReasons,
          }
        }

        return {
          ...s,
          phase: "transition",
          skipped: newSkipped,
          skipReasons: newReasons,
        }
      })

      timerRef.current = setTimeout(() => {
        setState((s) => {
          if (s.phase !== "transition") return s
          return {
            ...s,
            phase: "exercise",
            exerciseIndex: s.exerciseIndex + 1,
            currentSet: 0,
          }
        })
      }, TRANSITION_DELAY)
    },
    [totalExercises]
  )

  const setTtsEnabled = useCallback((enabled: boolean) => {
    setState((s) => ({ ...s, ttsEnabled: enabled }))
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem(storageKey)
  }, [storageKey])

  // ── TTS-driven set advancement (no phase transitions, just visual update) ──

  const advanceSetTTS = useCallback((completedSets: number) => {
    console.log("[Session] advanceSetTTS →", completedSets)
    setState((s) => {
      if (s.phase !== "exercise") return s
      const newCompleted = [...s.completedSets]
      newCompleted[s.exerciseIndex] = completedSets
      return { ...s, completedSets: newCompleted, currentSet: completedSets }
    })
  }, [])

  const finishExerciseTTS = useCallback(() => {
    setState((s) => {
      if (s.phase !== "exercise") return s
      return { ...s, phase: "feedback" }
    })
  }, [])

  return {
    ...state,
    startSession,
    completeSet,
    startHold,
    holdComplete,
    restComplete,
    skipRest,
    submitFeedback,
    skipFeedback,
    skipExercise,
    setTtsEnabled,
    clearSession,
    advanceSetTTS,
    finishExerciseTTS,
  }
}
