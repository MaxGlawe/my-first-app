/**
 * PROJ-15: Funktionsuntersuchung Detail
 * GET /api/patients/[id]/funktionsuntersuchung/[recordId] — Detail laden
 * PUT /api/patients/[id]/funktionsuntersuchung/[recordId] — Update (nur Entwurf)
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ── GET ──────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  const { id: patientId, recordId } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  if (!UUID_REGEX.test(patientId) || !UUID_REGEX.test(recordId)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("funktionsuntersuchungen")
    .select("id, patient_id, created_by, version, status, data, created_at, updated_at")
    .eq("id", recordId)
    .eq("patient_id", patientId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Untersuchung nicht gefunden." }, { status: 404 })
  }

  // Resolve author name
  const { data: authorProfile } = await supabase
    .from("user_profiles")
    .select("first_name, last_name")
    .eq("id", data.created_by)
    .single()

  return NextResponse.json({
    record: {
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
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  const { id: patientId, recordId } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  if (!UUID_REGEX.test(patientId) || !UUID_REGEX.test(recordId)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 })
  }

  let body: { data?: Record<string, unknown>; status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  // Build update payload
  const payload: Record<string, unknown> = {}
  if (body.data !== undefined) payload.data = body.data
  if (body.status === "abgeschlossen") payload.status = "abgeschlossen"

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "Keine Änderungen." }, { status: 400 })
  }

  // RLS handles: only draft + own patient + correct role
  const { data, error } = await supabase
    .from("funktionsuntersuchungen")
    .update(payload)
    .eq("id", recordId)
    .eq("patient_id", patientId)
    .select("id, patient_id, created_by, version, status, data, created_at, updated_at")
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Untersuchung nicht gefunden oder keine Berechtigung." },
        { status: 404 }
      )
    }
    console.error("[PUT /api/patients/[id]/funktionsuntersuchung/[recordId]] Error:", error)
    return NextResponse.json({ error: "Speichern fehlgeschlagen." }, { status: 500 })
  }

  return NextResponse.json({ record: data })
}
