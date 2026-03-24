"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { useTTS } from "@/hooks/use-tts"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import { AudioPlayer } from "@/components/app/AudioPlayer"
import {
  buildTrainerSegments,
  PAUSE_MARKER_PREFIX,
} from "@/lib/trainer-script"

interface AusfuehrungsSchritt {
  nummer: number
  beschreibung: string
}

interface ExerciseVorlesenProps {
  exerciseId: string
  exerciseName: string
  ausfuehrung: AusfuehrungsSchritt[]
  params: {
    saetze: number
    wiederholungen?: number | null
    dauer_sekunden?: number | null
    pause_sekunden: number
    anmerkung?: string | null
  }
}

export function ExerciseVorlesen({
  exerciseId,
  exerciseName,
  ausfuehrung,
  params,
}: ExerciseVorlesenProps) {
  const { generate, isGenerating, error: ttsError, clearError } = useTTS()
  const player = useAudioPlayer()
  const cachedItemsRef = useRef<string[] | null>(null)
  const [isPreparing, setIsPreparing] = useState(false)

  const segments = useMemo(
    () =>
      buildTrainerSegments({
        name: exerciseName,
        ausfuehrung,
        params,
      }),
    [exerciseName, ausfuehrung, params]
  )

  const handlePlay = useCallback(async () => {
    clearError()
    // Unlock mobile audio context synchronously before any async work
    player.warmUp()

    // Use cached play items if available
    if (cachedItemsRef.current) {
      player.play(cachedItemsRef.current)
      return
    }

    setIsPreparing(true)

    const items: string[] = []

    for (const seg of segments) {
      if (seg.type === "pause") {
        items.push(`${PAUSE_MARKER_PREFIX}${seg.seconds}`)
      } else if (seg.type === "speech") {
        const result = await generate({
          text: seg.text,
          sourceType: "exercise",
          sourceId: exerciseId,
        })
        if (result) {
          items.push(...result.audioUrls)
        }
      }
    }

    setIsPreparing(false)

    if (items.length > 0) {
      cachedItemsRef.current = items
      player.play(items)
    }
  }, [segments, exerciseId, generate, clearError, player])

  if (ausfuehrung.length === 0 && !params.wiederholungen && !params.dauer_sekunden) return null

  return (
    <AudioPlayer
      status={player.status}
      progress={player.progress}
      currentChunk={player.currentChunk}
      totalChunks={player.totalChunks}
      pauseRemaining={player.pauseRemaining}
      error={ttsError ?? player.error}
      onPlay={handlePlay}
      onPause={player.pause}
      onResume={player.resume}
      onStop={player.stop}
      isGenerating={isGenerating || isPreparing}
      compact
      label="Vorlesen"
      className="mt-2"
    />
  )
}
