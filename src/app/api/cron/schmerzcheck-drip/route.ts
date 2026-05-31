/**
 * PROJ-23 / Phase 4: GET /api/cron/schmerzcheck-drip
 *
 * Sends the D1–D5 nurture drip. Intended to run ~daily (Supabase pg_cron or an
 * external scheduler). Per lead it sends at most ONE due, unsent, eligible step
 * per run (no burst). Schedule offsets after check completion: D1 +1d, D2 +3d,
 * D3 +5d, D4 +7d, D5 +10d.
 *
 * Exclusions (spec §7.3):
 *   - red-flag leads are never enrolled (they have no completed result)
 *   - unsubscribed addresses are suppressed
 *   - soft-flag / needs_physician_assessment leads skip D3 AND D5 (booking pitches)
 *
 * Security: CRON_SECRET via `Authorization: Bearer` or `x-cron-secret`.
 */
import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { createLeadToken } from "@/lib/lead-jwt"
import { renderDripEmail } from "@/lib/schmerzcheck/emails"
import { sendSchmerzcheckEmail } from "@/lib/schmerzcheck/mailer"

const DAY = 86_400_000
const OFFSET_DAYS = [1, 3, 5, 7, 10] // D1..D5 after completed_at
const MAX_PER_RUN = 100

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

  // Enrolled leads: completed the check (implies DOI consent) and confirmed
  const { data: leads } = await supabase
    .from("schmerzcheck_leads")
    .select("id, email, first_name, email_hash")
    .eq("status", "check_completed")
    .eq("consent_status", "confirmed")
    .limit(1000)

  if (!leads || leads.length === 0) {
    return NextResponse.json({ ok: true, processed: 0, sent: 0 })
  }

  const leadIds = leads.map((l) => l.id)

  // Suppression list
  const hashes = leads.map((l) => l.email_hash).filter(Boolean) as string[]
  const { data: suppressed } = await supabase
    .from("schmerzcheck_unsubscribes")
    .select("email_hash")
    .in("email_hash", hashes.length ? hashes : ["_none_"])
  const suppressedSet = new Set((suppressed ?? []).map((s) => s.email_hash))

  // Results (completed_at, category, soft_flag) keyed by lead
  const { data: results } = await supabase
    .from("schmerzcheck_results")
    .select("lead_id, completed_at, result_category, soft_flag")
    .eq("status", "completed")
    .in("lead_id", leadIds)
  const resultByLead = new Map((results ?? []).map((r) => [r.lead_id, r]))

  // Already-sent drip steps per lead
  const { data: events } = await supabase
    .from("schmerzcheck_email_events")
    .select("lead_id, email_code")
    .eq("event_type", "sent")
    .in("email_code", ["D1", "D2", "D3", "D4", "D5"])
    .in("lead_id", leadIds)
  const sentByLead = new Map<string, Set<number>>()
  for (const e of events ?? []) {
    const step = Number(String(e.email_code).slice(1))
    if (!sentByLead.has(e.lead_id)) sentByLead.set(e.lead_id, new Set())
    sentByLead.get(e.lead_id)!.add(step)
  }

  let processed = 0
  let sent = 0
  let failed = 0

  for (const lead of leads) {
    if (sent >= MAX_PER_RUN) break
    if (suppressedSet.has(lead.email_hash)) continue
    const result = resultByLead.get(lead.id)
    if (!result) continue

    const soft = result.soft_flag === true || result.result_category === "needs_physician_assessment"
    const completedAt = new Date(result.completed_at).getTime()
    const alreadySent = sentByLead.get(lead.id) ?? new Set<number>()

    // earliest due, unsent, eligible step
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

  return NextResponse.json({ ok: true, candidates: leads.length, processed, sent, failed })
}
