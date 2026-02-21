/**
 * PROJ-2: Patientenstammdaten
 * GET  /api/patients/[id]  — Einzelnen Patienten laden
 * PUT  /api/patients/[id]  — Stammdaten eines Patienten aktualisieren
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

// ----------------------------------------------------------------
// Zod schema for updating patient data
// ----------------------------------------------------------------
const updatePatientSchema = z.object({
  vorname: z.string().min(1, "Vorname ist erforderlich.").max(100).trim(),
  nachname: z.string().min(1, "Nachname ist erforderlich.").max(100).trim(),
  geburtsdatum: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Geburtsdatum muss im Format YYYY-MM-DD sein."),
  geschlecht: z.enum(["maennlich", "weiblich", "divers", "unbekannt"]),
  telefon: z.string().max(30).optional().nullable(),
  email: z
    .string()
    .email("Ungültige E-Mail-Adresse.")
    .optional()
    .nullable()
    .or(z.literal("")),
  strasse: z.string().max(200).optional().nullable(),
  plz: z.string().max(10).optional().nullable(),
  ort: z.string().max(100).optional().nullable(),
  krankenkasse: z.string().max(200).optional().nullable(),
  versichertennummer: z.string().max(50).optional().nullable(),
  interne_notizen: z.string().max(5000).optional().nullable(),
})

// ----------------------------------------------------------------
// GET /api/patients/[id]
// ----------------------------------------------------------------
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: "Ungültige Patienten-ID." }, { status: 400 })
  }

  // RLS ensures therapists can only fetch their own patients
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned — either doesn't exist or RLS blocked access
      return NextResponse.json(
        { error: "Patient nicht gefunden." },
        { status: 404 }
      )
    }
    console.error("[GET /api/patients/[id]] Supabase error:", error)
    return NextResponse.json(
      { error: "Patient konnte nicht geladen werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ patient: data })
}

// ----------------------------------------------------------------
// PUT /api/patients/[id]
// ----------------------------------------------------------------
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: "Ungültige Patienten-ID." }, { status: 400 })
  }

  // Parse and validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = updatePatientSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Validierungsfehler.",
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 422 }
    )
  }

  const formData = parseResult.data

  // Check role — Praxismanagement can only update Stammdaten fields (no interne_notizen)
  const { createSupabaseServiceClient } = await import("@/lib/supabase-service")
  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const role = profile?.role as string | null
  const isPraxismanagement = role === "praxismanagement"

  // Praxismanagement: Stammdaten only — no interne_notizen
  const payload: Record<string, unknown> = {
    vorname: formData.vorname,
    nachname: formData.nachname,
    geburtsdatum: formData.geburtsdatum,
    geschlecht: formData.geschlecht,
    telefon: formData.telefon?.trim() || null,
    email: formData.email?.trim() || null,
    strasse: formData.strasse?.trim() || null,
    plz: formData.plz?.trim() || null,
    ort: formData.ort?.trim() || null,
    krankenkasse: formData.krankenkasse?.trim() || null,
    versichertennummer: formData.versichertennummer?.trim() || null,
  }

  // Only non-praxismanagement roles can update interne_notizen
  if (!isPraxismanagement) {
    payload.interne_notizen = formData.interne_notizen?.trim() || null
  }

  // RLS ensures therapists can only update their own patients
  const { data, error } = await supabase
    .from("patients")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Patient nicht gefunden oder keine Berechtigung." },
        { status: 404 }
      )
    }
    console.error("[PUT /api/patients/[id]] Supabase error:", error)
    return NextResponse.json(
      { error: "Stammdaten konnten nicht gespeichert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ patient: data })
}
