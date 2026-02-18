/**
 * PROJ-6: KI-Arztbericht-Generator
 * GET   /api/patients/[id]/reports/[reportId]  — Einzelnen Bericht laden
 * PATCH /api/patients/[id]/reports/[reportId]  — Bericht aktualisieren oder finalisieren
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const updateReportSchema = z.object({
  final_content: z.string().max(50000).optional(),
  status: z.enum(["entwurf", "finalisiert"]).optional(),
})

function normalizeReport(r: Record<string, unknown>) {
  const profile = r.user_profiles as { full_name?: string } | null
  return {
    id: r.id,
    patient_id: r.patient_id,
    generated_by: r.generated_by,
    generated_by_role: r.generated_by_role,
    report_type: r.report_type,
    date_from: r.date_from,
    date_to: r.date_to,
    recipient_name: r.recipient_name,
    recipient_address: r.recipient_address,
    extra_instructions: r.extra_instructions,
    draft_content: r.draft_content,
    final_content: r.final_content,
    status: r.status,
    created_at: r.created_at,
    updated_at: r.updated_at,
    generated_by_name: profile?.full_name ?? null,
  }
}

// ── GET /api/patients/[id]/reports/[reportId] ─────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; reportId: string }> }
) {
  const { id: patientId, reportId } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert. Bitte einloggen." }, { status: 401 })
  }

  if (!UUID_REGEX.test(patientId) || !UUID_REGEX.test(reportId)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 })
  }

  const { data: report, error } = await supabase
    .from("medical_reports")
    .select(`
      id, patient_id, generated_by, generated_by_role, report_type,
      date_from, date_to, recipient_name, recipient_address,
      extra_instructions, draft_content, final_content, status,
      created_at, updated_at,
      user_profiles!generated_by ( full_name )
    `)
    .eq("id", reportId)
    .eq("patient_id", patientId)
    .single()

  if (error || !report) {
    return NextResponse.json(
      { error: "Bericht nicht gefunden oder keine Berechtigung." },
      { status: 404 }
    )
  }

  return NextResponse.json({ report: normalizeReport(report as Record<string, unknown>) })
}

// ── PATCH /api/patients/[id]/reports/[reportId] ───────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reportId: string }> }
) {
  const { id: patientId, reportId } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert. Bitte einloggen." }, { status: 401 })
  }

  if (!UUID_REGEX.test(patientId) || !UUID_REGEX.test(reportId)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 })
  }

  // Body parsen
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = updateReportSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const updates = parseResult.data

  // Bericht existenz + Eigentümer prüfen (RLS hilft zusätzlich)
  const { data: existing, error: fetchError } = await supabase
    .from("medical_reports")
    .select("id, status, generated_by")
    .eq("id", reportId)
    .eq("patient_id", patientId)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: "Bericht nicht gefunden oder keine Berechtigung." },
      { status: 404 }
    )
  }

  // Finalisierte Berichte sind unveränderlich (Audit-Trail + DSGVO Dokumentationspflicht)
  if (existing.status === "finalisiert") {
    return NextResponse.json(
      { error: "Finalisierte Berichte können nicht mehr bearbeitet werden." },
      { status: 409 }
    )
  }

  // draft_content is never included in the PATCH body (immutable audit trail).
  // The updateReportSchema already excludes it — this comment documents the intent.

  const { data: updated, error: updateError } = await supabase
    .from("medical_reports")
    .update({
      ...(updates.final_content !== undefined ? { final_content: updates.final_content } : {}),
      ...(updates.status !== undefined ? { status: updates.status } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId)
    .select(`
      id, patient_id, generated_by, generated_by_role, report_type,
      date_from, date_to, recipient_name, recipient_address,
      extra_instructions, draft_content, final_content, status,
      created_at, updated_at
    `)
    .single()

  if (updateError) {
    console.error("[PATCH /api/patients/[id]/reports/[reportId]] Update error:", updateError)
    return NextResponse.json(
      { error: "Bericht konnte nicht gespeichert werden." },
      { status: 500 }
    )
  }

  const report = normalizeReport({ ...(updated as Record<string, unknown>), user_profiles: null })

  return NextResponse.json({ report })
}
