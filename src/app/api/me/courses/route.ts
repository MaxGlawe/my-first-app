/**
 * PROJ-13: Kurs-System
 * GET /api/me/courses — Meine eingeschriebenen Kurse (Patient)
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(
  _request: NextRequest,
) {
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
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

  // Get all active/completed enrollments with course info
  const { data: enrollments, error: enrollError } = await supabase
    .from("course_enrollments")
    .select("*, courses(name, beschreibung, cover_image_url, kategorie, dauer_wochen, unlock_mode)")
    .eq("patient_id", patient.id)
    .in("status", ["aktiv", "abgeschlossen"])
    .order("enrolled_at", { ascending: false })

  if (enrollError) {
    console.error("[GET /api/me/courses] Error:", enrollError)
    return NextResponse.json({ error: "Kurse konnten nicht geladen werden." }, { status: 500 })
  }

  // For each enrollment, get snapshot lesson count + completion count
  const result = await Promise.all(
    (enrollments ?? []).map(async (e) => {
      const course = e.courses as {
        name: string
        beschreibung: string | null
        cover_image_url: string | null
        kategorie: string
        dauer_wochen: number
        unlock_mode: string
      } | null

      // Count snapshots for enrolled version
      const { count: totalLessons } = await supabase
        .from("course_lesson_snapshots")
        .select("id", { count: "exact", head: true })
        .eq("course_id", e.course_id)
        .eq("version", e.enrolled_version)

      // Count completions
      const { count: completedLessons } = await supabase
        .from("lesson_completions")
        .select("id", { count: "exact", head: true })
        .eq("enrollment_id", e.id)

      const total = totalLessons ?? 0
      const completed = completedLessons ?? 0

      return {
        enrollment_id: e.id,
        course_id: e.course_id,
        course_name: course?.name ?? "",
        course_beschreibung: course?.beschreibung ?? null,
        cover_image_url: course?.cover_image_url ?? null,
        kategorie: course?.kategorie ?? "sonstiges",
        unlock_mode: course?.unlock_mode ?? "sequentiell",
        dauer_wochen: course?.dauer_wochen ?? 8,
        enrolled_version: e.enrolled_version,
        status: e.status,
        enrolled_at: e.enrolled_at,
        progress_percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        completed_count: completed,
        total_count: total,
      }
    })
  )

  return NextResponse.json({ courses: result })
}
