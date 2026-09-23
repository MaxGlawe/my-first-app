/**
 * PROJ-27 — Zutritt ohne Praxis-OS-Konto.
 *
 * POST /api/video/gast  { token }
 *
 * Bewusst ÖFFENTLICH, ohne Anmeldung. Das ist keine Nachlässigkeit, sondern
 * die Voraussetzung dafür, dass die Videokonsultation überhaupt stattfinden
 * kann: Zu diesem Zeitpunkt hat der Patient noch kein Konto — er bekommt es
 * erst, wenn er nach dem Gespräch das Programm kauft.
 *
 * Der Link ist ein Trage-Geheimnis: Wer ihn hat, kommt hinein. Genauso
 * arbeitet jeder Videodienst. Drei Dinge halten ihn zusammen:
 *
 *   1. Der Token ist zufällig und nicht erratbar (UUID v4).
 *   2. Er gilt für genau EIN Gespräch — nicht für den Patienten, nicht für
 *      die Praxis, nicht für den Raum als solchen.
 *   3. Er verfällt mit dem Zeitfenster des Gesprächs. Ein Link von gestern
 *      ist wertlos, auch wenn ihn jemand aufgehoben hat.
 *
 * Der Name des Gastes kommt aus dem Patientendatensatz und NICHT aus der
 * Anfrage: Sonst könnte sich jemand mit dem Link als beliebige Person
 * ausgeben, und der Behandler säle einem falschen Namen gegenüber.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { videoAnbieter } from "@/lib/video/livekit"
import { videoEingerichtet, ANLASS_TEXT } from "@/lib/video"

const schema = z.object({ token: z.string().uuid() })

export async function POST(request: NextRequest) {
  if (!videoEingerichtet()) {
    return NextResponse.json({ error: "Der Videodienst ist nicht eingerichtet." }, { status: 503 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültiger Zugang." }, { status: 400 })
  }

  const svc = createSupabaseServiceClient()
  const { data: call } = await svc
    .from("video_calls")
    .select("id, room_name, patient_id, anlass, status, oeffnet_at, schliesst_at")
    .eq("gast_token", parsed.data.token)
    .maybeSingle()

  if (!call) {
    return NextResponse.json({ error: "Dieser Zugang ist nicht gültig." }, { status: 404 })
  }

  const jetzt = Date.now()
  if (call.status === "beendet" || call.status === "abgebrochen") {
    return NextResponse.json(
      { error: "Dieses Gespräch ist beendet.", code: "beendet" },
      { status: 410 }
    )
  }
  if (jetzt < new Date(call.oeffnet_at).getTime()) {
    return NextResponse.json(
      { error: "Das Gespräch ist noch nicht geöffnet.", code: "zu_frueh" },
      { status: 425 }
    )
  }
  const schliesst = new Date(call.schliesst_at).getTime()
  if (jetzt > schliesst) {
    return NextResponse.json(
      { error: "Der Zugang ist abgelaufen. Bitte melde dich bei deinem Behandler.", code: "abgelaufen" },
      { status: 410 }
    )
  }

  const { data: patient } = await svc
    .from("patients")
    .select("vorname")
    .eq("id", call.patient_id)
    .maybeSingle()

  const zutritt = await videoAnbieter().zutritt({
    raum: call.room_name,
    // Stabil je Gespräch: Nach einem Verbindungsabbruch erkennt LiveKit
    // denselben Teilnehmer wieder, statt eine zweite Kachel zu zeigen.
    identitaet: `gast-${call.id}`,
    anzeigename: patient?.vorname || "Patient",
    rolle: "patient",
    gueltigBis: new Date(schliesst),
  })

  if (call.status === "offen") {
    await svc
      .from("video_calls")
      .update({ status: "laeuft", begonnen_at: new Date().toISOString() })
      .eq("id", call.id)
      .eq("status", "offen")
  }

  return NextResponse.json({
    token: zutritt.token,
    url: zutritt.url,
    gueltigBis: zutritt.gueltigBis,
    rolle: "patient",
    titel: ANLASS_TEXT[call.anlass]?.kurz ?? "Videogespräch",
  })
}
