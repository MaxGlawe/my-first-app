/**
 * PROJ-13: Kurs-System
 * GET /api/me/courses/[enrollmentId] — Kurs-Detail mit Lektionen (Patient)
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  _request: NextRequest,
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

  // Find patient record
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!patient) {
    return NextResponse.json({ error: "Kein Patientenprofil gefunden." }, { status: 403 })
  }

  // Get enrollment (must belong to this patient)
  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("*, courses(name, beschreibung, cover_image_url, kategorie, dauer_wochen, unlock_mode)")
    .eq("id", enrollmentId)
    .eq("patient_id", patient.id)
    .single()

  if (!enrollment) {
    return NextResponse.json({ error: "Einschreibung nicht gefunden." }, { status: 404 })
  }

  const course = enrollment.courses as {
    name: string
    beschreibung: string | null
    cover_image_url: string | null
    kategorie: string
    dauer_wochen: number
    unlock_mode: string
  } | null

  // Get lesson snapshots for enrolled version
  const { data: snapshots } = await supabase
    .from("course_lesson_snapshots")
    .select("*")
    .eq("course_id", enrollment.course_id)
    .eq("version", enrollment.enrolled_version)
    .order("order", { ascending: true })

  // Get completions
  const { data: completions } = await supabase
    .from("lesson_completions")
    .select("lesson_id, completed_at")
    .eq("enrollment_id", enrollmentId)

  const completionMap = new Map(
    (completions ?? []).map((c) => [c.lesson_id, c.completed_at])
  )

  // Build lesson list with unlock logic
  const lessons = (snapshots ?? []).map((s, index) => {
    const isCompleted = completionMap.has(s.lesson_id)
    let isUnlocked = true

    if (course?.unlock_mode === "sequentiell") {
      if (index === 0) {
        isUnlocked = true
      } else {
        // Previous lesson must be completed
        const prevLesson = snapshots![index - 1]
        isUnlocked = completionMap.has(prevLesson.lesson_id)
      }
    }

    return {
      lesson_id: s.lesson_id,
      snapshot_id: s.id,
      title: s.title,
      beschreibung: s.beschreibung,
      video_url: s.video_url,
      exercise_unit: s.exercise_unit,
      order: s.order,
      is_completed: isCompleted,
      is_unlocked: isUnlocked,
      completed_at: completionMap.get(s.lesson_id) ?? null,
    }
  })

  const completedCount = lessons.filter((l) => l.is_completed).length
  const totalCount = lessons.length

  return NextResponse.json({
    enrollment_id: enrollment.id,
    course_id: enrollment.course_id,
    course_name: course?.name ?? "",
    course_beschreibung: course?.beschreibung ?? null,
    cover_image_url: course?.cover_image_url ?? null,
    kategorie: course?.kategorie ?? "sonstiges",
    unlock_mode: course?.unlock_mode ?? "sequentiell",
    dauer_wochen: course?.dauer_wochen ?? 8,
    enrolled_version: enrollment.enrolled_version,
    status: enrollment.status,
    enrolled_at: enrollment.enrolled_at,
    lessons,
    progress_percent: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
    completed_count: completedCount,
    total_count: totalCount,
  })
}
