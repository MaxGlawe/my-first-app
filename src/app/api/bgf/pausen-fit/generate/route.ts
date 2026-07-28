/**
 * PROJ-18: POST /api/bgf/pausen-fit/generate
 *
 * Generiert eine personalisierte Pausen-Fit Micro-Routine für den
 * eingeloggten Mitarbeiter. Dünner Wrapper um generatePausenFitSession()
 * (src/lib/bgf/pausen-fit.ts) — die eigentliche Logik ist session-unabhängig
 * und wird auch vom Ensure-Endpoint (Push-Deeplink) genutzt.
 *
 * Input: { organization_id, typ: "morgen_aktivierung" | "mittag_mobilisation" | "nachmittag_reset" }
 * Output: PausenFitSession (gespeichert + zurückgegeben)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
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

  const result = await generatePausenFitSession({
    userId: user.id,
    organizationId: organization_id,
    typ,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json({ session: result.session, fokus: result.fokus }, { status: 201 })
}
