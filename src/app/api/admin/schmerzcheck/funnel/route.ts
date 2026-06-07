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
    .select("status, consent_status, utm_source, booked_at")
    .limit(10000)
  const { data: results } = await service
    .from("schmerzcheck_results")
    .select("result_category, severity_bucket, status")
    .limit(10000)
  const { data: emailEvents } = await service
    .from("schmerzcheck_email_events")
    .select("email_code, event_type")
    .limit(50000)
  const { data: pageViews } = await service
    .from("page_views")
    .select("session_id, device_type")
    .eq("path", "/schmerzcheck")
    .limit(50000)
  const { data: convEvents } = await service
    .from("conversion_events")
    .select("event_type")
    .eq("event_type", "schmerzcheck_pdf_download")
    .limit(50000)
  const { data: recent } = await service
    .from("schmerzcheck_leads")
    .select("id, first_name, email, status, consent_status, utm_source, booked_at, created_at")
    .order("created_at", { ascending: false })
    .limit(500)
  // Ergebnis-Kategorie je Lead (für mehr Einblick in der Leads-Tabelle)
  const recentIds = (recent ?? []).map((r) => r.id as string)
  const { data: recentResults } = await service
    .from("schmerzcheck_results")
    .select("lead_id, result_category")
    .eq("status", "completed")
    .in("lead_id", recentIds.length ? recentIds : ["_none_"])
  const catByLead = Object.fromEntries((recentResults ?? []).map((r) => [r.lead_id, r.result_category]))
  const recentEnriched = (recent ?? []).map((r) => ({ ...r, category: catByLead[r.id as string] ?? null }))

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
  const booked = leadRows.filter((l) => l.booked_at).length

  // UTM-Quelle (null/leer => "(direkt)")
  const byUtmSource: Record<string, number> = {}
  for (const l of leadRows) {
    const src = typeof l.utm_source === "string" && l.utm_source.trim() ? l.utm_source : "(direkt)"
    byUtmSource[src] = (byUtmSource[src] ?? 0) + 1
  }

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

  // Landing-Besucher (eindeutige Sessions) + Geräte + PDF-Downloads
  const pvRows = pageViews ?? []
  const visitors = new Set(pvRows.map((p) => p.session_id)).size
  const byDevice = tally(pvRows, "device_type")
  const pdfDownloads = (convEvents ?? []).length
  const completed = resultRows.length

  return NextResponse.json({
    funnel: { visitors, leads: leadRows.length, confirmed: consentConfirmed, completed, pdfDownloads, booked },
    leads: { total: leadRows.length, byStatus, consentConfirmed, booked, byUtmSource },
    results: { total: completed, byCategory, bySeverity },
    emails: { sent: emailSent, unsubscribed },
    devices: byDevice,
    recent: recentEnriched,
  })
}
