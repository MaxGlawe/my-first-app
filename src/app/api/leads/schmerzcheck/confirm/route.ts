/**
 * PROJ-23: GET /api/leads/schmerzcheck/confirm?t=<token>
 *
 * Double-Opt-in confirmation. The T1 email's check link lands here: clicking it
 * confirms consent and (if a drip list is configured and the address is not
 * suppressed) enrols the lead into the Brevo drip. Then redirects to the
 * confirmation page.
 *
 * Phase 2 will redirect to /check/start?t=<token> instead of /schmerzcheck/bestaetigt.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { verifyLeadToken } from "@/lib/lead-jwt"

export async function GET(request: NextRequest) {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin
      : new URL(request.url).origin
  const token = new URL(request.url).searchParams.get("t")
  const leadId = verifyLeadToken(token)

  // Invalid/expired token → back to the landing page
  if (!leadId) {
    return NextResponse.redirect(`${baseUrl}/schmerzcheck`)
  }

  const supabase = createSupabaseServiceClient()
  const { data: lead } = await supabase
    .from("schmerzcheck_leads")
    .select("id, consent_status")
    .eq("id", leadId)
    .maybeSingle()

  if (!lead) {
    return NextResponse.redirect(`${baseUrl}/schmerzcheck`)
  }

  // Idempotent: only act on first confirmation. Confirmed, non-suppressed leads
  // are what the Phase-4 drip will query (no external ESP list to maintain).
  if (lead.consent_status === "pending") {
    await supabase
      .from("schmerzcheck_leads")
      .update({ consent_status: "confirmed", consent_confirmed_at: new Date().toISOString() })
      .eq("id", lead.id)

    await supabase.from("schmerzcheck_email_events").insert({
      lead_id: lead.id,
      email_code: "T1",
      event_type: "confirmed",
    })
  }

  // Phase 2: the confirm link starts the check (token carried through).
  return NextResponse.redirect(`${baseUrl}/check/start?t=${encodeURIComponent(token ?? "")}`)
}
