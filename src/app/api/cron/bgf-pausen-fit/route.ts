/**
 * PROJ-18: GET /api/cron/bgf-pausen-fit
 *
 * Pausen-Fit Erinnerungs-Cron. Läuft alle 30 Minuten (via Supabase pg_cron +
 * pg_net, siehe supabase/cron/bgf-pausen-fit.sql). Pro Lauf:
 *   1. Aktuelle Berliner Zeit → Halbstunden-Bucket (HH:00 / HH:30) + Wochentag.
 *   2. Nur Mo–Fr; ausserhalb konfigurierter Slots passiert nichts (sent: 0).
 *   3. Aktive Organisationen (pilot/aktiv), deren pausen_fit_zeiten einen Slot
 *      im aktuellen Bucket haben.
 *   4. Deren aktive Mitglieder mit abgeschlossener Ist-Analyse, die den Slot
 *      heute noch nicht abgeschlossen haben.
 *   5. Web-Push-Erinnerung mit Deeplink auf /app/bgf/dashboard?slot=<typ>.
 *
 * Der Push GENERIERT nichts — die Routine entsteht erst beim Antippen
 * (Ensure-Endpoint), damit sie den aktuellen Check-in-Wert nutzt und keine
 * KI-Calls für Mitarbeiter verbraucht werden, die nie öffnen.
 *
 * Security: CRON_SECRET (Authorization: Bearer ODER x-cron-secret).
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { sendPushToUsers } from "@/lib/push"
import type { PausenFitTyp } from "@/lib/bgf/pausen-fit"

const WEEKDAY_CODES = ["so", "mo", "di", "mi", "do", "fr", "sa"] as const
const WORKDAYS = new Set(["mo", "di", "mi", "do", "fr"])

const SLOT_LABELS: Record<PausenFitTyp, string> = {
  morgen_aktivierung: "Morgen-Aktivierung",
  mittag_mobilisation: "Mittags-Mobilisation",
  nachmittag_reset: "Nachmittags-Reset",
}

/** Berliner Wochentag + aktueller Halbstunden-Bucket ("HH:00" | "HH:30"). */
function getBerlinParts(): { weekdayCode: string; bucket: string; hour: number } {
  const now = new Date()
  const parts = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now)

  const weekdayShort = parts.find((p) => p.type === "weekday")?.value?.toLowerCase() ?? "mo"
  const weekdayCode = WEEKDAY_CODES.includes(weekdayShort as (typeof WEEKDAY_CODES)[number])
    ? weekdayShort
    : WEEKDAY_CODES[now.getDay()]

  const hour = parseInt((parts.find((p) => p.type === "hour")?.value ?? "0").padStart(2, "0"), 10)
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10)
  const bucketMin = minute < 30 ? "00" : "30"
  const bucket = `${String(hour).padStart(2, "0")}:${bucketMin}`

  return { weekdayCode, bucket, hour }
}

/** Rundet eine "HH:MM"-Zeit auf ihren Halbstunden-Bucket. */
function toBucket(time: string): string | null {
  const m = /^(\d{2}):(\d{2})$/.exec(time.trim())
  if (!m) return null
  return `${m[1]}:${parseInt(m[2], 10) < 30 ? "00" : "30"}`
}

/** Tageszeit → Session-Typ. */
function typForHour(hour: number): PausenFitTyp {
  if (hour < 11) return "morgen_aktivierung"
  if (hour < 14) return "mittag_mobilisation"
  return "nachmittag_reset"
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error("[cron/bgf-pausen-fit] CRON_SECRET is not set")
    return NextResponse.json({ error: "Serverkonfiguration fehlt." }, { status: 500 })
  }

  const authHeader = req.headers.get("authorization")
  const cronHeader = req.headers.get("x-cron-secret")
  if (authHeader !== `Bearer ${cronSecret}` && cronHeader !== cronSecret) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const { weekdayCode, bucket, hour } = getBerlinParts()

  // Nur an Arbeitstagen erinnern.
  if (!WORKDAYS.has(weekdayCode)) {
    return NextResponse.json({ ok: true, sent: 0, message: "Kein Arbeitstag." })
  }

  const supabase = createSupabaseServiceClient()

  // 1. Aktive Organisationen mit Slot im aktuellen Bucket
  const { data: orgs, error: orgError } = await supabase
    .from("organizations")
    .select("id, pausen_fit_zeiten")
    .in("status", ["pilot", "aktiv"])

  if (orgError) {
    console.error("[cron/bgf-pausen-fit] Error loading orgs:", orgError.message)
    return NextResponse.json({ error: orgError.message }, { status: 500 })
  }

  const matchedOrgIds = (orgs ?? [])
    .filter((o) => {
      const zeiten = (o.pausen_fit_zeiten as string[] | null) ?? []
      return zeiten.some((t) => toBucket(t) === bucket)
    })
    .map((o) => o.id)

  if (matchedOrgIds.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: `Kein Slot im Bucket ${bucket}.` })
  }

  const typ = typForHour(hour)

  // 2. Aktive Mitglieder mit abgeschlossener Ist-Analyse
  const { data: members, error: memberError } = await supabase
    .from("organization_members")
    .select("user_id")
    .in("organization_id", matchedOrgIds)
    .eq("status", "aktiv")
    .eq("ist_analyse_abgeschlossen", true)
    .not("user_id", "is", null)

  if (memberError) {
    console.error("[cron/bgf-pausen-fit] Error loading members:", memberError.message)
    return NextResponse.json({ error: memberError.message }, { status: 500 })
  }

  let candidateIds = [...new Set((members ?? []).map((m) => m.user_id as string))]
  if (candidateIds.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: "Keine passenden Mitglieder." })
  }

  // 3. Slot heute schon abgeschlossen? Dann nicht nerven.
  const today = new Date().toISOString().split("T")[0]
  const { data: doneToday } = await supabase
    .from("pausen_fit_sessions")
    .select("user_id")
    .eq("typ", typ)
    .eq("status", "abgeschlossen")
    .gte("geplant_um", `${today}T00:00:00`)
    .lte("geplant_um", `${today}T23:59:59`)
    .in("user_id", candidateIds)

  if (doneToday && doneToday.length > 0) {
    const doneSet = new Set(doneToday.map((d) => d.user_id as string))
    candidateIds = candidateIds.filter((id) => !doneSet.has(id))
  }

  if (candidateIds.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: "Alle haben den Slot heute erledigt." })
  }

  // 4. Push-Erinnerung senden
  const result = await sendPushToUsers(candidateIds, {
    title: "Zeit für dein Pausen-Fit 🧘",
    body: `${SLOT_LABELS[typ]} — 3 Minuten für deinen Körper. Jetzt starten!`,
    url: `/app/bgf/dashboard?slot=${typ}`,
    tag: `bgf-pausen-fit-${typ}`,
  })

  console.log(
    `[cron/bgf-pausen-fit] Bucket ${bucket}, typ ${typ}, members ${candidateIds.length}, sent ${result.sent}, failed ${result.failed}, cleaned ${result.cleaned}`
  )

  return NextResponse.json({
    ok: true,
    bucket,
    typ,
    members: candidateIds.length,
    sent: result.sent,
    failed: result.failed,
    cleaned: result.cleaned,
  })
}
