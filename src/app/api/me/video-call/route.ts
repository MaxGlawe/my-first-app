/**
 * PROJ-27 — „Wartet gerade jemand auf mich?" (Patientenseite).
 *
 * GET /api/me/video-call
 *
 * Bewusst ohne Angaben zum Anlass im Klartext über das Nötigste hinaus: Diese
 * Antwort landet im Browser und in Protokollen. „Zusätzliche Sitzung bei
 * Verschlechterung" ist eine Gesundheitsangabe; der Patient weiss ohnehin,
 * warum er spricht. Deshalb geht nur der kurze Titel hinaus.
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { ANLASS_TEXT, videoEingerichtet } from "@/lib/video"
import { ABGESCHLOSSEN_FILTER } from "@/lib/video/termin"

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const svc = createSupabaseServiceClient()
  const { data: patient } = await svc
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!patient) {
    return NextResponse.json({ aktiv: null, eingerichtet: videoEingerichtet() })
  }

  // Gefragt wird nach dem ZEITFENSTER, nicht nach dem Status: Ein Termin
  // steht auf `geplant`, bis jemand beitritt. Diese Abfrage suchte frueher
  // nach `offen`/`laeuft` — und fand deshalb nie etwas. Ein Patient MIT Konto
  // sah seinen Call in der App also nie, waehrend der Gast-Link funktionierte.
  const jetzt = new Date().toISOString()
  const { data: call } = await svc
    .from("video_calls")
    .select("id, anlass, status, oeffnet_at, schliesst_at, therapist_id")
    .eq("patient_id", patient.id)
    .not("status", "in", ABGESCHLOSSEN_FILTER)
    .lte("oeffnet_at", jetzt)
    .gt("schliesst_at", jetzt)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!call) {
    return NextResponse.json({ aktiv: null, eingerichtet: videoEingerichtet() })
  }

  const { data: therapeut } = await svc
    .from("user_profiles")
    .select("first_name, last_name")
    .eq("id", call.therapist_id)
    .maybeSingle()

  return NextResponse.json({
    eingerichtet: videoEingerichtet(),
    aktiv: {
      id: call.id,
      titel: ANLASS_TEXT[call.anlass]?.kurz ?? "Videogespräch",
      status: call.status,
      schliesst_at: call.schliesst_at,
      behandler:
        [therapeut?.first_name, therapeut?.last_name].filter(Boolean).join(" ") || "Dein Behandler",
    },
  })
}
