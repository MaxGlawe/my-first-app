/**
 * PROJ-15: Trainingsdokumentation Detail
 * GET /api/patients/[id]/trainingsdoku/[sessionId] — Detail laden
 * PUT /api/patients/[id]/trainingsdoku/[sessionId] — Update (nur innerhalb 24h)
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ── GET ──────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  const { id: patientId, sessionId } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  if (!UUID_REGEX.test(patientId) || !UUID_REGEX.test(sessionId)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("training_documentations")
    .select("id, patient_id, created_by, typ, session_date, duration_minutes, status, data, confirmed_at, locked_at, created_at, updated_at")
    .eq("id", sessionId)
    .eq("patient_id", patientId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Dokumentation nicht gefunden." }, { status: 404 })
  }

  // Resolve author name
  const { data: authorProfile } = await supabase
    .from("user_profiles")
    .select("first_name, last_name")
    .eq("id", data.created_by)
    .single()

  return NextResponse.json({
    session: {
      ...data,
      created_by_name: authorProfile
        ? [authorProfile.first_name, authorProfile.last_name].filter(Boolean).join(" ")
        : null,
    },
  })
}

// ── PUT ──────────────────────────────────────────────────────────────

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  const { id: patientId, sessionId } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  if (!UUID_REGEX.test(patientId) || !UUID_REGEX.test(sessionId)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  // Build update payload — only allow specific fields
  const payload: Record<string, unknown> = {}
  if (body.data !== undefined) payload.data = body.data
  if (body.duration_minutes !== undefined) payload.duration_minutes = body.duration_minutes
  if (body.session_date !== undefined) payload.session_date = body.session_date
  if (body.status === "abgeschlossen") {
    payload.status = "abgeschlossen"
    payload.confirmed_at = new Date().toISOString()
  }

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "Keine Änderungen." }, { status: 400 })
  }

  // RLS handles: only within 24h + own patient + correct role
  const { data, error } = await supabase
    .from("training_documentations")
    .update(payload)
    .eq("id", sessionId)
    .eq("patient_id", patientId)
    .select("id, patient_id, created_by, typ, session_date, duration_minutes, status, data, confirmed_at, locked_at, created_at, updated_at")
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Dokumentation nicht gefunden oder keine Berechtigung (ggf. 24h-Frist abgelaufen)." },
        { status: 404 }
      )
    }
    console.error("[PUT /api/patients/[id]/trainingsdoku/[sessionId]] Error:", error)
    return NextResponse.json({ error: "Speichern fehlgeschlagen." }, { status: 500 })
  }

  return NextResponse.json({ session: data })
}
