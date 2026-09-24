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

/**
 * GET /api/video/gast?token=…
 *
 * Wann ist mein Termin, und kann ich schon hinein? Bewusst OHNE
 * Videozugang: Wer am Vorabend auf den Link klickt, soll eine Uhrzeit sehen
 * und keine Fehlermeldung. Ein Link, der zwoelf Stunden vorher wie ein
 * Defekt aussieht, erzeugt genau den Anruf, den die Einladung ersparen
 * sollte.
 *
 * Herausgegeben wird nur, was auf einer Einladung ohnehin steht — Zeitpunkt,
 * Dauer, Name des Behandlers. Keine Angaben zur Beschwerde.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")
  if (!token || !z.string().uuid().safeParse(token).success) {
    return NextResponse.json({ error: "Dieser Zugang ist nicht gültig." }, { status: 404 })
  }

  const svc = createSupabaseServiceClient()
  const { data: call } = await svc
    .from("video_calls")
    .select("id, anlass, status, geplant_at, dauer_minuten, oeffnet_at, schliesst_at, therapist_id, hinweis")
    .eq("gast_token", token)
    .maybeSingle()

  if (!call) {
    return NextResponse.json({ error: "Dieser Zugang ist nicht gültig." }, { status: 404 })
  }

  const { data: therapeut } = await svc
    .from("user_profiles")
    .select("first_name, last_name")
    .eq("id", call.therapist_id)
    .maybeSingle()

  const jetzt = Date.now()
  const zustand =
    call.status === "abgesagt"
      ? "abgesagt"
      : call.status === "beendet" || jetzt > new Date(call.schliesst_at).getTime()
      ? "vorbei"
      : jetzt >= new Date(call.oeffnet_at).getTime()
      ? "offen"
      : "wartet"

  return NextResponse.json({
    zustand,
    titel: ANLASS_TEXT[call.anlass]?.kurz ?? "Videogespräch",
    geplant_at: call.geplant_at,
    dauer_minuten: call.dauer_minuten,
    oeffnet_at: call.oeffnet_at,
    hinweis: call.hinweis,
    behandler:
      [therapeut?.first_name, therapeut?.last_name].filter(Boolean).join(" ") || "dein Behandler",
  })
}

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

  // Auch aus `geplant` heraus — siehe zutrittOffen in lib/video/termin.ts.
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
    rolle: "patient",
    titel: ANLASS_TEXT[call.anlass]?.kurz ?? "Videogespräch",
  })
}
