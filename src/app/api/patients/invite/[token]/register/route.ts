/**
 * POST /api/patients/invite/[token]/register
 * Server-side patient registration for invited patients.
 * Creates user with service role (auto-confirmed), links to patient record.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { isRateLimited } from "@/lib/rate-limit"
import { sendEmail } from "@/lib/email"
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

  // Send welcome email (fire-and-forget)
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wwwpraxis-os.com"
  sendEmail({
    to: email,
    subject: "Willkommen bei Praxis OS — Deine Reise zu mehr Wohlbefinden beginnt",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 0;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 50%, #0891b2 100%); border-radius: 16px 16px 0 0; padding: 40px 32px; text-align: center;">
          <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 28px;">🌿</span>
          </div>
          <h1 style="color: white; font-size: 24px; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.3px;">
            Willkommen bei Praxis OS
          </h1>
          <p style="color: rgba(255,255,255,0.85); font-size: 15px; margin: 0; font-weight: 400;">
            Deine persönliche Therapie-Begleitung
          </p>
        </div>

        <!-- Body -->
        <div style="background: #ffffff; padding: 36px 32px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #1e293b; margin: 0 0 16px; line-height: 1.6;">
            Hallo ${firstName},
          </p>
          <p style="font-size: 15px; color: #475569; margin: 0 0 24px; line-height: 1.7;">
            Dein Konto ist eingerichtet — und damit beginnt eine Reise, die wir gemeinsam
            gestalten. Kein Schema F, kein Standardprogramm. Sondern Therapie, die sich nach
            dir richtet: nach deinem Körper, deinem Alltag, deinem Tempo.
          </p>

          <!-- What awaits -->
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px 24px; margin: 0 0 24px;">
            <p style="font-size: 14px; font-weight: 600; color: #166534; margin: 0 0 12px;">
              Was dich in deiner App erwartet:
            </p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-size: 14px; color: #15803d; vertical-align: top; width: 24px;">✦</td>
                <td style="padding: 6px 0 6px 8px; font-size: 14px; color: #374151; line-height: 1.5;">
                  <strong>Dein Trainingsplan</strong> — individuell für dich erstellt, jederzeit abrufbar
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 14px; color: #15803d; vertical-align: top;">✦</td>
                <td style="padding: 6px 0 6px 8px; font-size: 14px; color: #374151; line-height: 1.5;">
                  <strong>Übungen mit Anleitung</strong> — Schritt für Schritt, so oft du möchtest
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 14px; color: #15803d; vertical-align: top;">✦</td>
                <td style="padding: 6px 0 6px 8px; font-size: 14px; color: #374151; line-height: 1.5;">
                  <strong>Direkter Draht zu deinem Therapeuten</strong> — per Chat, wenn du Fragen hast
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 14px; color: #15803d; vertical-align: top;">✦</td>
                <td style="padding: 6px 0 6px 8px; font-size: 14px; color: #374151; line-height: 1.5;">
                  <strong>Dein Fortschritt</strong> — sichtbar, motivierend, ehrlich
                </td>
              </tr>
            </table>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 0 0 28px;">
            <a href="${appUrl}/login"
               style="display: inline-block; background: linear-gradient(135deg, #059669, #0d9488); color: white; padding: 14px 36px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px; letter-spacing: 0.2px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);">
              Zur App &rarr;
            </a>
          </div>

          <div style="background: #f8fafc; border-radius: 10px; padding: 16px 20px; margin: 0 0 24px;">
            <p style="font-size: 13px; color: #64748b; margin: 0 0 8px; font-weight: 600;">
              So meldest du dich an:
            </p>
            <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.6;">
              Öffne <a href="${appUrl}/login" style="color: #059669; font-weight: 600; text-decoration: none;">${appUrl.replace("https://", "")}</a>
              in deinem Browser und melde dich mit deiner E-Mail-Adresse und dem Passwort an, das du gerade erstellt hast.
            </p>
          </div>

          <!-- Personal note -->
          <p style="font-size: 14px; color: #64748b; margin: 0; line-height: 1.7; font-style: italic; border-left: 3px solid #d1d5db; padding-left: 16px;">
            Ein kleiner Tipp: Speichere die Seite als Lesezeichen oder füge sie zum Startbildschirm
            deines Handys hinzu — so hast du deine Therapie immer griffbereit.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; border-radius: 0 0 16px 16px; padding: 24px 32px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 13px; color: #94a3b8; margin: 0 0 4px;">
            Physiotherapie Glawe — Praxis OS
          </p>
          <p style="font-size: 12px; color: #cbd5e1; margin: 0;">
            Bei Fragen erreichst du uns jederzeit über den Chat in der App.
          </p>
        </div>
      </div>
    `,
  }).catch((err) => console.error("[register] Welcome email failed:", err))

  return NextResponse.json({
    success: true,
    message: "Konto erstellt. Du kannst dich jetzt anmelden.",
  })
}
