/**
 * PROJ-23 / Phase 2: GET /api/check/state?t=<token>
 *
 * Returns the lead's check progress so the client can resume at the right step
 * and prefill saved answers. Token-gated.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { verifyLeadToken } from "@/lib/lead-jwt"
import { CHECK_ITEMS, TOTAL_ITEMS } from "@/lib/schmerzcheck/check-items"
import { loadAnswers } from "@/lib/schmerzcheck/check-store"

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("t")
  const leadId = verifyLeadToken(token)
  if (!leadId) {
    return NextResponse.json({ error: "Ungültiger oder abgelaufener Link." }, { status: 401 })
  }

  const supabase = createSupabaseServiceClient()
  const { data: lead } = await supabase
    .from("schmerzcheck_leads")
    .select("id, status")
    .eq("id", leadId)
    .maybeSingle()

  if (!lead) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 })

  if (lead.status === "red_flag_routed") {
    return NextResponse.json({ ok: true, status: "red_flag", totalItems: TOTAL_ITEMS })
  }

  const { data: result } = await supabase
    .from("schmerzcheck_results")
    .select("status")
    .eq("lead_id", leadId)
    .maybeSingle()

  const answers = await loadAnswers(supabase, leadId)
  const answeredCount = Object.keys(answers).length

  // First unanswered item (1-based); all answered → TOTAL_ITEMS + 1
  let nextStep = TOTAL_ITEMS + 1
  for (let i = 0; i < CHECK_ITEMS.length; i++) {
    if (!(CHECK_ITEMS[i].id in answers)) {
      nextStep = i + 1
      break
    }
  }

  const status = result?.status === "completed" ? "completed" : "in_progress"

  return NextResponse.json({
    ok: true,
    status,
    totalItems: TOTAL_ITEMS,
    answeredCount,
    nextStep,
    answers,
  })
}
