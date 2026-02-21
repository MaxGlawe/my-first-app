/**
 * PROJ-13: Kurs-System
 * PATCH /api/courses/[id]/enrollments/[enrollmentId] — Einschreibung aktualisieren (Status ändern)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const patchEnrollmentSchema = z.object({
  status: z.enum(["aktiv", "abgeschlossen", "abgebrochen"]),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; enrollmentId: string }> }
) {
  const { id: courseId, enrollmentId } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  if (!UUID_REGEX.test(courseId) || !UUID_REGEX.test(enrollmentId)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = patchEnrollmentSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { status } = parseResult.data

  const payload: Record<string, unknown> = { status }
  if (status === "abgeschlossen") {
    payload.completed_at = new Date().toISOString()
  } else if (status === "abgebrochen") {
    payload.cancelled_at = new Date().toISOString()
  } else if (status === "aktiv") {
    payload.completed_at = null
    payload.cancelled_at = null
  }

  const { data: updated, error: updateError } = await supabase
    .from("course_enrollments")
    .update(payload)
    .eq("id", enrollmentId)
    .eq("course_id", courseId)
    .select("*")
    .single()

  if (updateError || !updated) {
    if (updateError?.code === "PGRST116") {
      return NextResponse.json({ error: "Einschreibung nicht gefunden." }, { status: 404 })
    }
    console.error("[PATCH /api/courses/[id]/enrollments/[eId]] Error:", updateError)
    return NextResponse.json({ error: "Einschreibung konnte nicht aktualisiert werden." }, { status: 500 })
  }

  return NextResponse.json({ enrollment: updated })
}
