/**
 * PROJ-23 / Phase 2: small data helpers shared by the check API routes.
 */
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { sendSchmerzcheckEmail } from "./mailer"
import { renderT3RedFlagEmail } from "./emails"
import type { AnswerMap, AnswerValue } from "./scoring"

type ServiceClient = ReturnType<typeof createSupabaseServiceClient>

/** Load all saved answers for a lead as an { item_id: value } map. */
export async function loadAnswers(
  supabase: ServiceClient,
  leadId: string
): Promise<AnswerMap> {
  const { data } = await supabase
    .from("schmerzcheck_responses")
    .select("item_id, value")
    .eq("lead_id", leadId)

  const map: AnswerMap = {}
  for (const row of data ?? []) {
    map[row.item_id as string] = row.value as AnswerValue
  }
  return map
}

interface RedFlagLead {
  id: string
  email: string
  first_name: string
}

/**
 * Route a lead out of the funnel on a hard red flag: mark the lead, record a
 * red-flag result, and send the T3 referral email (NO marketing, NO drip).
 * Call this only on the transition into the red-flag state (idempotent guard
 * is the caller's responsibility — check status !== 'red_flag_routed' first).
 */
export async function routeToRedFlag(
  supabase: ServiceClient,
  lead: RedFlagLead,
  codes: string[],
  baseUrl: string
): Promise<void> {
  await supabase
    .from("schmerzcheck_leads")
    .update({ status: "red_flag_routed" })
    .eq("id", lead.id)

  await supabase
    .from("schmerzcheck_results")
    .upsert(
      { lead_id: lead.id, status: "red_flag_stopped", red_flag_codes: codes },
      { onConflict: "lead_id" }
    )

  void sendSchmerzcheckEmail({
    to: lead.email,
    toName: lead.first_name,
    subject: "Dein Schmerzcheck — wichtiger Hinweis",
    html: renderT3RedFlagEmail({ firstName: lead.first_name, baseUrl }),
  })
    .then((res) =>
      supabase.from("schmerzcheck_email_events").insert({
        lead_id: lead.id,
        email_code: "T3",
        event_type: res.success ? "sent" : "failed",
        metadata: res.success ? { messageId: res.messageId } : { error: res.error },
      })
    )
    .catch((err) => console.error("[Schmerzcheck] T3 send error:", err))
}

/**
 * PROJ-23 / Phase 4: stop the drip when a lead converts (books an appointment).
 * Called from the booking webhook. Adds the lead's email to the suppression list
 * so the drip cron skips them (D3/D4 etc. won't go out). No-op if the email
 * isn't a Schmerzcheck lead. Idempotent.
 */
export async function stopSchmerzcheckDrip(
  supabase: ServiceClient,
  email: string | null | undefined,
  reason = "booked"
): Promise<void> {
  if (!email) return
  const { data: lead } = await supabase
    .from("schmerzcheck_leads")
    .select("id, email_hash")
    .eq("email", email.trim().toLowerCase())
    .eq("source", "schmerzcheck_landing")
    .maybeSingle()
  if (!lead?.email_hash) return

  await supabase
    .from("schmerzcheck_unsubscribes")
    .upsert({ email_hash: lead.email_hash, reason }, { onConflict: "email_hash" })
  await supabase.from("schmerzcheck_email_events").insert({
    lead_id: lead.id,
    email_code: "drip",
    event_type: "unsubscribed",
    metadata: { reason },
  })
}
