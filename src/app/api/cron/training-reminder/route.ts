/**
 * PROJ-14: GET /api/cron/training-reminder
 *
 * Cron endpoint — called hourly by Vercel Cron Jobs (vercel.json).
 * Finds all patients with:
 *   - An active training assignment today (based on active_days weekday codes)
 *   - A push subscription with reminder_enabled = true
 *   - Whose reminder_time falls within the current UTC hour
 *
 * Sends a training reminder push notification to each matching patient.
 *
 * Security: Protected by CRON_SECRET header (Vercel sends this automatically
 * when configured in vercel.json as Authorization: Bearer <CRON_SECRET>).
 * Also accepts x-cron-secret for compatibility with Supabase pg_net calls.
 *
 * Note on timezones: The reminder_time stored in the DB is the time the
 * patient wants to receive the reminder (in their local time). However,
 * we store it in HH:MM format without timezone. For simplicity, the cron
 * runs hourly and compares reminder_time against the CURRENT UTC hour.
 * For a production deployment where patients span multiple timezones, you
 * would add a timezone column and convert accordingly.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { sendPushToPatients } from "@/lib/push"

// German weekday codes matching patient_assignments.active_days
const WEEKDAY_CODES = ["so", "mo", "di", "mi", "do", "fr", "sa"] as const

// BUG-3 FIX: Use Europe/Berlin local time for both weekday and hour comparison.
// reminder_time is set by patients in German local time (CET/CEST), so the cron
// must compare against the Berlin hour, not UTC. Intl.DateTimeFormat handles
// both CET (UTC+1) and CEST (UTC+2) automatically.
function getBerlinTimeParts(): { weekdayCode: string; hourString: string } {
  const now = new Date()
  // "de-DE" with numeric day/hour gives us locale-formatted Berlin time parts
  const parts = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    weekday: "short",  // e.g. "So", "Mo", "Di" ...
    hour: "2-digit",   // e.g. "08", "14"
    hour12: false,
  }).formatToParts(now)

  const weekdayShort = parts.find((p) => p.type === "weekday")?.value?.toLowerCase() ?? "mo"
  // Intl returns "So" → "so", "Mo" → "mo", etc. — matches our WEEKDAY_CODES
  const weekdayCode = WEEKDAY_CODES.includes(weekdayShort as typeof WEEKDAY_CODES[number])
    ? weekdayShort
    : WEEKDAY_CODES[now.getDay()]

  // Hour part: Intl may return "08" or "8" depending on platform — normalise
  const rawHour = parts.find((p) => p.type === "hour")?.value ?? "0"
  const hourString = rawHour.padStart(2, "0")

  return { weekdayCode, hourString }
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // 1. Verify secret — supports both Vercel Cron (Authorization: Bearer) and
  //    Supabase pg_net (x-cron-secret header)
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error("[cron/training-reminder] CRON_SECRET is not set")
    return NextResponse.json({ error: "Serverkonfiguration fehlt." }, { status: 500 })
  }

  const authHeader = req.headers.get("authorization")
  const cronHeader = req.headers.get("x-cron-secret")

  const isAuthorized =
    authHeader === `Bearer ${cronSecret}` || cronHeader === cronSecret

  if (!isAuthorized) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // 2. Determine today's weekday code and current hour in Europe/Berlin timezone
  const { weekdayCode: todayCode, hourString: currentHour } = getBerlinTimeParts()

  // The reminder_time is stored as "HH:MM" in German local time. We match
  // patients whose reminder_time starts with the current Berlin hour.
  const hourPrefix = `${currentHour}:`

  const supabase = createSupabaseServiceClient()

  // 3. Find all push subscriptions where:
  //    - reminder_enabled = true
  //    - reminder_time starts with the current hour (e.g. "08:00", "08:30")
  //    - The patient has at least one active assignment today
  //
  // We join through patient_id → patient_assignments to check active_days.
  // Use Berlin date for start_date/end_date comparison (not UTC date which could be a day off)
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(new Date()) // "YYYY-MM-DD"

  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("patient_id")
    .eq("reminder_enabled", true)
    .like("reminder_time", `${hourPrefix}%`)

  if (error) {
    console.error("[cron/training-reminder] Error fetching subscriptions:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: "Keine Subscriptions in dieser Stunde." })
  }

  // Deduplicate patient IDs (one patient may have multiple subscriptions)
  const candidatePatientIds = [...new Set(subscriptions.map((s) => s.patient_id))]

  // 4. Filter: only patients who have an active training assignment TODAY
  const { data: assignments, error: assignError } = await supabase
    .from("patient_assignments")
    .select("patient_id")
    .in("patient_id", candidatePatientIds)
    .eq("status", "aktiv")
    .lte("start_date", today)
    .gte("end_date", today)
    .contains("active_days", [todayCode])

  if (assignError) {
    console.error("[cron/training-reminder] Error fetching assignments:", assignError.message)
    return NextResponse.json({ error: assignError.message }, { status: 500 })
  }

  if (!assignments || assignments.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: "Keine aktiven Trainingstage für diese Stunde." })
  }

  // Deduplicate patient IDs from assignments
  const targetPatientIds = [...new Set(assignments.map((a) => a.patient_id))]

  // 5. Send push to all target patients
  const result = await sendPushToPatients(targetPatientIds, {
    title: "Training heute!",
    body: "Du hast heute ein Training geplant. Jetzt starten!",
    icon: "/icons/icon-192.png",
    url: "/app/training",
    tag: "training-reminder",
  })

  console.log(
    `[cron/training-reminder] Sent: ${result.sent}, Failed: ${result.failed}, Cleaned: ${result.cleaned}, Patients: ${targetPatientIds.length}`
  )

  return NextResponse.json({
    ok: true,
    patients: targetPatientIds.length,
    sent: result.sent,
    failed: result.failed,
    cleaned: result.cleaned,
  })
}
