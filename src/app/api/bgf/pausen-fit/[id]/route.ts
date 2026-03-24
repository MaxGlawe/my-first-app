/**
 * PROJ-18: PATCH /api/bgf/pausen-fit/[id]
 * Update session status: start, complete, feedback
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const updateSchema = z.object({
  action: z.enum(["start", "complete", "feedback"]),
  feedback_sterne: z.number().int().min(1).max(5).optional(),
  feedback_text: z.string().max(500).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Ungültige Session-ID." }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = updateSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { action, feedback_sterne, feedback_text } = parseResult.data

  // Prüfe ob Session dem User gehört (service client bypasses RLS)
  const serviceClient = createSupabaseServiceClient()
  const { data: session, error: fetchError } = await serviceClient
    .from("pausen_fit_sessions")
    .select("id, status, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (fetchError || !session) {
    return NextResponse.json(
      { error: "Session nicht gefunden." },
      { status: 404 }
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {}

  switch (action) {
    case "start":
      if (session.status !== "geplant") {
        return NextResponse.json(
          { error: "Session kann nur aus 'geplant' gestartet werden." },
          { status: 400 }
        )
      }
      updateData.status = "gestartet"
      updateData.gestartet_um = new Date().toISOString()
      break

    case "complete":
      if (session.status !== "gestartet") {
        return NextResponse.json(
          { error: "Session muss zuerst gestartet werden." },
          { status: 400 }
        )
      }
      updateData.status = "abgeschlossen"
      updateData.abgeschlossen_um = new Date().toISOString()
      if (feedback_sterne) updateData.feedback_sterne = feedback_sterne
      if (feedback_text) updateData.feedback_text = feedback_text.trim()
      break

    case "feedback":
      if (session.status !== "abgeschlossen") {
        return NextResponse.json(
          { error: "Feedback nur für abgeschlossene Sessions." },
          { status: 400 }
        )
      }
      if (feedback_sterne) updateData.feedback_sterne = feedback_sterne
      if (feedback_text) updateData.feedback_text = feedback_text.trim()
      break
  }

  const { data: updated, error: updateError } = await serviceClient
    .from("pausen_fit_sessions")
    .update(updateData)
    .eq("id", id)
    .select("id, status, gestartet_um, abgeschlossen_um, feedback_sterne")
    .single()

  if (updateError) {
    console.error("[PATCH /api/bgf/pausen-fit/[id]] error:", updateError)
    return NextResponse.json(
      { error: "Session konnte nicht aktualisiert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ session: updated })
}
