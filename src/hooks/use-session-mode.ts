"use client"

import { useState, useCallback, useRef, useEffect } from "react"

// ── Session Phase State Machine ──────────────────────────────────────────────

export type SessionPhase =
  | "start"      // Overview + start button
  | "exercise"   // Active exercise (waiting for user action or hold start)
  | "holding"    // Hold timer running
  | "set-done"   // Brief celebration (auto-advances after 500ms)
  | "resting"    // Rest between sets (breathing circle + countdown)
  | "side-switch" // Seite wechseln (erst nach allen Sätzen der ersten Seite)
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
  /** Durchgänge insgesamt — bei „pro Seite" die doppelte Satzanzahl */
  getSetsForExercise: (index: number) => number
  getPauseForExercise: (index: number) => number
  /** Sätze je Seite; 0/undefined = Übung wird nicht pro Seite ausgeführt */
  getSetsPerSideForExercise?: (index: number) => number
  storageKey: string
}

const SET_DONE_DELAY = 600
// Short transition so the slide animation renders, but stays well within
// iOS' user-gesture grace window so audio.play() after the next exercise
// starts without being blocked as autoplay.
const TRANSITION_DELAY = 300

export function useSessionMode(options: UseSessionModeOptions) {
  const {
    totalExercises,
    getSetsForExercise,
    getPauseForExercise,
    getSetsPerSideForExercise,
    storageKey,
  } = options

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

        // Seitenwechsel: alle Sätze der ersten Seite sind durch. Eigener
        // Schritt mit Bestätigung — sonst läuft man versehentlich einseitig
        // weiter, wie im Nutzer-Feedback berichtet.
        const saetzeProSeite = getSetsPerSideForExercise?.(s.exerciseIndex) ?? 0
        if (saetzeProSeite > 0 && setsDone === saetzeProSeite) {
          return { ...s, phase: "side-switch" }
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
  }, [getSetsForExercise, getPauseForExercise, getSetsPerSideForExercise])

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

  /** Seite gewechselt — weiter mit den Sätzen der zweiten Seite. */
  const sideSwitchDone = useCallback(() => {
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

  /**
   * Eine Übung zurück — zum Nachschauen und Nochmal-Anhören.
   *
   * Der Fortschritt bleibt bewusst erhalten: bereits gemachte Sätze, Feedback
   * und Skips werden NICHT zurückgesetzt. Wer zurückgeht, hört sich die Übung
   * erneut an und geht dann wieder vor; die Sitzung merkt sich, wie weit sie
   * schon war.
   */
  const previousExercise = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setState((s) => {
      if (s.exerciseIndex === 0) return s
      const prevIndex = s.exerciseIndex - 1
      return {
        ...s,
        phase: "exercise",
        exerciseIndex: prevIndex,
        // Satz-Anzeige auf den Stand dieser Übung setzen
        currentSet: s.completedSets[prevIndex] ?? 0,
      }
    })
  }, [])

  /**
   * Wieder vorwärts, ohne die Übung erneut abschließen zu müssen —
   * Gegenstück zu previousExercise().
   */
  const nextExercise = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setState((s) => {
      const nextIndex = s.exerciseIndex + 1
      if (nextIndex >= totalExercises) return s
      return {
        ...s,
        phase: "exercise",
        exerciseIndex: nextIndex,
        currentSet: s.completedSets[nextIndex] ?? 0,
      }
    })
  }, [totalExercises])

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
    sideSwitchDone,
    submitFeedback,
    skipFeedback,
    skipExercise,
    previousExercise,
    nextExercise,
    setTtsEnabled,
    clearSession,
    advanceSetTTS,
    finishExerciseTTS,
  }
}
