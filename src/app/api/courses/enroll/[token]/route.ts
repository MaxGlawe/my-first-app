/**
 * PROJ-13: Kurs-System
 * POST /api/courses/enroll/[token] — Selbst-Einschreibung via Einladungstoken
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  if (!token || token.length < 10) {
    return NextResponse.json({ error: "Ungültiger Einladungstoken." }, { status: 400 })
  }

  // Find course by invite token
  const { data: course } = await supabase
    .from("courses")
    .select("id, name, version, status, is_archived, invite_enabled")
    .eq("invite_token", token)
    .single()

  if (!course) {
    return NextResponse.json({ error: "Kurs nicht gefunden." }, { status: 404 })
  }

  if (!course.invite_enabled) {
    return NextResponse.json({ error: "Einladungslink ist deaktiviert." }, { status: 410 })
  }

  if (course.is_archived || course.status === "archiviert") {
    return NextResponse.json({ error: "Kurs ist archiviert." }, { status: 410 })
  }

  if (course.version < 1) {
    return NextResponse.json({ error: "Kurs ist noch nicht veröffentlicht." }, { status: 422 })
  }

  // Find patient record for this user
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!patient) {
    return NextResponse.json({ error: "Kein Patientenprofil gefunden." }, { status: 403 })
  }

  // Check for existing enrollment
  const { data: existing } = await supabase
    .from("course_enrollments")
    .select("id, status")
    .eq("course_id", course.id)
    .eq("patient_id", patient.id)
    .single()

  if (existing) {
    if (existing.status === "aktiv") {
      return NextResponse.json({
        error: "Sie sind bereits in diesem Kurs eingeschrieben.",
        enrollment_id: existing.id,
      }, { status: 409 })
    }

    // Re-enroll
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
      console.error("[POST /api/courses/enroll/[token]] Re-enroll Error:", updateError)
      return NextResponse.json({ error: "Einschreibung fehlgeschlagen." }, { status: 500 })
    }

    // Clear old completions
    await supabase
      .from("lesson_completions")
      .delete()
      .eq("enrollment_id", existing.id)

    return NextResponse.json({
      enrollment: updated,
      course_name: course.name,
    })
  }

  // New enrollment
  const { data: enrollment, error: insertError } = await supabase
    .from("course_enrollments")
    .insert({
      course_id: course.id,
      patient_id: patient.id,
      enrolled_by: user.id,
      enrolled_version: course.version,
    })
    .select("*")
    .single()

  if (insertError) {
    console.error("[POST /api/courses/enroll/[token]] Insert Error:", insertError)
    return NextResponse.json({ error: "Einschreibung fehlgeschlagen." }, { status: 500 })
  }

  return NextResponse.json({
    enrollment,
    course_name: course.name,
  }, { status: 201 })
}

// ── GET /api/courses/enroll/[token] — Kurs-Info für Einladungsseite ─────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  if (!token || token.length < 10) {
    return NextResponse.json({ error: "Ungültiger Einladungstoken." }, { status: 400 })
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, name, beschreibung, cover_image_url, kategorie, dauer_wochen, invite_enabled, is_archived, version, status")
    .eq("invite_token", token)
    .single()

  if (!course) {
    return NextResponse.json({ error: "Kurs nicht gefunden." }, { status: 404 })
  }

  if (!course.invite_enabled) {
    return NextResponse.json({ error: "Einladungslink ist deaktiviert." }, { status: 410 })
  }

  // Check if user already enrolled
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .single()

  let isEnrolled = false
  if (patient) {
    const { data: existing } = await supabase
      .from("course_enrollments")
      .select("id, status")
      .eq("course_id", course.id)
      .eq("patient_id", patient.id)
      .eq("status", "aktiv")
      .single()
    isEnrolled = !!existing
  }

  // Count lessons
  const { count: lessonCount } = await supabase
    .from("course_lesson_snapshots")
    .select("id", { count: "exact", head: true })
    .eq("course_id", course.id)
    .eq("version", course.version)

  return NextResponse.json({
    course: {
      id: course.id,
      name: course.name,
      beschreibung: course.beschreibung,
      cover_image_url: course.cover_image_url,
      kategorie: course.kategorie,
      dauer_wochen: course.dauer_wochen,
      lesson_count: lessonCount ?? 0,
    },
    is_enrolled: isEnrolled,
  })
}
