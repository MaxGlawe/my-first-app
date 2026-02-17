/**
 * PROJ-2: Patientenstammdaten
 * POST /api/patients/[id]/avatar
 *   — Avatar-Bild hochladen (multipart/form-data)
 *   — Speichert in Supabase Storage bucket "avatars"
 *   — Aktualisiert avatar_url in der patients-Tabelle
 *
 * Constraints:
 *   - Nur JPG, PNG, WEBP erlaubt
 *   - Maximale Dateigröße: 2 MB
 *   - Dateiname: avatars/{patient_id}.{ext}  (upsert — ersetzt vorherigen Avatar)
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const BUCKET = "avatars"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  // UUID format check
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: "Ungültige Patienten-ID." }, { status: 400 })
  }

  // Verify the patient exists and the user has access (via RLS)
  const { data: patient, error: fetchError } = await supabase
    .from("patients")
    .select("id, vorname, nachname")
    .eq("id", id)
    .single()

  if (fetchError || !patient) {
    return NextResponse.json(
      { error: "Patient nicht gefunden oder keine Berechtigung." },
      { status: 404 }
    )
  }

  // Parse multipart form data
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Lesen der Datei. Bitte erneut versuchen." },
      { status: 400 }
    )
  }

  const file = formData.get("avatar")
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: 'Kein Bild gefunden. Bitte als Feld "avatar" senden.' },
      { status: 400 }
    )
  }

  // Validate MIME type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Nur JPG, PNG oder WEBP erlaubt." },
      { status: 422 }
    )
  }

  // Validate file size
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Avatar darf maximal 2 MB groß sein." },
      { status: 422 }
    )
  }

  // Determine file extension from MIME type
  const extMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  }
  const ext = extMap[file.type]
  const storagePath = `avatars/${id}.${ext}`

  // Upload to Supabase Storage (upsert = overwrite previous avatar)
  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    console.error("[POST /api/patients/[id]/avatar] Storage upload error:", uploadError)
    return NextResponse.json(
      { error: "Avatar konnte nicht hochgeladen werden." },
      { status: 500 }
    )
  }

  // Get the public CDN URL
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  const publicUrl = urlData.publicUrl

  // Update the patient record with the new avatar_url
  const { error: updateError } = await supabase
    .from("patients")
    .update({ avatar_url: publicUrl })
    .eq("id", id)

  if (updateError) {
    console.error("[POST /api/patients/[id]/avatar] DB update error:", updateError)
    return NextResponse.json(
      { error: "Avatar-URL konnte nicht gespeichert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({
    avatar_url: publicUrl,
    message: "Avatar erfolgreich aktualisiert.",
  })
}
