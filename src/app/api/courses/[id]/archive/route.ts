/**
 * PROJ-13: Kurs-System
 * POST /api/courses/[id]/archive — Kurs archivieren (soft-delete)
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(
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

  const { data: course, error: updateError } = await supabase
    .from("courses")
    .update({ is_archived: true, status: "archiviert" })
    .eq("id", courseId)
    .eq("is_archived", false)
    .select("id")
    .single()

  if (updateError || !course) {
    if (updateError?.code === "PGRST116") {
      return NextResponse.json({ error: "Kurs nicht gefunden oder bereits archiviert." }, { status: 404 })
    }
    console.error("[POST /api/courses/[id]/archive] Error:", updateError)
    return NextResponse.json({ error: "Kurs konnte nicht archiviert werden." }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
