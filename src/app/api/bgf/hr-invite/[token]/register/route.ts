/**
 * PROJ-18: POST /api/bgf/hr-invite/[token]/register
 *
 * HR admin sets their password after receiving an invite.
 * Token is stored in user_metadata.hr_invite_token.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { z } from "zod"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const registerSchema = z.object({
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein.").max(128),
})

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

  const { password } = parseResult.data
  const sc = createSupabaseServiceClient()

  // Find user by invite token in metadata
  // We need to look through user_profiles + auth users
  // The token is in auth.users.raw_user_meta_data.hr_invite_token
  const { data: allUsers, error: listError } = await sc.auth.admin.listUsers({ perPage: 1000 })

  if (listError) {
    console.error("[hr-register] listUsers error:", listError)
    return NextResponse.json({ error: "Fehler bei der Suche." }, { status: 500 })
  }

  const invitedUser = allUsers.users.find(
    (u) => u.user_metadata?.hr_invite_token === token && u.user_metadata?.must_change_password === true
  )

  if (!invitedUser) {
    return NextResponse.json(
      { error: "Einladung nicht gefunden oder bereits verwendet." },
      { status: 404 }
    )
  }

  // Update password and clear the must_change_password flag
  const { error: updateError } = await sc.auth.admin.updateUserById(invitedUser.id, {
    password,
    user_metadata: {
      ...invitedUser.user_metadata,
      must_change_password: false,
      hr_invite_token: null, // Clear token after use
    },
  })

  if (updateError) {
    console.error("[hr-register] updateUser error:", updateError)
    return NextResponse.json({ error: "Passwort konnte nicht gesetzt werden." }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    email: invitedUser.email,
    message: "Passwort gesetzt. Sie können sich jetzt anmelden.",
  })
}
