/**
 * PROJ-2: Patientenstammdaten
 * PATCH /api/patients/[id]/archive
 *   — Patienten archivieren (archived_at setzen) oder reaktivieren (archived_at = null)
 *
 * DSGVO: Physisches Löschen ist nicht erlaubt (10 Jahre Aufbewahrungspflicht).
 * Stattdessen wird der Patient per archived_at Timestamp "weich" archiviert.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const archiveSchema = z.object({
  archive: z.boolean({
    error: "archive muss true (archivieren) oder false (reaktivieren) sein.",
  }),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: "Nicht autorisiert. Bitte einloggen." },
      { status: 401 }
    )
  }

  // UUID format check
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: "Ungültige Patienten-ID." }, { status: 400 })
  }

  // Parse and validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = archiveSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Validierungsfehler.",
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 422 }
    )
  }

  const { archive } = parseResult.data

  // RLS ensures therapists can only archive their own patients
  const { data, error } = await supabase
    .from("patients")
    .update({ archived_at: archive ? new Date().toISOString() : null })
    .eq("id", id)
    .select("id, vorname, nachname, archived_at")
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Patient nicht gefunden oder keine Berechtigung." },
        { status: 404 }
      )
    }
    console.error("[PATCH /api/patients/[id]/archive] Supabase error:", error)
    return NextResponse.json(
      { error: archive ? "Patient konnte nicht archiviert werden." : "Patient konnte nicht reaktiviert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({
    patient: data,
    message: archive
      ? `${data.vorname} ${data.nachname} wurde archiviert.`
      : `${data.vorname} ${data.nachname} wurde reaktiviert.`,
  })
}
