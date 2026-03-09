"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Loader2,
  AlertCircle,
  RotateCcw,
} from "lucide-react"
import type { PlayerStatus } from "@/hooks/use-audio-player"

interface AudioPlayerProps {
  status: PlayerStatus
  progress: number
  currentChunk: number
  totalChunks: number
  /** Seconds remaining in current timed pause, 0 if not in a pause */
  pauseRemaining?: number
  error: string | null
  onPlay: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
  voiceVolume?: number
  onVoiceVolumeChange?: (v: number) => void
  compact?: boolean
  label?: string
  className?: string
  isGenerating?: boolean
}

export function AudioPlayer({
  status,
  progress,
  currentChunk,
  totalChunks,
  error,
  onPlay,
  onPause,
  onResume,
  onStop,
  pauseRemaining = 0,
  voiceVolume = 1,
  onVoiceVolumeChange,
  compact = false,
  label = "Vorlesen",
  className = "",
  isGenerating = false,
}: AudioPlayerProps) {
  // ── Generating state (TTS in progress, no audio yet) ─────────────────────

  if (isGenerating) {
    return (
      <div
        className={`flex items-center gap-3 rounded-2xl bg-emerald-50/80 px-4 py-3 ${className}`}
      >
        <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
        <span className="text-sm font-medium text-emerald-700">
          Audio wird generiert...
        </span>
      </div>
    )
  }

  // ── Error state ──────────────────────────────────────────────────────────

  if (status === "error" || error) {
    return (
      <div
        className={`flex items-center gap-3 rounded-2xl bg-red-50/80 px-4 py-3 ${className}`}
      >
        <AlertCircle className="h-5 w-5 text-red-500" />
        <span className="text-sm text-red-600">
          {error ?? "Wiedergabe fehlgeschlagen."}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-9 text-red-600 hover:text-red-700"
          onClick={onPlay}
        >
          <RotateCcw className="mr-1 h-4 w-4" />
          Erneut
        </Button>
      </div>
    )
  }

  // ── Idle / Ended state → show play button ────────────────────────────────

  if (status === "idle" || status === "ended") {
    return (
      <Button
        variant="outline"
        size={compact ? "sm" : "default"}
        className={`rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 ${className}`}
        onClick={onPlay}
      >
        <Play className="mr-2 h-4 w-4" />
        {status === "ended" ? "Nochmal abspielen" : label}
      </Button>
    )
  }

  // ── Playing / Paused state → full controls ───────────────────────────────

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 rounded-2xl bg-emerald-50/80 px-3 py-2 ${className}`}
      >
        {status === "playing" ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-emerald-700 hover:bg-emerald-100"
            onClick={onPause}
            aria-label="Pausieren"
          >
            <Pause className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-emerald-700 hover:bg-emerald-100"
            onClick={onResume}
            aria-label="Fortsetzen"
          >
            <Play className="h-5 w-5" />
          </Button>
        )}

        <div className="flex-1 min-w-0">
          {pauseRemaining > 0 && (
            <p className="text-xs font-medium text-emerald-600 mb-1">
              Pause — noch {pauseRemaining} Sek.
            </p>
          )}
          <Progress
            value={progress * 100}
            className="h-2 [&>div]:bg-emerald-500"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-slate-500 hover:bg-slate-100"
          onClick={onStop}
          aria-label="Stoppen"
        >
          <Square className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // Full player
  return (
    <div
      className={`rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 p-4 space-y-3 ${className}`}
    >
      {/* Controls row */}
      <div className="flex items-center gap-3">
        {status === "playing" ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            onClick={onPause}
            aria-label="Pausieren"
          >
            <Pause className="h-6 w-6" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            onClick={onResume}
            aria-label="Fortsetzen"
          >
            <Play className="h-6 w-6" />
          </Button>
        )}

        <div className="flex-1 space-y-1">
          {pauseRemaining > 0 && (
            <p className="text-xs font-medium text-emerald-600 mb-1">
              Pause — noch {pauseRemaining} Sek.
            </p>
          )}
          <Progress
            value={progress * 100}
            className="h-2 [&>div]:bg-emerald-500"
          />
          {totalChunks > 1 && !pauseRemaining && (
            <p className="text-xs text-slate-500">
              Teil {currentChunk + 1} von {totalChunks}
            </p>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-slate-500 hover:bg-slate-100"
          onClick={onStop}
          aria-label="Stoppen"
        >
          <Square className="h-5 w-5" />
        </Button>
      </div>

      {/* Volume slider */}
      {onVoiceVolumeChange && (
        <div className="flex items-center gap-3 px-1">
          {voiceVolume === 0 ? (
            <VolumeX className="h-4 w-4 text-slate-400" />
          ) : (
            <Volume2 className="h-4 w-4 text-slate-500" />
          )}
          <Slider
            value={[voiceVolume * 100]}
            max={100}
            step={5}
            className="flex-1"
            onValueChange={(vals) =>
              onVoiceVolumeChange(vals[0] / 100)
            }
            aria-label="Lautstärke"
          />
        </div>
      )}
    </div>
  )
}
