/**
 * PROJ-8: Übungsdatenbank-Verwaltung
 * GET    /api/exercises/[id]  — Einzelne Übung abrufen
 * PUT    /api/exercises/[id]  — Übung bearbeiten (nur eigene oder Admin)
 * DELETE /api/exercises/[id]  — Übung löschen mit Archiv-Check
 *
 * Delete logic:
 *   - If the exercise is referenced in any training plan → set is_archived = true (soft-delete)
 *   - Otherwise → hard-delete + remove media file from Storage
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ----------------------------------------------------------------
// Shared Zod schema
// ----------------------------------------------------------------
const ausfuehrungsSchrittSchema = z.object({
  nummer: z.number().int().min(1),
  beschreibung: z.string().min(1).max(1000),
})

const updateExerciseSchema = z.object({
  name: z
    .string()
    .min(1, "Name ist erforderlich.")
    .max(200, "Name darf maximal 200 Zeichen haben.")
    .trim(),
  beschreibung: z.string().max(5000).optional().nullable(),
  ausfuehrung: z.array(ausfuehrungsSchrittSchema).optional().nullable(),
  muskelgruppen: z
    .array(z.string().min(1).max(100))
    .min(1, "Mindestens eine Muskelgruppe ist erforderlich."),
  schwierigkeitsgrad: z.enum(["anfaenger", "mittel", "fortgeschritten"], {
    error: "Ungültiger Schwierigkeitsgrad.",
  }),
  media_url: z.string().url("Ungültige Medien-URL.").max(1000).optional().nullable(),
  media_type: z.enum(["image", "video"]).optional().nullable(),
  standard_saetze: z.number().int().min(1).max(99).optional().nullable(),
  standard_wiederholungen: z.number().int().min(1).max(999).optional().nullable(),
  standard_pause_sekunden: z.number().int().min(0).max(3600).optional().nullable(),
  is_public: z.boolean().optional(),
})

// ----------------------------------------------------------------
// Helper: Check if user can edit/delete this exercise
// ----------------------------------------------------------------
async function resolveUserRole(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, userId: string) {
  const { data } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", userId)
    .single()
  return data?.role ?? "therapeut"
}

// ----------------------------------------------------------------
// GET /api/exercises/[id]
// ----------------------------------------------------------------
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

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

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Ungültige Übungs-ID." }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("exercises")
    .select(
      `
      *,
      exercise_favorites!left(user_id)
      `
    )
    .eq("id", id)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: "Übung nicht gefunden oder keine Berechtigung." },
      { status: 404 }
    )
  }

  const favorites = data.exercise_favorites as { user_id: string }[] | null
  const is_favorite =
    Array.isArray(favorites) && favorites.some((f) => f.user_id === user.id)

  const { exercise_favorites: _fav, ...rest } = data as typeof data & {
    exercise_favorites: unknown
  }

  return NextResponse.json({ exercise: { ...rest, is_favorite } })
}

// ----------------------------------------------------------------
// PUT /api/exercises/[id]
// ----------------------------------------------------------------
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

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

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Ungültige Übungs-ID." }, { status: 400 })
  }

  // Fetch existing exercise (RLS: user can only see exercises they're allowed to see)
  const { data: existing, error: fetchError } = await supabase
    .from("exercises")
    .select("id, created_by, is_public")
    .eq("id", id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: "Übung nicht gefunden oder keine Berechtigung." },
      { status: 404 }
    )
  }

  // Permission check: only own exercises, or admin can edit any
  const role = await resolveUserRole(supabase, user.id)
  const canEdit = existing.created_by === user.id || role === "admin"
  if (!canEdit) {
    return NextResponse.json(
      { error: "Sie dürfen nur eigene Übungen bearbeiten." },
      { status: 403 }
    )
  }

  // Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = updateExerciseSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Validierungsfehler.",
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 422 }
    )
  }

  const values = parseResult.data

  // Only admins can toggle is_public
  let isPublic = existing.is_public
  if (typeof values.is_public === "boolean" && role === "admin") {
    isPublic = values.is_public
  }

  const updatePayload = {
    name: values.name,
    beschreibung: values.beschreibung?.trim() || null,
    ausfuehrung: values.ausfuehrung?.length ? values.ausfuehrung : null,
    muskelgruppen: values.muskelgruppen,
    schwierigkeitsgrad: values.schwierigkeitsgrad,
    media_url: values.media_url?.trim() || null,
    media_type: values.media_type || null,
    standard_saetze: values.standard_saetze ?? null,
    standard_wiederholungen: values.standard_wiederholungen ?? null,
    standard_pause_sekunden: values.standard_pause_sekunden ?? null,
    is_public: isPublic,
  }

  const { data: updated, error: updateError } = await supabase
    .from("exercises")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single()

  if (updateError) {
    console.error("[PUT /api/exercises/[id]] Supabase error:", updateError)
    return NextResponse.json(
      { error: "Übung konnte nicht aktualisiert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ exercise: { ...updated, is_favorite: false } })
}

// ----------------------------------------------------------------
// DELETE /api/exercises/[id]
// ----------------------------------------------------------------
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

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

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Ungültige Übungs-ID." }, { status: 400 })
  }

  // Fetch the exercise
  const { data: existing, error: fetchError } = await supabase
    .from("exercises")
    .select("id, created_by, is_public, media_url, media_type")
    .eq("id", id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: "Übung nicht gefunden oder keine Berechtigung." },
      { status: 404 }
    )
  }

  // Permission check
  const role = await resolveUserRole(supabase, user.id)
  const canDelete = existing.created_by === user.id || role === "admin"
  if (!canDelete) {
    return NextResponse.json(
      { error: "Sie dürfen nur eigene Übungen löschen." },
      { status: 403 }
    )
  }

  // Check if exercise is used in any training plan (PROJ-9 will add plan_exercises table)
  // For now, check for a future-proof reference. If the table doesn't exist yet, skip.
  let isUsedInPlan = false
  try {
    const { count } = await supabase
      .from("plan_exercises")
      .select("*", { count: "exact", head: true })
      .eq("exercise_id", id)
    isUsedInPlan = (count ?? 0) > 0
  } catch {
    // plan_exercises table doesn't exist yet (PROJ-9) — treat as not used
    isUsedInPlan = false
  }

  if (isUsedInPlan) {
    // Soft-delete: archive the exercise so training plans remain intact
    const { error: archiveError } = await supabase
      .from("exercises")
      .update({ is_archived: true })
      .eq("id", id)

    if (archiveError) {
      console.error("[DELETE /api/exercises/[id]] Archive error:", archiveError)
      return NextResponse.json(
        { error: "Übung konnte nicht archiviert werden." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      archived: true,
      message:
        "Übung wird in aktiven Trainingsplänen verwendet und wurde archiviert. Sie kann nicht neu zugewiesen werden.",
    })
  }

  // Hard-delete: remove media from Storage first, then delete the row
  if (existing.media_url) {
    try {
      // Extract the storage path from the public URL
      // URL format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
      const url = new URL(existing.media_url)
      const pathParts = url.pathname.split("/object/public/")
      if (pathParts.length === 2) {
        const [bucketAndPath] = pathParts[1].split("/")
        const bucket =
          existing.media_type === "video" ? "exercise-videos" : "exercise-images"
        const filePath = pathParts[1].replace(`${bucketAndPath}/`, "")
        await supabase.storage.from(bucket).remove([filePath])
      }
    } catch (storageErr) {
      // Storage cleanup failure is non-fatal; log and continue
      console.warn("[DELETE /api/exercises/[id]] Storage cleanup warning:", storageErr)
    }
  }

  const { error: deleteError } = await supabase
    .from("exercises")
    .delete()
    .eq("id", id)

  if (deleteError) {
    console.error("[DELETE /api/exercises/[id]] Delete error:", deleteError)
    return NextResponse.json(
      { error: "Übung konnte nicht gelöscht werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ deleted: true, message: "Übung erfolgreich gelöscht." })
}
