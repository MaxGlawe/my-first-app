/**
 * GET /api/me/access — Zugangszustand des eingeloggten Patienten (PROJ-26).
 *
 * Liefert exakt das, was auch Middleware und Schreib-Endpunkte auswerten, damit
 * die Oberfläche nicht raten muss: Darf hier noch geschrieben werden, und wann
 * ist die Betreuung ausgelaufen?
 *
 * Ohne Patientendatensatz gibt es nichts zu entscheiden → 404. Die Oberfläche
 * behandelt das wie „keine Einschränkung" (unverändertes Altverhalten).
 */
import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { getAccessState } from "@/lib/app-access"

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const svc = createSupabaseServiceClient()
  const { data: patient } = await svc
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!patient) {
    return NextResponse.json({ error: "Kein Patientenprofil." }, { status: 404 })
  }

  const access = await getAccessState(svc, {
    userId: user.id,
    patientId: patient.id,
    accountOrigin:
      (user.app_metadata as { account_origin?: string } | null | undefined)?.account_origin ?? null,
  })

  return NextResponse.json(access)
}
