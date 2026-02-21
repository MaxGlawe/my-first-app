/**
 * PROJ-16: Schmerztagebuch (Therapeuten-Ansicht)
 * GET /api/patients/[id]/pain-diary — Einträge eines Patienten (letzte 90 Tage)
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  if (!UUID_REGEX.test(patientId)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 })
  }

  // Fetch last 90 days of entries
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const sinceDate = ninetyDaysAgo.toISOString().split("T")[0]

  const { data: entries, error } = await supabase
    .from("pain_diary_entries")
    .select("id, entry_date, pain_level, wellbeing, notes, created_at")
    .eq("patient_id", patientId)
    .gte("entry_date", sinceDate)
    .order("entry_date", { ascending: true })

  if (error) {
    console.error("[GET /api/patients/[id]/pain-diary] Error:", error)
    return NextResponse.json(
      { error: "Einträge konnten nicht geladen werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ entries: entries ?? [] })
}
