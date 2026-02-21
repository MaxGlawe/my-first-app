/**
 * PROJ-13: Kurs-System
 * POST   /api/courses/[id]/invite — Einladungslink generieren/aktivieren
 * DELETE /api/courses/[id]/invite — Einladungslink deaktivieren
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let token = ""
  for (let i = 0; i < 24; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

// ── POST /api/courses/[id]/invite ────────────────────────────────────────────

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

  // Check course and current invite state
  const { data: course } = await supabase
    .from("courses")
    .select("id, invite_token, invite_enabled, version, is_archived")
    .eq("id", courseId)
    .single()

  if (!course) {
    return NextResponse.json({ error: "Kurs nicht gefunden." }, { status: 404 })
  }

  if (course.is_archived) {
    return NextResponse.json({ error: "Kurs ist archiviert." }, { status: 422 })
  }

  if (course.version < 1) {
    return NextResponse.json({ error: "Kurs muss zuerst veröffentlicht werden." }, { status: 422 })
  }

  // If already has an active invite, just return it
  if (course.invite_token && course.invite_enabled) {
    return NextResponse.json({
      invite_token: course.invite_token,
      invite_enabled: true,
    })
  }

  // Generate new token or re-enable existing
  const token = course.invite_token || generateToken()

  const { error: updateError } = await supabase
    .from("courses")
    .update({ invite_token: token, invite_enabled: true })
    .eq("id", courseId)

  if (updateError) {
    console.error("[POST /api/courses/[id]/invite] Error:", updateError)
    return NextResponse.json({ error: "Einladungslink konnte nicht erstellt werden." }, { status: 500 })
  }

  return NextResponse.json({
    invite_token: token,
    invite_enabled: true,
  })
}

// ── DELETE /api/courses/[id]/invite ──────────────────────────────────────────

export async function DELETE(
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

  const { error: updateError } = await supabase
    .from("courses")
    .update({ invite_enabled: false })
    .eq("id", courseId)

  if (updateError) {
    console.error("[DELETE /api/courses/[id]/invite] Error:", updateError)
    return NextResponse.json({ error: "Einladungslink konnte nicht deaktiviert werden." }, { status: 500 })
  }

  return NextResponse.json({ invite_enabled: false })
}
