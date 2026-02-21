/**
 * PROJ-13: Kurs-System
 * GET    /api/courses/[id]  — Kurs-Detail mit Lektionen
 * PUT    /api/courses/[id]  — Kurs-Metadaten aktualisieren
 * DELETE /api/courses/[id]  — Kurs archivieren (soft-delete)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const updateCourseSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  beschreibung: z.string().max(5000).nullable().optional(),
  cover_image_url: z.string().max(1000).nullable().optional(),
  dauer_wochen: z.number().int().min(1).max(104).optional(),
  kategorie: z.enum(["ruecken", "schulter", "knie", "huefte", "nacken", "ganzkoerper", "sonstiges"]).optional(),
  unlock_mode: z.enum(["sequentiell", "alle_sofort"]).optional(),
})

// ── GET /api/courses/[id] ─────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: courseId } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  if (!UUID_REGEX.test(courseId)) {
    return NextResponse.json({ error: "Ungültige Kurs-ID." }, { status: 400 })
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .eq("is_archived", false)
    .single()

  if (courseError || !course) {
    return NextResponse.json({ error: "Kurs nicht gefunden." }, { status: 404 })
  }

  const { data: lessons } = await supabase
    .from("course_lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("order", { ascending: true })

  // Count enrollments
  const { count: enrollmentCount } = await supabase
    .from("course_enrollments")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId)
    .eq("status", "aktiv")

  return NextResponse.json({
    course: {
      ...course,
      lesson_count: (lessons ?? []).length,
      enrollment_count: enrollmentCount ?? 0,
    },
    lessons: lessons ?? [],
  })
}

// ── PUT /api/courses/[id] ─────────────────────────────────────────────────────

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: courseId } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  if (!UUID_REGEX.test(courseId)) {
    return NextResponse.json({ error: "Ungültige Kurs-ID." }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = updateCourseSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const updates = parseResult.data
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Keine Änderungen angegeben." }, { status: 400 })
  }

  const payload: Record<string, unknown> = {}
  if (updates.name !== undefined) payload.name = updates.name.trim()
  if ("beschreibung" in updates) payload.beschreibung = updates.beschreibung?.trim() || null
  if ("cover_image_url" in updates) payload.cover_image_url = updates.cover_image_url || null
  if (updates.dauer_wochen !== undefined) payload.dauer_wochen = updates.dauer_wochen
  if (updates.kategorie !== undefined) payload.kategorie = updates.kategorie
  if (updates.unlock_mode !== undefined) payload.unlock_mode = updates.unlock_mode

  const { data: updated, error: updateError } = await supabase
    .from("courses")
    .update(payload)
    .eq("id", courseId)
    .eq("is_archived", false)
    .select("*")
    .single()

  if (updateError) {
    if (updateError.code === "PGRST116") {
      return NextResponse.json({ error: "Kurs nicht gefunden oder keine Berechtigung." }, { status: 404 })
    }
    console.error("[PUT /api/courses/[id]] Error:", updateError)
    return NextResponse.json({ error: "Kurs konnte nicht aktualisiert werden." }, { status: 500 })
  }

  return NextResponse.json({ course: updated })
}

// ── DELETE /api/courses/[id] ──────────────────────────────────────────────────

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: courseId } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  if (!UUID_REGEX.test(courseId)) {
    return NextResponse.json({ error: "Ungültige Kurs-ID." }, { status: 400 })
  }

  const { error: updateError } = await supabase
    .from("courses")
    .update({ is_archived: true, status: "archiviert" })
    .eq("id", courseId)

  if (updateError) {
    console.error("[DELETE /api/courses/[id]] Error:", updateError)
    return NextResponse.json({ error: "Kurs konnte nicht archiviert werden." }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
