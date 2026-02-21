/**
 * PROJ-13: Kurs-System
 * POST /api/courses/[id]/publish — Kurs veröffentlichen (Version erhöhen + Snapshot)
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

  const { data: newVersion, error: rpcError } = await supabase.rpc("publish_course", {
    p_course_id: courseId,
  })

  if (rpcError) {
    console.error("[POST /api/courses/[id]/publish] RPC Error:", rpcError)
    if (rpcError.message?.includes("Not authenticated")) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
    }
    if (rpcError.message?.includes("Not authorized") || rpcError.message?.includes("not found")) {
      return NextResponse.json({ error: "Keine Berechtigung oder Kurs nicht gefunden." }, { status: 403 })
    }
    if (rpcError.message?.includes("at least one lesson")) {
      return NextResponse.json({ error: "Der Kurs muss mindestens eine Lektion enthalten." }, { status: 422 })
    }
    return NextResponse.json({ error: "Kurs konnte nicht veröffentlicht werden." }, { status: 500 })
  }

  return NextResponse.json({ version: newVersion, status: "aktiv" })
}
