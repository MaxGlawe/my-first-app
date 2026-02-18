/**
 * PROJ-12: GET /api/me/chat/profile
 * Returns the patient's own record + the therapist name for the chat header.
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

  // Look up patient via user_id
  let { data: patient } = await supabase
    .from("patients")
    .select("id, vorname, nachname, therapeut_id, archived_at")
    .eq("user_id", user.id)
    .maybeSingle()

  // Fallback: match by email
  if (!patient && user.email) {
    const { data: byEmail } = await supabase
      .from("patients")
      .select("id, vorname, nachname, therapeut_id, archived_at")
      .eq("email", user.email)
      .maybeSingle()
    patient = byEmail ?? null
  }

  if (!patient) {
    return NextResponse.json({ profile: null })
  }

  // Fetch therapist display name
  let therapeutName: string | null = null
  if (patient.therapeut_id) {
    const { data: therapeutProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", patient.therapeut_id)
      .maybeSingle()
    therapeutName = therapeutProfile?.full_name ?? null
  }

  return NextResponse.json({
    profile: {
      id: patient.id,
      vorname: patient.vorname,
      nachname: patient.nachname,
      therapeut_id: patient.therapeut_id,
      therapeut_name: therapeutName,
      is_archived: !!patient.archived_at,
    },
  })
}
