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

  // Speech settings per source type
  const speechOpts = source_type === "lesson"
    ? { speed: 0.6, stability: 0.95, style: 0.0 }  // Traumreisen: ruhig, gleichmäßig (0.4 war zu leise)
    : { speed: 0.75, stability: 0.9, style: 0.05 }  // Übungen: normal-langsam
  const speed = speechOpts.speed

  // Compute hash (includes speed so different speeds get separate cache entries)
  const hash = contentHash(cleanText, config.voiceId, speed)

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

  // Rate limit: nur ungecachte Generierungen zählen.
  //
  // WICHTIG: Eine geführte Trainingseinheit erzeugt pro Übung mehrere
  // Sprech-Segmente — bei 8 Übungen sind das 60–80 Einzelanfragen. Mit dem
  // früheren Limit von 100/h lief ein zweites Training in derselben Stunde in
  // ein 429 und der Player blieb stumm. Das Limit muss deshalb über dem
  // Bedarf mehrerer vollständiger Einheiten liegen; Wiederholungen kosten
  // dank Cache ohnehin nichts.
  if (isRateLimited(`tts:${user.id}`, 500, 3_600_000)) {
    console.warn(`[TTS] Rate limit erreicht für User ${user.id} — 500 ungecachte Generierungen/h`)
    return NextResponse.json(
      {
        error:
          "Das Sprach-Kontingent für diese Stunde ist erschöpft. Die Anleitung kann gerade nicht vorgelesen werden — das Training funktioniert weiterhin ohne Ton.",
        code: "TTS_RATE_LIMIT",
      },
      { status: 429 }
    )
  }

  // Generate audio — all chunks in parallel for speed
  const chunks = chunkText(cleanText)
  const hashPrefix = hash.substring(0, 4)

  console.log(`[TTS] Generating ${chunks.length} chunks (${cleanText.length} chars) for ${source_type} at speed ${speed}`)
  const startTime = Date.now()

  try {
    // Step 1: Generate all audio chunks in parallel via ElevenLabs
    const audioBuffers = await Promise.all(
      chunks.map((chunk, i) =>
        generateSpeech(chunk, config, speechOpts).then((buf) => {
          console.log(`[TTS] Chunk ${i}/${chunks.length} generated (${buf.byteLength} bytes)`)
          return buf
        })
      )
    )

    const ttsTime = Date.now() - startTime
    console.log(`[TTS] All chunks generated in ${ttsTime}ms`)

    // Step 2: Upload all chunks + insert cache records in parallel
    const audio_urls = await Promise.all(
      audioBuffers.map(async (audioBuffer, i) => {
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

        // Insert cache record (fire-and-forget, don't block URL return)
        serviceClient.from("tts_audio_cache").insert({
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
        }).then(({ error }) => {
          if (error) console.warn(`[TTS] Cache insert error chunk ${i}:`, error.message)
        })

        return urlData.publicUrl
      })
    )

    const totalTime = Date.now() - startTime
    console.log(`[TTS] Complete: ${chunks.length} chunks in ${totalTime}ms (TTS: ${ttsTime}ms)`)

    return NextResponse.json({
      audio_urls,
      cached: false,
      total_chunks: chunks.length,
    })
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
}
