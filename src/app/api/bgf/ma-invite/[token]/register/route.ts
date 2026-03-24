/**
 * PROJ-18: POST /api/bgf/ma-invite/[token]/register
 *
 * Employee registers via invite link.
 * Creates auth user + user_profiles, links to organization_members.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { z } from "zod"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const registerSchema = z.object({
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein.").max(128),
  vorname: z.string().min(1, "Vorname erforderlich.").max(100).trim(),
  nachname: z.string().min(1, "Nachname erforderlich.").max(100).trim(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!UUID_REGEX.test(token)) {
    return NextResponse.json({ error: "Ungültiger Token." }, { status: 400 })
  }

  const sc = createSupabaseServiceClient()

  const { data: member } = await sc
    .from("organization_members")
    .select("id, email, vorname, nachname, status, organization_id, organizations(name)")
    .eq("invite_token", token)
    .maybeSingle()

  if (!member) {
    return NextResponse.json({ error: "Einladung nicht gefunden." }, { status: 404 })
  }

  if (member.status === "aktiv") {
    return NextResponse.json({ error: "Diese Einladung wurde bereits verwendet." }, { status: 410 })
  }

  const orgData = member.organizations as unknown as { name: string } | null

  return NextResponse.json({
    email: member.email,
    vorname: member.vorname,
    nachname: member.nachname,
    firma: orgData?.name ?? null,
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!UUID_REGEX.test(token)) {
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
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { password, vorname, nachname } = parseResult.data
  const sc = createSupabaseServiceClient()

  // Find the member by invite token
  const { data: member } = await sc
    .from("organization_members")
    .select("id, email, status, organization_id, user_id")
    .eq("invite_token", token)
    .single()

  if (!member) {
    return NextResponse.json({ error: "Einladung nicht gefunden." }, { status: 404 })
  }

  if (member.status === "aktiv" && member.user_id) {
    return NextResponse.json({ error: "Diese Einladung wurde bereits verwendet." }, { status: 410 })
  }

  // Check if user already exists with this email
  const { data: existingProfiles } = await sc
    .from("user_profiles")
    .select("id")
    .eq("email", member.email.toLowerCase())
    .limit(1)

  let userId: string

  if (existingProfiles && existingProfiles.length > 0) {
    // User exists — just link them
    userId = existingProfiles[0].id
  } else {
    // Create new auth user
    const { data: authData, error: createError } = await sc.auth.admin.createUser({
      email: member.email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        first_name: vorname,
        last_name: nachname,
        role: "patient",
      },
    })

    if (createError) {
      if (createError.message.includes("already")) {
        return NextResponse.json(
          { error: "Diese E-Mail-Adresse ist bereits registriert. Bitte loggen Sie sich ein." },
          { status: 409 }
        )
      }
      console.error("[ma-register] createUser error:", createError)
      return NextResponse.json({ error: "Konto konnte nicht erstellt werden." }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Konto konnte nicht erstellt werden." }, { status: 500 })
    }

    userId = authData.user.id

    // Create user_profiles entry
    const { error: profileError } = await sc
      .from("user_profiles")
      .upsert({
        id: userId,
        email: member.email.toLowerCase(),
        role: "patient",
        status: "aktiv",
        first_name: vorname,
        last_name: nachname,
      }, { onConflict: "id" })

    if (profileError) {
      console.error("[ma-register] profile error:", profileError)
      try { await sc.auth.admin.deleteUser(userId) } catch {}
      return NextResponse.json({ error: "Profil konnte nicht erstellt werden." }, { status: 500 })
    }
  }

  // Link user to organization_members + set active
  const { error: updateError } = await sc
    .from("organization_members")
    .update({
      user_id: userId,
      vorname: vorname,
      nachname: nachname,
      status: "aktiv",
    })
    .eq("id", member.id)

  if (updateError) {
    console.error("[ma-register] member update error:", updateError)
  }

  return NextResponse.json({
    success: true,
    email: member.email,
    message: "Registrierung erfolgreich. Sie können sich jetzt anmelden.",
  })
}
