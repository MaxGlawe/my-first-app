"use client"

import { useState, useEffect, useRef, useMemo, useCallback, forwardRef, useImperativeHandle } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Play,
  Pause,
  Square,
  Volume2,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import {
  buildTrainerSegments,
  PAUSE_MARKER_PREFIX,
} from "@/lib/trainer-script"
import type { FlatExercise } from "@/lib/training-helpers"
import type { SessionPhase } from "@/hooks/use-session-mode"
import { BreathingCircle } from "./BreathingCircle"

export interface SessionTTSControllerHandle {
  /** Call from a user gesture (tap/click) to unlock mobile audio playback */
  warmUp: () => void
}

interface SessionTTSControllerProps {
  exercises: FlatExercise[]
  currentIndex: number
  phase: SessionPhase
  ttsEnabled: boolean
  onSetComplete?: (completedSets: number) => void
  onExerciseComplete?: () => void
  onTTSError?: () => void
}

// ── Direct TTS fetch ─────────────────────────────────────────────────────────

async function generateDirect(
  text: string,
  sourceId: string
): Promise<string[]> {
  try {
    const res = await fetch("/api/tts/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        source_type: "training_plan",
        source_id: sourceId || undefined,
        is_html: false,
      }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => "")
      console.error(`[TTS] Generate failed (${res.status}):`, body)
      return []
    }
    const json = await res.json()
    return json.audio_urls ?? []
  } catch (err) {
    console.error("[TTS] Generate network error:", err)
    return []
  }
}

function formatPauseTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0
    ? `${mins}:${secs.toString().padStart(2, "0")}`
    : `0:${secs.toString().padStart(2, "0")}`
}

export const SessionTTSController = forwardRef<SessionTTSControllerHandle, SessionTTSControllerProps>(function SessionTTSController({
  exercises,
  currentIndex,
  phase,
  ttsEnabled,
  onSetComplete,
  onExerciseComplete,
  onTTSError,
}, ref) {
  const [isPreparing, setIsPreparing] = useState(false)
  const [prepProgress, setPrepProgress] = useState(0)
  const [readyExercises, setReadyExercises] = useState<Set<number>>(new Set())
  const [ttsError, setTtsError] = useState<string | null>(null)

  // Reactive state: which exercise index is currently playing
  const [activePlayIndex, setActivePlayIndex] = useState<number | null>(null)

  const player = useAudioPlayer()

  // Expose warmUp to parent so it can be called during user gesture
  useImperativeHandle(ref, () => ({
    warmUp: player.warmUp,
  }), [player.warmUp])

  // Stable references to player functions (avoid re-running effects on every render)
  const playerPlayRef = useRef(player.play)
  const playerStopRef = useRef(player.stop)
  playerPlayRef.current = player.play
  playerStopRef.current = player.stop

  // Data maps
  const playItemsMapRef = useRef<Map<number, string[]>>(new Map())
  const textMapRef = useRef<Map<number, string[]>>(new Map())
  const setsCompletedMapRef = useRef<Map<number, number[]>>(new Map())
  const prevCompletedSetsRef = useRef(0)
  const preparingRef = useRef(false)

  // Build segments per exercise
  const segmentsPerExercise = useMemo(
    () =>
      exercises.map((ex, i) =>
        buildTrainerSegments(
          {
            name: ex.name,
            ausfuehrung: ex.ausfuehrung,
            params: ex.params,
          },
          i,
          exercises.length
        )
      ),
    [exercises]
  )

  // ── SAFETY: Full reset when phase goes back to "start" (session restart) ──

  useEffect(() => {
    if (phase === "start") {
      playerStopRef.current()
      setActivePlayIndex(null)
      setReadyExercises(new Set())
      setIsPreparing(false)
      setPrepProgress(0)
      setTtsError(null)
      preparingRef.current = false
      playItemsMapRef.current.clear()
      textMapRef.current.clear()
      setsCompletedMapRef.current.clear()
      prevCompletedSetsRef.current = 0
    }
  }, [phase])

  // ── SAFETY: Stop player when phase leaves "exercise" ──────────────────────

  useEffect(() => {
    if (ttsEnabled && phase !== "exercise" && phase !== "start" && phase !== "complete") {
      playerStopRef.current()
      setActivePlayIndex(null)
    }
  }, [ttsEnabled, phase])

  // ── Progressive generation: Exercise 0 first, then rest ─────────────────

  useEffect(() => {
    if (!ttsEnabled || readyExercises.size > 0 || preparingRef.current) return
    if (phase === "start" || phase === "complete") return

    console.log("[TTS] Starting progressive generation for", segmentsPerExercise.length, "exercises")
    preparingRef.current = true
    setIsPreparing(true)
    setPrepProgress(0)
    setTtsError(null)

    async function prepareExercise(exIdx: number): Promise<boolean> {
      const segments = segmentsPerExercise[exIdx]
      const exerciseId = exercises[exIdx].exerciseId

      const speechJobs: Array<{ text: string }> = []
      const orderedEntries: Array<
        | { kind: "pause"; marker: string }
        | { kind: "speech"; jobIndex: number; text: string }
        | { kind: "set-boundary"; completedSets: number }
      > = []

      for (const seg of segments) {
        if (seg.type === "pause") {
          orderedEntries.push({
            kind: "pause",
            marker: `${PAUSE_MARKER_PREFIX}${seg.seconds}`,
          })
        } else if (seg.type === "set-boundary") {
          orderedEntries.push({
            kind: "set-boundary",
            completedSets: seg.completedSets,
          })
        } else {
          orderedEntries.push({
            kind: "speech",
            jobIndex: speechJobs.length,
            text: seg.text,
          })
          speechJobs.push({ text: seg.text })
        }
      }

      const speechResults = await Promise.all(
        speechJobs.map((job) => generateDirect(job.text, exerciseId))
      )

      // Count how many speech segments succeeded
      const successCount = speechResults.filter((r) => r.length > 0).length
      const failCount = speechResults.length - successCount

      if (successCount === 0 && speechJobs.length > 0) {
        console.error(`[TTS] Exercise ${exIdx}: ALL ${failCount} speech segments failed! No audio available.`)
        return false
      }

      if (failCount > 0) {
        console.warn(`[TTS] Exercise ${exIdx}: ${failCount}/${speechResults.length} speech segments failed`)
      }

      const items: string[] = []
      const texts: string[] = []
      let currentCompletedSets = 0
      const setsCompleted: number[] = []

      for (const entry of orderedEntries) {
        if (entry.kind === "set-boundary") {
          currentCompletedSets = entry.completedSets
          continue
        }
        if (entry.kind === "pause") {
          // Only add pause markers if there are audio items before them
          // (prevents starting with a pause when speech generation failed)
          if (items.length > 0) {
            items.push(entry.marker)
            texts.push("")
            setsCompleted.push(currentCompletedSets)
          }
        } else {
          const urls = speechResults[entry.jobIndex]
          for (const url of urls) {
            items.push(url)
            texts.push(entry.text)
            setsCompleted.push(currentCompletedSets)
          }
        }
      }

      // Final safety: ensure items is not empty and first item is audio (not pause)
      if (items.length === 0) {
        console.error(`[TTS] Exercise ${exIdx}: items array is empty after processing`)
        return false
      }

      if (items[0].startsWith(PAUSE_MARKER_PREFIX)) {
        console.error(`[TTS] Exercise ${exIdx}: first item is a pause marker, stripping leading pauses`)
        while (items.length > 0 && items[0].startsWith(PAUSE_MARKER_PREFIX)) {
          items.shift()
          texts.shift()
          setsCompleted.shift()
        }
        if (items.length === 0) {
          console.error(`[TTS] Exercise ${exIdx}: only pause markers, no audio`)
          return false
        }
      }

      console.log(`[TTS] Exercise ${exIdx} prepared:`, items.length, "items, first:", items[0]?.substring(0, 40))

      playItemsMapRef.current.set(exIdx, items)
      textMapRef.current.set(exIdx, texts)
      setsCompletedMapRef.current.set(exIdx, setsCompleted)
      setReadyExercises((prev) => new Set(prev).add(exIdx))
      setPrepProgress(((exIdx + 1) / segmentsPerExercise.length) * 100)
      return true
    }

    async function progressiveGenerate() {
      let hasAnySuccess = false
      for (let exIdx = 0; exIdx < segmentsPerExercise.length; exIdx++) {
        const ok = await prepareExercise(exIdx)
        if (exIdx === 0 && !ok) {
          // First exercise failed — TTS can't work at all
          console.error("[TTS] First exercise generation failed. Disabling TTS mode.")
          setTtsError("Audio konnte nicht generiert werden. Bitte versuche es erneut oder trainiere ohne Sprachführung.")
          onTTSError?.()
          break
        }
        if (ok) hasAnySuccess = true
      }
      if (!hasAnySuccess && !ttsError) {
        setTtsError("Audio konnte nicht generiert werden.")
      }
      preparingRef.current = false
      setIsPreparing(false)
    }

    progressiveGenerate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ttsEnabled, phase])

  // ── Consolidated playback lifecycle ─────────────────────────────────────

  useEffect(() => {
    if (!ttsEnabled || phase !== "exercise") return
    if (!readyExercises.has(currentIndex)) return
    if (activePlayIndex === currentIndex) return

    const items = playItemsMapRef.current.get(currentIndex)
    if (!items || items.length === 0) return

    console.log("[TTS] Starting playback for exercise", currentIndex, "→", items.length, "items")

    playerStopRef.current()
    prevCompletedSetsRef.current = 0
    setActivePlayIndex(currentIndex)
    playerPlayRef.current(items)
  }, [ttsEnabled, phase, currentIndex, readyExercises, activePlayIndex])

  // ── Stop audio on session completion ──────────────────────────────────────

  useEffect(() => {
    if (phase === "complete") {
      playerStopRef.current()
    }
  }, [phase])

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    const stopFn = playerStopRef.current
    return () => {
      stopFn()
    }
  }, [])

  // ── Auto-advance set indicator ────────────────────────────────────────────

  useEffect(() => {
    if (!ttsEnabled || !onSetComplete) return
    if (activePlayIndex !== currentIndex) return
    if (player.status !== "playing" && player.status !== "paused") return

    const setsMap = setsCompletedMapRef.current.get(currentIndex)
    if (!setsMap) return
    const completed = setsMap[player.currentChunk] ?? 0
    if (completed > prevCompletedSetsRef.current) {
      console.log("[TTS] Set advancement: chunk", player.currentChunk, "→ completed:", completed)
      prevCompletedSetsRef.current = completed
      onSetComplete(completed)
    }
  }, [currentIndex, activePlayIndex, player.currentChunk, player.status, ttsEnabled, onSetComplete])

  // ── Auto-advance to feedback when audio ends ──────────────────────────────

  useEffect(() => {
    if (!ttsEnabled || !onExerciseComplete) return
    if (activePlayIndex !== currentIndex) return
    if (player.status === "ended") {
      console.log("[TTS] Audio ended for exercise", currentIndex, "→ onExerciseComplete")
      onExerciseComplete()
    }
  }, [player.status, activePlayIndex, currentIndex, ttsEnabled, onExerciseComplete])

  // ── Derived state ─────────────────────────────────────────────────────────

  const isPlayingForCurrent =
    activePlayIndex === currentIndex &&
    (player.status === "playing" || player.status === "paused")

  const currentTrainerText = useMemo(() => {
    if (!isPlayingForCurrent) return ""
    const texts = textMapRef.current.get(currentIndex)
    if (!texts || player.currentChunk >= texts.length) return ""
    return texts[player.currentChunk] ?? ""
  }, [currentIndex, player.currentChunk, isPlayingForCurrent])

  const showPauseOverlay = useMemo(() => {
    if (!isPlayingForCurrent) return false
    if (player.pauseRemaining <= 0) return false
    const items = playItemsMapRef.current.get(currentIndex)
    if (!items) return false
    const currentItem = items[player.currentChunk]
    return !!currentItem && currentItem.startsWith(PAUSE_MARKER_PREFIX)
  }, [player.pauseRemaining, player.currentChunk, currentIndex, isPlayingForCurrent])

  const isPlaying =
    player.status === "playing" || player.status === "paused"

  // ── Dismiss error handler ───────────────────────────────────────────────

  const handleDismissError = useCallback(() => {
    setTtsError(null)
  }, [])

  // ── Don't render anything if TTS is disabled ────────────────────────────

  if (!ttsEnabled) return null

  // ── Error state ─────────────────────────────────────────────────────────

  if (ttsError) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-50/95 backdrop-blur-sm border-t border-amber-200 px-4 py-3 safe-area-inset-bottom">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800 flex-1">{ttsError}</p>
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-700 hover:bg-amber-100 shrink-0 text-xs h-7"
            onClick={handleDismissError}
          >
            OK
          </Button>
        </div>
      </div>
    )
  }

  // ── Preparing state (only block if current exercise isn't ready yet) ────

  if (isPreparing && !readyExercises.has(currentIndex)) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-slate-200 px-4 py-3 safe-area-inset-bottom">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-emerald-700 mb-1">
              Audio wird vorbereitet...
            </p>
            <Progress
              value={prepProgress}
              className="h-1.5 [&>div]:bg-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-400 tabular-nums shrink-0">
            {Math.round(prepProgress)}%
          </span>
        </div>
      </div>
    )
  }

  // ── Not playing → hidden ──────────────────────────────────────────────

  if (!isPlaying && player.status !== "loading") {
    return null
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <>
      {showPauseOverlay && (
        <div className="fixed inset-0 z-40 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 flex flex-col items-center justify-center">
          <p className="text-sm font-medium text-blue-200/60 uppercase tracking-wider mb-8">
            Pause
          </p>

          <BreathingCircle variant="blue" />

          <div className="mt-8 text-center">
            <p className="text-5xl font-bold tabular-nums text-white animate-countdown-pulse">
              {formatPauseTime(player.pauseRemaining)}
            </p>
            <p className="text-sm text-blue-200/50 mt-3">
              Atme ruhig und gleichmäßig
            </p>
          </div>
        </div>
      )}

      {currentTrainerText && isPlaying && !showPauseOverlay && (
        <div
          key={player.currentChunk}
          className="fixed bottom-14 left-0 right-0 z-50 px-4 pb-2 animate-fade-in pointer-events-none"
        >
          <div className="max-w-md mx-auto bg-slate-900/80 backdrop-blur-sm rounded-2xl px-4 py-3">
            <p className="text-sm text-white/90 text-center leading-relaxed line-clamp-3">
              {currentTrainerText.split("\n\n").pop()}
            </p>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-slate-200 px-4 py-2 safe-area-inset-bottom">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <Volume2 className="h-4 w-4 text-emerald-700" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-600 truncate">
              {player.pauseRemaining > 0
                ? `Pause — noch ${player.pauseRemaining} Sek.`
                : "Trainer-Stimme"}
            </p>
            <Progress
              value={player.progress * 100}
              className="h-1 mt-1 [&>div]:bg-emerald-500"
            />
          </div>

          {player.status === "playing" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-emerald-700 hover:bg-emerald-100"
              onClick={player.pause}
              aria-label="Pausieren"
            >
              <Pause className="h-4 w-4" />
            </Button>
          )}
          {player.status === "paused" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-emerald-700 hover:bg-emerald-100"
              onClick={player.resume}
              aria-label="Fortsetzen"
            >
              <Play className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:bg-slate-100"
            onClick={player.stop}
            aria-label="Stoppen"
          >
            <Square className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </>
  )
})
