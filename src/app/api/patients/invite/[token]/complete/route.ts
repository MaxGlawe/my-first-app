/**
 * POST /api/patients/invite/[token]/complete
 * Finalize patient registration: create user_profiles entry, mark invite as registered.
 * Requires authentication (patient just set their password).
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!token || token.length < 10) {
    return NextResponse.json({ error: "Ungültiger Token." }, { status: 400 })
  }

  // Verify authentication
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: "Nicht autorisiert. Bitte zuerst anmelden." },
      { status: 401 }
    )
  }

  const serviceClient = createSupabaseServiceClient()

  // Look up patient by invite_token
  const { data: patient, error: lookupError } = await serviceClient
    .from("patients")
    .select("id, vorname, nachname, user_id, invite_status")
    .eq("invite_token", token)
    .single()

  if (lookupError || !patient) {
    return NextResponse.json(
      { error: "Einladung nicht gefunden." },
      { status: 404 }
    )
  }

  if (patient.invite_status === "registered") {
    return NextResponse.json(
      { error: "Registrierung bereits abgeschlossen." },
      { status: 409 }
    )
  }

  // Verify the authenticated user matches the invited user
  if (patient.user_id && patient.user_id !== user.id) {
    return NextResponse.json(
      { error: "Diese Einladung gehört zu einem anderen Konto." },
      { status: 403 }
    )
  }

  // Create user_profiles entry (upsert to handle edge cases)
  const { error: profileError } = await serviceClient
    .from("user_profiles")
    .upsert(
      {
        id: user.id,
        role: "patient",
        status: "aktiv",
        first_name: patient.vorname,
        last_name: patient.nachname,
      },
      { onConflict: "id" }
    )

  if (profileError) {
    console.error("[POST /api/patients/invite/complete] Profile error:", profileError)
    return NextResponse.json(
      { error: "Benutzerprofil konnte nicht erstellt werden." },
      { status: 500 }
    )
  }

  // Mark invite as registered and ensure user_id is linked
  const { error: updateError } = await serviceClient
    .from("patients")
    .update({
      invite_status: "registered",
      user_id: user.id,
    })
    .eq("id", patient.id)

  if (updateError) {
    console.error("[POST /api/patients/invite/complete] Update error:", updateError)
    return NextResponse.json(
      { error: "Einladungsstatus konnte nicht aktualisiert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
