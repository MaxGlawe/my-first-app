/**
 * PROJ-5: Behandlungsdokumentation
 * GET  /api/patients/[id]/treatments  — Alle Behandlungssessions eines Patienten
 * POST /api/patients/[id]/treatments  — Neue Session anlegen (Entwurf oder abgeschlossen)
 *
 * Access: Therapeut (eigene Patienten) + Admin
 * RLS: Enforced at DB level (treatment_sessions_select / treatment_sessions_insert)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

// UUID validation regex (reused across handlers)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ----------------------------------------------------------------
// Allowed measure IDs (matches MASSNAHMEN_KATALOG in frontend types)
// ----------------------------------------------------------------
const VALID_MEASURE_IDS = [
  "KG",
  "MT",
  "MLD",
  "US",
  "TENS",
  "Wärme",
  "Kälte",
  "Elektrotherapie",
  "Atemtherapie",
] as const

// ----------------------------------------------------------------
// Zod schema for POST body
// ----------------------------------------------------------------
const createTreatmentSchema = z.object({
  status: z.enum(["entwurf", "abgeschlossen"]),

  // DATE string "YYYY-MM-DD" — server stores as DATE column (no time component)
  session_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum muss im Format YYYY-MM-DD sein.")
    .refine((d) => !isNaN(Date.parse(d)), "Ungültiges Datum."),

  duration_minutes: z
    .number()
    .int()
    .min(1, "Mindestens 1 Minute.")
    .max(480, "Maximal 480 Minuten.")
    .nullable()
    .optional(),

  // Array of measure IDs (from catalog) + optional free-text entries (up to 10 chars each)
  // Free-text entries are those not in VALID_MEASURE_IDS — max 200 chars
  measures: z
    .array(z.string().min(1).max(200))
    .min(0)
    .max(20, "Maximal 20 Maßnahmen."),

  nrs_before: z.number().int().min(0).max(10),
  nrs_after: z.number().int().min(0).max(10).nullable().optional(),

  notes: z.string().max(5000).optional().default(""),
  next_steps: z.string().max(2000).optional().default(""),
})

// ----------------------------------------------------------------
// Helper: Normalize a session row for API response
// ----------------------------------------------------------------
function normalizeSession(r: {
  id: string
  patient_id: string
  therapist_id: string
  session_date: string
  duration_minutes: number | null
  measures: unknown
  nrs_before: number
  nrs_after: number | null
  notes: string
  next_steps: string
  status: string
  confirmed_at: string | null
  locked_at: string | null
  created_at: string
  updated_at: string
  user_profiles?: { full_name?: string } | null
}) {
  const profile = r.user_profiles as { full_name?: string } | null
  return {
    id: r.id,
    patient_id: r.patient_id,
    therapist_id: r.therapist_id,
    session_date: r.session_date,
    duration_minutes: r.duration_minutes,
    measures: (r.measures as string[]) ?? [],
    nrs_before: r.nrs_before,
    nrs_after: r.nrs_after,
    notes: r.notes,
    next_steps: r.next_steps,
    status: r.status,
    confirmed_at: r.confirmed_at,
    locked_at: r.locked_at,
    created_at: r.created_at,
    updated_at: r.updated_at,
    therapist_name: profile?.full_name ?? null,
  }
}

// ----------------------------------------------------------------
// GET /api/patients/[id]/treatments
// Returns all treatment sessions for a patient, newest first.
// Joins therapist_name from user_profiles.
// Performance target: < 500ms for up to 200 entries.
// ----------------------------------------------------------------
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params
  const supabase = await createSupabaseServerClient()

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: "Nicht autorisiert. Bitte einloggen." },
      { status: 401 }
    )
  }

  // UUID format check
  if (!UUID_REGEX.test(patientId)) {
    return NextResponse.json({ error: "Ungültige Patienten-ID." }, { status: 400 })
  }

  // Verify patient exists and is accessible (RLS handles ownership)
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id")
    .eq("id", patientId)
    .single()

  if (patientError || !patient) {
    return NextResponse.json(
      { error: "Patient nicht gefunden oder keine Berechtigung." },
      { status: 404 }
    )
  }

  // Fetch sessions — RLS (treatment_sessions_select) ensures therapist only sees own patients
  // Join therapist name for display in BehandlungCard / BehandlungView
  const { data: sessions, error } = await supabase
    .from("treatment_sessions")
    .select(`
      id,
      patient_id,
      therapist_id,
      session_date,
      duration_minutes,
      measures,
      nrs_before,
      nrs_after,
      notes,
      next_steps,
      status,
      confirmed_at,
      locked_at,
      created_at,
      updated_at,
      user_profiles!therapist_id (
        full_name
      )
    `)
    .eq("patient_id", patientId)
    .order("session_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200)

  if (error) {
    console.error("[GET /api/patients/[id]/treatments] Supabase error:", error)
    return NextResponse.json(
      { error: "Behandlungen konnten nicht geladen werden." },
      { status: 500 }
    )
  }

  const normalized = (sessions ?? []).map((r) =>
    normalizeSession(r as Parameters<typeof normalizeSession>[0])
  )

  return NextResponse.json({ sessions: normalized })
}

// ----------------------------------------------------------------
// POST /api/patients/[id]/treatments
// Creates a new treatment session (draft or completed).
// therapist_id is always set to the authenticated user (server-enforced).
// locked_at is a generated column: created_at + 24h (DB-computed, immutable).
// ----------------------------------------------------------------
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params
  const supabase = await createSupabaseServerClient()

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: "Nicht autorisiert. Bitte einloggen." },
      { status: 401 }
    )
  }

  // UUID format check
  if (!UUID_REGEX.test(patientId)) {
    return NextResponse.json({ error: "Ungültige Patienten-ID." }, { status: 400 })
  }

  // Verify patient exists and is accessible (RLS handles ownership)
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id")
    .eq("id", patientId)
    .single()

  if (patientError || !patient) {
    return NextResponse.json(
      { error: "Patient nicht gefunden oder keine Berechtigung." },
      { status: 404 }
    )
  }

  // Parse and validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = createTreatmentSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Validierungsfehler.",
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 422 }
    )
  }

  const {
    status,
    session_date,
    duration_minutes,
    measures,
    nrs_before,
    nrs_after,
    notes,
    next_steps,
  } = parseResult.data

  // Sanitize measures: validate catalog IDs, allow free-text (max 200 chars already validated)
  const sanitizedMeasures = measures.map((m) => m.trim()).filter(Boolean)

  // Build insert payload
  // therapist_id is always the authenticated user — never trust client input
  // locked_at is a GENERATED ALWAYS column (created_at + 24h), DB sets it automatically
  const insertPayload: Record<string, unknown> = {
    patient_id: patientId,
    therapist_id: user.id,
    session_date,
    duration_minutes: duration_minutes ?? null,
    measures: sanitizedMeasures,
    nrs_before,
    nrs_after: nrs_after ?? null,
    notes: notes?.trim() ?? "",
    next_steps: next_steps?.trim() ?? "",
    status,
  }

  // If being confirmed, record the confirmation timestamp
  if (status === "abgeschlossen") {
    insertPayload.confirmed_at = new Date().toISOString()
  }

  const { data: created, error: insertError } = await supabase
    .from("treatment_sessions")
    .insert(insertPayload)
    .select(`
      id,
      patient_id,
      therapist_id,
      session_date,
      duration_minutes,
      measures,
      nrs_before,
      nrs_after,
      notes,
      next_steps,
      status,
      confirmed_at,
      locked_at,
      created_at,
      updated_at
    `)
    .single()

  if (insertError) {
    console.error("[POST /api/patients/[id]/treatments] Supabase error:", insertError)
    return NextResponse.json(
      { error: "Behandlung konnte nicht gespeichert werden." },
      { status: 500 }
    )
  }

  // Return without user_profiles join (fresh insert — caller can refetch for full view)
  const session = normalizeSession({
    ...(created as Parameters<typeof normalizeSession>[0]),
    user_profiles: null,
  })

  return NextResponse.json({ session }, { status: 201 })
}
