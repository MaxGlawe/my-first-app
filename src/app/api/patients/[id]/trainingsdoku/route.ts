/**
 * PROJ-15: Trainingsdokumentation
 * GET  /api/patients/[id]/trainingsdoku — Liste aller Dokumentationen
 * POST /api/patients/[id]/trainingsdoku — Neue Dokumentation anlegen
 *
 * Rollen: praeventionstrainer, personal_trainer, admin
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ALLOWED_ROLES = ["praeventionstrainer", "personal_trainer", "admin"]

const createSchema = z.object({
  typ: z.enum(["training", "therapeutisch"]),
  session_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Datum im Format YYYY-MM-DD"),
  duration_minutes: z.number().min(1).max(480).optional().nullable(),
  data: z.record(z.string(), z.unknown()).optional().default({}),
})

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
  if (!role || (![...ALLOWED_ROLES, "praxismanagement"].includes(role))) {
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

  const { data, error } = await supabase
    .from("training_documentations")
    .select("id, patient_id, created_by, typ, session_date, duration_minutes, status, data, confirmed_at, locked_at, created_at, updated_at")
    .eq("patient_id", patientId)
    .order("session_date", { ascending: false })
    .limit(100)

  if (error) {
    console.error("[GET /api/patients/[id]/trainingsdoku] Error:", error)
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
    sessions: (data ?? []).map((r) => ({
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
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = createSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { typ, session_date, duration_minutes, data: formData } = parseResult.data

  const { data: created, error: insertError } = await supabase
    .from("training_documentations")
    .insert({
      patient_id: patientId,
      created_by: user.id,
      typ,
      session_date,
      duration_minutes: duration_minutes ?? null,
      data: formData,
      status: "entwurf",
    })
    .select("id, patient_id, created_by, typ, session_date, duration_minutes, status, data, confirmed_at, locked_at, created_at, updated_at")
    .single()

  if (insertError) {
    console.error("[POST /api/patients/[id]/trainingsdoku] Error:", insertError)
    return NextResponse.json({ error: "Dokumentation konnte nicht erstellt werden." }, { status: 500 })
  }

  return NextResponse.json({ session: created }, { status: 201 })
}
