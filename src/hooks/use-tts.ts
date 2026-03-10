"use client"

import { useState, useCallback, useRef } from "react"
import type { TTSSourceType } from "@/types/tts"

interface TTSRequest {
  text: string
  sourceType: TTSSourceType
  sourceId?: string
  isHtml?: boolean
}

interface TTSResult {
  audioUrls: string[]
  cached: boolean
  totalChunks: number
}

interface UseTTSReturn {
  generate: (req: TTSRequest) => Promise<TTSResult | null>
  isGenerating: boolean
  error: string | null
  clearError: () => void
}

export function useTTS(): UseTTSReturn {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const generate = useCallback(
    async (req: TTSRequest): Promise<TTSResult | null> => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setIsGenerating(true)
      setError(null)

      try {
        const res = await fetch("/api/tts/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: req.text,
            source_type: req.sourceType,
            source_id: req.sourceId,
            is_html: req.isHtml ?? false,
          }),
          signal: controller.signal,
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          console.error("[TTS] API error:", res.status, body)
          throw new Error(
            body.error ?? `TTS-Generierung fehlgeschlagen (${res.status}).`
          )
        }

        const json = await res.json()
        console.log("[TTS] Success:", {
          cached: json.cached,
          chunks: json.total_chunks,
          urls: json.audio_urls?.map((u: string) => u.substring(0, 80)),
        })
        return {
          audioUrls: json.audio_urls,
          cached: json.cached,
          totalChunks: json.total_chunks,
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError")
          return null
        const msg =
          err instanceof Error
            ? err.message
            : "Ein Fehler ist aufgetreten."
        setError(msg)
        return null
      } finally {
        setIsGenerating(false)
      }
    },
    []
  )

  const clearError = useCallback(() => setError(null), [])

  return { generate, isGenerating, error, clearError }
}
