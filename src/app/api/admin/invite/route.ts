/**
 * POST /api/admin/invite — Invite a new user (admin-only)
 * Uses the Service Role key to call supabase.auth.admin.inviteUserByEmail
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

const inviteSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse."),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: z.enum([
    "admin",
    "heilpraktiker",
    "physiotherapeut",
    "praeventionstrainer",
    "personal_trainer",
    "praxismanagement",
  ]),
})

export async function POST(request: NextRequest) {
  // 1. Auth check — only admins can invite
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Verify caller is admin
  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Nur Admins können Nutzer einladen." }, { status: 403 })
  }

  // 2. Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = inviteSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { email, firstName, lastName, role } = parseResult.data

  // 3. Invite user via service role client (has admin privileges)
  const { data, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(email, {
    data: {
      first_name: firstName,
      last_name: lastName,
      role,
    },
  })

  if (inviteError) {
    if (inviteError.message.includes("already registered") || inviteError.message.includes("already been registered")) {
      return NextResponse.json(
        { error: "Diese E-Mail-Adresse ist bereits registriert." },
        { status: 409 }
      )
    }
    console.error("[POST /api/admin/invite] Error:", inviteError)
    return NextResponse.json(
      { error: "Einladung fehlgeschlagen: " + inviteError.message },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { message: "Einladung gesendet.", userId: data.user?.id },
    { status: 201 }
  )
}
