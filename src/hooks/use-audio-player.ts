"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { PAUSE_MARKER_PREFIX } from "@/lib/trainer-script"

// MediaError codes → human-readable label. Helps debug Safari audio failures
// that otherwise just surface as opaque "Script error." in window.onerror.
const MEDIA_ERROR_CODE: Record<number, string> = {
  1: "MEDIA_ERR_ABORTED",
  2: "MEDIA_ERR_NETWORK",
  3: "MEDIA_ERR_DECODE",
  4: "MEDIA_ERR_SRC_NOT_SUPPORTED",
}

function reportAudioError(kind: string, details: Record<string, unknown>) {
  try {
    const body = JSON.stringify({
      source: "error",
      message: `Audio/${kind}: ${details.message ?? "unknown"}`,
      stack: JSON.stringify(details, null, 2),
      url: typeof window !== "undefined" ? window.location.href : null,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    })
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" })
      if (navigator.sendBeacon("/api/log/client-error", blob)) return
    }
    fetch("/api/log/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {})
  } catch {
    // Reporting must never throw
  }
}

export type PlayerStatus =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "ended"
  | "error"

interface AudioPlayerOptions {
  ambientUrl?: string
  ambientVolume?: number
  voiceVolume?: number
  onComplete?: () => void
  onChunkChange?: (index: number, total: number) => void
}

interface UseAudioPlayerReturn {
  status: PlayerStatus
  play: (urls: string[]) => void
  pause: () => void
  resume: () => void
  stop: () => void
  /** Call synchronously in a click/tap handler BEFORE any async work to unlock mobile audio */
  warmUp: () => void
  progress: number
  currentChunk: number
  totalChunks: number
  /** Seconds remaining in current timed pause, 0 if not in a pause */
  pauseRemaining: number
  setVoiceVolume: (v: number) => void
  setAmbientVolume: (v: number) => void
  setAmbientUrl: (url: string | null) => void
  error: string | null
}

// ── Pause Timer State ──────────────────────────────────────────────────────────

interface PauseTimerState {
  totalMs: number
  elapsedBeforePause: number
  startedAt: number
}

export function useAudioPlayer(
  options: AudioPlayerOptions = {}
): UseAudioPlayerReturn {
  const [status, setStatus] = useState<PlayerStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [currentChunk, setCurrentChunk] = useState(0)
  const [totalChunks, setTotalChunks] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [pauseRemaining, setPauseRemaining] = useState(0)

  const voiceRef = useRef<HTMLAudioElement | null>(null)
  const ambientRef = useRef<HTMLAudioElement | null>(null)
  const urlsRef = useRef<string[]>([])
  const chunkIndexRef = useRef(0)
  const progressRafRef = useRef<number>(0)
  const optionsRef = useRef(options)

  // Timed pause refs
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pauseStateRef = useRef<PauseTimerState | null>(null)

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  // ── Progress tracking ────────────────────────────────────────────────────

  const startProgressTracking = useCallback(() => {
    const tick = () => {
      const audio = voiceRef.current
      if (audio && audio.duration > 0) {
        setProgress(audio.currentTime / audio.duration)
      }
      progressRafRef.current = requestAnimationFrame(tick)
    }
    progressRafRef.current = requestAnimationFrame(tick)
  }, [])

  const stopProgressTracking = useCallback(() => {
    if (progressRafRef.current) {
      cancelAnimationFrame(progressRafRef.current)
      progressRafRef.current = 0
    }
  }, [])

  // ── Clear timed pause ──────────────────────────────────────────────────

  const clearPauseTimer = useCallback(() => {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current)
      pauseTimerRef.current = null
    }
    pauseStateRef.current = null
    setPauseRemaining(0)
  }, [])

  // ── Play chunk (audio URL or pause marker) ─────────────────────────────

  const playChunk = useCallback(
    (index: number) => {
      const urls = urlsRef.current
      if (index >= urls.length) {
        stopProgressTracking()
        clearPauseTimer()
        setStatus("ended")
        setProgress(1)
        if (ambientRef.current) {
          ambientRef.current.pause()
        }
        optionsRef.current.onComplete?.()
        return
      }

      const item = urls[index]
      chunkIndexRef.current = index
      setCurrentChunk(index)
      setProgress(0)
      optionsRef.current.onChunkChange?.(index, urls.length)

      // ── Timed pause marker: "pause:30" ────────────────────────────────
      if (item.startsWith(PAUSE_MARKER_PREFIX)) {
        const seconds = parseInt(item.slice(PAUSE_MARKER_PREFIX.length), 10)
        const totalMs = seconds * 1000

        // Stop any playing audio
        if (voiceRef.current) {
          voiceRef.current.pause()
          voiceRef.current.onended = null
          voiceRef.current.onerror = null
          // Don't removeAttribute("src") — it breaks the element state
        }

        pauseStateRef.current = {
          totalMs,
          elapsedBeforePause: 0,
          startedAt: Date.now(),
        }

        setStatus("playing")
        setPauseRemaining(seconds)

        // Track progress during the timed pause
        const trackPause = () => {
          const state = pauseStateRef.current
          if (!state) return
          const elapsed = state.elapsedBeforePause + (Date.now() - state.startedAt)
          const p = Math.min(elapsed / state.totalMs, 1)
          setProgress(p)
          setPauseRemaining(Math.max(Math.ceil((state.totalMs - elapsed) / 1000), 0))
          if (p < 1) {
            progressRafRef.current = requestAnimationFrame(trackPause)
          }
        }
        progressRafRef.current = requestAnimationFrame(trackPause)

        pauseTimerRef.current = setTimeout(() => {
          pauseTimerRef.current = null
          pauseStateRef.current = null
          stopProgressTracking()
          setPauseRemaining(0)
          playChunk(index + 1)
        }, totalMs)

        return
      }

      // ── Regular audio URL ─────────────────────────────────────────────
      clearPauseTimer()

      // Stop current playback (don't removeAttribute — it breaks the element state)
      if (voiceRef.current) {
        voiceRef.current.pause()
        voiceRef.current.onended = null
        voiceRef.current.onerror = null
      }

      // Reuse existing audio element if warm (keeps mobile audio context alive)
      const audio = voiceRef.current ?? new Audio()
      // crossOrigin must be set BEFORE src to take effect. Lets error events
      // surface real details instead of Safari's opaque "Script error."
      audio.crossOrigin = "anonymous"
      audio.src = item
      audio.volume = optionsRef.current.voiceVolume ?? 1.0
      audio.preload = "auto"
      voiceRef.current = audio

      audio.onended = () => {
        playChunk(index + 1)
      }

      audio.onerror = (e) => {
        const mediaErr = audio.error
        const code = mediaErr?.code
        // Code 1 = MEDIA_ERR_ABORTED = we paused/changed src deliberately.
        // Same kind of harmless interruption as play()'s AbortError.
        if (code === 1) {
          return
        }
        const details = {
          code,
          codeLabel: code ? MEDIA_ERROR_CODE[code] ?? "UNKNOWN" : "NO_CODE",
          message: mediaErr?.message ?? "unknown",
          srcHead: audio.src?.substring(0, 200),
          networkState: audio.networkState,
          readyState: audio.readyState,
          chunkIndex: index,
          totalChunks: urlsRef.current.length,
          eventType: (e as Event).type,
        }
        console.error("[AudioPlayer] audio.onerror", details)
        reportAudioError("load", details)
        setError(`Audio-Fehler: ${mediaErr?.message ?? MEDIA_ERROR_CODE[code ?? 0] ?? "unbekannt"}`)
        setStatus("error")
        stopProgressTracking()
      }

      audio
        .play()
        .then(() => {
          setStatus("playing")
          startProgressTracking()
        })
        .catch((err) => {
          const details = {
            errorName: err?.name ?? "UnknownError",
            message: err?.message ?? "unknown",
            srcHead: item?.substring(0, 200),
            chunkIndex: index,
            totalChunks: urlsRef.current.length,
          }
          // AbortError = play() was interrupted by a deliberate pause()/src-change
          // (exercise switch, user stop). Expected, harmless — silently swallow.
          if (err?.name === "AbortError") {
            return
          }
          // NotAllowedError = browser autoplay policy blocked us. Expected on
          // first play before user gesture; the UI prompts the user to tap.
          if (err?.name === "NotAllowedError") {
            console.warn("[AudioPlayer] autoplay blocked, waiting for user gesture")
            setError("Bitte tippe erneut zum Abspielen.")
            setStatus("error")
            return
          }
          // Anything else is a real failure (codec, network, decode) — report.
          console.error("[AudioPlayer] play() rejected:", details)
          reportAudioError("play", details)
          setError(`Wiedergabe fehlgeschlagen: ${err?.message ?? "unbekannt"}`)
          setStatus("error")
        })
    },
    [startProgressTracking, stopProgressTracking, clearPauseTimer]
  )

  // ── Ambient playback ─────────────────────────────────────────────────────

  const startAmbient = useCallback((url: string) => {
    if (ambientRef.current) {
      ambientRef.current.pause()
    }
    const ambient = new Audio(url)
    ambient.loop = true
    ambient.volume = optionsRef.current.ambientVolume ?? 0.3
    ambientRef.current = ambient
    ambient.play().catch(() => {
      console.warn("[AudioPlayer] Ambient playback failed")
    })
  }, [])

  // ── Warm up audio context (must be called synchronously from user gesture) ──

  const warmUp = useCallback(() => {
    // Create a silent audio element and play it to unlock the audio context
    // This must happen synchronously inside the user tap/click handler
    if (!voiceRef.current) {
      const silent = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=")
      silent.volume = 0
      silent.play().catch(() => {})
      voiceRef.current = silent
    }
  }, [])

  // ── Public API ───────────────────────────────────────────────────────────

  const play = useCallback(
    (urls: string[]) => {
      voiceRef.current?.pause()
      ambientRef.current?.pause()
      stopProgressTracking()
      clearPauseTimer()

      urlsRef.current = urls
      setTotalChunks(urls.length)
      setProgress(0)
      setError(null)
      setStatus("loading")

      const ambientUrl = optionsRef.current.ambientUrl
      if (ambientUrl) {
        startAmbient(ambientUrl)
      }

      playChunk(0)
    },
    [playChunk, startAmbient, stopProgressTracking, clearPauseTimer]
  )

  const pause = useCallback(() => {
    // If we're in a timed pause, save remaining time
    if (pauseStateRef.current && pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current)
      pauseTimerRef.current = null
      const elapsed =
        pauseStateRef.current.elapsedBeforePause +
        (Date.now() - pauseStateRef.current.startedAt)
      pauseStateRef.current.elapsedBeforePause = elapsed
    }

    voiceRef.current?.pause()
    ambientRef.current?.pause()
    stopProgressTracking()
    setStatus("paused")
  }, [stopProgressTracking])

  const resume = useCallback(() => {
    // If we were in a timed pause, resume the timer
    if (pauseStateRef.current && !pauseTimerRef.current) {
      const remaining =
        pauseStateRef.current.totalMs - pauseStateRef.current.elapsedBeforePause
      if (remaining > 0) {
        pauseStateRef.current.startedAt = Date.now()

        // Resume progress tracking
        const trackPause = () => {
          const state = pauseStateRef.current
          if (!state) return
          const elapsed = state.elapsedBeforePause + (Date.now() - state.startedAt)
          const p = Math.min(elapsed / state.totalMs, 1)
          setProgress(p)
          setPauseRemaining(Math.max(Math.ceil((state.totalMs - elapsed) / 1000), 0))
          if (p < 1) {
            progressRafRef.current = requestAnimationFrame(trackPause)
          }
        }
        progressRafRef.current = requestAnimationFrame(trackPause)

        pauseTimerRef.current = setTimeout(() => {
          pauseTimerRef.current = null
          pauseStateRef.current = null
          stopProgressTracking()
          setPauseRemaining(0)
          playChunk(chunkIndexRef.current + 1)
        }, remaining)

        setStatus("playing")
        ambientRef.current?.play()
        return
      }
    }

    voiceRef.current?.play()
    ambientRef.current?.play()
    startProgressTracking()
    setStatus("playing")
  }, [startProgressTracking, stopProgressTracking, playChunk])

  const stop = useCallback(() => {
    if (voiceRef.current) {
      voiceRef.current.pause()
      voiceRef.current.onended = null
      voiceRef.current.onerror = null
      // Keep voiceRef.current alive — don't null it!
      // The element was unlocked via user gesture and we need it for future play() calls.
    }
    ambientRef.current?.pause()
    ambientRef.current = null
    stopProgressTracking()
    clearPauseTimer()
    urlsRef.current = []
    chunkIndexRef.current = 0
    setStatus("idle")
    setProgress(0)
    setCurrentChunk(0)
    setTotalChunks(0)
    setError(null)
  }, [stopProgressTracking, clearPauseTimer])

  const setVoiceVolume = useCallback((v: number) => {
    if (voiceRef.current) voiceRef.current.volume = v
  }, [])

  const setAmbientVolume = useCallback((v: number) => {
    if (ambientRef.current) ambientRef.current.volume = v
  }, [])

  const setAmbientUrl = useCallback(
    (url: string | null) => {
      if (url) {
        startAmbient(url)
      } else {
        ambientRef.current?.pause()
        ambientRef.current = null
      }
    },
    [startAmbient]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      voiceRef.current?.pause()
      ambientRef.current?.pause()
      stopProgressTracking()
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current)
      }
    }
  }, [stopProgressTracking])

  return {
    status,
    play,
    pause,
    resume,
    stop,
    warmUp,
    progress,
    currentChunk,
    totalChunks,
    pauseRemaining,
    setVoiceVolume,
    setAmbientVolume,
    setAmbientUrl,
    error,
  }
}
