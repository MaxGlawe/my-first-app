/**
 * PROJ-8: Übungsdatenbank-Verwaltung
 * GET  /api/exercises  — Übungsliste mit Suche (FTS), Filtern und Pagination
 * POST /api/exercises  — Neue Übung erstellen
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const PAGE_SIZE = 24

// ----------------------------------------------------------------
// Shared Zod schemas
// ----------------------------------------------------------------
const ausfuehrungsSchrittSchema = z.object({
  nummer: z.number().int().min(1),
  beschreibung: z.string().min(1).max(1000),
})

const exerciseBaseSchema = z.object({
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
// GET /api/exercises
// ----------------------------------------------------------------
export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")?.trim() ?? ""
  const schwierigkeitsgrad = searchParams.get("schwierigkeitsgrad") ?? ""
  const muskelgruppenRaw = searchParams.get("muskelgruppen") ?? ""
  const quelle = searchParams.get("quelle") ?? "alle"
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const pageSize = Math.min(
    PAGE_SIZE,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? String(PAGE_SIZE), 10))
  )

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Parse muskelgruppen filter (comma-separated)
  const muskelgruppen = muskelgruppenRaw
    ? muskelgruppenRaw.split(",").map((m) => m.trim()).filter(Boolean)
    : []

  // Base query — join favorites for the current user
  let query = supabase
    .from("exercises")
    .select(
      `
      id,
      created_at,
      updated_at,
      name,
      beschreibung,
      ausfuehrung,
      muskelgruppen,
      schwierigkeitsgrad,
      media_url,
      media_type,
      standard_saetze,
      standard_wiederholungen,
      standard_pause_sekunden,
      is_public,
      is_archived,
      created_by,
      exercise_favorites!left(user_id)
      `,
      { count: "exact" }
    )
    .eq("is_archived", false)
    .order("name", { ascending: true })
    .range(from, to)

  // Source filter (quelle)
  switch (quelle) {
    case "praxis":
      query = query.eq("is_public", true)
      break
    case "eigene":
      query = query.eq("is_public", false).eq("created_by", user.id)
      break
    case "favoriten": {
      // BUG-5: Fetch current user's favorite IDs explicitly — safe and user-scoped
      const { data: favRows } = await supabase
        .from("exercise_favorites")
        .select("exercise_id")
        .eq("user_id", user.id)
      const favIds = (favRows ?? []).map((r) => r.exercise_id)
      if (favIds.length === 0) {
        return NextResponse.json({ exercises: [], totalCount: 0, page, pageSize, totalPages: 1 })
      }
      query = query.in("id", favIds)
      break
    }
    // "alle" — no additional filter; RLS handles visibility
  }

  // Full-text search (Supabase FTS)
  if (search) {
    query = query.textSearch("fts_vector", search, {
      type: "websearch",
      config: "german",
    })
  }

  // Schwierigkeitsgrad filter
  if (schwierigkeitsgrad && ["anfaenger", "mittel", "fortgeschritten"].includes(schwierigkeitsgrad)) {
    query = query.eq("schwierigkeitsgrad", schwierigkeitsgrad)
  }

  // Muskelgruppen filter — exercise must contain ALL selected groups (overlap: contains any)
  if (muskelgruppen.length > 0) {
    // Use PostgreSQL @> (contains) for "must include all" — or && (overlap) for "any of"
    // The spec says multi-select filter — we use overlap (any match) for better UX
    query = query.overlaps("muskelgruppen", muskelgruppen)
  }

  const { data, error, count } = await query

  if (error) {
    console.error("[GET /api/exercises] Supabase error:", error)
    return NextResponse.json(
      { error: "Übungen konnten nicht geladen werden." },
      { status: 500 }
    )
  }

  // Map: add is_favorite computed field from the join
  const exercises = (data ?? []).map((row) => {
    const favorites = row.exercise_favorites as { user_id: string }[] | null
    const is_favorite =
      Array.isArray(favorites) && favorites.some((f) => f.user_id === user.id)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { exercise_favorites: _fav, ...rest } = row as typeof row & {
      exercise_favorites: unknown
    }
    return { ...rest, is_favorite }
  })

  return NextResponse.json({
    exercises,
    totalCount: count ?? 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  })
}

// ----------------------------------------------------------------
// POST /api/exercises
// ----------------------------------------------------------------
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

  // Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = exerciseBaseSchema.safeParse(body)
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

  // Only admins can create public (Praxis-Bibliothek) exercises directly
  let isPublic = false
  if (values.is_public === true) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role === "admin") {
      isPublic = true
    }
    // Non-admins silently create private exercises even if they sent is_public=true
  }

  const payload = {
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
    created_by: user.id,
  }

  const { data: created, error: insertError } = await supabase
    .from("exercises")
    .insert(payload)
    .select(
      "id, name, muskelgruppen, schwierigkeitsgrad, is_public, is_archived, created_by, created_at, updated_at"
    )
    .single()

  if (insertError) {
    console.error("[POST /api/exercises] Supabase error:", insertError)
    return NextResponse.json(
      { error: "Übung konnte nicht gespeichert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ exercise: { ...created, is_favorite: false } }, { status: 201 })
}
