/**
 * PROJ-15: Funktionsuntersuchung
 * GET  /api/patients/[id]/funktionsuntersuchung — Liste aller Untersuchungen
 * POST /api/patients/[id]/funktionsuntersuchung — Neue Untersuchung anlegen
 *
 * Rollen: praeventionstrainer, personal_trainer, admin
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ALLOWED_ROLES = ["praeventionstrainer", "personal_trainer", "admin"]

// ── GET ──────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  if (!UUID_REGEX.test(patientId)) {
    return NextResponse.json({ error: "Ungültige Patienten-ID." }, { status: 400 })
  }

  // Check role
  const { createSupabaseServiceClient } = await import("@/lib/supabase-service")
  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const role = profile?.role as string | null

  // Praxismanagement can also read (RLS allows it)
  if (!role || (![...ALLOWED_ROLES, "praxismanagement"].includes(role))) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  // Patient existence check (RLS handles access control)
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("id", patientId)
    .single()

  if (!patient) {
    return NextResponse.json({ error: "Patient nicht gefunden." }, { status: 404 })
  }

  const { data, error } = await supabase
    .from("funktionsuntersuchungen")
    .select("id, patient_id, created_by, version, status, data, created_at, updated_at")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("[GET /api/patients/[id]/funktionsuntersuchung] Error:", error)
    return NextResponse.json({ error: "Daten konnten nicht geladen werden." }, { status: 500 })
  }

  // Resolve author names
  const authorIds = [...new Set((data ?? []).map((r) => r.created_by).filter(Boolean))]
  let nameMap: Record<string, string> = {}
  if (authorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("id, first_name, last_name")
      .in("id", authorIds)
    nameMap = Object.fromEntries(
      (profiles ?? []).map((p) => [p.id, [p.first_name, p.last_name].filter(Boolean).join(" ")])
    )
  }

  return NextResponse.json({
    records: (data ?? []).map((r) => ({
      ...r,
      created_by_name: nameMap[r.created_by] || null,
    })),
  })
}

// ── POST ─────────────────────────────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  if (!UUID_REGEX.test(patientId)) {
    return NextResponse.json({ error: "Ungültige Patienten-ID." }, { status: 400 })
  }

  // Check role
  const { createSupabaseServiceClient } = await import("@/lib/supabase-service")
  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const role = profile?.role as string | null
  if (!role || !ALLOWED_ROLES.includes(role)) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  // Patient check
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("id", patientId)
    .single()

  if (!patient) {
    return NextResponse.json({ error: "Patient nicht gefunden." }, { status: 404 })
  }

  // Parse body
  let body: { data?: Record<string, unknown> } = {}
  try {
    body = await request.json()
  } catch {
    // Empty body is OK — creates empty draft
  }

  const { data: created, error: insertError } = await supabase
    .from("funktionsuntersuchungen")
    .insert({
      patient_id: patientId,
      created_by: user.id,
      data: body.data ?? {},
      status: "entwurf",
    })
    .select("id, patient_id, created_by, version, status, data, created_at, updated_at")
    .single()

  if (insertError) {
    console.error("[POST /api/patients/[id]/funktionsuntersuchung] Error:", insertError)
    return NextResponse.json({ error: "Untersuchung konnte nicht erstellt werden." }, { status: 500 })
  }

  return NextResponse.json({ record: created }, { status: 201 })
}
