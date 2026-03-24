/**
 * PROJ-18: GET/PATCH /api/bgf/organizations/[id]/hr-kennzahlen
 * HR can view and update their company health KPIs (Krankenquote, Fehltage, etc.)
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const sc = createSupabaseServiceClient()

  const { data: org } = await sc
    .from("organizations")
    .select("hr_krankenquote, hr_fehltage_pro_ma, hr_personalkosten_pro_tag, branche")
    .eq("id", orgId)
    .single()

  if (!org) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 })

  // Branchenspezifische Defaults (BAuA / Statista 2024)
  const branchenDefaults: Record<string, { krankenquote: number; fehltage: number; kosten: number }> = {
    "Handwerk": { krankenquote: 6.2, fehltage: 19, kosten: 350 },
    "Produktion": { krankenquote: 6.5, fehltage: 20, kosten: 320 },
    "Büro": { krankenquote: 4.8, fehltage: 14, kosten: 280 },
    "IT": { krankenquote: 4.2, fehltage: 12, kosten: 380 },
    "Pflege": { krankenquote: 7.1, fehltage: 22, kosten: 300 },
    "Handel": { krankenquote: 5.5, fehltage: 16, kosten: 250 },
    "Logistik": { krankenquote: 6.0, fehltage: 18, kosten: 290 },
    "Gastronomie": { krankenquote: 5.8, fehltage: 17, kosten: 220 },
  }

  const defaultForBranche = branchenDefaults[org.branche ?? ""] ?? { krankenquote: 5.5, fehltage: 15, kosten: 300 }

  return NextResponse.json({
    eigene_daten: {
      krankenquote: org.hr_krankenquote ? Number(org.hr_krankenquote) : null,
      fehltage_pro_ma: org.hr_fehltage_pro_ma ? Number(org.hr_fehltage_pro_ma) : null,
      personalkosten_pro_tag: org.hr_personalkosten_pro_tag ? Number(org.hr_personalkosten_pro_tag) : null,
    },
    branche: org.branche,
    branche_defaults: defaultForBranche,
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const sc = createSupabaseServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = {}

  if (typeof body.krankenquote === "number" && body.krankenquote >= 0 && body.krankenquote <= 50) {
    update.hr_krankenquote = body.krankenquote
  }
  if (typeof body.fehltage_pro_ma === "number" && body.fehltage_pro_ma >= 0 && body.fehltage_pro_ma <= 100) {
    update.hr_fehltage_pro_ma = body.fehltage_pro_ma
  }
  if (typeof body.personalkosten_pro_tag === "number" && body.personalkosten_pro_tag >= 0 && body.personalkosten_pro_tag <= 2000) {
    update.hr_personalkosten_pro_tag = body.personalkosten_pro_tag
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Keine gültigen Daten." }, { status: 400 })
  }

  const { error } = await sc.from("organizations").update(update).eq("id", orgId)
  if (error) {
    return NextResponse.json({ error: "Fehler beim Speichern." }, { status: 500 })
  }

  return NextResponse.json({ message: "Gespeichert.", updated: update })
}
