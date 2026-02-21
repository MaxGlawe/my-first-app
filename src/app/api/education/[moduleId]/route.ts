/**
 * PROJ-17: GET/PUT /api/education/[moduleId]
 * GET  — Fetch a single education module with its quizzes
 * PUT  — Update module (edit lesson, change status to freigegeben/archiviert)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const updateSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  lesson_content: z.string().min(10).optional(),
  status: z.enum(["entwurf", "freigegeben", "archiviert"]).optional(),
})

interface RouteContext {
  params: Promise<{ moduleId: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { moduleId } = await context.params
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const { data: module, error } = await supabase
    .from("education_modules")
    .select(`
      id, hauptproblem, title, lesson_content, generated_by, status, lesson_number, total_lessons, curriculum, created_at, updated_at,
      education_quizzes (id, module_id, question_number, question_text, options, correct_index, explanation)
    `)
    .eq("id", moduleId)
    .maybeSingle()

  if (error) {
    console.error("[GET /api/education/[moduleId]] Supabase error:", error)
    return NextResponse.json({ error: "Modul konnte nicht geladen werden." }, { status: 500 })
  }

  if (!module) {
    return NextResponse.json({ error: "Modul nicht gefunden." }, { status: 404 })
  }

  return NextResponse.json({
    module: {
      ...module,
      quizzes: module.education_quizzes ?? [],
    },
  })
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { moduleId } = await context.params
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Check staff role — use service client to bypass potential RLS on user_profiles
  const { createSupabaseServiceClient } = await import("@/lib/supabase-service")
  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const staffRoles = ["admin", "heilpraktiker", "physiotherapeut", "praeventionstrainer", "personal_trainer"]
  if (!profile || !staffRoles.includes(profile.role)) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  // Parse body
  let body: z.infer<typeof updateSchema>
  try {
    body = updateSchema.parse(await request.json())
  } catch (err) {
    const msg = err instanceof z.ZodError ? (err as z.ZodError).issues[0]?.message : "Ungültige Eingabe."
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  if (Object.keys(body).length === 0) {
    return NextResponse.json({ error: "Keine Änderungen angegeben." }, { status: 400 })
  }

  // Build update payload
  const updatePayload: Record<string, unknown> = {}
  if (body.title !== undefined) updatePayload.title = body.title
  if (body.lesson_content !== undefined) updatePayload.lesson_content = body.lesson_content
  if (body.status !== undefined) updatePayload.status = body.status

  const { data: updated, error: updateErr } = await supabase
    .from("education_modules")
    .update(updatePayload)
    .eq("id", moduleId)
    .select(`
      id, hauptproblem, title, lesson_content, generated_by, status, lesson_number, total_lessons, curriculum, created_at, updated_at,
      education_quizzes (id, module_id, question_number, question_text, options, correct_index, explanation)
    `)
    .maybeSingle()

  if (updateErr) {
    console.error("[PUT /api/education/[moduleId]] Update error:", updateErr)
    return NextResponse.json({ error: "Modul konnte nicht aktualisiert werden." }, { status: 500 })
  }

  if (!updated) {
    return NextResponse.json({ error: "Modul nicht gefunden." }, { status: 404 })
  }

  return NextResponse.json({
    module: {
      ...updated,
      quizzes: updated.education_quizzes ?? [],
    },
  })
}
