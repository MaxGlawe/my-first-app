/**
 * PROJ-13: Kurs-System
 * GET  /api/courses  — Kurs-Liste mit Filter/Suche
 * POST /api/courses  — Neuen Kurs erstellen (Entwurf)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const createCourseSchema = z.object({
  name: z.string().min(1, "Kursname ist erforderlich.").max(200).trim(),
  beschreibung: z.string().max(5000).optional().nullable().default(null),
  cover_image_url: z.string().max(1000).optional().nullable().default(null),
  dauer_wochen: z.number().int().min(1).max(104).default(8),
  kategorie: z.enum(["ruecken", "schulter", "knie", "huefte", "nacken", "ganzkoerper", "sonstiges"]),
  unlock_mode: z.enum(["sequentiell", "alle_sofort"]).default("sequentiell"),
})

// ── GET /api/courses ──────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") || "alle"
  const kategorie = searchParams.get("kategorie") || ""
  const search = searchParams.get("search") || ""
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "24", 10)))

  let query = supabase
    .from("courses")
    .select("id, name, beschreibung, cover_image_url, kategorie, status, version, dauer_wochen, unlock_mode, created_at, updated_at, is_archived", { count: "exact" })
    .eq("is_archived", false)
    .order("created_at", { ascending: false })

  if (status !== "alle") {
    query = query.eq("status", status)
  }
  if (kategorie) {
    query = query.eq("kategorie", kategorie)
  }
  if (search) {
    query = query.ilike("name", `%${search.replace(/%/g, "\\%")}%`)
  }

  const from = (page - 1) * pageSize
  query = query.range(from, from + pageSize - 1)

  const { data: courses, error, count } = await query

  if (error) {
    console.error("[GET /api/courses] Supabase error:", error)
    return NextResponse.json({ error: "Kurse konnten nicht geladen werden." }, { status: 500 })
  }

  // Compute lesson_count and enrollment_count for each course
  const courseIds = (courses ?? []).map((c) => c.id)
  let lessonCounts: Record<string, number> = {}
  let enrollmentCounts: Record<string, number> = {}

  if (courseIds.length > 0) {
    const { data: lessonData } = await supabase
      .from("course_lessons")
      .select("course_id")
      .in("course_id", courseIds)

    lessonCounts = (lessonData ?? []).reduce((acc, l) => {
      acc[l.course_id] = (acc[l.course_id] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const { data: enrollmentData } = await supabase
      .from("course_enrollments")
      .select("course_id")
      .in("course_id", courseIds)
      .eq("status", "aktiv")

    enrollmentCounts = (enrollmentData ?? []).reduce((acc, e) => {
      acc[e.course_id] = (acc[e.course_id] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  const result = (courses ?? []).map((c) => ({
    ...c,
    lesson_count: lessonCounts[c.id] || 0,
    enrollment_count: enrollmentCounts[c.id] || 0,
  }))

  return NextResponse.json({
    courses: result,
    totalCount: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  })
}

// ── POST /api/courses ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Role check
  const { createSupabaseServiceClient } = await import("@/lib/supabase-service")
  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const role = profile?.role
  if (!role || !["physiotherapeut", "heilpraktiker", "admin"].includes(role)) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = createCourseSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { name, beschreibung, cover_image_url, dauer_wochen, kategorie, unlock_mode } = parseResult.data

  const { data: created, error: insertError } = await supabase
    .from("courses")
    .insert({
      created_by: user.id,
      name: name.trim(),
      beschreibung: beschreibung?.trim() || null,
      cover_image_url: cover_image_url || null,
      dauer_wochen,
      kategorie,
      unlock_mode,
      status: "entwurf",
      version: 0,
    })
    .select("*")
    .single()

  if (insertError) {
    console.error("[POST /api/courses] Insert error:", insertError)
    return NextResponse.json({ error: "Kurs konnte nicht erstellt werden." }, { status: 500 })
  }

  return NextResponse.json({ course: created }, { status: 201 })
}
