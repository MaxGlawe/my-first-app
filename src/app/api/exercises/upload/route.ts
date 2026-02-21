/**
 * PROJ-8: Übungsdatenbank-Verwaltung
 * POST /api/exercises/upload
 *
 * Uploads a media file (image or video) to Supabase Storage.
 * Returns the public URL for storing in the exercises table.
 *
 * Form data fields:
 *   - file: File (JPG/PNG ≤5MB | MP4/WebM ≤50MB)
 *   - exercise_id: UUID (the exercise this media belongs to)
 *   - media_type: "image" | "video"
 *
 * Storage path: {user_id}/{exercise_id}.{ext}
 * Buckets:
 *   - exercise-images (images)
 *   - exercise-videos (videos)
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const IMAGE_MAX_BYTES = 5 * 1024 * 1024          // 5 MB
const VIDEO_MAX_BYTES = 50 * 1024 * 1024          // 50 MB

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp", // BUG-4: align with frontend
}

const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: "Nicht autorisiert. Bitte einloggen." },
      { status: 401 }
    )
  }

  // Parse multipart form data
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Lesen der Formulardaten." },
      { status: 400 }
    )
  }

  const file = formData.get("file")
  const exerciseId = formData.get("exercise_id")?.toString() ?? ""
  const mediaType = formData.get("media_type")?.toString() ?? ""

  // Validate inputs
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: 'Keine Datei gefunden. Bitte als Feld "file" senden.' },
      { status: 400 }
    )
  }

  if (!UUID_REGEX.test(exerciseId)) {
    return NextResponse.json(
      { error: "Ungültige Übungs-ID." },
      { status: 400 }
    )
  }

  if (mediaType !== "image" && mediaType !== "video") {
    return NextResponse.json(
      { error: 'Ungültiger media_type. Erlaubt: "image" oder "video".' },
      { status: 400 }
    )
  }

  // Validate MIME type and size based on media type
  if (mediaType === "image") {
    if (!ALLOWED_IMAGE_TYPES[file.type]) {
      return NextResponse.json(
        { error: "Nur JPG, PNG und WebP sind für Bilder erlaubt." },
        { status: 422 }
      )
    }
    if (file.size > IMAGE_MAX_BYTES) {
      return NextResponse.json(
        { error: "Bild darf maximal 5 MB groß sein." },
        { status: 422 }
      )
    }
  } else {
    // video
    if (!ALLOWED_VIDEO_TYPES[file.type]) {
      return NextResponse.json(
        { error: "Nur MP4 und WebM sind für Videos erlaubt." },
        { status: 422 }
      )
    }
    if (file.size > VIDEO_MAX_BYTES) {
      return NextResponse.json(
        { error: "Video darf maximal 50 MB groß sein." },
        { status: 422 }
      )
    }
  }

  // Build storage path: {user_id}/{exercise_id}.{ext}
  const ext =
    mediaType === "image"
      ? ALLOWED_IMAGE_TYPES[file.type]
      : ALLOWED_VIDEO_TYPES[file.type]

  const bucket = mediaType === "image" ? "exercise-images" : "exercise-videos"
  const storagePath = `${user.id}/${exerciseId}.${ext}`

  // Upload to Supabase Storage
  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: true,  // Overwrite if media was previously uploaded for this exercise
    })

  if (uploadError) {
    console.error("[POST /api/exercises/upload] Storage upload error:", uploadError)
    return NextResponse.json(
      { error: "Datei konnte nicht hochgeladen werden. Bitte erneut versuchen." },
      { status: 500 }
    )
  }

  // Get the public CDN URL
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(storagePath)
  const publicUrl = urlData.publicUrl

  return NextResponse.json({
    media_url: publicUrl,
    media_type: mediaType,
    message: "Datei erfolgreich hochgeladen.",
  })
}
