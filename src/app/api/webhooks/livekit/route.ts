/**
 * PROJ-27 — Anwesenheitsprotokoll aus den LiveKit-Webhooks.
 *
 * POST /api/webhooks/livekit
 *
 * Schreibt mit, wer wann beigetreten und gegangen ist, und schliesst ein
 * Gespräch ab, wenn der Raum endet.
 *
 * ZWEI LEHREN aus dem Buchungs-Webhook, der am 23.09.2026 zwei Wochen lang
 * jede Zustellung gegen die Wand fahren liess, ohne dass es jemandem auffiel:
 *
 *  1. ABGEWIESENE Anfragen werden protokolliert, nicht nur angenommene. Dort
 *     wurden Signaturfehler stillschweigend mit 401 beantwortet und nirgends
 *     vermerkt — die Protokolltabelle war leer, und genau diese Leere las sich
 *     wie „es kommt nichts an". Sie war die Ursache einer falschen Diagnose.
 *
 *  2. Die Antwort ist immer 200, sobald die Signatur stimmt. Ein Sender, der
 *     auf 5xx wiederholt, baut sonst eine Warteschlange auf, weil bei uns
 *     etwa eine Zeile nicht in die Datenbank passt. Annahme und Verarbeitung
 *     sind zwei verschiedene Dinge.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { videoAnbieter } from "@/lib/video/livekit"
import { videoEingerichtet } from "@/lib/video"

interface LiveKitEvent {
  event?: string
  room?: { name?: string; sid?: string }
  participant?: { identity?: string; name?: string; metadata?: string }
  createdAt?: number | string
}

export async function POST(request: NextRequest) {
  if (!videoEingerichtet()) {
    return NextResponse.json({ error: "Videodienst nicht eingerichtet." }, { status: 503 })
  }

  const body = await request.text()
  const authHeader = request.headers.get("authorization")
  const svc = createSupabaseServiceClient()

  const geprueft = (await videoAnbieter().webhookPruefen(body, authHeader)) as LiveKitEvent | null

  if (!geprueft) {
    // Siehe Lehre 1: Auch das Scheitern hinterlässt eine Spur.
    await svc
      .from("video_call_events")
      .insert({
        room_name: "(unbekannt)",
        event: "signatur_abgelehnt",
        payload: { laenge: body.length, hatHeader: Boolean(authHeader) },
      })
      .then(undefined, () => {})
    return NextResponse.json({ error: "Ungültige Signatur." }, { status: 401 })
  }

  const raum = geprueft.room?.name ?? null
  const event = geprueft.event ?? "unbekannt"

  try {
    let callId: string | null = null
    if (raum) {
      const { data } = await svc
        .from("video_calls")
        .select("id, status")
        .eq("room_name", raum)
        .maybeSingle()
      callId = data?.id ?? null

      // Raum zu Ende → Gespräch abschliessen. Nur, wenn es noch offen steht:
      // Ein bereits vom Behandler beendetes Gespräch behält seinen Zeitstempel.
      if (event === "room_finished" && data && (data.status === "offen" || data.status === "laeuft")) {
        await svc
          .from("video_calls")
          .update({ status: "beendet", beendet_at: new Date().toISOString() })
          .eq("id", data.id)
          .in("status", ["offen", "laeuft"])
      }
    }

    let rolle: string | null = null
    if (geprueft.participant?.metadata) {
      try {
        rolle = (JSON.parse(geprueft.participant.metadata) as { rolle?: string }).rolle ?? null
      } catch {
        rolle = null
      }
    }

    await svc.from("video_call_events").insert({
      call_id: callId,
      room_name: raum ?? "(ohne Raum)",
      event,
      identity: geprueft.participant?.identity ?? null,
      rolle,
      payload: {
        name: geprueft.participant?.name ?? null,
        sid: geprueft.room?.sid ?? null,
      },
    })
  } catch (err) {
    // Siehe Lehre 2: sichtbar machen, aber nicht wiederholen lassen.
    console.error("[webhooks/livekit] Verarbeitung fehlgeschlagen:", err)
  }

  return NextResponse.json({ received: true })
}
