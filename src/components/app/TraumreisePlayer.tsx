"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import {
  Play,
  Pause,
  Square,
  Volume2,
  Headphones,
  Loader2,
  Trees,
  Waves,
  Mountain,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { useTTS } from "@/hooks/use-tts"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import type { AmbientTheme } from "@/types/tts"

interface TraumreisePlayerProps {
  lessonBeschreibung: string
  lessonTitle: string
  lessonId: string
  /** If provided, auto-selects this theme and hides the theme picker */
  ambientTheme?: AmbientTheme
}

const THEMES: {
  id: AmbientTheme
  label: string
  icon: typeof Trees
  gradient: string
  bg: string
}[] = [
  {
    id: "forest",
    label: "Wald",
    icon: Trees,
    gradient: "from-emerald-800 to-green-900",
    bg: "bg-emerald-900/95",
  },
  {
    id: "sea",
    label: "Meer",
    icon: Waves,
    gradient: "from-blue-800 to-cyan-900",
    bg: "bg-blue-900/95",
  },
  {
    id: "mountains",
    label: "Berge",
    icon: Mountain,
    gradient: "from-slate-700 to-stone-800",
    bg: "bg-slate-800/95",
  },
]

export function TraumreisePlayer({
  lessonBeschreibung,
  lessonTitle,
  lessonId,
  ambientTheme,
}: TraumreisePlayerProps) {
  const [selectedTheme, setSelectedTheme] = useState<AmbientTheme | null>(ambientTheme ?? null)
  const [ambientUrl, setAmbientUrl] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [voiceVol, setVoiceVol] = useState(1)
  const [ambientVol, setAmbientVol] = useState(0.3)

  const { generate, isGenerating, error: ttsError, clearError } = useTTS()
  const player = useAudioPlayer({
    ambientUrl: ambientUrl ?? undefined,
    ambientVolume: ambientVol,
    voiceVolume: voiceVol,
  })

  const cachedUrlsRef = useRef<string[] | null>(null)

  // Fetch ambient sound URL for selected theme
  useEffect(() => {
    if (!selectedTheme) {
      setAmbientUrl(null)
      return
    }

    fetch(`/api/tts/ambient?theme=${selectedTheme}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.sounds && json.sounds.length > 0) {
          setAmbientUrl(json.sounds[0].url)
        }
      })
      .catch(() => {
        // Ambient is non-critical — continue without it
      })
  }, [selectedTheme])

  // Update player ambient when URL changes
  useEffect(() => {
    if (player.status === "playing" || player.status === "paused") {
      player.setAmbientUrl(ambientUrl)
    }
  }, [ambientUrl]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update volumes in real-time
  useEffect(() => {
    player.setVoiceVolume(voiceVol)
  }, [voiceVol]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    player.setAmbientVolume(ambientVol)
  }, [ambientVol]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = useCallback(async () => {
    clearError()

    if (cachedUrlsRef.current) {
      player.play(cachedUrlsRef.current)
      setIsFullscreen(true)
      return
    }

    const result = await generate({
      text: lessonBeschreibung,
      sourceType: "lesson",
      sourceId: lessonId,
      isHtml: true,
    })

    if (result) {
      cachedUrlsRef.current = result.audioUrls
      player.play(result.audioUrls)
      setIsFullscreen(true)
    }
  }, [lessonBeschreibung, lessonId, generate, clearError, player])

  const handleStop = useCallback(() => {
    player.stop()
    setIsFullscreen(false)
  }, [player])

  const theme = useMemo(
    () => THEMES.find((t) => t.id === selectedTheme) ?? THEMES[0],
    [selectedTheme]
  )

  const isActive = player.status === "playing" || player.status === "paused"

  // ── Fullscreen immersive mode ────────────────────────────────────────────

  if (isFullscreen && isActive) {
    return (
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${theme.bg} backdrop-blur-xl`}
      >
        {/* Decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-white/5 blur-3xl" />

        {/* Close button */}
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition"
          aria-label="Minimieren"
        >
          <Minimize2 className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-10 px-6">
          <theme.icon className="h-10 w-10 text-white/40 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white/90">
            {lessonTitle}
          </h2>
          <p className="text-sm text-white/50 mt-1">
            {theme.label}-Traumreise
          </p>
        </div>

        {/* Big play/pause button */}
        <button
          onClick={
            player.status === "playing" ? player.pause : player.resume
          }
          className="h-24 w-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition mb-10"
          aria-label={
            player.status === "playing" ? "Pausieren" : "Fortsetzen"
          }
        >
          {player.status === "playing" ? (
            <Pause className="h-10 w-10" />
          ) : (
            <Play className="h-10 w-10 ml-1" />
          )}
        </button>

        {/* Progress */}
        <div className="w-full max-w-xs px-6 space-y-2">
          <Progress
            value={player.progress * 100}
            className="h-1.5 bg-white/10 [&>div]:bg-white/60"
          />
          {player.totalChunks > 1 && (
            <p className="text-xs text-white/40 text-center">
              Teil {player.currentChunk + 1} von {player.totalChunks}
            </p>
          )}
        </div>

        {/* Volume controls */}
        <div className="w-full max-w-xs px-6 mt-8 space-y-4">
          <div className="flex items-center gap-3">
            <Headphones className="h-4 w-4 text-white/50 shrink-0" />
            <span className="text-xs text-white/50 w-14 shrink-0">
              Stimme
            </span>
            <Slider
              value={[voiceVol * 100]}
              max={100}
              step={5}
              className="flex-1"
              onValueChange={(v) => setVoiceVol(v[0] / 100)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Volume2 className="h-4 w-4 text-white/50 shrink-0" />
            <span className="text-xs text-white/50 w-14 shrink-0">
              {theme.label}
            </span>
            <Slider
              value={[ambientVol * 100]}
              max={100}
              step={5}
              className="flex-1"
              onValueChange={(v) => setAmbientVol(v[0] / 100)}
            />
          </div>
        </div>

        {/* Stop button */}
        <button
          onClick={handleStop}
          className="mt-8 flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition"
        >
          <Square className="h-4 w-4" />
          Beenden
        </button>
      </div>
    )
  }

  // ── Inline card ──────────────────────────────────────────────────────────

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Headphones className="h-5 w-5 text-emerald-700" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Traumreise</h3>
          <p className="text-xs text-slate-400">
            Entspanne dich mit einer geführten Reise
          </p>
        </div>
      </div>

      {/* Theme selection (only if no fixed theme from course) */}
      {!ambientTheme && (
        <div className="flex gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTheme(t.id)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition ${
                selectedTheme === t.id
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
              }`}
            >
              <t.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      {isGenerating ? (
        <div className="flex items-center justify-center gap-3 py-3">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          <span className="text-sm text-emerald-700">
            Audio wird vorbereitet...
          </span>
        </div>
      ) : isActive ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              onClick={
                player.status === "playing" ? player.pause : player.resume
              }
            >
              {player.status === "playing" ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>

            <div className="flex-1 space-y-1">
              <Progress
                value={player.progress * 100}
                className="h-2 [&>div]:bg-emerald-500"
              />
              {player.totalChunks > 1 && (
                <p className="text-xs text-slate-400">
                  Teil {player.currentChunk + 1} von {player.totalChunks}
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-slate-400"
              onClick={() => setIsFullscreen(true)}
              aria-label="Vollbild"
            >
              <Maximize2 className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-slate-400"
              onClick={handleStop}
              aria-label="Stoppen"
            >
              <Square className="h-5 w-5" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={handleStart}
          disabled={!selectedTheme}
          className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
        >
          <Play className="mr-2 h-5 w-5" />
          Traumreise starten
        </Button>
      )}

      {(ttsError || player.error) && (
        <p className="text-xs text-red-500 text-center">
          {ttsError ?? player.error}
        </p>
      )}
    </div>
  )
}
