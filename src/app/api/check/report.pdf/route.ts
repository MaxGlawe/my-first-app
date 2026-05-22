/**
 * PROJ-23 / Phase 3: GET /api/check/report.pdf?t=<token>
 * Streams the personalized Schmerz-Report as a PDF. Token-gated.
 */
import { NextRequest } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { verifyLeadToken } from "@/lib/lead-jwt"
import { buildReportView, type SchmerzResult } from "@/lib/schmerzcheck/report"
import { generateReportPdf } from "@/lib/schmerzcheck/report-pdf"
import { loadAnswers } from "@/lib/schmerzcheck/check-store"

export const runtime = "nodejs"

function sanitize(name: string): string {
  return (name || "report").replace(/[^a-zA-Z0-9äöüÄÖÜß]+/g, "-").replace(/^-+|-+$/g, "") || "report"
}

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("t")
  const leadId = verifyLeadToken(token)
  if (!leadId) return new Response("Unauthorized", { status: 401 })

  const supabase = createSupabaseServiceClient()
  const { data: lead } = await supabase
    .from("schmerzcheck_leads")
    .select("first_name, status")
    .eq("id", leadId)
    .maybeSingle()

  if (!lead) return new Response("Not found", { status: 404 })
  if (lead.status === "red_flag_routed") return new Response("Forbidden", { status: 403 })

  const { data: result } = await supabase
    .from("schmerzcheck_results")
    .select(
      "status, region, duration_bucket, severity_score, severity_bucket, yellow_flag_score, psychosocial_risk, movement_readiness, result_category, soft_flag"
    )
    .eq("lead_id", leadId)
    .maybeSingle()

  if (!result || result.status !== "completed") {
    return new Response("Not ready", { status: 404 })
  }

  const answers = await loadAnswers(supabase, leadId)
  const view = buildReportView(result as SchmerzResult, lead.first_name, answers)
  const now = new Date()
  const isoDate = now.toISOString().slice(0, 10)
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin
      : new URL(request.url).origin
  const pdf = generateReportPdf(view, now.toLocaleDateString("de-DE"), baseUrl)
  const filename = `schmerz-report-${sanitize(lead.first_name)}-${isoDate}.pdf`

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  })
}
