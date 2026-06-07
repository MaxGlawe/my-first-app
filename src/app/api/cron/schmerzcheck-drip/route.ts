/**
 * PROJ-23 / Phase 4: GET /api/cron/schmerzcheck-drip
 *
 * Runs ~daily (Supabase pg_cron). Two passes, ONE due step per lead per run:
 *
 *  1) Nurture drip (status=check_completed): D1 +1d, D2 +2d, D3 +3d, D4 +5d,
 *     D5 +7d after completed_at. soft-flag skips D3 + D5 (booking pitches).
 *  2) Check reminder (consent confirmed, status=awaiting_check/check_started):
 *     R1 +1d, R2 +3d after consent_confirmed_at — wins back abandoned checks.
 *     Only confirmed leads (DOI given); pending leads are never re-mailed.
 *
 * Exclusions: red-flag leads aren't enrolled; unsubscribed/booked are suppressed.
 * Security: CRON_SECRET via `Authorization: Bearer` or `x-cron-secret`.
 */
import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { createLeadToken } from "@/lib/lead-jwt"
import { renderDripEmail, renderReminderEmail } from "@/lib/schmerzcheck/emails"
import { sendSchmerzcheckEmail } from "@/lib/schmerzcheck/mailer"

const DAY = 86_400_000
const OFFSET_DAYS = [1, 2, 3, 5, 7] // D1..D5 after completed_at (verdichtet für mehr Buchungen)
const REMINDER_OFFSET_DAYS = [1, 3] // R1..R2 after consent_confirmed_at
const MAX_PER_RUN = 100

type SC = ReturnType<typeof createSupabaseServiceClient>

/** email_hashes currently on the suppression list (unsubscribed / booked). */
async function loadSuppressed(supabase: SC, hashes: string[]): Promise<Set<string>> {
  const { data } = await supabase
    .from("schmerzcheck_unsubscribes")
    .select("email_hash")
    .in("email_hash", hashes.length ? hashes : ["_none_"])
  return new Set((data ?? []).map((s) => s.email_hash))
}

/** Map lead_id → set of already-sent step numbers for the given email codes. */
async function loadSentSteps(supabase: SC, codes: string[], leadIds: string[]): Promise<Map<string, Set<number>>> {
  const { data } = await supabase
    .from("schmerzcheck_email_events")
    .select("lead_id, email_code")
    .eq("event_type", "sent")
    .in("email_code", codes)
    .in("lead_id", leadIds)
  const map = new Map<string, Set<number>>()
  for (const e of data ?? []) {
    const step = Number(String(e.email_code).slice(1))
    if (!map.has(e.lead_id)) map.set(e.lead_id, new Set())
    map.get(e.lead_id)!.add(step)
  }
  return map
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: "Serverkonfiguration fehlt." }, { status: 500 })
  }
  const authHeader = req.headers.get("authorization")
  const cronHeader = req.headers.get("x-cron-secret")
  if (authHeader !== `Bearer ${cronSecret}` && cronHeader !== cronSecret) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin
      : new URL(req.url).origin

  const supabase = createSupabaseServiceClient()
  const now = Date.now()

  let processed = 0
  let sent = 0
  let failed = 0

  // ─────────────────────────────────────────────────────────────────────────
  // PASS 1 — Nurture drip (check completed)
  // ─────────────────────────────────────────────────────────────────────────
  const { data: leads } = await supabase
    .from("schmerzcheck_leads")
    .select("id, email, first_name, email_hash")
    .eq("status", "check_completed")
    .eq("consent_status", "confirmed")
    .limit(1000)

  if (leads && leads.length) {
    const leadIds = leads.map((l) => l.id)
    const suppressedSet = await loadSuppressed(supabase, leads.map((l) => l.email_hash).filter(Boolean) as string[])

    const { data: results } = await supabase
      .from("schmerzcheck_results")
      .select("lead_id, completed_at, result_category, soft_flag")
      .eq("status", "completed")
      .in("lead_id", leadIds)
    const resultByLead = new Map((results ?? []).map((r) => [r.lead_id, r]))
    const sentByLead = await loadSentSteps(supabase, ["D1", "D2", "D3", "D4", "D5"], leadIds)

    for (const lead of leads) {
      if (sent >= MAX_PER_RUN) break
      if (suppressedSet.has(lead.email_hash)) continue
      const result = resultByLead.get(lead.id)
      if (!result) continue

      const soft = result.soft_flag === true || result.result_category === "needs_physician_assessment"
      const completedAt = new Date(result.completed_at).getTime()
      const alreadySent = sentByLead.get(lead.id) ?? new Set<number>()

      let step: 1 | 2 | 3 | 4 | 5 | null = null
      for (let s = 1; s <= 5; s++) {
        if (alreadySent.has(s)) continue
        if ((s === 3 || s === 5) && soft) continue // skip Video-Analyse pitches for soft-flag
        if (now < completedAt + OFFSET_DAYS[s - 1] * DAY) break // not due yet
        step = s as 1 | 2 | 3 | 4 | 5
        break
      }
      if (!step) continue

      processed++
      const token = createLeadToken(lead.id)
      const { subject, html } = renderDripEmail({
        step,
        firstName: lead.first_name,
        reportUrl: `${baseUrl}/check/result?t=${encodeURIComponent(token)}`,
        token,
        baseUrl,
        unsubscribeUrl: `${baseUrl}/api/email/unsubscribe?u=${encodeURIComponent(token)}`,
        softFlag: soft,
      })

      const res = await sendSchmerzcheckEmail({ to: lead.email, toName: lead.first_name, subject, html })
      if (res.success) sent++
      else failed++

      await supabase.from("schmerzcheck_email_events").insert({
        lead_id: lead.id,
        email_code: `D${step}`,
        event_type: res.success ? "sent" : "failed",
        metadata: res.success ? { messageId: res.messageId } : { error: res.error },
      })
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PASS 2 — Check reminder (confirmed lead, check not finished)
  // ─────────────────────────────────────────────────────────────────────────
  const { data: rLeads } = await supabase
    .from("schmerzcheck_leads")
    .select("id, email, first_name, email_hash, consent_confirmed_at")
    .eq("consent_status", "confirmed")
    .in("status", ["awaiting_check", "check_started"])
    .not("consent_confirmed_at", "is", null)
    .limit(1000)

  if (rLeads && rLeads.length) {
    const rIds = rLeads.map((l) => l.id)
    const rSuppressed = await loadSuppressed(supabase, rLeads.map((l) => l.email_hash).filter(Boolean) as string[])
    const rSentByLead = await loadSentSteps(supabase, ["R1", "R2"], rIds)

    for (const lead of rLeads) {
      if (sent >= MAX_PER_RUN) break
      if (rSuppressed.has(lead.email_hash)) continue
      if (!lead.consent_confirmed_at) continue

      const baseTs = new Date(lead.consent_confirmed_at).getTime()
      const alreadySent = rSentByLead.get(lead.id) ?? new Set<number>()

      let rStep: 1 | 2 | null = null
      for (let s = 1; s <= 2; s++) {
        if (alreadySent.has(s)) continue
        if (now < baseTs + REMINDER_OFFSET_DAYS[s - 1] * DAY) break // not due yet
        rStep = s as 1 | 2
        break
      }
      if (!rStep) continue

      processed++
      const token = createLeadToken(lead.id)
      const { subject, html } = renderReminderEmail({
        step: rStep,
        firstName: lead.first_name,
        checkUrl: `${baseUrl}/check/start?t=${encodeURIComponent(token)}`,
        baseUrl,
        unsubscribeUrl: `${baseUrl}/api/email/unsubscribe?u=${encodeURIComponent(token)}`,
      })

      const res = await sendSchmerzcheckEmail({ to: lead.email, toName: lead.first_name, subject, html })
      if (res.success) sent++
      else failed++

      await supabase.from("schmerzcheck_email_events").insert({
        lead_id: lead.id,
        email_code: `R${rStep}`,
        event_type: res.success ? "sent" : "failed",
        metadata: res.success ? { messageId: res.messageId } : { error: res.error },
      })
    }
  }

  return NextResponse.json({ ok: true, processed, sent, failed })
}
