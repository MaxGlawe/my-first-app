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
    .select("id, anlass, status, patient_id, gast_token, geplant_at, dauer_minuten, schliesst_at, notiz")
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wwwpraxis-os.com"

  return NextResponse.json({
    id: call.id,
    titel: ANLASS_TEXT[call.anlass]?.kurz ?? "Videogespräch",
    gast_url: `${siteUrl}/sprechzimmer/${call.gast_token}`,
    geplant_at: call.geplant_at,
    dauer_minuten: call.dauer_minuten,
    patient: [patient?.vorname, patient?.nachname].filter(Boolean).join(" ") || "Patient",
    // Fuer die Akte in der Schublade (PROJ-28). Nur die Praxis sieht diese
    // Antwort — der Gast-Endpunkt gibt sie nicht heraus.
    patient_id: call.patient_id,
    notiz: call.notiz ?? "",
    status: call.status,
    schliesst_at: call.schliesst_at,
  })
}
