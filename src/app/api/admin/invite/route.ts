/**
 * POST /api/admin/invite — Create a new staff user (admin-only)
 * Creates the user directly with a temporary password so they can
 * sign in immediately without needing an email invitation.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import crypto from "crypto"

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

function generateTempPassword(): string {
  // 12-char password: letters + digits, easy to type
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  const bytes = crypto.randomBytes(12)
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join("")
}

export async function POST(request: NextRequest) {
  // 1. Auth check — only admins can create users
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
    return NextResponse.json({ error: "Nur Admins können Nutzer anlegen." }, { status: 403 })
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

  // 3. Create user directly with a temporary password (no invite email)
  const tempPassword = generateTempPassword()

  const { data, error: createError } = await serviceClient.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true, // Auto-confirm so they can log in immediately
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      role,
    },
  })

  if (createError) {
    if (
      createError.message.includes("already registered") ||
      createError.message.includes("already been registered") ||
      createError.message.includes("already exists")
    ) {
      return NextResponse.json(
        { error: "Diese E-Mail-Adresse ist bereits registriert." },
        { status: 409 }
      )
    }
    console.error("[POST /api/admin/invite] Error:", createError)
    return NextResponse.json(
      { error: "Nutzer konnte nicht angelegt werden: " + createError.message },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      message: "Nutzer angelegt.",
      userId: data.user?.id,
      tempPassword,
    },
    { status: 201 }
  )
}
