/**
 * GET/POST /api/admin/courses/seed-traumreisen
 *
 * Seeds 3 Traumreise courses (Wald, Meer, Berge) with 8 lessons each,
 * plus 10 relaxation exercises for the exercise database.
 *
 * Access: Admin only.
 * Idempotent: Skips existing courses (by name) and exercises (by name + is_public).
 *
 * GET is provided so you can trigger it by visiting the URL in the browser.
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import {
  TRAUMREISE_COURSES,
  RELAXATION_EXERCISES,
} from "@/data/traumreise-content"

export async function POST(request: Request) {
  const url = new URL(request.url)
  const force = url.searchParams.get("force") === "true"

  const supabase = await createSupabaseServerClient()

  // ── Auth ──────────────────────────────────────────────────────────────────
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

  // ── Admin role check ──────────────────────────────────────────────────────
  const serviceClient = createSupabaseServiceClient()

  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    return NextResponse.json(
      { error: "Nur Administratoren können Kurse seeden." },
      { status: 403 }
    )
  }

  // ── 1. Seed relaxation exercises ──────────────────────────────────────────
  const { data: existingExercises } = await serviceClient
    .from("exercises")
    .select("id, name")
    .eq("is_public", true)

  const existingExerciseNames = new Set(
    (existingExercises ?? []).map((e) => e.name.toLowerCase())
  )

  // Map exercise name → ID (for linking to lessons later)
  const exerciseNameToId: Record<string, string> = {}
  for (const ex of existingExercises ?? []) {
    exerciseNameToId[ex.name.toLowerCase()] = ex.id
  }

  const exercisesToInsert = RELAXATION_EXERCISES.filter(
    (ex) => !existingExerciseNames.has(ex.name.toLowerCase())
  ).map((ex) => ({
    name: ex.name,
    beschreibung: ex.beschreibung,
    ausfuehrung: [...ex.ausfuehrung],
    muskelgruppen: [...ex.muskelgruppen],
    schwierigkeitsgrad: ex.schwierigkeitsgrad,
    standard_saetze: ex.standard_saetze,
    standard_wiederholungen: ex.standard_wiederholungen,
    standard_dauer_sekunden: ex.standard_dauer_sekunden,
    standard_pause_sekunden: ex.standard_pause_sekunden,
    is_public: true,
    created_by: user.id,
  }))

  let exercisesInserted = 0

  if (exercisesToInsert.length > 0) {
    const { data: inserted, error: insertError } = await serviceClient
      .from("exercises")
      .insert(exercisesToInsert)
      .select("id, name")

    if (insertError) {
      console.error("[seed-traumreisen] Exercise insert error:", insertError)
      return NextResponse.json(
        { error: "Fehler beim Einfügen der Entspannungsübungen.", details: insertError.message },
        { status: 500 }
      )
    }

    exercisesInserted = inserted?.length ?? 0

    // Add newly inserted exercises to the name→ID map
    for (const ex of inserted ?? []) {
      exerciseNameToId[ex.name.toLowerCase()] = ex.id
    }
  }

  // ── 2. Check for existing courses (force=true → delete first) ─────────────
  const courseNames = TRAUMREISE_COURSES.map((c) => c.name)

  if (force) {
    // Delete existing Traumreise courses (cascade removes lessons, snapshots, enrollments)
    const { data: toDelete } = await serviceClient
      .from("courses")
      .select("id")
      .in("name", courseNames)

    if (toDelete && toDelete.length > 0) {
      const ids = toDelete.map((c) => c.id)

      // Delete in correct order: snapshots → enrollments → lessons → course
      await serviceClient.from("course_lesson_snapshots").delete().in("course_id", ids)
      await serviceClient.from("course_enrollments").delete().in("course_id", ids)
      await serviceClient.from("course_lessons").delete().in("course_id", ids)
      await serviceClient.from("courses").delete().in("id", ids)
    }
  }

  const { data: existingCourses } = await serviceClient
    .from("courses")
    .select("id, name")
    .in("name", courseNames)

  const existingCourseNames = new Set(
    (existingCourses ?? []).map((c) => c.name)
  )

  const coursesToCreate = TRAUMREISE_COURSES.filter(
    (c) => !existingCourseNames.has(c.name)
  )

  if (coursesToCreate.length === 0) {
    return NextResponse.json({
      exercises_inserted: exercisesInserted,
      exercises_skipped: RELAXATION_EXERCISES.length - exercisesInserted,
      courses_created: 0,
      courses_skipped: TRAUMREISE_COURSES.length,
      published: false,
      message: "Alle Traumreise-Kurse existieren bereits. Übungen wurden ggf. ergänzt.",
    })
  }

  // ── 3. Create courses + lessons + publish ──────────────────────────────────
  const createdCourseIds: string[] = []

  for (const courseSeed of coursesToCreate) {
    // 3a. Insert course
    const { data: course, error: courseError } = await serviceClient
      .from("courses")
      .insert({
        created_by: user.id,
        name: courseSeed.name,
        beschreibung: courseSeed.beschreibung,
        kategorie: courseSeed.kategorie,
        dauer_wochen: courseSeed.dauer_wochen,
        unlock_mode: courseSeed.unlock_mode,
        status: "entwurf",
        version: 0,
      })
      .select("id")
      .single()

    if (courseError || !course) {
      console.error(`[seed-traumreisen] Course insert error for "${courseSeed.name}":`, courseError)
      continue
    }

    // 3b. Insert lessons
    const lessonsPayload = courseSeed.lessons.map((lesson, index) => {
      // Build exercise_unit from exercise names
      const exerciseUnit = lesson.exerciseNames
        .map((name) => {
          const exerciseId = exerciseNameToId[name.toLowerCase()]
          if (!exerciseId) return null

          // Find the exercise definition for default params
          const exerciseDef = RELAXATION_EXERCISES.find(
            (e) => e.name.toLowerCase() === name.toLowerCase()
          )

          return {
            exercise_id: exerciseId,
            exercise_name: name,
            exercise_media_url: null,
            params: {
              saetze: exerciseDef?.standard_saetze ?? 1,
              wiederholungen: exerciseDef?.standard_wiederholungen ?? null,
              dauer_sekunden: exerciseDef?.standard_dauer_sekunden ?? null,
              pause_sekunden: exerciseDef?.standard_pause_sekunden ?? 0,
              anmerkung: null,
            },
          }
        })
        .filter(Boolean)

      return {
        course_id: course.id,
        title: lesson.title,
        beschreibung: lesson.beschreibung,
        video_url: null,
        exercise_unit: exerciseUnit.length > 0 ? exerciseUnit : null,
        order: index,
      }
    })

    const { error: lessonsError } = await serviceClient
      .from("course_lessons")
      .insert(lessonsPayload)

    if (lessonsError) {
      console.error(`[seed-traumreisen] Lessons insert error for "${courseSeed.name}":`, lessonsError)
      continue
    }

    // 3c. Publish: manually replicate publish_course RPC logic
    //     (RPC uses auth.uid() which doesn't work with service client)
    const newVersion = 1

    // Update course status and version
    const { error: publishError } = await serviceClient
      .from("courses")
      .update({
        version: newVersion,
        status: "aktiv",
        updated_at: new Date().toISOString(),
      })
      .eq("id", course.id)

    if (publishError) {
      console.error(`[seed-traumreisen] Publish error for "${courseSeed.name}":`, publishError)
      continue
    }

    // Create lesson snapshots
    const { data: lessons } = await serviceClient
      .from("course_lessons")
      .select("id, course_id, title, beschreibung, video_url, exercise_unit, order")
      .eq("course_id", course.id)
      .order("order", { ascending: true })

    if (lessons && lessons.length > 0) {
      const snapshots = lessons.map((l) => ({
        course_id: l.course_id,
        lesson_id: l.id,
        version: newVersion,
        title: l.title,
        beschreibung: l.beschreibung,
        video_url: l.video_url,
        exercise_unit: l.exercise_unit,
        order: l.order,
      }))

      const { error: snapshotError } = await serviceClient
        .from("course_lesson_snapshots")
        .insert(snapshots)

      if (snapshotError) {
        console.error(`[seed-traumreisen] Snapshot error for "${courseSeed.name}":`, snapshotError)
      }
    }

    createdCourseIds.push(course.id)
  }

  return NextResponse.json({
    exercises_inserted: exercisesInserted,
    exercises_skipped: RELAXATION_EXERCISES.length - exercisesInserted,
    courses_created: createdCourseIds.length,
    courses_skipped: TRAUMREISE_COURSES.length - coursesToCreate.length,
    course_ids: createdCourseIds,
    published: createdCourseIds.length > 0,
    message: `${createdCourseIds.length} Traumreise-Kurse erstellt und veröffentlicht. ${exercisesInserted} Entspannungsübungen hinzugefügt.`,
  })
}

// GET handler — same logic, so you can trigger it by visiting the URL in the browser
export async function GET(request: Request) {
  return POST(request)
}
