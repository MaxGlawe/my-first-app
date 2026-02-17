/**
 * PROJ-2: Patientenstammdaten
 * GET /api/patients/check-duplicate?vorname=...&nachname=...&geburtsdatum=...
 *   — Duplikatprüfung vor dem Anlegen eines neuen Patienten
 *   — Gibt den gefundenen Patienten zurück, oder null wenn kein Duplikat existiert
 *
 * Nur aktive Patienten (archived_at IS NULL) werden geprüft.
 * RLS stellt sicher, dass Therapeuten nur innerhalb ihrer eigenen Patienten suchen.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url)
  const vorname = searchParams.get("vorname")?.trim() ?? ""
  const nachname = searchParams.get("nachname")?.trim() ?? ""
  const geburtsdatum = searchParams.get("geburtsdatum")?.trim() ?? ""

  // Validate required params
  if (!vorname || !nachname || !geburtsdatum) {
    return NextResponse.json(
      { error: "vorname, nachname und geburtsdatum sind erforderlich." },
      { status: 400 }
    )
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(geburtsdatum)) {
    return NextResponse.json(
      { error: "geburtsdatum muss im Format YYYY-MM-DD sein." },
      { status: 400 }
    )
  }

  // RLS ensures therapists only search among their own patients
  const { data, error } = await supabase
    .from("patients")
    .select("id, vorname, nachname, geburtsdatum")
    .ilike("vorname", vorname)
    .ilike("nachname", nachname)
    .eq("geburtsdatum", geburtsdatum)
    .is("archived_at", null)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("[GET /api/patients/check-duplicate] Supabase error:", error)
    return NextResponse.json(
      { error: "Duplikatprüfung fehlgeschlagen." },
      { status: 500 }
    )
  }

  return NextResponse.json({
    duplicate: data ?? null,
    isDuplicate: data !== null,
  })
}
