/**
 * PROJ-23 / Phase 4: GET /api/email/unsubscribe?u=<token>
 *
 * One-click unsubscribe. Adds the lead's email_hash to the suppression list
 * (checked by the drip cron before every send) and records the event. Always
 * redirects to a friendly confirmation — no account enumeration.
 */
import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { verifyLeadToken } from "@/lib/lead-jwt"

export async function GET(request: NextRequest) {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin
      : new URL(request.url).origin
  const token = new URL(request.url).searchParams.get("u")
  const leadId = verifyLeadToken(token)

  if (leadId) {
    const supabase = createSupabaseServiceClient()
    const { data: lead } = await supabase
      .from("schmerzcheck_leads")
      .select("id, email_hash")
      .eq("id", leadId)
      .maybeSingle()

    if (lead?.email_hash) {
      await supabase
        .from("schmerzcheck_unsubscribes")
        .upsert({ email_hash: lead.email_hash, reason: "one_click" }, { onConflict: "email_hash" })
      await supabase.from("schmerzcheck_email_events").insert({
        lead_id: lead.id,
        email_code: "drip",
        event_type: "unsubscribed",
      })
    }
  }

  return NextResponse.redirect(`${baseUrl}/schmerzcheck/abgemeldet`)
}
