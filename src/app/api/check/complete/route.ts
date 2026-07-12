/**
 * PROJ-23 / Phase 2: POST /api/check/complete — finalize the check.
 *
 * Token-gated. Requires all 15 items answered. Runs a defensive hard-red-flag
 * re-check, then computes the result (scoring §5.6), writes the results row and
 * marks the lead check_completed. The personalized report + T2 email are Phase 3.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { verifyLeadToken } from "@/lib/lead-jwt"
import { CHECK_ITEMS, TOTAL_ITEMS } from "@/lib/schmerzcheck/check-items"
import { computeResult, detectHardRedFlag } from "@/lib/schmerzcheck/scoring"
import { loadAnswers, routeToRedFlag } from "@/lib/schmerzcheck/check-store"
import { buildReportView } from "@/lib/schmerzcheck/report"
import { generateReportPdf } from "@/lib/schmerzcheck/report-pdf"
import { renderT2ReportEmail } from "@/lib/schmerzcheck/emails"
import { sendSchmerzcheckEmail } from "@/lib/schmerzcheck/mailer"
import { claimEmailSend, releaseEmailClaim } from "@/lib/schmerzcheck/email-claims"
import { sendMetaEvent } from "@/lib/meta-capi"

const completeSchema = z.object({ t: z.string() })

export async function POST(request: NextRequest) {
  let body: z.infer<typeof completeSchema>
  try {
    body = completeSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 })
  }

  const leadId = verifyLeadToken(body.t)
  if (!leadId) return NextResponse.json({ error: "Ungültiger oder abgelaufener Link." }, { status: 401 })

  const supabase = createSupabaseServiceClient()
  const { data: lead } = await supabase
    .from("schmerzcheck_leads")
    .select("id, email, first_name, status")
    .eq("id", leadId)
    .maybeSingle()

  if (!lead) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 })
  if (lead.status === "red_flag_routed") {
    return NextResponse.json({ ok: true, redFlag: true })
  }

  const answers = await loadAnswers(supabase, leadId)

  // All items required
  const missing = CHECK_ITEMS.filter((i) => !(i.id in answers)).map((i) => i.id)
  if (missing.length > 0) {
    return NextResponse.json(
      { error: "Der Check ist noch nicht vollständig.", missing },
      { status: 400 }
    )
  }

  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin
      : new URL(request.url).origin

  // Defensive red-flag re-check (in case an answer slipped through)
  const { hardFlag, codes } = detectHardRedFlag(answers)
  if (hardFlag) {
    await routeToRedFlag(supabase, { id: lead.id, email: lead.email, first_name: lead.first_name }, codes, baseUrl)
    return NextResponse.json({ ok: true, redFlag: true })
  }

  const result = computeResult(answers)

  const { error } = await supabase.from("schmerzcheck_results").upsert(
    {
      lead_id: leadId,
      status: "completed",
      region: result.region,
      duration_bucket: result.duration_bucket,
      severity_score: result.severity_score,
      severity_bucket: result.severity_bucket,
      yellow_flag_score: result.yellow_flag_score,
      psychosocial_risk: result.psychosocial_risk,
      movement_readiness: result.movement_readiness,
      result_category: result.result_category,
      soft_flag: result.soft_flag,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "lead_id" }
  )

  if (error) {
    console.error("[POST /api/check/complete] Result upsert error:", error)
    return NextResponse.json({ error: "Auswertung konnte nicht gespeichert werden." }, { status: 500 })
  }

  await supabase.from("schmerzcheck_leads").update({ status: "check_completed" }).eq("id", leadId)

  // Meta CAPI: CompleteRegistration (server-side; deterministic event_id avoids
  // double-counting on report revisits). Fires for every completed check.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null
  void sendMetaEvent({
    eventName: "CompleteRegistration",
    email: lead.email,
    eventId: `cr_${leadId}`,
    eventSourceUrl: `${baseUrl}/check/result`,
    clientIp: ip,
    userAgent: request.headers.get("user-agent"),
    fbp: request.cookies.get("_fbp")?.value ?? null,
    fbc: request.cookies.get("_fbc")?.value ?? null,
  }).catch(() => {})

  // T2: deliver the report (web link + PDF attachment). Fire-and-forget so a
  // mail/PDF hiccup never blocks the completion response.
  const reportUrl = `${baseUrl}/check/result?t=${encodeURIComponent(body.t)}`
  const unsubscribeUrl = `${baseUrl}/api/email/unsubscribe?u=${encodeURIComponent(body.t)}`
  void (async () => {
    try {
      // Idempotent: ein zweiter POST auf /complete (Reload, Doppelklick) darf den
      // Report nicht ein zweites Mal verschicken.
      if (!(await claimEmailSend(supabase, leadId, "T2"))) return

      const view = buildReportView(result, lead.first_name, answers)
      const pdf = generateReportPdf(view, new Date().toLocaleDateString("de-DE"), baseUrl)
      const res = await sendSchmerzcheckEmail({
        to: lead.email,
        toName: lead.first_name,
        subject: "Dein persönlicher Schmerz-Report — von Max Glawe",
        html: renderT2ReportEmail({
          firstName: lead.first_name,
          reportUrl,
          baseUrl,
          unsubscribeUrl,
          token: body.t,
          softFlag: result.soft_flag,
        }),
        attachments: [{ filename: "schmerz-report.pdf", content: Buffer.from(pdf) }],
      })

      if (!res.success) await releaseEmailClaim(supabase, leadId, "T2")

      await supabase.from("schmerzcheck_email_events").insert({
        lead_id: leadId,
        email_code: "T2",
        event_type: res.success ? "sent" : "failed",
        metadata: res.success ? { messageId: res.messageId } : { error: res.error },
      })
    } catch (err) {
      console.error("[POST /api/check/complete] T2 send error:", err)
    }
  })()

  return NextResponse.json({
    ok: true,
    redFlag: false,
    category: result.result_category,
    softFlag: result.soft_flag,
    totalItems: TOTAL_ITEMS,
  })
}
