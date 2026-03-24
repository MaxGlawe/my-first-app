import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

// ── Validation ──────────────────────────────────────────────────────

const createOrgSchema = z.object({
  name: z.string().min(2, "Firmenname ist erforderlich.").max(200).trim(),
  branche: z.string().max(100).optional(),
  groesse: z.enum(["1-49", "50-99", "100-249", "250-499", "500+"]).optional(),
  kontakt_name: z.string().min(2, "Kontaktname ist erforderlich.").max(100).trim(),
  kontakt_email: z.string().email("Ungültige E-Mail-Adresse.").trim(),
  kontakt_telefon: z.string().max(30).optional(),
  adresse_strasse: z.string().max(200).optional(),
  adresse_plz: z.string().max(10).optional(),
  adresse_ort: z.string().max(100).optional(),
  vertrag_tier: z.enum(["basic", "pro", "enterprise"]).optional(),
  vertrag_lizenzen: z.number().int().min(1).max(10000).optional(),
  vertrag_preis_pro_ma_monat: z.number().min(0).max(500).optional(),
})

// ── GET: Liste aller Organisationen ─────────────────────────────────

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

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

  // Prüfe ob User Admin oder BGF-Therapeut ist
  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role, bgf_freigeschaltet")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return NextResponse.json(
      { error: "Profil nicht gefunden." },
      { status: 404 }
    )
  }

  const isAdmin = profile.role === "admin"
  const isBgf = profile.bgf_freigeschaltet === true

  if (!isAdmin && !isBgf) {
    return NextResponse.json(
      { error: "Keine Berechtigung für BGF." },
      { status: 403 }
    )
  }

  // Admin sieht alle, BGF-Therapeut nur seine
  let query = serviceClient
    .from("organizations")
    .select("*", { count: "exact" })
    .order("name", { ascending: true })
    .limit(100)

  if (!isAdmin) {
    query = query.eq("therapeut_id", user.id)
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  if (status) {
    query = query.eq("status", status)
  }

  const { data, error, count } = await query

  if (error) {
    console.error("[GET /api/bgf/organizations] Supabase error:", error)
    return NextResponse.json(
      { error: "Organisationen konnten nicht geladen werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({
    organizations: data ?? [],
    totalCount: count ?? 0,
  })
}

// ── POST: Neue Organisation anlegen ─────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

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

  // Nur Admin darf Organisationen anlegen
  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    return NextResponse.json(
      { error: "Nur Admins können Organisationen anlegen." },
      { status: 403 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = createOrgSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Validierungsfehler.",
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 422 }
    )
  }

  const d = parseResult.data

  const { data: created, error: insertError } = await serviceClient
    .from("organizations")
    .insert({
      name: d.name,
      branche: d.branche?.trim() || null,
      groesse: d.groesse || null,
      kontakt_name: d.kontakt_name,
      kontakt_email: d.kontakt_email,
      kontakt_telefon: d.kontakt_telefon?.trim() || null,
      adresse_strasse: d.adresse_strasse?.trim() || null,
      adresse_plz: d.adresse_plz?.trim() || null,
      adresse_ort: d.adresse_ort?.trim() || null,
      vertrag_tier: d.vertrag_tier || "pro",
      vertrag_lizenzen: d.vertrag_lizenzen || 50,
      vertrag_preis_pro_ma_monat: d.vertrag_preis_pro_ma_monat || 39.0,
      vertrag_start: new Date().toISOString().split("T")[0],
      status: "pilot",
    })
    .select("id, name, status, vertrag_tier, vertrag_lizenzen, kontakt_email, created_at")
    .single()

  if (insertError) {
    console.error("[POST /api/bgf/organizations] Supabase error:", insertError)
    return NextResponse.json(
      { error: "Organisation konnte nicht erstellt werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ organization: created }, { status: 201 })
}
