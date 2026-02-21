/**
 * PROJ-6: KI-Arztbericht-Generator
 * GET /api/patients/[id]/reports/data-availability
 * Prüft wie viele Behandlungen / Befunde / Diagnosen / Anamnesen im Zeitraum vorhanden sind.
 * Wird im Konfigurationsformular angezeigt um dem Therapeuten eine Übersicht zu geben.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  if (!UUID_REGEX.test(patientId)) {
    return NextResponse.json({ error: "Ungültige Patienten-ID." }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const dateFrom = searchParams.get("date_from")
  const dateTo = searchParams.get("date_to")

  if (!dateFrom || !dateTo) {
    return NextResponse.json({ error: "date_from und date_to sind erforderlich." }, { status: 400 })
  }

  const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
  if (!DATE_REGEX.test(dateFrom) || !DATE_REGEX.test(dateTo)) {
    return NextResponse.json({ error: "Ungültiges Datumsformat. Erwartet: YYYY-MM-DD." }, { status: 400 })
  }

  const dateToEnd = dateTo + "T23:59:59"

  // Rolle ermitteln (service client bypasses RLS on user_profiles)
  const { createSupabaseServiceClient } = await import("@/lib/supabase-service")
  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  const role = profile?.role as string | null

  // Behandlungen zählen
  const { count: treatmentCount } = await supabase
    .from("treatment_sessions")
    .select("id", { count: "exact", head: true })
    .eq("patient_id", patientId)
    .gte("session_date", dateFrom)
    .lte("session_date", dateTo)

  let befundCount = 0
  let diagnosisCount = 0
  let anamnesisCount = 0

  // Nur Heilpraktiker / Admin sehen Befund- und Diagnosezahlen
  // Uses correct table names from PROJ-3 (anamnesis_records) and PROJ-4 (diagnoses)
  if (role === "heilpraktiker" || role === "admin") {
    const { count: dc } = await supabase
      .from("diagnoses")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", patientId)
      .gte("created_at", dateFrom)
      .lte("created_at", dateToEnd)

    const { count: ac } = await supabase
      .from("anamnesis_records")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", patientId)
      .gte("created_at", dateFrom)
      .lte("created_at", dateToEnd)

    // befundCount and diagnosisCount both come from the "diagnoses" table
    // (in PROJ-4, klinischer_befund and diagnoses are stored in a single table)
    befundCount = dc ?? 0
    diagnosisCount = dc ?? 0
    anamnesisCount = ac ?? 0
  }

  return NextResponse.json({
    treatmentCount: treatmentCount ?? 0,
    befundCount,
    diagnosisCount,
    anamnesisCount,
  })
}
