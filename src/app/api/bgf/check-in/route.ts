/**
 * PROJ-18: POST /api/bgf/check-in  — Save daily check-in
 *          GET  /api/bgf/check-in  — Get today's check-in (if exists)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

const checkInSchema = z.object({
  organization_id: z.string().uuid(),
  stimmung: z.number().int().min(1).max(5),
  schmerz_aktuell: z.number().int().min(0).max(10).default(0),
  schlaf_qualitaet: z.number().int().min(0).max(10).default(7),
  arbeitstag_typ: z.enum(["buero", "homeoffice", "unterwegs", "frei"]),
  arbeitszeit_stunden: z.number().int().min(0).max(12).default(8),
})

// ── GET: Today's check-in ────────────────────────────────────────────

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const sc = createSupabaseServiceClient()
  const today = new Date().toISOString().split("T")[0]

  const { data, error } = await sc
    .from("bgf_daily_checkins")
    .select("*")
    .eq("user_id", user.id)
    .eq("datum", today)
    .maybeSingle()

  if (error) {
    console.error("[GET /api/bgf/check-in] error:", error)
    return NextResponse.json({ error: "Fehler beim Laden." }, { status: 500 })
  }

  return NextResponse.json({ checkin: data })
}

// ── POST: Save check-in ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = checkInSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const data = parseResult.data
  const sc = createSupabaseServiceClient()
  const today = new Date().toISOString().split("T")[0]

  // Verify membership
  const { data: membership } = await sc
    .from("organization_members")
    .select("id, status")
    .eq("organization_id", data.organization_id)
    .eq("user_id", user.id)
    .eq("status", "aktiv")
    .single()

  if (!membership) {
    return NextResponse.json(
      { error: "Kein aktives BGF-Mitglied." },
      { status: 403 }
    )
  }

  // Upsert check-in (one per user per day)
  const { data: checkin, error: upsertError } = await sc
    .from("bgf_daily_checkins")
    .upsert(
      {
        user_id: user.id,
        organization_id: data.organization_id,
        datum: today,
        stimmung: data.stimmung,
        schmerz_aktuell: data.schmerz_aktuell,
        schlaf_qualitaet: data.schlaf_qualitaet,
        arbeitstag_typ: data.arbeitstag_typ,
        arbeitszeit_stunden: data.arbeitszeit_stunden,
        wasser_glaeser: 0,
      },
      { onConflict: "user_id,datum" }
    )
    .select("*")
    .single()

  if (upsertError) {
    console.error("[POST /api/bgf/check-in] upsert error:", upsertError)
    return NextResponse.json(
      { error: "Check-In konnte nicht gespeichert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ checkin }, { status: 201 })
}
