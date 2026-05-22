/**
 * PROJ-23 / Phase 4: GET /api/admin/schmerzcheck/funnel
 * Funnel metrics for the Schmerzcheck (staff only).
 */
import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

const STAFF = ["admin", "heilpraktiker", "physiotherapeut"]

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const service = createSupabaseServiceClient()
  const { data: profile } = await service
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  if (!profile || !STAFF.includes(profile.role)) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  // Bulk reads, tally in JS (modest data volume)
  const { data: leads } = await service
    .from("schmerzcheck_leads")
    .select("status, consent_status, utm_source")
    .limit(10000)
  const { data: results } = await service
    .from("schmerzcheck_results")
    .select("result_category, severity_bucket, status")
    .limit(10000)
  const { data: emailEvents } = await service
    .from("schmerzcheck_email_events")
    .select("email_code, event_type")
    .limit(50000)
  const { data: recent } = await service
    .from("schmerzcheck_leads")
    .select("first_name, email, status, consent_status, created_at")
    .order("created_at", { ascending: false })
    .limit(25)

  const tally = <T extends string>(rows: { [k: string]: unknown }[], key: string): Record<string, number> => {
    const out: Record<string, number> = {}
    for (const r of rows) {
      const v = r[key]
      if (typeof v === "string") out[v] = (out[v] ?? 0) + 1
    }
    return out as Record<T, number>
  }

  const leadRows = leads ?? []
  const byStatus = tally(leadRows, "status")
  const consentConfirmed = leadRows.filter((l) => l.consent_status === "confirmed").length

  const resultRows = (results ?? []).filter((r) => r.status === "completed")
  const byCategory = tally(resultRows, "result_category")
  const bySeverity = tally(resultRows, "severity_bucket")

  // Email counts: sent per code, plus unsubscribes
  const emailSent: Record<string, number> = {}
  let unsubscribed = 0
  for (const e of emailEvents ?? []) {
    if (e.event_type === "sent") emailSent[e.email_code] = (emailSent[e.email_code] ?? 0) + 1
    if (e.event_type === "unsubscribed") unsubscribed++
  }

  return NextResponse.json({
    leads: { total: leadRows.length, byStatus, consentConfirmed },
    results: { total: resultRows.length, byCategory, bySeverity },
    emails: { sent: emailSent, unsubscribed },
    recent: recent ?? [],
  })
}
