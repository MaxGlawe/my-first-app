import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const updateOrgSchema = z.object({
  name: z.string().min(2).max(200).trim().optional(),
  branche: z.string().max(100).nullable().optional(),
  groesse: z.enum(["1-49", "50-99", "100-249", "250-499", "500+"]).nullable().optional(),
  kontakt_name: z.string().min(2).max(100).trim().optional(),
  kontakt_email: z.string().email().trim().optional(),
  kontakt_telefon: z.string().max(30).nullable().optional(),
  adresse_strasse: z.string().max(200).nullable().optional(),
  adresse_plz: z.string().max(10).nullable().optional(),
  adresse_ort: z.string().max(100).nullable().optional(),
  vertrag_tier: z.enum(["basic", "pro", "enterprise", "voll"]).optional(),
  vertrag_lizenzen: z.number().int().min(1).max(10000).optional(),
  vertrag_paket_max_ma: z.number().int().min(1).max(10000).nullable().optional(),
  vertrag_monatspreis: z.number().min(0).max(100000).optional(),
  vertrag_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  vertrag_ende: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  status: z.enum(["pilot", "aktiv", "pausiert", "gekuendigt"]).optional(),
  therapeut_id: z.string().uuid().nullable().optional(),
  pausen_fit_zeiten: z.array(z.string().regex(/^\d{2}:\d{2}$/)).optional(),
  abteilungen: z.array(z.string().max(100)).optional(),
})

// ── Auth Helper ─────────────────────────────────────────────────────

async function checkBgfAccess(orgId: string) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return null

  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role, bgf_freigeschaltet")
    .eq("id", user.id)
    .single()

  if (!profile) return null

  const isAdmin = profile.role === "admin"
  const isBgf = profile.bgf_freigeschaltet === true

  // Check if HR admin for this org
  const { data: orgAdmin } = await serviceClient
    .from("organization_admins")
    .select("id")
    .eq("user_id", user.id)
    .eq("organization_id", orgId)
    .maybeSingle()

  const isHrAdmin = !!orgAdmin

  if (!isAdmin && !isBgf && !isHrAdmin) return null

  // BGF-Therapeut darf nur seine Firmen sehen
  if (!isAdmin && !isHrAdmin) {
    const { data: org } = await serviceClient
      .from("organizations")
      .select("id")
      .eq("id", orgId)
      .eq("therapeut_id", user.id)
      .single()

    if (!org) return null
  }

  return { user, serviceClient, isAdmin }
}

// ── GET: Organisation Detail ────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Ungültige Organisations-ID." }, { status: 400 })
  }

  const auth = await checkBgfAccess(id)
  if (!auth) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const { data: org, error } = await auth.serviceClient
    .from("organizations")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !org) {
    return NextResponse.json(
      { error: "Organisation nicht gefunden." },
      { status: 404 }
    )
  }

  // Mitglieder-Statistik
  const { count: totalMembers } = await auth.serviceClient
    .from("organization_members")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", id)

  const { count: activeMembers } = await auth.serviceClient
    .from("organization_members")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", id)
    .eq("status", "aktiv")

  const { count: analyseComplete } = await auth.serviceClient
    .from("organization_members")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", id)
    .eq("ist_analyse_abgeschlossen", true)

  return NextResponse.json({
    organization: org,
    stats: {
      total_members: totalMembers ?? 0,
      aktive_members: activeMembers ?? 0,
      ist_analyse_quote: totalMembers
        ? Math.round(((analyseComplete ?? 0) / totalMembers) * 100)
        : 0,
    },
  })
}

// ── PATCH: Organisation bearbeiten ──────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Ungültige Organisations-ID." }, { status: 400 })
  }

  const auth = await checkBgfAccess(id)
  if (!auth || !auth.isAdmin) {
    return NextResponse.json(
      { error: "Nur Admins können Organisationen bearbeiten." },
      { status: 403 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = updateOrgSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Validierungsfehler.",
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 422 }
    )
  }

  const { data: updated, error } = await auth.serviceClient
    .from("organizations")
    .update(parseResult.data)
    .eq("id", id)
    .select("id, name, status, vertrag_tier, vertrag_lizenzen, vertrag_paket_max_ma, vertrag_monatspreis, updated_at")
    .single()

  if (error) {
    console.error("[PATCH /api/bgf/organizations/[id]] Supabase error:", error)
    return NextResponse.json(
      { error: "Organisation konnte nicht aktualisiert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ organization: updated })
}
