/**
 * PROJ-13: Kurs-System
 * PUT /api/courses/[id]/lessons — Lektionen atomar speichern (via RPC)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const exerciseParamsSchema = z.object({
  saetze: z.number().int().min(1).max(20),
  wiederholungen: z.number().int().min(1).max(100).nullable().optional(),
  dauer_sekunden: z.number().int().min(1).max(3600).nullable().optional(),
  pause_sekunden: z.number().int().min(0).max(600),
  anmerkung: z.string().max(500).nullable().optional(),
})

const lessonExerciseSchema = z.object({
  exercise_id: z.string().uuid(),
  exercise_name: z.string().optional(),
  exercise_media_url: z.string().nullable().optional(),
  params: exerciseParamsSchema,
})

const lessonSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  beschreibung: z.string().max(50000).nullable().optional(),
  video_url: z.string().max(1000).nullable().optional(),
  exercise_unit: z.array(lessonExerciseSchema).nullable().optional(),
})

const saveLessonsSchema = z.object({
  lessons: z.array(lessonSchema).max(100),
})

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

  const parseResult = saveLessonsSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  // Clean up lessons for RPC
  const lessonsPayload = parseResult.data.lessons.map((l) => ({
    title: l.title.trim(),
    beschreibung: l.beschreibung?.trim() || null,
    video_url: l.video_url?.trim() || null,
    exercise_unit: l.exercise_unit && l.exercise_unit.length > 0 ? l.exercise_unit : null,
  }))

  const { error: rpcError } = await supabase.rpc("save_course_lessons", {
    p_course_id: courseId,
    p_lessons: lessonsPayload,
  })

  if (rpcError) {
    console.error("[PUT /api/courses/[id]/lessons] RPC Error:", rpcError)
    if (rpcError.message?.includes("Not authorized")) {
      return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
    }
    return NextResponse.json({ error: "Lektionen konnten nicht gespeichert werden." }, { status: 500 })
  }

  // Return updated lessons
  const { data: lessons } = await supabase
    .from("course_lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("order", { ascending: true })

  return NextResponse.json({ lessons: lessons ?? [] })
}
