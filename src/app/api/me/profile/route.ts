/**
 * PROJ-11: GET /api/me/profile
 * Returns the patients record for the currently logged-in patient.
 * Lookup: patients.user_id = auth.uid()
 * Fallback: patients.email = auth.user.email (for patients without user_id set yet)
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Primary lookup: via user_id (the bridge column from PROJ-11)
  let { data: patient } = await supabase
    .from("patients")
    .select("id, vorname, nachname, email, geburtsdatum, user_id")
    .eq("user_id", user.id)
    .maybeSingle()

  // Fallback: match by email (works for patients not yet linked via user_id)
  if (!patient && user.email) {
    const { data: byEmail } = await supabase
      .from("patients")
      .select("id, vorname, nachname, email, geburtsdatum, user_id")
      .eq("email", user.email)
      .maybeSingle()
    patient = byEmail ?? null
  }

  if (!patient) {
    return NextResponse.json({ patient: null })
  }

  return NextResponse.json({ patient })
}
