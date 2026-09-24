/**
 * PROJ-27 — Zutritt zum Sprechzimmer.
 *
 * POST /api/video/token  { call_id }
 *
 * Die sicherheitskritische Stelle des ganzen Vorhabens. Hier entscheidet sich,
 * wer ein fremdes Gespräch über Gesundheit mithören kann. Deshalb drei
 * getrennte Prüfungen, jede einzeln ausreichend, um abzuweisen:
 *
 *   1. WER — angemeldet, und zwar als der Patient dieses Gesprächs oder als
 *      klinisches Personal. Der Raumname allein genügt nie; er taucht in URLs
 *      auf und ist damit kein Geheimnis.
 *   2. WANN — nur innerhalb des am Gespräch gespeicherten Zutrittsfensters.
 *      Ein beendetes Gespräch gibt keine Token mehr aus.
 *   3. WIE LANGE — die Gültigkeit endet mit dem Fenster, nicht nach einer
 *      festen Spanne. Ein Token überlebt niemals das Gespräch, zu dem es
 *      gehört.
 *
 * Der Schlüssel des Videodienstes bleibt dabei auf dem Server. Der Browser
 * bekommt ein Token für genau einen Raum, nichts weiter — kein Recht, Räume
 * aufzulisten, Teilnehmer zu entfernen oder aufzuzeichnen.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { videoAnbieter } from "@/lib/video/livekit"
import { videoEingerichtet, type CallRolle } from "@/lib/video"

const STAFF_ROLES = new Set(["admin", "heilpraktiker", "physiotherapeut", "praxismanagement"])

const schema = z.object({ call_id: z.string().uuid() })

export async function POST(request: NextRequest) {
  if (!videoEingerichtet()) {
    return NextResponse.json(
      { error: "Der Videodienst ist auf diesem Server nicht eingerichtet." },
      { status: 503 }
    )
  }

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
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "call_id fehlt oder ist ungültig." }, { status: 400 })
  }

  const svc = createSupabaseServiceClient()

  const { data: call } = await svc
    .from("video_calls")
    .select("id, room_name, patient_id, therapist_id, anlass, status, oeffnet_at, schliesst_at")
    .eq("id", parsed.data.call_id)
    .maybeSingle()

  if (!call) {
    return NextResponse.json({ error: "Gespräch nicht gefunden." }, { status: 404 })
  }

  // ── 1. Wer ──────────────────────────────────────────────────────────────
  const { data: profile } = await svc
    .from("user_profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle()

  const istPersonal = profile ? STAFF_ROLES.has(profile.role) : false

  let rolle: CallRolle
  let anzeigename: string

  if (istPersonal) {
    rolle = "therapeut"
    anzeigename =
      [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Behandler"
  } else {
    const { data: patient } = await svc
      .from("patients")
      .select("id, vorname")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!patient || patient.id !== call.patient_id) {
      // Bewusst dieselbe Antwort wie bei einem unbekannten Gespräch: Wer kein
      // Teilnehmer ist, soll nicht einmal erfahren, ob es dieses Gespräch gibt.
      return NextResponse.json({ error: "Gespräch nicht gefunden." }, { status: 404 })
    }
    rolle = "patient"
    anzeigename = patient.vorname || "Patient"
  }

  // ── 2. Wann ─────────────────────────────────────────────────────────────
  const jetzt = Date.now()
  const oeffnet = new Date(call.oeffnet_at).getTime()
  const schliesst = new Date(call.schliesst_at).getTime()

  if (call.status === "beendet" || call.status === "abgebrochen") {
    return NextResponse.json(
      { error: "Dieses Gespräch ist beendet.", code: "beendet" },
      { status: 410 }
    )
  }
  if (jetzt < oeffnet) {
    return NextResponse.json(
      { error: "Das Gespräch ist noch nicht geöffnet.", code: "zu_frueh", oeffnetAm: call.oeffnet_at },
      { status: 425 }
    )
  }
  if (jetzt > schliesst) {
    return NextResponse.json(
      { error: "Das Zeitfenster für dieses Gespräch ist abgelaufen.", code: "abgelaufen" },
      { status: 410 }
    )
  }

  // ── 3. Wie lange ────────────────────────────────────────────────────────
  const zutritt = await videoAnbieter().zutritt({
    raum: call.room_name,
    // Die Identität ist je Teilnehmer eindeutig und stabil. Tritt jemand nach
    // einem Verbindungsabbruch erneut bei, erkennt LiveKit ihn wieder, statt
    // eine zweite Kachel zu zeigen.
    identitaet: `${rolle}-${user.id}`,
    anzeigename,
    rolle,
    gueltigBis: new Date(schliesst),
  })

  // Erster Beitritt markiert das Gespräch als laufend. Das genaue Protokoll
  // schreiben die Anbieter-Webhooks — hier geht es nur darum, dass die
  // Oberfläche den Zustand sofort richtig zeigt, ohne auf den Webhook zu
  // warten.
  //
  // Auch aus `geplant` heraus: Ein Termin bleibt geplant, bis jemand kommt.
  // Vorher wurde nur `offen` befördert — und weil nichts je auf `offen`
  // schaltete, blieb jedes Gespraech für immer geplant (siehe zutrittOffen).
  if (call.status === "geplant" || call.status === "offen") {
    await svc
      .from("video_calls")
      .update({ status: "laeuft", begonnen_at: new Date().toISOString() })
      .eq("id", call.id)
      .in("status", ["geplant", "offen"])
  }

  return NextResponse.json({
    token: zutritt.token,
    url: zutritt.url,
    gueltigBis: zutritt.gueltigBis,
    rolle,
    anlass: call.anlass,
    raum: call.room_name,
  })
}
