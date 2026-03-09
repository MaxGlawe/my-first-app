/**
 * POST /api/patients/invite/[token]/register
 * Server-side patient registration for invited patients.
 * Creates user with service role (auto-confirmed), links to patient record.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { isRateLimited } from "@/lib/rate-limit"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (isRateLimited(`register:${ip}`, 5, 3600000)) {
    return NextResponse.json({ error: "Zu viele Versuche. Bitte später erneut versuchen." }, { status: 429 })
  }

  if (!token || !/^[a-zA-Z0-9_-]{16,}$/.test(token)) {
    return NextResponse.json({ error: "Ungültiger Token." }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }
  const parseResult = registerSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json({ error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors }, { status: 422 })
  }
  const { email, password, firstName, lastName } = parseResult.data

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

  if (email.toLowerCase() !== patient.email?.toLowerCase()) {
    return NextResponse.json({ error: "E-Mail-Adresse stimmt nicht mit der Einladung überein." }, { status: 400 })
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

  // Create user_profiles entry (required for middleware role checks)
  const { error: profileError } = await serviceClient
    .from("user_profiles")
    .upsert(
      {
        id: authData.user.id,
        email,
        role: "patient",
        status: "aktiv",
        first_name: firstName,
        last_name: lastName,
      },
      { onConflict: "id" }
    )

  if (profileError) {
    console.error("[register] Profile creation failed:", profileError)
    // Rollback: delete the auth user
    try { await serviceClient.auth.admin.deleteUser(authData.user.id) } catch {}
    return NextResponse.json({ error: "Profil konnte nicht erstellt werden." }, { status: 500 })
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
