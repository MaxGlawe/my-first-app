/**
 * PROJ-3: Anamnese & Untersuchungsdokumentation
 * GET  /api/patients/[id]/anamnesis  — Alle Anamnesebögen eines Patienten
 * POST /api/patients/[id]/anamnesis  — Neuen Anamnesebogen anlegen
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

// UUID validation regex (reused across handlers)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ----------------------------------------------------------------
// Zod schemas for JSONB data sub-fields
// ----------------------------------------------------------------

const painPointSchema = z.object({
  x: z.number().min(0).max(200), // SVG viewBox width (BodySchema: BODY_SVG_WIDTH = 200)
  y: z.number().min(0).max(400), // SVG viewBox height (BodySchema: BODY_SVG_HEIGHT = 400)
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
  // Hauptbeschwerde
  hauptbeschwerde: z.string().min(1, "Hauptbeschwerde ist erforderlich.").max(2000),
  schmerzdauer: z.string().max(200).optional().default(""),
  schmerzcharakter: z.string().max(500).optional().default(""),

  // Schmerzintensität
  nrs: z.number().int().min(0).max(10),

  // Schmerzlokalisation
  schmerzlokalisation: z.array(painPointSchema).max(50).default([]),

  // Vorerkrankungen
  vorerkrankungen: z.array(z.string().max(200)).max(100).default([]),
  vorerkrankungenFreitext: z.string().max(1000).optional().default(""),
  keineVorerkrankungen: z.boolean().default(false),

  // Medikamente
  medikamente: z.string().max(2000).optional().default(""),

  // Bewegungsausmaß
  bewegungsausmass: z.array(rangeOfMotionEntrySchema).max(50).default([]),

  // Kraftgrad nach Janda
  kraftgrad: z.array(strengthEntrySchema).max(50).default([]),

  // Heilpraktiker-Felder (leer für PT, gefüllt für HP)
  differentialdiagnosen: z.string().max(3000).optional().default(""),
  erweiterte_tests: z.string().max(3000).optional().default(""),
})

// ----------------------------------------------------------------
// Zod schema for POST body
// ----------------------------------------------------------------
const createAnamnesisSchema = z.object({
  status: z.enum(["entwurf", "abgeschlossen"]),
  data: anamnesisDataSchema,
})

// ----------------------------------------------------------------
// GET /api/patients/[id]/anamnesis
// Returns all anamnesis records for a patient, newest first.
// Joins created_by_name from user_profiles.
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

  // Fetch records — RLS on anamnesis_records ensures therapist can only see
  // records belonging to their own patients.
  const { data: records, error } = await supabase
    .from("anamnesis_records")
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
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("[GET /api/patients/[id]/anamnesis] Supabase error:", error)
    return NextResponse.json(
      { error: "Anamnesebögen konnten nicht geladen werden." },
      { status: 500 }
    )
  }

  // Resolve created_by names via separate query (no FK dependency)
  const creatorIds = [...new Set((records ?? []).map((r) => r.created_by).filter(Boolean))]
  let profileMap: Record<string, string> = {}
  if (creatorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("id, first_name, last_name")
      .in("id", creatorIds)
    profileMap = Object.fromEntries(
      (profiles ?? []).map((p) => [p.id, [p.first_name, p.last_name].filter(Boolean).join(" ")])
    )
  }

  const normalized = (records ?? []).map((r) => ({
    id: r.id,
    patient_id: r.patient_id,
    created_by: r.created_by,
    version: r.version,
    status: r.status,
    data: r.data,
    created_at: r.created_at,
    updated_at: r.updated_at,
    created_by_name: profileMap[r.created_by] ?? null,
  }))

  return NextResponse.json({ records: normalized })
}

// ----------------------------------------------------------------
// POST /api/patients/[id]/anamnesis
// Creates a new anamnesis record for a patient.
// Version is auto-incremented by DB trigger.
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

  const parseResult = createAnamnesisSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Validierungsfehler.",
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 422 }
    )
  }

  const { status, data: formData } = parseResult.data

  // Enforce role-based field restriction server-side:
  // HP fields must be empty if the user is not a Heilpraktiker.
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const isHeilpraktiker = userProfile?.role === "heilpraktiker" || userProfile?.role === "admin"

  const sanitizedData = {
    ...formData,
    // Strip HP fields for non-HP users, regardless of what was sent
    differentialdiagnosen: isHeilpraktiker ? (formData.differentialdiagnosen ?? "") : "",
    erweiterte_tests: isHeilpraktiker ? (formData.erweiterte_tests ?? "") : "",
  }

  // Insert — version is set by DB trigger (set_anamnesis_version)
  // RLS INSERT policy enforces patient ownership
  const { data: created, error: insertError } = await supabase
    .from("anamnesis_records")
    .insert({
      patient_id: patientId,
      created_by: user.id,
      status,
      data: sanitizedData,
    })
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

  if (insertError) {
    console.error("[POST /api/patients/[id]/anamnesis] Supabase error:", insertError)
    return NextResponse.json(
      { error: "Anamnesebogen konnte nicht gespeichert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ record: created }, { status: 201 })
}
