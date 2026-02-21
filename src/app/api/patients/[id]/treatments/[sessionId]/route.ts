/**
 * PROJ-5: Behandlungsdokumentation
 * GET   /api/patients/[id]/treatments/[sessionId]  — Einzelne Session laden
 * PATCH /api/patients/[id]/treatments/[sessionId]  — Session aktualisieren (< 24h Frist)
 *
 * Edit window enforcement (defense-in-depth):
 *   1. API handler: checks NOW() vs locked_at before processing PATCH (clear error message)
 *   2. RLS UPDATE policy: blocks UPDATE if NOW() >= locked_at (DB-level safety net)
 *   3. Admin exception: Admin may always edit (Admin-Freischaltung per spec)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ----------------------------------------------------------------
// Zod schema for PATCH body — all fields optional
// ----------------------------------------------------------------
const patchTreatmentSchema = z.object({
  status: z.enum(["entwurf", "abgeschlossen"]).optional(),

  session_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum muss im Format YYYY-MM-DD sein.")
    .refine((d) => !isNaN(Date.parse(d)), "Ungültiges Datum.")
    .optional(),

  duration_minutes: z
    .number()
    .int()
    .min(1, "Mindestens 1 Minute.")
    .max(480, "Maximal 480 Minuten.")
    .nullable()
    .optional(),

  measures: z
    .array(z.string().min(1).max(200))
    .min(0)
    .max(20, "Maximal 20 Maßnahmen.")
    .optional(),

  nrs_before: z.number().int().min(0).max(10).optional(),
  nrs_after: z.number().int().min(0).max(10).nullable().optional(),

  notes: z.string().max(5000).optional(),
  next_steps: z.string().max(2000).optional(),
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
}, therapistName: string | null = null) {
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
    therapist_name: therapistName,
  }
}

// ----------------------------------------------------------------
// Shared helper: load a single session and verify patient scope
// ----------------------------------------------------------------
async function loadSession(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  patientId: string,
  sessionId: string
) {
  const { data: session, error } = await supabase
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
      updated_at
    `)
    .eq("id", sessionId)
    .eq("patient_id", patientId)
    .single()

  return { session, error }
}

// ----------------------------------------------------------------
// GET /api/patients/[id]/treatments/[sessionId]
// Returns a single treatment session (read-only view).
// Used by BehandlungView and BehandlungEditForm pages.
// ----------------------------------------------------------------
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  const { id: patientId, sessionId } = await params
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

  // UUID format checks
  if (!UUID_REGEX.test(patientId)) {
    return NextResponse.json({ error: "Ungültige Patienten-ID." }, { status: 400 })
  }
  if (!UUID_REGEX.test(sessionId)) {
    return NextResponse.json({ error: "Ungültige Session-ID." }, { status: 400 })
  }

  const { session, error } = await loadSession(supabase, patientId, sessionId)

  if (error || !session) {
    if (error?.code === "PGRST116" || !session) {
      return NextResponse.json(
        { error: "Behandlung nicht gefunden oder keine Berechtigung." },
        { status: 404 }
      )
    }
    console.error("[GET /api/patients/[id]/treatments/[sessionId]] Supabase error:", error)
    return NextResponse.json(
      { error: "Behandlung konnte nicht geladen werden." },
      { status: 500 }
    )
  }

  // Resolve therapist name via separate query (no FK dependency)
  let therapistName: string | null = null
  if (session.therapist_id) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("first_name, last_name")
      .eq("id", session.therapist_id)
      .single()
    therapistName = profile ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") || null : null
  }

  return NextResponse.json({
    session: normalizeSession(session as Parameters<typeof normalizeSession>[0], therapistName),
  })
}

// ----------------------------------------------------------------
// PATCH /api/patients/[id]/treatments/[sessionId]
// Updates a treatment session (data, status, or both).
//
// Edit window rules:
// - Regular therapist: only within 24h of creation (NOW() < locked_at)
// - Admin: can always edit (Freischaltung per spec edge case)
//
// Confirmation rule:
// - When status transitions to 'abgeschlossen', sets confirmed_at to now
// - Once confirmed, status cannot be set back to 'entwurf' (application guard)
// ----------------------------------------------------------------
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  const { id: patientId, sessionId } = await params
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

  // UUID format checks
  if (!UUID_REGEX.test(patientId)) {
    return NextResponse.json({ error: "Ungültige Patienten-ID." }, { status: 400 })
  }
  if (!UUID_REGEX.test(sessionId)) {
    return NextResponse.json({ error: "Ungültige Session-ID." }, { status: 400 })
  }

  // Load the existing record to check ownership, status, and lock window
  const { session: existingSession, error: loadError } = await loadSession(
    supabase,
    patientId,
    sessionId
  )

  if (loadError || !existingSession) {
    if (loadError?.code === "PGRST116" || !existingSession) {
      return NextResponse.json(
        { error: "Behandlung nicht gefunden oder keine Berechtigung." },
        { status: 404 }
      )
    }
    console.error(
      "[PATCH /api/patients/[id]/treatments/[sessionId]] load error:",
      loadError
    )
    return NextResponse.json(
      { error: "Behandlung konnte nicht geladen werden." },
      { status: 500 }
    )
  }

  // Fetch user role for admin check (needed for edit window bypass)
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const isAdmin = userProfile?.role === "admin"

  // Application-level edit window guard (defense-in-depth layer 1)
  // RLS UPDATE policy enforces this at DB level (layer 2)
  const lockedAt = existingSession.locked_at
    ? new Date(existingSession.locked_at)
    : null

  if (!isAdmin && lockedAt && new Date() >= lockedAt) {
    const lockedAtFormatted = lockedAt.toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    return NextResponse.json(
      {
        error: `Die 24-Stunden-Bearbeitungsfrist ist abgelaufen (gesperrt seit ${lockedAtFormatted}). Bitte Admin kontaktieren.`,
        locked: true,
        locked_at: existingSession.locked_at,
      },
      { status: 409 }
    )
  }

  // Application-level ownership guard: only the original therapist or admin may edit
  if (existingSession.therapist_id !== user.id && !isAdmin) {
    return NextResponse.json(
      { error: "Nur der erstellende Therapeut oder ein Admin darf diese Behandlung bearbeiten." },
      { status: 403 }
    )
  }

  // Parse and validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = patchTreatmentSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Validierungsfehler.",
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 422 }
    )
  }

  const updates = parseResult.data

  // At least one field must be provided
  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "Keine Änderungen angegeben." },
      { status: 400 }
    )
  }

  // Build the PATCH payload (only include fields that were provided)
  const patchPayload: Record<string, unknown> = {}

  if (updates.status !== undefined) {
    patchPayload.status = updates.status
    // Set confirmed_at when therapist confirms the session
    if (updates.status === "abgeschlossen" && existingSession.status !== "abgeschlossen") {
      patchPayload.confirmed_at = new Date().toISOString()
    }
  }

  if (updates.session_date !== undefined) patchPayload.session_date = updates.session_date
  if ("duration_minutes" in updates) patchPayload.duration_minutes = updates.duration_minutes ?? null
  if (updates.measures !== undefined) {
    patchPayload.measures = updates.measures.map((m) => m.trim()).filter(Boolean)
  }
  if (updates.nrs_before !== undefined) patchPayload.nrs_before = updates.nrs_before
  if ("nrs_after" in updates) patchPayload.nrs_after = updates.nrs_after ?? null
  if (updates.notes !== undefined) patchPayload.notes = updates.notes.trim()
  if (updates.next_steps !== undefined) patchPayload.next_steps = updates.next_steps.trim()

  // RLS UPDATE policy also enforces the 24h window at DB level
  const { data: updated, error: updateError } = await supabase
    .from("treatment_sessions")
    .update(patchPayload)
    .eq("id", sessionId)
    .eq("patient_id", patientId)
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

  if (updateError) {
    // PGRST116: no rows returned — either not found or RLS blocked the update
    if (updateError.code === "PGRST116") {
      return NextResponse.json(
        { error: "Behandlung nicht gefunden, gesperrt, oder keine Berechtigung." },
        { status: 409 }
      )
    }
    console.error(
      "[PATCH /api/patients/[id]/treatments/[sessionId]] Supabase error:",
      updateError
    )
    return NextResponse.json(
      { error: "Behandlung konnte nicht aktualisiert werden." },
      { status: 500 }
    )
  }

  // Resolve therapist name for response
  let updatedTherapistName: string | null = null
  if (updated.therapist_id) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("first_name, last_name")
      .eq("id", updated.therapist_id as string)
      .single()
    updatedTherapistName = profile ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") || null : null
  }

  return NextResponse.json({
    session: normalizeSession(updated as Parameters<typeof normalizeSession>[0], updatedTherapistName),
  })
}
