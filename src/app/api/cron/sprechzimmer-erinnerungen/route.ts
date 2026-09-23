/**
 * PROJ-27 — Erinnerungen an Videotermine.
 *
 * GET /api/cron/sprechzimmer-erinnerungen  (stündlich)
 *
 * Zwei Erinnerungen, wie mit dem Praxisinhaber entschieden:
 *   24 Stunden vorher — fängt die vergessenen Termine ab und lässt Zeit zum
 *                       Absagen.
 *   1 Stunde vorher   — der Moment, in dem jemand sein Handy zurechtlegt.
 *
 * Beide zusammen decken die zwei Arten des Vergessens ab: „war nicht auf dem
 * Schirm" und „war auf dem Schirm, ging unter".
 *
 * WARUM DER ZEITSTEMPEL VOR DEM VERSAND GESETZT WIRD:
 * Scheitert die Mail, gilt die Erinnerung trotzdem als erledigt. Das ist
 * Absicht. Der Cron läuft stündlich; ohne Markierung würde ein dauerhaft
 * scheiternder Versand denselben Patienten stündlich anschreiben, sobald das
 * Problem behoben ist — oder schlimmer, bei einem Teilfehler mehrfach. Eine
 * verpasste Erinnerung ist ärgerlich; zwanzig gleiche Mails sind ein
 * Vertrauensschaden.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { sendEmail } from "@/lib/email"
import { sprechzimmerEinladung } from "@/lib/email-templates/sprechzimmer-einladung"

export const dynamic = "force-dynamic"

function autorisiert(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = request.headers.get("x-cron-secret")
  const auth = request.headers.get("authorization")
  return header === secret || auth === `Bearer ${secret}`
}

interface Zeile {
  id: string
  patient_id: string
  gast_token: string
  geplant_at: string
  dauer_minuten: number
  hinweis: string | null
  therapist_id: string
  patients: { vorname: string | null; email: string | null } | null
}

export async function GET(request: NextRequest) {
  if (!autorisiert(request)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const svc = createSupabaseServiceClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wwwpraxis-os.com"
  const jetzt = Date.now()

  const { data: praxis } = await svc
    .from("praxis_settings")
    .select("praxis_name")
    .limit(1)
    .maybeSingle()

  const ergebnis = { "24h": 0, "1h": 0, fehler: 0, uebersprungen: 0 }

  for (const stufe of ["24h", "1h"] as const) {
    // Fenster grosszuegig genug, dass ein ausgefallener Lauf nachgeholt wird,
    // aber eng genug, dass niemand eine Erinnerung zu einem Termin bekommt,
    // der laengst vorbei ist.
    const vonMin = stufe === "24h" ? 23 * 60 : 45
    const bisMin = stufe === "24h" ? 25 * 60 : 75
    const spalte = stufe === "24h" ? "erinnerung_24h_at" : "erinnerung_1h_at"

    const { data, error } = await svc
      .from("video_calls")
      .select(
        "id, patient_id, gast_token, geplant_at, dauer_minuten, hinweis, therapist_id, patients(vorname, email)"
      )
      .eq("status", "geplant")
      .is(spalte, null)
      .gte("geplant_at", new Date(jetzt + vonMin * 60_000).toISOString())
      .lte("geplant_at", new Date(jetzt + bisMin * 60_000).toISOString())
      .limit(100)

    if (error) {
      console.error(`[cron/sprechzimmer] ${stufe} Abfrage:`, error.message)
      continue
    }

    for (const call of (data ?? []) as unknown as Zeile[]) {
      // Siehe Kopfkommentar: erst markieren, dann senden.
      await svc
        .from("video_calls")
        .update({ [spalte]: new Date().toISOString() })
        .eq("id", call.id)

      const email = call.patients?.email
      if (!email) {
        ergebnis.uebersprungen++
        continue
      }

      const { data: therapeut } = await svc
        .from("user_profiles")
        .select("first_name, last_name")
        .eq("id", call.therapist_id)
        .maybeSingle()

      const mail = sprechzimmerEinladung({
        vorname: call.patients?.vorname || "",
        geplantAt: call.geplant_at,
        dauerMinuten: call.dauer_minuten,
        beitrittsUrl: `${siteUrl}/sprechzimmer/${call.gast_token}`,
        behandlerName:
          [therapeut?.first_name, therapeut?.last_name].filter(Boolean).join(" ") ||
          "Dein Behandler",
        praxisName: praxis?.praxis_name ?? "Physiotherapie Glawe",
        siteUrl,
        hinweis: call.hinweis,
        erinnerung: stufe,
      })

      const res = await sendEmail({ to: email, subject: mail.subject, html: mail.html })
      if (res.success) ergebnis[stufe]++
      else {
        ergebnis.fehler++
        console.error(`[cron/sprechzimmer] ${stufe} Versand an ${email}:`, res.error)
      }
    }
  }

  console.log("[cron/sprechzimmer] ", JSON.stringify(ergebnis))
  return NextResponse.json({ ok: true, ...ergebnis })
}
