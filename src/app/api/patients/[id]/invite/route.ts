/**
 * POST /api/patients/[id]/invite
 * Send or re-send app invite to a patient (therapist action).
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { generateToken } from "@/lib/tokens"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params

  if (!UUID_REGEX.test(patientId)) {
    return NextResponse.json({ error: "Ungültige Patienten-ID." }, { status: 400 })
  }

  // Verify authentication
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Load patient (RLS ensures therapist owns this patient)
  const { data: patient, error: fetchError } = await supabase
    .from("patients")
    .select("id, vorname, nachname, email, user_id, invite_status")
    .eq("id", patientId)
    .single()

  if (fetchError || !patient) {
    return NextResponse.json({ error: "Patient nicht gefunden." }, { status: 404 })
  }

  if (!patient.email) {
    return NextResponse.json(
      { error: "Patient hat keine E-Mail-Adresse. Bitte zuerst eine E-Mail hinterlegen." },
      { status: 422 }
    )
  }

  if (patient.invite_status === "registered") {
    return NextResponse.json(
      { error: "Patient ist bereits registriert." },
      { status: 409 }
    )
  }

  const serviceClient = createSupabaseServiceClient()

  // If a previous invite created an auth user that never completed registration, delete it
  if (patient.user_id && patient.invite_status === "invited") {
    try {
      await serviceClient.auth.admin.deleteUser(patient.user_id)
    } catch (err) {
      console.warn("[POST /api/patients/[id]/invite] Could not delete old auth user:", err)
    }
  }

  // Send invite
  const inviteToken = generateToken()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  const { data: authData, error: inviteError } =
    await serviceClient.auth.admin.inviteUserByEmail(patient.email, {
      data: {
        role: "patient",
        patient_id: patient.id,
        first_name: patient.vorname,
        last_name: patient.nachname,
      },
      redirectTo: `${siteUrl}/invite/${inviteToken}`,
    })

  if (inviteError) {
    console.error("[POST /api/patients/[id]/invite] Error:", inviteError)
    const message = inviteError.message.includes("already")
      ? "Diese E-Mail-Adresse ist bereits registriert."
      : "Einladung konnte nicht gesendet werden: " + inviteError.message
    return NextResponse.json({ error: message }, { status: 422 })
  }

  // Update patient record
  const { error: updateError } = await serviceClient
    .from("patients")
    .update({
      invite_token: inviteToken,
      invite_sent_at: new Date().toISOString(),
      invite_status: "invited",
      user_id: authData.user?.id ?? null,
    })
    .eq("id", patient.id)

  if (updateError) {
    console.error("[POST /api/patients/[id]/invite] Update error:", updateError)
    return NextResponse.json(
      { error: "Einladung gesendet, aber Status konnte nicht aktualisiert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, message: "Einladung wurde gesendet." })
}
