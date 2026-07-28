/**
 * PROJ-18: POST /api/bgf/pausen-fit/ensure
 *
 * "Get-or-generate" für einen Slot — Ziel des Push-Deeplinks.
 * Tippt der Mitarbeiter auf die Erinnerung, landet er hier: existiert heute
 * schon eine Session dieses Typs, wird sie zurückgegeben; sonst wird sie
 * frisch generiert (mit dem aktuellen Check-in-Wert, sofern vorhanden).
 *
 * Input:  { organization_id, typ }
 * Output: { session, fokus?, existing: boolean }
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { generatePausenFitSession } from "@/lib/bgf/pausen-fit"

const bodySchema = z.object({
  organization_id: z.string().uuid(),
  typ: z.enum(["morgen_aktivierung", "mittag_mobilisation", "nachmittag_reset"]),
})

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = bodySchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { organization_id, typ } = parseResult.data
  const serviceClient = createSupabaseServiceClient()

  // Existiert heute bereits eine Session dieses Typs? (nicht verpasst)
  const today = new Date().toISOString().split("T")[0]
  const { data: existing } = await serviceClient
    .from("pausen_fit_sessions")
    .select("id, typ, uebungen, ergonomie_tipp, dauer_sekunden, status, geplant_um, created_at")
    .eq("user_id", user.id)
    .eq("organization_id", organization_id)
    .eq("typ", typ)
    .neq("status", "verpasst")
    .gte("geplant_um", `${today}T00:00:00`)
    .lte("geplant_um", `${today}T23:59:59`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ session: existing, existing: true }, { status: 200 })
  }

  // Sonst neu generieren
  const result = await generatePausenFitSession({
    userId: user.id,
    organizationId: organization_id,
    typ,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json(
    { session: result.session, fokus: result.fokus, existing: false },
    { status: 201 }
  )
}
