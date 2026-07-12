/**
 * PROJ-23 / Phase 2: POST /api/check/answer — save one answer (auto-save).
 *
 * Token-gated (lead JWT). Persists the answer, advances lead status, and — on a
 * hard red flag (items 7/8/9) — immediately routes the lead out of the funnel
 * (status red_flag_routed, T3 referral email, NO drip) and signals the client
 * to navigate to the stop page.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { isRateLimited } from "@/lib/rate-limit"
import { verifyLeadToken } from "@/lib/lead-jwt"
import { getItemById } from "@/lib/schmerzcheck/check-items"
import { evaluateAnswerRedFlag } from "@/lib/schmerzcheck/scoring"
import { routeToRedFlag } from "@/lib/schmerzcheck/check-store"

const answerSchema = z.object({
  t: z.string(),
  itemId: z.string(),
  value: z.union([z.string(), z.number(), z.array(z.string())]),
})

export async function POST(request: NextRequest) {
  let body: z.infer<typeof answerSchema>
  try {
    body = answerSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 })
  }

  const leadId = verifyLeadToken(body.t)
  if (!leadId) return NextResponse.json({ error: "Ungültiger oder abgelaufener Link." }, { status: 401 })

  // Per-token rate limit (auto-save can be frequent)
  if (isRateLimited(`check:answer:${leadId}`, 80, 60_000)) {
    return NextResponse.json({ error: "Zu viele Anfragen." }, { status: 429 })
  }

  const item = getItemById(body.itemId)
  if (!item) return NextResponse.json({ error: "Unbekannte Frage." }, { status: 400 })

  const supabase = createSupabaseServiceClient()
  const { data: lead } = await supabase
    .from("schmerzcheck_leads")
    .select("id, email, first_name, status")
    .eq("id", leadId)
    .maybeSingle()

  if (!lead) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 })

  // Already routed out — keep the client on the stop page
  if (lead.status === "red_flag_routed") {
    return NextResponse.json({ ok: true, redFlag: true })
  }

  const { hardFlag, codes } = evaluateAnswerRedFlag(body.itemId, body.value)

  // Persist the answer (idempotent upsert on lead+item)
  const { error } = await supabase
    .from("schmerzcheck_responses")
    .upsert(
      { lead_id: leadId, item_id: body.itemId, value: body.value, is_red_flag: hardFlag },
      { onConflict: "lead_id,item_id" }
    )
  if (error) {
    console.error("[POST /api/check/answer] Upsert error:", error)
    return NextResponse.json({ error: "Antwort konnte nicht gespeichert werden." }, { status: 500 })
  }

  // Advance status awaiting_check → check_started on first answer
  if (lead.status === "awaiting_check") {
    await supabase.from("schmerzcheck_leads").update({ status: "check_started" }).eq("id", leadId)
  }

  if (hardFlag) {
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin
        : new URL(request.url).origin
    await routeToRedFlag(supabase, { id: lead.id, email: lead.email, first_name: lead.first_name }, codes, baseUrl)
    return NextResponse.json({ ok: true, redFlag: true })
  }

  // ── Schwerpunkt-Frage überspringen, wenn nur EIN Bereich gewählt wurde ──────
  // Der Check kennt keine bedingten Fragen. Statt eine einzuführen, füllen wir
  // `main_region` hier automatisch und sagen dem Client, dass er die Folgefrage
  // überspringen soll. Ohne das Auto-Füllen würde /api/check/complete den Check
  // als unvollständig ablehnen — main_region ist eine Pflichtfrage.
  let skipNext = false
  if (body.itemId === "region") {
    const regions = Array.isArray(body.value) ? body.value.map(String) : [String(body.value)]

    if (regions.length === 1) {
      await supabase.from("schmerzcheck_responses").upsert(
        { lead_id: leadId, item_id: "main_region", value: regions[0], is_red_flag: false },
        { onConflict: "lead_id,item_id" }
      )
      skipNext = true
    } else {
      // Mehrere Bereiche → der Nutzer muss den Schwerpunkt selbst benennen.
      // Eine evtl. frühere Auto-Antwort (Nutzer geht zurück und wählt mehr aus)
      // wird verworfen, sonst bliebe ein falscher Schwerpunkt stehen.
      await supabase
        .from("schmerzcheck_responses")
        .delete()
        .eq("lead_id", leadId)
        .eq("item_id", "main_region")
    }
  }

  return NextResponse.json({ ok: true, redFlag: false, skipNext })
}
