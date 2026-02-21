/**
 * PROJ-13: Kurs-System
 * GET  /api/courses/[id]/enrollments — Einschreibungen eines Kurses auflisten
 * POST /api/courses/[id]/enrollments — Patient einschreiben
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const enrollSchema = z.object({
  patient_id: z.string().uuid(),
})

// ── GET /api/courses/[id]/enrollments ────────────────────────────────────────

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

  // Check course exists
  const { data: course } = await supabase
    .from("courses")
    .select("id, version")
    .eq("id", courseId)
    .single()

  if (!course) {
    return NextResponse.json({ error: "Kurs nicht gefunden." }, { status: 404 })
  }

  // Get enrollments with patient name
  const { data: enrollments, error: enrollError } = await supabase
    .from("course_enrollments")
    .select("*, patients(first_name, last_name)")
    .eq("course_id", courseId)
    .order("enrolled_at", { ascending: false })

  if (enrollError) {
    console.error("[GET /api/courses/[id]/enrollments] Error:", enrollError)
    return NextResponse.json({ error: "Einschreibungen konnten nicht geladen werden." }, { status: 500 })
  }

  // Get lesson completions count per enrollment
  const enrollmentIds = (enrollments ?? []).map((e) => e.id)
  let completionCounts: Record<string, number> = {}

  if (enrollmentIds.length > 0) {
    const { data: completions } = await supabase
      .from("lesson_completions")
      .select("enrollment_id")
      .in("enrollment_id", enrollmentIds)

    completionCounts = (completions ?? []).reduce((acc, c) => {
      acc[c.enrollment_id] = (acc[c.enrollment_id] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  // Get total lesson count (snapshots for enrolled version)
  const enriched = (enrollments ?? []).map((e) => {
    const patient = e.patients as { first_name: string; last_name: string } | null
    return {
      id: e.id,
      course_id: e.course_id,
      patient_id: e.patient_id,
      enrolled_by: e.enrolled_by,
      enrolled_version: e.enrolled_version,
      status: e.status,
      enrolled_at: e.enrolled_at,
      completed_at: e.completed_at,
      cancelled_at: e.cancelled_at,
      patient_name: patient ? `${patient.first_name} ${patient.last_name}`.trim() : null,
      completed_lessons: completionCounts[e.id] || 0,
    }
  })

  return NextResponse.json({ enrollments: enriched })
}

// ── POST /api/courses/[id]/enrollments ───────────────────────────────────────

export async function POST(
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

  const parseResult = enrollSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { patient_id } = parseResult.data

  // Course must be published (version >= 1) and active
  const { data: course } = await supabase
    .from("courses")
    .select("id, version, status, is_archived")
    .eq("id", courseId)
    .single()

  if (!course) {
    return NextResponse.json({ error: "Kurs nicht gefunden." }, { status: 404 })
  }

  if (course.version < 1) {
    return NextResponse.json({ error: "Kurs wurde noch nicht veröffentlicht." }, { status: 422 })
  }

  if (course.is_archived) {
    return NextResponse.json({ error: "Kurs ist archiviert." }, { status: 422 })
  }

  // Check for existing enrollment
  const { data: existing } = await supabase
    .from("course_enrollments")
    .select("id, status")
    .eq("course_id", courseId)
    .eq("patient_id", patient_id)
    .single()

  if (existing) {
    if (existing.status === "aktiv") {
      return NextResponse.json({ error: "Patient ist bereits eingeschrieben." }, { status: 409 })
    }

    // Re-enroll: update existing enrollment with new version
    const { data: updated, error: updateError } = await supabase
      .from("course_enrollments")
      .update({
        status: "aktiv",
        enrolled_version: course.version,
        enrolled_by: user.id,
        enrolled_at: new Date().toISOString(),
        completed_at: null,
        cancelled_at: null,
      })
      .eq("id", existing.id)
      .select("*")
      .single()

    if (updateError) {
      console.error("[POST /api/courses/[id]/enrollments] Re-enroll Error:", updateError)
      return NextResponse.json({ error: "Re-Einschreibung fehlgeschlagen." }, { status: 500 })
    }

    // Clear old lesson completions
    await supabase
      .from("lesson_completions")
      .delete()
      .eq("enrollment_id", existing.id)

    return NextResponse.json({ enrollment: updated }, { status: 200 })
  }

  // New enrollment
  const { data: enrollment, error: insertError } = await supabase
    .from("course_enrollments")
    .insert({
      course_id: courseId,
      patient_id,
      enrolled_by: user.id,
      enrolled_version: course.version,
    })
    .select("*")
    .single()

  if (insertError) {
    console.error("[POST /api/courses/[id]/enrollments] Insert Error:", insertError)
    return NextResponse.json({ error: "Einschreibung fehlgeschlagen." }, { status: 500 })
  }

  return NextResponse.json({ enrollment }, { status: 201 })
}
