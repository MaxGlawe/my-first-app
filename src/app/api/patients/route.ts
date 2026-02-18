/**
 * PROJ-2: Patientenstammdaten
 * GET  /api/patients  — Patientenliste mit Suche, Filter und Pagination
 * POST /api/patients  — Neuen Patienten anlegen
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const PAGE_SIZE = 20

// ----------------------------------------------------------------
// Zod schema for creating a new patient
// ----------------------------------------------------------------
const createPatientSchema = z.object({
  vorname: z.string().min(1, "Vorname ist erforderlich.").max(100).trim(),
  nachname: z.string().min(1, "Nachname ist erforderlich.").max(100).trim(),
  geburtsdatum: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Geburtsdatum muss im Format YYYY-MM-DD sein."),
  geschlecht: z.enum(["maennlich", "weiblich", "divers", "unbekannt"], {
    error: "Ungültiges Geschlecht.",
  }),
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
// GET /api/patients
// ----------------------------------------------------------------
export async function GET(request: NextRequest) {
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

  // Parse query parameters
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") ?? ""
  const showArchived = searchParams.get("archived") === "true"
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const pageSize = Math.min(
    PAGE_SIZE,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? String(PAGE_SIZE), 10))
  )

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Build query — RLS ensures therapists only see their own patients
  let query = supabase
    .from("patients")
    .select(
      "id, vorname, nachname, geburtsdatum, geschlecht, email, krankenkasse, avatar_url, archived_at, therapeut_id, created_at",
      { count: "exact" }
    )
    .order("nachname", { ascending: true })
    .order("vorname", { ascending: true })
    .range(from, to)

  // Archivierungsfilter
  if (showArchived) {
    query = query.not("archived_at", "is", null)
  } else {
    query = query.is("archived_at", null)
  }

  // Volltext-Suche nach Name oder Geburtsdatum
  if (search.trim()) {
    // Sanitize: remove PostgREST delimiters, escape LIKE wildcards
    const term = search.trim()
      .replace(/[,()]/g, "")   // Remove PostgREST filter delimiters
      .replace(/%/g, "\\%")    // Escape LIKE wildcard %
      .replace(/_/g, "\\_")    // Escape LIKE wildcard _
    if (term) {
      query = query.or(
        `vorname.ilike.%${term}%,nachname.ilike.%${term}%,geburtsdatum.ilike.%${term}%`
      )
    }
  }

  const { data, error, count } = await query

  if (error) {
    console.error("[GET /api/patients] Supabase error:", error)
    return NextResponse.json(
      { error: "Patientenliste konnte nicht geladen werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({
    patients: data ?? [],
    totalCount: count ?? 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  })
}

// ----------------------------------------------------------------
// POST /api/patients
// ----------------------------------------------------------------
export async function POST(request: NextRequest) {
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

  // Parse and validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = createPatientSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Validierungsfehler.",
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 422 }
    )
  }

  const data = parseResult.data

  // Build insert payload
  const payload = {
    vorname: data.vorname,
    nachname: data.nachname,
    geburtsdatum: data.geburtsdatum,
    geschlecht: data.geschlecht,
    telefon: data.telefon?.trim() || null,
    email: data.email?.trim() || null,
    strasse: data.strasse?.trim() || null,
    plz: data.plz?.trim() || null,
    ort: data.ort?.trim() || null,
    krankenkasse: data.krankenkasse?.trim() || null,
    versichertennummer: data.versichertennummer?.trim() || null,
    interne_notizen: data.interne_notizen?.trim() || null,
    therapeut_id: user.id,
  }

  const { data: created, error: insertError } = await supabase
    .from("patients")
    .insert(payload)
    .select("id, vorname, nachname, geburtsdatum, geschlecht")
    .single()

  if (insertError) {
    console.error("[POST /api/patients] Supabase error:", insertError)
    return NextResponse.json(
      { error: "Patient konnte nicht gespeichert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ patient: created }, { status: 201 })
}
