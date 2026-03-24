/**
 * PROJ-18: POST /api/bgf/organizations/[id]/invite-hr
 *
 * Invites an HR admin for an organization.
 * Creates a user_profiles entry (role: patient) + organization_admins entry.
 * Sends invitation email with registration link.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { randomUUID } from "crypto"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const inviteSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse.").trim(),
  vorname: z.string().min(1, "Vorname erforderlich.").max(100).trim(),
  nachname: z.string().min(1, "Nachname erforderlich.").max(100).trim(),
  rolle: z.enum(["hr_admin", "hr_viewer", "geschaeftsfuehrung"]).default("hr_admin"),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await params

  if (!UUID_REGEX.test(orgId)) {
    return NextResponse.json({ error: "Ungültige Organisations-ID." }, { status: 400 })
  }

  // Auth: Only admin can invite HR
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const sc = createSupabaseServiceClient()
  const { data: profile } = await sc
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Nur Admins können HR-Zugänge einrichten." }, { status: 403 })
  }

  // Validate body
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

  const { email, vorname, nachname, rolle } = parseResult.data

  // Verify org exists
  const { data: org } = await sc
    .from("organizations")
    .select("id, name")
    .eq("id", orgId)
    .single()

  if (!org) {
    return NextResponse.json({ error: "Organisation nicht gefunden." }, { status: 404 })
  }

  // Check if email already has an account
  const { data: existingProfiles } = await sc
    .from("user_profiles")
    .select("id")
    .eq("email", email.toLowerCase())
    .limit(1)

  if (existingProfiles && existingProfiles.length > 0) {
    // User exists — just add to organization_admins
    const existingUserId = existingProfiles[0].id

    const { error: adminError } = await sc
      .from("organization_admins")
      .upsert({
        organization_id: orgId,
        user_id: existingUserId,
        rolle,
      }, { onConflict: "organization_id,user_id" })

    if (adminError) {
      console.error("[invite-hr] org_admins upsert error:", adminError)
      return NextResponse.json({ error: "Zuordnung fehlgeschlagen." }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `${vorname} ${nachname} wurde als ${rolle} hinzugefügt. Der Benutzer hat bereits ein Konto.`,
      existing_user: true,
    })
  }

  // New user — generate invite token and store it
  const inviteToken = randomUUID()

  // Create a temporary user_profiles entry to hold the invite
  // We'll use the invite_token in organization_members table pattern
  // but for HR we store it in organization_admins with a pending state

  // First, create the auth user with a temp password (they'll set their own via invite link)
  const tempPassword = randomUUID() + "Aa1!" // meets password requirements

  const { data: authData, error: createError } = await sc.auth.admin.createUser({
    email: email.toLowerCase(),
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      first_name: vorname,
      last_name: nachname,
      role: "patient", // HR admins use patient role + organization_admins entry
      must_change_password: true,
      hr_invite_token: inviteToken,
      hr_org_id: orgId,
    },
  })

  if (createError) {
    if (createError.message.includes("already")) {
      return NextResponse.json(
        { error: "Diese E-Mail-Adresse ist bereits registriert." },
        { status: 409 }
      )
    }
    console.error("[invite-hr] createUser error:", createError)
    return NextResponse.json({ error: "Benutzer konnte nicht erstellt werden." }, { status: 500 })
  }

  if (!authData.user) {
    return NextResponse.json({ error: "Benutzer konnte nicht erstellt werden." }, { status: 500 })
  }

  // Create user_profiles
  const { error: profileError } = await sc
    .from("user_profiles")
    .upsert({
      id: authData.user.id,
      email: email.toLowerCase(),
      role: "patient",
      status: "aktiv",
      first_name: vorname,
      last_name: nachname,
    }, { onConflict: "id" })

  if (profileError) {
    console.error("[invite-hr] profile error:", profileError)
    try { await sc.auth.admin.deleteUser(authData.user.id) } catch {}
    return NextResponse.json({ error: "Profil konnte nicht erstellt werden." }, { status: 500 })
  }

  // Add to organization_admins
  const { error: adminError } = await sc
    .from("organization_admins")
    .insert({
      organization_id: orgId,
      user_id: authData.user.id,
      rolle,
    })

  if (adminError) {
    console.error("[invite-hr] org_admins insert error:", adminError)
    return NextResponse.json({ error: "HR-Zuordnung fehlgeschlagen." }, { status: 500 })
  }

  // Send invitation email
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const inviteLink = `${siteUrl}/hr-invite/${inviteToken}`

  try {
    const nodemailer = await import("nodemailer")
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "Praxis OS"}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Ihr Zugang zum Gesundheits-Dashboard — ${org.name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">Praxis OS <span style="color: #2D6A4F;">BGF</span></h1>
            <p style="color: #8896A6; font-size: 14px; margin: 8px 0 0;">Betriebliche Gesundheitsförderung</p>
          </div>

          <p style="color: #1a1a2e; font-size: 16px; line-height: 1.6;">
            Hallo ${vorname},
          </p>

          <p style="color: #4A5568; font-size: 15px; line-height: 1.6;">
            Sie wurden als <strong>${rolle === "geschaeftsfuehrung" ? "Geschäftsführung" : "HR-Administrator"}</strong>
            für das Gesundheits-Dashboard von <strong>${org.name}</strong> eingerichtet.
          </p>

          <p style="color: #4A5568; font-size: 15px; line-height: 1.6;">
            Über das Dashboard sehen Sie anonymisierte Gesundheitskennzahlen Ihres Teams,
            Teilnahmequoten und vierteljährliche Berichte.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${inviteLink}"
               style="display: inline-block; background: #2D6A4F; color: white; text-decoration: none;
                      padding: 14px 32px; border-radius: 100px; font-weight: 600; font-size: 15px;">
              Passwort festlegen & Dashboard öffnen
            </a>
          </div>

          <p style="color: #8896A6; font-size: 13px; line-height: 1.6;">
            Dieser Link ist 7 Tage gültig. Bei Fragen wenden Sie sich an Ihren BGF-Ansprechpartner.
          </p>

          <hr style="border: none; border-top: 1px solid #E2DDD5; margin: 32px 0;" />

          <p style="color: #8896A6; font-size: 12px;">
            Praxis OS — Betriebliche Gesundheitsförderung<br>
            DSGVO-konform · EU-Server · ZPP-zertifiziert
          </p>
        </div>
      `,
    })
  } catch (emailErr) {
    console.error("[invite-hr] Email send error:", emailErr)
    // Don't fail the request — user is created, they just didn't get the email
  }

  return NextResponse.json({
    success: true,
    message: `Einladung an ${email} gesendet.`,
    invite_link: inviteLink, // Also return for admin to manually share if email fails
  }, { status: 201 })
}
