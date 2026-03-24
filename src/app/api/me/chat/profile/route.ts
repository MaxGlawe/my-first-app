/**
 * PROJ-12: GET /api/me/chat/profile
 * Returns the patient's own record + the therapist name for the chat header.
 * Also handles BGF members who may not have a patient record yet.
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const sc = createSupabaseServiceClient()

  // Look up patient via user_id
  let { data: patient } = await sc
    .from("patients")
    .select("id, vorname, nachname, therapeut_id, archived_at")
    .eq("user_id", user.id)
    .maybeSingle()

  // Fallback: match by email
  if (!patient && user.email) {
    const { data: byEmail } = await sc
      .from("patients")
      .select("id, vorname, nachname, therapeut_id, archived_at")
      .eq("email", user.email)
      .maybeSingle()
    patient = byEmail ?? null
  }

  // BGF fallback: if no patient record, check if user is a BGF member
  // and auto-create a minimal patient record linked to the org's therapist
  if (!patient) {
    const { data: bgfMember } = await sc
      .from("organization_members")
      .select("id, vorname, nachname, email, organization_id")
      .eq("user_id", user.id)
      .in("status", ["aktiv", "eingeladen"])
      .maybeSingle()

    if (bgfMember) {
      // Get the organization's assigned therapist
      const { data: org } = await sc
        .from("organizations")
        .select("therapeut_id")
        .eq("id", bgfMember.organization_id)
        .single()

      const therapeutId = org?.therapeut_id ?? null

      if (!therapeutId) {
        console.error("[GET /api/me/chat/profile] Organisation hat keinen Therapeuten zugewiesen")
        return NextResponse.json({ profile: null })
      }

      // Create a minimal patient record for chat functionality
      const { data: newPatient, error: insertError } = await sc
        .from("patients")
        .insert({
          user_id: user.id,
          vorname: bgfMember.vorname || "BGF",
          nachname: bgfMember.nachname || "Mitglied",
          geburtsdatum: "2000-01-01",
          geschlecht: "unbekannt",
          email: bgfMember.email || user.email,
          therapeut_id: therapeutId,
          interne_notizen: "BGF-Mitglied – automatisch für Chat erstellt",
        })
        .select("id, vorname, nachname, therapeut_id, archived_at")
        .single()

      if (insertError) {
        console.error("[GET /api/me/chat/profile] BGF patient insert error:", insertError)
      }
      if (!insertError && newPatient) {
        patient = newPatient
      }
    }
  }

  if (!patient) {
    return NextResponse.json({ profile: null })
  }

  // Fetch therapist display name
  let therapeutName: string | null = null
  if (patient.therapeut_id) {
    const { data: therapeutProfile } = await sc
      .from("user_profiles")
      .select("full_name")
      .eq("id", patient.therapeut_id)
      .maybeSingle()
    therapeutName = therapeutProfile?.full_name ?? null

    // Fallback: check profiles table
    if (!therapeutName) {
      const { data: profileFallback } = await sc
        .from("profiles")
        .select("full_name")
        .eq("id", patient.therapeut_id)
        .maybeSingle()
      therapeutName = profileFallback?.full_name ?? null
    }
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
