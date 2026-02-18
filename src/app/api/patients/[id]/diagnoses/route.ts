/**
 * PROJ-4: Befund & Diagnose (Heilpraktiker)
 * GET  /api/patients/[id]/diagnoses  — Alle Befundberichte eines Patienten
 * POST /api/patients/[id]/diagnoses  — Neuen Befundbericht anlegen (Heilpraktiker only)
 *
 * Security: Defense-in-depth
 *   1. Middleware blocks /os/patients/[id]/befund/* for physiotherapeuten (route-level)
 *   2. API route checks role server-side → 403 for non-Heilpraktiker (handler-level)
 *   3. RLS policy blocks INSERT/SELECT for non-Heilpraktiker (DB-level)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ----------------------------------------------------------------
// Zod schemas for JSONB sub-fields
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
// Zod schema for POST body
// ----------------------------------------------------------------
const createDiagnoseSchema = z.object({
  status: z.enum(["entwurf", "abgeschlossen"]),
  klinischer_befund: z
    .string()
    .min(1, "Klinischer Befund ist erforderlich.")
    .max(10000),
  hauptdiagnose: diagnoseEintragSchema,
  nebendiagnosen: z.array(diagnoseEintragSchema).max(5).default([]),
  therapieziel: z.string().max(5000).optional().default(""),
  prognose: z.string().max(5000).optional().default(""),
  therapiedauer_wochen: z
    .number()
    .int()
    .min(1)
    .max(520)
    .nullable()
    .optional()
    .default(null),
})

// ----------------------------------------------------------------
// GET /api/patients/[id]/diagnoses
// Returns all diagnose records for a patient, newest first.
// Accessible only by Heilpraktiker (own patients) and Admin.
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

  // Fetch records — RLS on diagnoses ensures heilpraktiker can only see
  // records belonging to their own patients.
  const { data: records, error } = await supabase
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
      updated_at,
      user_profiles!created_by (
        full_name
      )
    `)
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("[GET /api/patients/[id]/diagnoses] Supabase error:", error)
    return NextResponse.json(
      { error: "Befundberichte konnten nicht geladen werden." },
      { status: 500 }
    )
  }

  // Flatten joined user_profiles data into created_by_name
  const normalized = (records ?? []).map((r) => {
    const profile = r.user_profiles as { full_name?: string } | null
    return {
      id: r.id,
      patient_id: r.patient_id,
      created_by: r.created_by,
      created_by_role: r.created_by_role,
      status: r.status,
      klinischer_befund: r.klinischer_befund,
      hauptdiagnose: r.hauptdiagnose,
      nebendiagnosen: r.nebendiagnosen,
      therapieziel: r.therapieziel,
      prognose: r.prognose,
      therapiedauer_wochen: r.therapiedauer_wochen,
      created_at: r.created_at,
      updated_at: r.updated_at,
      created_by_name: profile?.full_name ?? null,
    }
  })

  return NextResponse.json({ records: normalized })
}

// ----------------------------------------------------------------
// POST /api/patients/[id]/diagnoses
// Creates a new diagnose record for a patient.
// Restricted to Heilpraktiker and Admin — 403 for all other roles.
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

  // Server-side role check (defense-in-depth layer 2):
  // Physiotherapeuten are blocked here regardless of frontend guards.
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const role = userProfile?.role
  if (role !== "heilpraktiker" && role !== "admin") {
    // Log unauthorized attempt for admin audit trail
    console.warn(
      `[SECURITY] POST /api/patients/${patientId}/diagnoses blocked: user ${user.id} has role '${role ?? "unknown"}' — not heilpraktiker`
    )
    return NextResponse.json(
      { error: "Zugriff verweigert. Nur Heilpraktiker dürfen Befunde erstellen." },
      { status: 403 }
    )
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

  const parseResult = createDiagnoseSchema.safeParse(body)
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
    klinischer_befund,
    hauptdiagnose,
    nebendiagnosen,
    therapieziel,
    prognose,
    therapiedauer_wochen,
  } = parseResult.data

  // Insert — RLS INSERT policy enforces patient ownership + role check
  // created_by_role is always 'heilpraktiker': DB-level audit field
  const { data: created, error: insertError } = await supabase
    .from("diagnoses")
    .insert({
      patient_id: patientId,
      created_by: user.id,
      created_by_role: "heilpraktiker",
      status,
      klinischer_befund: klinischer_befund.trim(),
      hauptdiagnose,
      nebendiagnosen: nebendiagnosen ?? [],
      therapieziel: therapieziel?.trim() ?? "",
      prognose: prognose?.trim() ?? "",
      therapiedauer_wochen: therapiedauer_wochen ?? null,
    })
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

  if (insertError) {
    console.error("[POST /api/patients/[id]/diagnoses] Supabase error:", insertError)
    return NextResponse.json(
      { error: "Befundbericht konnte nicht gespeichert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ record: created }, { status: 201 })
}
