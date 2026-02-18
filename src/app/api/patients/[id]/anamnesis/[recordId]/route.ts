/**
 * PROJ-3: Anamnese & Untersuchungsdokumentation
 * GET   /api/patients/[id]/anamnesis/[recordId]  — Einzelnen Bogen laden
 * PATCH /api/patients/[id]/anamnesis/[recordId]  — Entwurf aktualisieren oder abschließen
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ----------------------------------------------------------------
// Zod schemas for JSONB data sub-fields (mirrors route.ts parent)
// ----------------------------------------------------------------

const painPointSchema = z.object({
  x: z.number().min(0).max(120), // SVG viewBox width (BodySchema: BODY_SVG_WIDTH = 120)
  y: z.number().min(0).max(300), // SVG viewBox height (BodySchema: BODY_SVG_HEIGHT = 300)
  view: z.enum(["anterior", "posterior"]),
})

const rangeOfMotionEntrySchema = z.object({
  id: z.string().max(20),
  gelenk: z.string().min(1).max(200),
  richtung: z.string().min(1).max(200),
  grad: z.string().regex(/^\d+(\.\d+)?$/, "Grad muss eine Zahl sein.").max(10),
})

const strengthEntrySchema = z.object({
  id: z.string().max(20),
  muskelgruppe: z.string().min(1).max(200),
  grad: z.string().min(1).max(5),
})

const anamnesisDataSchema = z.object({
  hauptbeschwerde: z.string().min(1, "Hauptbeschwerde ist erforderlich.").max(2000),
  schmerzdauer: z.string().max(200).optional().default(""),
  schmerzcharakter: z.string().max(500).optional().default(""),
  nrs: z.number().int().min(0).max(10),
  schmerzlokalisation: z.array(painPointSchema).max(50).default([]),
  vorerkrankungen: z.array(z.string().max(200)).max(100).default([]),
  vorerkrankungenFreitext: z.string().max(1000).optional().default(""),
  keineVorerkrankungen: z.boolean().default(false),
  medikamente: z.string().max(2000).optional().default(""),
  bewegungsausmass: z.array(rangeOfMotionEntrySchema).max(50).default([]),
  kraftgrad: z.array(strengthEntrySchema).max(50).default([]),
  differentialdiagnosen: z.string().max(3000).optional().default(""),
  erweiterte_tests: z.string().max(3000).optional().default(""),
})

// ----------------------------------------------------------------
// Zod schema for PATCH body
// Both fields are optional — a PATCH can update data, status, or both.
// ----------------------------------------------------------------
const patchAnamnesisSchema = z.object({
  status: z.enum(["entwurf", "abgeschlossen"]).optional(),
  data: anamnesisDataSchema.optional(),
})

// ----------------------------------------------------------------
// Shared helper: load and verify record access
// ----------------------------------------------------------------
async function loadRecord(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, patientId: string, recordId: string) {
  const { data: record, error } = await supabase
    .from("anamnesis_records")
    .select(`
      id,
      patient_id,
      created_by,
      version,
      status,
      data,
      created_at,
      updated_at,
      user_profiles!created_by (
        full_name
      )
    `)
    .eq("id", recordId)
    .eq("patient_id", patientId)
    .single()

  return { record, error }
}

// ----------------------------------------------------------------
// GET /api/patients/[id]/anamnesis/[recordId]
// Returns a single anamnesis record (read-only view).
// ----------------------------------------------------------------
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  const { id: patientId, recordId } = await params
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
  if (!UUID_REGEX.test(recordId)) {
    return NextResponse.json({ error: "Ungültige Datensatz-ID." }, { status: 400 })
  }

  const { record, error } = await loadRecord(supabase, patientId, recordId)

  if (error || !record) {
    if (error?.code === "PGRST116" || !record) {
      return NextResponse.json(
        { error: "Anamnesebogen nicht gefunden oder keine Berechtigung." },
        { status: 404 }
      )
    }
    console.error("[GET /api/patients/[id]/anamnesis/[recordId]] Supabase error:", error)
    return NextResponse.json(
      { error: "Anamnesebogen konnte nicht geladen werden." },
      { status: 500 }
    )
  }

  // Flatten joined profile data
  const profile = record.user_profiles as { full_name?: string } | null
  const normalized = {
    id: record.id,
    patient_id: record.patient_id,
    created_by: record.created_by,
    version: record.version,
    status: record.status,
    data: record.data,
    created_at: record.created_at,
    updated_at: record.updated_at,
    created_by_name: profile?.full_name ?? null,
  }

  return NextResponse.json({ record: normalized })
}

// ----------------------------------------------------------------
// PATCH /api/patients/[id]/anamnesis/[recordId]
// Updates a draft record (data, status, or both).
// Blocked by RLS if status = 'abgeschlossen'.
// Once status → 'abgeschlossen', the record is locked forever.
// ----------------------------------------------------------------
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  const { id: patientId, recordId } = await params
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
  if (!UUID_REGEX.test(recordId)) {
    return NextResponse.json({ error: "Ungültige Datensatz-ID." }, { status: 400 })
  }

  // Load the record first to check current status before trying to update
  const { record: existingRecord, error: loadError } = await loadRecord(supabase, patientId, recordId)

  if (loadError || !existingRecord) {
    if (loadError?.code === "PGRST116" || !existingRecord) {
      return NextResponse.json(
        { error: "Anamnesebogen nicht gefunden oder keine Berechtigung." },
        { status: 404 }
      )
    }
    console.error("[PATCH /api/patients/[id]/anamnesis/[recordId]] load error:", loadError)
    return NextResponse.json(
      { error: "Anamnesebogen konnte nicht geladen werden." },
      { status: 500 }
    )
  }

  // Application-level guard: reject attempts to edit locked records
  // (RLS also blocks this, but we return a clear error message)
  if (existingRecord.status === "abgeschlossen") {
    return NextResponse.json(
      { error: "Abgeschlossene Bögen können nicht bearbeitet werden." },
      { status: 409 }
    )
  }

  // Application-level guard: only the original creator or an admin may edit
  if (existingRecord.created_by !== user.id) {
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    if (userProfile?.role !== "admin") {
      return NextResponse.json(
        { error: "Nur der Ersteller oder ein Admin darf diesen Bogen bearbeiten." },
        { status: 403 }
      )
    }
  }

  // Parse and validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = patchAnamnesisSchema.safeParse(body)
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
  if (!updates.status && !updates.data) {
    return NextResponse.json(
      { error: "Keine Änderungen angegeben." },
      { status: 400 }
    )
  }

  // Enforce role-based HP field restriction server-side
  if (updates.data) {
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const isHeilpraktiker = userProfile?.role === "heilpraktiker" || userProfile?.role === "admin"

    updates.data = {
      ...updates.data,
      differentialdiagnosen: isHeilpraktiker ? (updates.data.differentialdiagnosen ?? "") : "",
      erweiterte_tests: isHeilpraktiker ? (updates.data.erweiterte_tests ?? "") : "",
    }
  }

  // Build the PATCH payload (only include fields that were provided)
  const patchPayload: Record<string, unknown> = {}
  if (updates.status !== undefined) patchPayload.status = updates.status
  if (updates.data !== undefined) patchPayload.data = updates.data

  // RLS UPDATE policy blocks this if status = 'abgeschlossen'
  const { data: updated, error: updateError } = await supabase
    .from("anamnesis_records")
    .update(patchPayload)
    .eq("id", recordId)
    .eq("patient_id", patientId)
    .select(`
      id,
      patient_id,
      created_by,
      version,
      status,
      data,
      created_at,
      updated_at
    `)
    .single()

  if (updateError) {
    if (updateError.code === "PGRST116") {
      return NextResponse.json(
        { error: "Anamnesebogen nicht gefunden, gesperrt, oder keine Berechtigung." },
        { status: 404 }
      )
    }
    console.error("[PATCH /api/patients/[id]/anamnesis/[recordId]] Supabase error:", updateError)
    return NextResponse.json(
      { error: "Anamnesebogen konnte nicht aktualisiert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ record: updated })
}
