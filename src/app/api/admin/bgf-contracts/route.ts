/**
 * PROJ-18: BGF Contract CRUD
 * GET  /api/admin/bgf-contracts  — List BGF contracts
 * POST /api/admin/bgf-contracts  — Create new BGF contract
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { z } from "zod"
import { generateToken } from "@/lib/tokens"
import { generateBgfVertragText } from "@/lib/bgf-contract-templates"
import type { PraxisSettings } from "@/types/billing"
import { BGF_VOLL_LEISTUNGEN } from "@/types/bgf-contract"
import { MAX_LISTEN_PAKET_MA, paketByMaxMa, paketVertragsLabel } from "@/lib/bgf-pakete"

const createSchema = z.object({
  organization_id: z.string().uuid(),
  /** Obergrenze der Preisstaffel (10/20/35/50) — null = individuelles Paket */
  paket_max_ma: z.number().int().min(1).nullable().optional().default(null),
  /** Fester Monatspreis netto; bei Listen-Paketen optional (wird abgeleitet) */
  monatspreis: z.number().min(0).optional(),
  /** Kopfpreis je Nachbesetzung; bei Listen-Paketen optional (wird abgeleitet) */
  zusatz_ma_preis: z.number().min(0).nullable().optional(),
  lizenzen: z.number().int().min(1),
  laufzeit_monate: z.number().int().min(1).default(12),
  vertrag_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional(),
})

async function checkAuth() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const sc = createSupabaseServiceClient()
  const { data: profile } = await sc
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || !["admin", "heilpraktiker", "physiotherapeut"].includes(profile.role)) {
    return null
  }

  return { user, sc, role: profile.role }
}

// ── GET: List BGF contracts ──────────────────────────────────────────

export async function GET(request: NextRequest) {
  const auth = await checkAuth()
  if (!auth) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const orgId = searchParams.get("organization_id")

  let query = auth.sc
    .from("bgf_contracts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  if (auth.role !== "admin") {
    query = query.eq("created_by", auth.user.id)
  }
  if (status) query = query.eq("status", status)
  if (orgId) query = query.eq("organization_id", orgId)

  const { data, error } = await query

  if (error) {
    console.error("[GET /api/admin/bgf-contracts] error:", error)
    return NextResponse.json({ error: "Fehler beim Laden." }, { status: 500 })
  }

  return NextResponse.json({ contracts: data ?? [] })
}

// ── POST: Create BGF contract ────────────────────────────────────────

export async function POST(request: NextRequest) {
  const auth = await checkAuth()
  if (!auth) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = createSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const data = parseResult.data

  // Paketpreis: aus der Staffel ableiten, sofern kein Betrag mitgegeben wurde.
  const paket = data.paket_max_ma ? paketByMaxMa(data.paket_max_ma) : undefined
  const monatlichGesamt = data.monatspreis ?? paket?.preis
  if (monatlichGesamt === undefined) {
    return NextResponse.json(
      {
        error: `Kein Preis ermittelbar. Für Teams über ${MAX_LISTEN_PAKET_MA} Mitarbeitende muss ein Monatspreis angegeben werden.`,
      },
      { status: 422 }
    )
  }
  const paketLabelText = paketVertragsLabel(data.paket_max_ma)
  // Kopfpreis für Nachbesetzungen über der Paketgrenze (§4 Abs. 4)
  const zusatzMaPreis = data.zusatz_ma_preis ?? paket?.proMaZusatz ?? null

  // Load organization
  const { data: org, error: orgError } = await auth.sc
    .from("organizations")
    .select("*")
    .eq("id", data.organization_id)
    .single()

  if (orgError || !org) {
    return NextResponse.json({ error: "Organisation nicht gefunden." }, { status: 404 })
  }

  // Load praxis settings
  const { data: praxisRaw } = await auth.sc
    .from("praxis_settings")
    .select("*")
    .limit(1)
    .single()

  const praxis: PraxisSettings = praxisRaw ?? {
    praxis_name: "Physiotherapie Praxis",
    inhaber_name: "Inhaber",
    strasse: "",
    plz: "",
    ort: "",
    email: "",
    telefon: "",
    zulassungsnummer: null,
  }

  // Ein Produkt: identischer Leistungskatalog in jedem Vertrag
  const leistungen = BGF_VOLL_LEISTUNGEN

  // Generate contract text
  const orgAddress = [org.adresse_strasse, org.adresse_plz, org.adresse_ort]
    .filter(Boolean)
    .join(", ")

  const vertragText = generateBgfVertragText({
    leistungen,
    paketMaxMa: data.paket_max_ma,
    zusatzMaPreis: zusatzMaPreis,
    lizenzen: data.lizenzen,
    monatlichGesamt,
    laufzeitMonate: data.laufzeit_monate,
    vertragStart: data.vertrag_start,
    praxis,
    orgName: org.name,
    orgAddress: orgAddress || null,
    orgBranche: org.branche,
    orgGroesse: org.groesse,
    kontaktName: org.kontakt_name,
    kontaktEmail: org.kontakt_email,
  })

  // Generate contract number (BGF-YYYY-NNNN)
  const year = new Date().getFullYear()
  const { data: lastContract } = await auth.sc
    .from("bgf_contracts")
    .select("contract_number")
    .like("contract_number", `BGF-${year}-%`)
    .order("contract_number", { ascending: false })
    .limit(1)
    .maybeSingle()

  let nextNumber = 1
  if (lastContract?.contract_number) {
    const match = lastContract.contract_number.match(/BGF-\d{4}-(\d+)/)
    if (match) nextNumber = parseInt(match[1]) + 1
  }
  const contractNumber = `BGF-${year}-${String(nextNumber).padStart(4, "0")}`

  // Generate signing token
  const signingToken = generateToken()
  const tokenExpiresAt = new Date()
  tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 14)

  // Insert
  const praxisFullAddress = `${praxis.strasse}, ${praxis.plz} ${praxis.ort}`

  const { data: contract, error: insertError } = await auth.sc
    .from("bgf_contracts")
    .insert({
      contract_number: contractNumber,
      organization_id: data.organization_id,
      created_by: auth.user.id,
      contract_type: "voll",
      leistungen,
      paket_max_ma: data.paket_max_ma,
      paket_label: paketLabelText,
      zusatz_ma_preis: zusatzMaPreis,
      preis_pro_ma_monat: null,
      lizenzen: data.lizenzen,
      monatlicher_gesamtpreis: monatlichGesamt,
      laufzeit_monate: data.laufzeit_monate,
      vertrag_start: data.vertrag_start,
      vertrag_text: vertragText,
      org_name: org.name,
      org_address: orgAddress || null,
      org_branche: org.branche,
      org_groesse: org.groesse,
      kontakt_name: org.kontakt_name,
      kontakt_email: org.kontakt_email,
      praxis_name: praxis.praxis_name,
      praxis_address: praxisFullAddress,
      praxis_inhaber: praxis.inhaber_name,
      praxis_zulassung: praxis.zulassungsnummer ?? null,
      signing_token: signingToken,
      token_expires_at: tokenExpiresAt.toISOString(),
      status: "entwurf",
      notes: data.notes?.trim() || null,
    })
    .select("*")
    .single()

  if (insertError) {
    console.error("[POST /api/admin/bgf-contracts] insert error:", insertError)
    return NextResponse.json({ error: "Vertrag konnte nicht erstellt werden." }, { status: 500 })
  }

  return NextResponse.json({ contract }, { status: 201 })
}
