/**
 * PROJ-23 / Phase 4: GET /api/schmerzcheck/go?u=<token>&e=<emailCode>
 *
 * Tracked click-out for the Video-Analyse booking CTA in emails. Logs a
 * `clicked` event in schmerzcheck_email_events (attributed to the exact email)
 * and then 302-redirects to the external booking calendar with per-touchpoint
 * UTM tagging. Never blocks the user: an invalid token or a logging hiccup
 * still forwards to the booking page.
 */
import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { verifyLeadToken } from "@/lib/lead-jwt"
import { buildBookingUrl } from "@/lib/schmerzcheck/recommendations"

// Email codes we attribute a booking click to.
const ALLOWED = new Set(["T2", "D1", "D2", "D3", "D4", "D5"])

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const token = url.searchParams.get("u")
  const code = (url.searchParams.get("e") || "").toUpperCase()
  const emailCode = ALLOWED.has(code) ? code : "drip"

  const leadId = verifyLeadToken(token)
  if (leadId) {
    try {
      const supabase = createSupabaseServiceClient()
      await supabase.from("schmerzcheck_email_events").insert({
        lead_id: leadId,
        email_code: emailCode,
        event_type: "clicked",
        metadata: { target: "video_analyse" },
      })
    } catch (err) {
      console.error("[GET /api/schmerzcheck/go] click log failed:", err)
    }
  }

  const dest = buildBookingUrl({ medium: "email", content: emailCode.toLowerCase() })
  return NextResponse.redirect(dest, 302)
}
