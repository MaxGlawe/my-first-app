/**
 * PROJ-27 — Ein einzelnes Gespräch, für die Therapeutenansicht.
 *
 * GET /api/os/video-calls/[id]
 *
 * Liefert nur, was die Seite zum Anzeigen braucht: Titel und Gegenüber. Der
 * Zutritt läuft über `/api/video/token` und prüft dort erneut — diese Route
 * gewährt nichts, sie beschriftet nur.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { ANLASS_TEXT } from "@/lib/video"

const STAFF_ROLES = new Set(["admin", "heilpraktiker", "physiotherapeut", "praxismanagement"])

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const svc = createSupabaseServiceClient()
  const { data: profile } = await svc
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile || !STAFF_ROLES.has(profile.role)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 })
  }

  const { data: call } = await svc
    .from("video_calls")
    .select("id, anlass, status, patient_id, schliesst_at")
    .eq("id", id)
    .maybeSingle()

  if (!call) {
    return NextResponse.json({ error: "Gespräch nicht gefunden." }, { status: 404 })
  }

  const { data: patient } = await svc
    .from("patients")
    .select("vorname, nachname")
    .eq("id", call.patient_id)
    .maybeSingle()

  return NextResponse.json({
    id: call.id,
    titel: ANLASS_TEXT[call.anlass]?.kurz ?? "Videogespräch",
    patient: [patient?.vorname, patient?.nachname].filter(Boolean).join(" ") || "Patient",
    status: call.status,
    schliesst_at: call.schliesst_at,
  })
}
