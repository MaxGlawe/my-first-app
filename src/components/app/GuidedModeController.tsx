"use client"

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Play,
  Pause,
  Square,
  Mic,
  Loader2,
  Volume2,
} from "lucide-react"
import { useTTS } from "@/hooks/use-tts"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import {
  buildTrainerSegments,
  PAUSE_MARKER_PREFIX,
  type TrainerSegment,
} from "@/lib/trainer-script"

interface ExerciseForNarration {
  exerciseId: string
  name: string
  ausfuehrung: Array<{ nummer: number; beschreibung: string }> | null
  params: {
    saetze: number
    wiederholungen?: number | null
    dauer_sekunden?: number | null
    pause_sekunden: number
    anmerkung?: string | null
  }
}

interface GuidedModeControllerProps {
  exercises: ExerciseForNarration[]
  currentIndex: number
  isSessionActive: boolean
}

export function GuidedModeController({
  exercises,
  currentIndex,
  isSessionActive,
}: GuidedModeControllerProps) {
  const [isActive, setIsActive] = useState(false)
  const [isPreparing, setIsPreparing] = useState(false)
  const [prepProgress, setPrepProgress] = useState(0)
  const { generate, isGenerating } = useTTS()
  const player = useAudioPlayer()

  // Play items per exercise index (audio URLs + pause markers)
  const playItemsMapRef = useRef<Map<number, string[]>>(new Map())
  const lastPlayedIndexRef = useRef(-1)

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

  // ── Activate guided mode: pre-generate all audio ─────────────────────────

  const handleActivate = useCallback(async () => {
    setIsPreparing(true)
    setPrepProgress(0)
    playItemsMapRef.current.clear()

    for (let exIdx = 0; exIdx < segmentsPerExercise.length; exIdx++) {
      const segments = segmentsPerExercise[exIdx]
      const items: string[] = []

      for (const seg of segments) {
        if (seg.type === "pause") {
          items.push(`${PAUSE_MARKER_PREFIX}${seg.seconds}`)
        } else if (seg.type === "speech") {
          const result = await generate({
            text: seg.text,
            sourceType: "training_plan",
            sourceId: exercises[exIdx].exerciseId,
          })
          if (result) {
            items.push(...result.audioUrls)
          }
        }
      }

      playItemsMapRef.current.set(exIdx, items)
      setPrepProgress(((exIdx + 1) / segmentsPerExercise.length) * 100)
    }

    setIsPreparing(false)
    setIsActive(true)
    lastPlayedIndexRef.current = -1
  }, [segmentsPerExercise, exercises, generate])

  const handleDeactivate = useCallback(() => {
    setIsActive(false)
    player.stop()
    lastPlayedIndexRef.current = -1
  }, [player])

  // ── Auto-play when exercise changes ──────────────────────────────────────

  useEffect(() => {
    if (!isActive || !isSessionActive) return
    if (currentIndex === lastPlayedIndexRef.current) return

    const items = playItemsMapRef.current.get(currentIndex)
    if (items && items.length > 0) {
      lastPlayedIndexRef.current = currentIndex
      player.play(items)
    }
  }, [isActive, isSessionActive, currentIndex, player])

  // ── Deactivate if session ends ───────────────────────────────────────────

  useEffect(() => {
    if (!isSessionActive && isActive) {
      handleDeactivate()
    }
  }, [isSessionActive, isActive, handleDeactivate])

  if (exercises.length === 0) return null

  // ── Preparing state ──────────────────────────────────────────────────────

  if (isPreparing) {
    return (
      <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/60 p-4 space-y-2">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">
            Audio wird vorbereitet...
          </span>
        </div>
        <Progress
          value={prepProgress}
          className="h-2 [&>div]:bg-emerald-500"
        />
        <p className="text-xs text-emerald-600/70">
          {Math.round(prepProgress)}% — {exercises.length} Übungen
        </p>
      </div>
    )
  }

  // ── Inactive → show toggle button ────────────────────────────────────────

  if (!isActive) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleActivate}
        disabled={isGenerating}
        className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 gap-2"
      >
        <Mic className="h-4 w-4" />
        Geführter Modus
      </Button>
    )
  }

  // ── Active → mini player ─────────────────────────────────────────────────

  return (
    <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/60 px-4 py-3 flex items-center gap-3">
      <div className="h-8 w-8 rounded-full bg-emerald-200 flex items-center justify-center shrink-0">
        <Volume2 className="h-4 w-4 text-emerald-700" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-emerald-700 truncate">
          {player.pauseRemaining > 0
            ? `Pause — noch ${player.pauseRemaining} Sek.`
            : "Geführter Modus aktiv"}
        </p>
        {(player.status === "playing" || player.status === "paused") && (
          <Progress
            value={player.progress * 100}
            className="h-1 mt-1 [&>div]:bg-emerald-500"
          />
        )}
      </div>

      {player.status === "playing" && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-emerald-700 hover:bg-emerald-100"
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
          className="h-9 w-9 text-emerald-700 hover:bg-emerald-100"
          onClick={player.resume}
          aria-label="Fortsetzen"
        >
          <Play className="h-4 w-4" />
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-slate-400 hover:bg-slate-100"
        onClick={handleDeactivate}
        aria-label="Geführten Modus beenden"
      >
        <Square className="h-4 w-4" />
      </Button>
    </div>
  )
}
