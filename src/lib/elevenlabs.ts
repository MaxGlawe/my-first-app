/**
 * PROJ-17: ElevenLabs TTS Server-Side Client
 *
 * ONLY use in API routes (server-side). Never import in client components.
 * Handles text-to-speech conversion, chunking for long texts, and audio streaming.
 */

import crypto from "crypto"

// ── Configuration ──────────────────────────────────────────────────────────────

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1"
const MAX_CHARS_PER_REQUEST = 2500
const DEFAULT_MODEL_ID = "eleven_multilingual_v2"

export interface TTSConfig {
  apiKey: string
  voiceId: string
  modelId: string
}

export function getElevenLabsConfig(): TTSConfig {
  const apiKey = process.env.ELEVENLABS_API_KEY
  const voiceId = process.env.ELEVENLABS_VOICE_ID

  if (!apiKey || !voiceId) {
    throw new Error(
      "Missing ElevenLabs configuration. " +
        "Ensure ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID are set in .env.local"
    )
  }

  return {
    apiKey,
    voiceId,
    modelId: process.env.ELEVENLABS_MODEL_ID ?? DEFAULT_MODEL_ID,
  }
}

// ── Text Processing ────────────────────────────────────────────────────────────

/** Strip HTML tags, decode entities, normalize whitespace */
export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/** Generate SHA-256 content hash for cache lookup (includes speed for distinct cache entries) */
export function contentHash(text: string, voiceId: string, speed?: number): string {
  const speedKey = speed != null ? `:spd${speed}` : ""
  return crypto
    .createHash("sha256")
    .update(`${voiceId}${speedKey}:${text}`)
    .digest("hex")
}

/**
 * Split text into chunks — prefers paragraph breaks (\n\n) as natural split points,
 * falls back to sentence boundaries. Shorter chunks prevent ElevenLabs from speeding up.
 */
export function chunkText(
  text: string,
  maxChars = MAX_CHARS_PER_REQUEST
): string[] {
  if (text.length <= maxChars) return [text]

  // Step 1: Split at paragraph breaks (our trainer script uses \n\n for pauses)
  const paragraphs = text.split(/\n\n+/)
  const grouped: string[] = []
  let current = ""

  for (const para of paragraphs) {
    const trimmed = para.trim()
    if (!trimmed) continue

    if (current.length + trimmed.length + 2 > maxChars && current.length > 0) {
      grouped.push(current.trim())
      current = trimmed
    } else {
      current += (current ? "\n\n" : "") + trimmed
    }
  }

  if (current.trim()) {
    grouped.push(current.trim())
  }

  // Step 2: If any group is still too long, split at sentence boundaries
  const chunks: string[] = []

  for (const group of grouped) {
    if (group.length <= maxChars) {
      chunks.push(group)
      continue
    }

    const sentences = group.split(/(?<=[.!?])\s+/)
    let sub = ""

    for (const sentence of sentences) {
      if (sub.length + sentence.length + 1 > maxChars && sub.length > 0) {
        chunks.push(sub.trim())
        sub = sentence
      } else {
        sub += (sub ? " " : "") + sentence
      }
    }

    if (sub.trim()) {
      chunks.push(sub.trim())
    }
  }

  return chunks
}

// ── API Call ────────────────────────────────────────────────────────────────────

const RETRYABLE_STATUS = new Set([500, 502, 503, 429])
const MAX_RETRIES = 2
const RETRY_DELAY_MS = 1500

export interface SpeechOptions {
  speed?: number
  /** Higher = more consistent, calmer delivery (0.0-1.0) */
  stability?: number
  /** Lower = more monotone/calm (0.0-1.0) */
  style?: number
}

/** Call ElevenLabs TTS API and return raw audio buffer (MP3) — with auto-retry */
export async function generateSpeech(
  text: string,
  config: TTSConfig,
  opts: SpeechOptions = {},
): Promise<ArrayBuffer> {
  const { speed = 0.75, stability = 0.9, style = 0.05 } = opts
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt))
    }

    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${config.voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": config.apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: config.modelId,
          voice_settings: {
            stability,
            similarity_boost: 0.75,
            style,
            use_speaker_boost: false,
          },
          speed,
        }),
      }
    )

    if (response.ok) {
      return response.arrayBuffer()
    }

    const errorBody = await response.text().catch(() => "Unknown error")
    lastError = new Error(
      `ElevenLabs API error (${response.status}): ${errorBody}`
    )

    // Only retry on transient server errors
    if (!RETRYABLE_STATUS.has(response.status)) {
      throw lastError
    }

    console.warn(
      `[TTS] Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed (${response.status}), retrying...`
    )
  }

  throw lastError!
}
