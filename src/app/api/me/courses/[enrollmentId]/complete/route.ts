/**
 * PROJ-13: Kurs-System
 * POST /api/me/courses/[enrollmentId]/complete — Lektion abschließen (Patient)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const completeSchema = z.object({
  lesson_id: z.string().uuid(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  const { enrollmentId } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  if (!UUID_REGEX.test(enrollmentId)) {
    return NextResponse.json({ error: "Ungültige Einschreibungs-ID." }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = completeSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { lesson_id } = parseResult.data

  // Find patient
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!patient) {
    return NextResponse.json({ error: "Kein Patientenprofil gefunden." }, { status: 403 })
  }

  // Verify enrollment belongs to this patient and is active
  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("id, course_id, enrolled_version, status, courses(unlock_mode)")
    .eq("id", enrollmentId)
    .eq("patient_id", patient.id)
    .eq("status", "aktiv")
    .single()

  if (!enrollment) {
    return NextResponse.json({ error: "Einschreibung nicht gefunden oder nicht aktiv." }, { status: 404 })
  }

  const courseData = enrollment.courses as unknown as { unlock_mode: string } | null

  // Verify lesson exists in snapshots for this version
  const { data: snapshots } = await supabase
    .from("course_lesson_snapshots")
    .select("lesson_id, \"order\"")
    .eq("course_id", enrollment.course_id)
    .eq("version", enrollment.enrolled_version)
    .order("order", { ascending: true })

  const lessonSnapshot = (snapshots ?? []).find((s) => s.lesson_id === lesson_id)
  if (!lessonSnapshot) {
    return NextResponse.json({ error: "Lektion nicht in diesem Kurs gefunden." }, { status: 404 })
  }

  // Check sequential unlock
  if (courseData?.unlock_mode === "sequentiell") {
    const lessonOrder = lessonSnapshot.order
    if (lessonOrder > 0) {
      // Find previous lesson
      const prevLesson = (snapshots ?? []).find((s) => s.order === lessonOrder - 1)
      if (prevLesson) {
        const { data: prevCompletion } = await supabase
          .from("lesson_completions")
          .select("id")
          .eq("enrollment_id", enrollmentId)
          .eq("lesson_id", prevLesson.lesson_id)
          .single()

        if (!prevCompletion) {
          return NextResponse.json({ error: "Vorherige Lektion muss zuerst abgeschlossen werden." }, { status: 422 })
        }
      }
    }
  }

  // Check if already completed
  const { data: existing } = await supabase
    .from("lesson_completions")
    .select("id")
    .eq("enrollment_id", enrollmentId)
    .eq("lesson_id", lesson_id)
    .single()

  if (existing) {
    return NextResponse.json({ error: "Lektion wurde bereits abgeschlossen." }, { status: 409 })
  }

  // Insert completion
  const { data: completion, error: insertError } = await supabase
    .from("lesson_completions")
    .insert({
      enrollment_id: enrollmentId,
      lesson_id,
      patient_id: patient.id,
    })
    .select("*")
    .single()

  if (insertError) {
    console.error("[POST /api/me/courses/[eId]/complete] Insert Error:", insertError)
    return NextResponse.json({ error: "Lektion konnte nicht als abgeschlossen markiert werden." }, { status: 500 })
  }

  // Check if all lessons are now completed → auto-complete enrollment
  const { count: totalLessons } = await supabase
    .from("course_lesson_snapshots")
    .select("id", { count: "exact", head: true })
    .eq("course_id", enrollment.course_id)
    .eq("version", enrollment.enrolled_version)

  const { count: completedLessons } = await supabase
    .from("lesson_completions")
    .select("id", { count: "exact", head: true })
    .eq("enrollment_id", enrollmentId)

  if (totalLessons && completedLessons && completedLessons >= totalLessons) {
    await supabase
      .from("course_enrollments")
      .update({ status: "abgeschlossen", completed_at: new Date().toISOString() })
      .eq("id", enrollmentId)
  }

  return NextResponse.json({
    completion,
    is_course_completed: (totalLessons && completedLessons && completedLessons >= totalLessons) || false,
  }, { status: 201 })
}
