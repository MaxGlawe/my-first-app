/**
 * PROJ-17: TTS Audio Generation
 * POST /api/tts/generate
 *
 * Accepts text content, checks cache, generates audio via ElevenLabs if needed,
 * stores in Supabase Storage, and returns the audio URL(s).
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { isRateLimited } from "@/lib/rate-limit"
import {
  getElevenLabsConfig,
  stripHtml,
  contentHash,
  chunkText,
  generateSpeech,
} from "@/lib/elevenlabs"

const requestSchema = z.object({
  text: z.string().min(1).max(60_000),
  source_type: z.enum(["exercise", "lesson", "training_plan"]),
  source_id: z.string().uuid().optional(),
  is_html: z.boolean().optional().default(false),
})

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Parse & validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validierungsfehler.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    )
  }

  const { text: rawText, source_type, source_id, is_html } = parsed.data

  let config
  try {
    config = getElevenLabsConfig()
  } catch (err) {
    console.error("[TTS] Config error:", err)
    return NextResponse.json(
      { error: "TTS-Service nicht konfiguriert." },
      { status: 503 }
    )
  }

  // Process text
  const cleanText = is_html ? stripHtml(rawText) : rawText
  if (cleanText.length === 0) {
    return NextResponse.json(
      { error: "Text ist nach Bereinigung leer." },
      { status: 422 }
    )
  }

  // Compute hash
  const hash = contentHash(cleanText, config.voiceId)

  // Check cache BEFORE rate limit — cached results are free
  const serviceClient = createSupabaseServiceClient()
  const { data: cached, error: cacheError } = await serviceClient
    .from("tts_audio_cache")
    .select("storage_path, chunk_index, total_chunks")
    .eq("content_hash", hash)
    .eq("voice_id", config.voiceId)
    .order("chunk_index", { ascending: true })

  if (cacheError) {
    console.warn("[TTS] Cache lookup failed (table may not exist):", cacheError.message)
  }

  if (cached && cached.length > 0) {
    const audio_urls = cached.map(
      (c) =>
        serviceClient.storage
          .from("tts-audio")
          .getPublicUrl(c.storage_path).data.publicUrl
    )
    return NextResponse.json({
      audio_urls,
      cached: true,
      total_chunks: cached[0].total_chunks,
    })
  }

  // Rate limit: only count uncached generations (100 per hour)
  if (isRateLimited(`tts:${user.id}`, 100, 3_600_000)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuche es später erneut." },
      { status: 429 }
    )
  }

  // Generate audio
  const chunks = chunkText(cleanText)
  const audio_urls: string[] = []

  try {
    for (let i = 0; i < chunks.length; i++) {
      const audioBuffer = await generateSpeech(chunks[i], config)

      // Storage path: {source_type}/{hash_prefix}/{hash}_{chunk}.mp3
      const hashPrefix = hash.substring(0, 4)
      const storagePath = `${source_type}/${hashPrefix}/${hash}_${i}.mp3`

      // Upload to storage
      const { error: uploadError } = await serviceClient.storage
        .from("tts-audio")
        .upload(storagePath, audioBuffer, {
          contentType: "audio/mpeg",
          upsert: true,
        })

      if (uploadError) {
        console.error(`[TTS] Upload error chunk ${i}:`, uploadError)
        throw new Error("Audio konnte nicht gespeichert werden.")
      }

      // Get public URL
      const { data: urlData } = serviceClient.storage
        .from("tts-audio")
        .getPublicUrl(storagePath)

      audio_urls.push(urlData.publicUrl)

      // Insert cache record
      await serviceClient.from("tts_audio_cache").insert({
        content_hash: hash,
        voice_id: config.voiceId,
        model_id: config.modelId,
        source_type,
        source_id: source_id ?? null,
        chunk_index: i,
        total_chunks: chunks.length,
        storage_path: storagePath,
        file_size_bytes: audioBuffer.byteLength,
        input_char_count: chunks[i].length,
      })
    }
  } catch (err) {
    console.error("[TTS] Generation error:", err)
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "TTS-Generierung fehlgeschlagen.",
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    audio_urls,
    cached: false,
    total_chunks: chunks.length,
  })
}
