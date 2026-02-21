/**
 * POST /api/patients/invite/[token]/register
 * Server-side patient registration for invited patients.
 * Creates user with service role (auto-confirmed), links to patient record.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!token || token.length < 10) {
    return NextResponse.json({ error: "Ungültiger Token." }, { status: 400 })
  }

  const body = await request.json()
  const { email, password, firstName, lastName } = body

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json({ error: "Alle Felder sind erforderlich." }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Das Passwort muss mindestens 8 Zeichen lang sein." },
      { status: 400 }
    )
  }

  const serviceClient = createSupabaseServiceClient()

  // Verify invite token and get patient data
  const { data: patient, error: lookupError } = await serviceClient
    .from("patients")
    .select("id, vorname, nachname, email, invite_status, user_id")
    .eq("invite_token", token)
    .single()

  if (lookupError || !patient) {
    return NextResponse.json(
      { error: "Einladung nicht gefunden oder ungültig." },
      { status: 404 }
    )
  }

  if (patient.invite_status === "registered") {
    return NextResponse.json(
      { error: "Diese Einladung wurde bereits verwendet." },
      { status: 410 }
    )
  }

  // Delete any previously invited auth user (from inviteUserByEmail)
  if (patient.user_id) {
    try {
      await serviceClient.auth.admin.deleteUser(patient.user_id)
    } catch {
      // Ignore — user may already be deleted
    }
  }

  // Create user with service role — auto-confirmed, no email needed
  const { data: authData, error: createError } =
    await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: "patient",
        patient_id: patient.id,
      },
    })

  if (createError) {
    if (createError.message.includes("already")) {
      return NextResponse.json(
        { error: "Diese E-Mail-Adresse ist bereits registriert." },
        { status: 409 }
      )
    }
    console.error("[POST /api/patients/invite/register]", createError)
    return NextResponse.json(
      { error: "Konto konnte nicht erstellt werden." },
      { status: 500 }
    )
  }

  if (!authData.user) {
    return NextResponse.json(
      { error: "Konto konnte nicht erstellt werden." },
      { status: 500 }
    )
  }

  // Link user to patient and mark as registered
  const { error: updateError } = await serviceClient
    .from("patients")
    .update({
      user_id: authData.user.id,
      invite_status: "registered",
    })
    .eq("id", patient.id)

  if (updateError) {
    console.error("[POST /api/patients/invite/register] Update error:", updateError)
  }

  return NextResponse.json({
    success: true,
    message: "Konto erstellt. Du kannst dich jetzt anmelden.",
  })
}
