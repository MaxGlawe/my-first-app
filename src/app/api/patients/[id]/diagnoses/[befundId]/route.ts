/**
 * PROJ-4: Befund & Diagnose (Heilpraktiker)
 * GET   /api/patients/[id]/diagnoses/[befundId]  — Einzelnen Befundbericht laden
 * PATCH /api/patients/[id]/diagnoses/[befundId]  — Entwurf aktualisieren oder abschließen
 *
 * Security: Defense-in-depth
 *   1. Middleware blocks /os/patients/[id]/befund/* for physiotherapeuten (route-level)
 *   2. API route checks role server-side → 403 for non-Heilpraktiker (handler-level)
 *   3. RLS policy blocks all access for non-Heilpraktiker (DB-level)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ----------------------------------------------------------------
// Zod schemas for JSONB sub-fields (mirrors collection route)
// ----------------------------------------------------------------

const icd10Schema = z
  .object({
    code: z.string().min(1).max(20),
    bezeichnung: z.string().min(1).max(500),
  })
  .nullable()

const diagnoseEintragSchema = z
  .object({
    icd10: icd10Schema,
    sicherheitsgrad: z.enum(["gesichert", "verdacht", "ausschluss"]),
    freitextDiagnose: z.string().max(500).optional().default(""),
    freitextNotiz: z.string().max(1000).optional().default(""),
  })
  .superRefine((data, ctx) => {
    // BUG-5 fix: freitextNotiz is mandatory when using free-text diagnosis (no ICD code)
    if (!data.icd10 && data.freitextDiagnose && !data.freitextNotiz) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pflichtfeld: Bei Freitext-Diagnose muss eine Notiz/Begründung angegeben werden.",
        path: ["freitextNotiz"],
      })
    }
  })

// ----------------------------------------------------------------
// Zod schema for PATCH body
// All fields optional — a PATCH can update any subset.
// ----------------------------------------------------------------
const patchDiagnoseSchema = z.object({
  status: z.enum(["entwurf", "abgeschlossen"]).optional(),
  klinischer_befund: z.string().min(1).max(10000).optional(),
  hauptdiagnose: diagnoseEintragSchema.optional(),
  nebendiagnosen: z.array(diagnoseEintragSchema).max(5).optional(),
  therapieziel: z.string().max(5000).optional(),
  prognose: z.string().max(5000).optional(),
  therapiedauer_wochen: z.number().int().min(1).max(520).nullable().optional(),
})

// ----------------------------------------------------------------
// Shared helper: load and verify record access
// ----------------------------------------------------------------
async function loadRecord(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  patientId: string,
  befundId: string
) {
  const { data: record, error } = await supabase
    .from("diagnoses")
    .select(`
      id,
      patient_id,
      created_by,
      created_by_role,
      status,
      klinischer_befund,
      hauptdiagnose,
      nebendiagnosen,
      therapieziel,
      prognose,
      therapiedauer_wochen,
      created_at,
      updated_at
    `)
    .eq("id", befundId)
    .eq("patient_id", patientId)
    .single()

  return { record, error }
}

// ----------------------------------------------------------------
// GET /api/patients/[id]/diagnoses/[befundId]
// Returns a single diagnose record (read-only view).
// Accessible only by Heilpraktiker (own patients) and Admin.
// ----------------------------------------------------------------
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; befundId: string }> }
) {
  const { id: patientId, befundId } = await params
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
  if (!UUID_REGEX.test(befundId)) {
    return NextResponse.json({ error: "Ungültige Befund-ID." }, { status: 400 })
  }

  // Server-side role check: only Heilpraktiker and Admin may access diagnoses
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const role = userProfile?.role
  if (role !== "heilpraktiker" && role !== "admin") {
    return NextResponse.json(
      { error: "Zugriff verweigert. Befundberichte sind nur für Heilpraktiker zugänglich." },
      { status: 403 }
    )
  }

  const { record, error } = await loadRecord(supabase, patientId, befundId)

  if (error || !record) {
    if (error?.code === "PGRST116" || !record) {
      return NextResponse.json(
        { error: "Befundbericht nicht gefunden oder keine Berechtigung." },
        { status: 404 }
      )
    }
    console.error("[GET /api/patients/[id]/diagnoses/[befundId]] Supabase error:", error)
    return NextResponse.json(
      { error: "Befundbericht konnte nicht geladen werden." },
      { status: 500 }
    )
  }

  // Resolve created_by name via separate query (no FK dependency)
  let createdByName: string | null = null
  if (record.created_by) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("first_name, last_name")
      .eq("id", record.created_by)
      .single()
    createdByName = profile ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") || null : null
  }

  const normalized = {
    id: record.id,
    patient_id: record.patient_id,
    created_by: record.created_by,
    created_by_role: record.created_by_role,
    status: record.status,
    klinischer_befund: record.klinischer_befund,
    hauptdiagnose: record.hauptdiagnose,
    nebendiagnosen: record.nebendiagnosen,
    therapieziel: record.therapieziel,
    prognose: record.prognose,
    therapiedauer_wochen: record.therapiedauer_wochen,
    created_at: record.created_at,
    updated_at: record.updated_at,
    created_by_name: createdByName,
  }

  return NextResponse.json({ record: normalized })
}

// ----------------------------------------------------------------
// PATCH /api/patients/[id]/diagnoses/[befundId]
// Updates a draft record (fields, status, or both).
// Blocked if status = 'abgeschlossen' (locked forever).
// Only the original creator (Heilpraktiker) or Admin may edit.
// ----------------------------------------------------------------
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; befundId: string }> }
) {
  const { id: patientId, befundId } = await params
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
  if (!UUID_REGEX.test(befundId)) {
    return NextResponse.json({ error: "Ungültige Befund-ID." }, { status: 400 })
  }

  // Server-side role check
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const role = userProfile?.role
  if (role !== "heilpraktiker" && role !== "admin") {
    console.warn(
      `[SECURITY] PATCH /api/patients/${patientId}/diagnoses/${befundId} blocked: user ${user.id} has role '${role ?? "unknown"}'`
    )
    return NextResponse.json(
      { error: "Zugriff verweigert. Nur Heilpraktiker dürfen Befunde bearbeiten." },
      { status: 403 }
    )
  }

  // Load the record first to check current status before trying to update
  const { record: existingRecord, error: loadError } = await loadRecord(
    supabase,
    patientId,
    befundId
  )

  if (loadError || !existingRecord) {
    if (loadError?.code === "PGRST116" || !existingRecord) {
      return NextResponse.json(
        { error: "Befundbericht nicht gefunden oder keine Berechtigung." },
        { status: 404 }
      )
    }
    console.error(
      "[PATCH /api/patients/[id]/diagnoses/[befundId]] load error:",
      loadError
    )
    return NextResponse.json(
      { error: "Befundbericht konnte nicht geladen werden." },
      { status: 500 }
    )
  }

  // Application-level guard: reject attempts to edit locked records
  // (RLS also blocks this, but we return a clear error message)
  if (existingRecord.status === "abgeschlossen") {
    return NextResponse.json(
      { error: "Abgeschlossene Befundberichte können nicht bearbeitet werden." },
      { status: 409 }
    )
  }

  // Application-level guard: only the original creator or Admin may edit
  if (existingRecord.created_by !== user.id && role !== "admin") {
    return NextResponse.json(
      { error: "Nur der Ersteller oder ein Admin darf diesen Befundbericht bearbeiten." },
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

  const parseResult = patchDiagnoseSchema.safeParse(body)
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

  // Build PATCH payload (only include fields that were provided)
  const patchPayload: Record<string, unknown> = {}
  if (updates.status !== undefined) patchPayload.status = updates.status
  if (updates.klinischer_befund !== undefined)
    patchPayload.klinischer_befund = updates.klinischer_befund.trim()
  if (updates.hauptdiagnose !== undefined) patchPayload.hauptdiagnose = updates.hauptdiagnose
  if (updates.nebendiagnosen !== undefined) patchPayload.nebendiagnosen = updates.nebendiagnosen
  if (updates.therapieziel !== undefined)
    patchPayload.therapieziel = updates.therapieziel.trim()
  if (updates.prognose !== undefined) patchPayload.prognose = updates.prognose.trim()
  if ("therapiedauer_wochen" in updates)
    patchPayload.therapiedauer_wochen = updates.therapiedauer_wochen ?? null

  // RLS UPDATE policy also blocks this if status = 'abgeschlossen'
  const { data: updated, error: updateError } = await supabase
    .from("diagnoses")
    .update(patchPayload)
    .eq("id", befundId)
    .eq("patient_id", patientId)
    .select(`
      id,
      patient_id,
      created_by,
      created_by_role,
      status,
      klinischer_befund,
      hauptdiagnose,
      nebendiagnosen,
      therapieziel,
      prognose,
      therapiedauer_wochen,
      created_at,
      updated_at
    `)
    .single()

  if (updateError) {
    if (updateError.code === "PGRST116") {
      return NextResponse.json(
        { error: "Befundbericht nicht gefunden, gesperrt, oder keine Berechtigung." },
        { status: 404 }
      )
    }
    console.error(
      "[PATCH /api/patients/[id]/diagnoses/[befundId]] Supabase error:",
      updateError
    )
    return NextResponse.json(
      { error: "Befundbericht konnte nicht aktualisiert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ record: updated })
}
