/**
 * POST /api/admin/invite — Create a new staff user (admin-only)
 * Creates the user directly with a temporary password so they can
 * sign in immediately without needing an email invitation.
 *
 * Security:
 * - Admin-only (role check)
 * - CSRF protection (Origin/Referer header check)
 * - Rate limiting (3 per hour)
 * - Disposable email blocklist
 * - Email notification to admin on every creation
 * - Audit log entry
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { isRateLimited } from "@/lib/rate-limit"
import { sendEmail } from "@/lib/email"
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

// Disposable email domains — block staff accounts with throwaway emails
const BLOCKED_DOMAINS = new Set([
  "mailnull.com", "maildrop.cc", "mailsac.com", "mailinator.com",
  "guerrillamail.com", "guerrillamail.de", "sharklasers.com",
  "tempmail.com", "temp-mail.org", "throwaway.email", "trashmail.com",
  "yopmail.com", "10minutemail.com", "dispostable.com", "discard.email",
  "fakeinbox.com", "getnada.com", "devnull.email", "wegwerfmail.de",
])

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  const bytes = crypto.randomBytes(12)
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join("")
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  // ── CSRF Protection ──────────────────────────────────────────────
  // Block requests that don't originate from our own domain
  const origin = request.headers.get("origin") ?? ""
  const referer = request.headers.get("referer") ?? ""
  const allowedHosts = [
    "wwwpraxis-os.com",
    "localhost:3000",
    "localhost",
    "127.0.0.1",
  ]
  const isValidOrigin = allowedHosts.some(
    (host) => origin.includes(host) || referer.includes(host)
  )
  if (!origin && !referer) {
    // No origin/referer at all — likely a direct API call, not from browser
    // Allow it (could be from our own server-side code)
  } else if (!isValidOrigin) {
    console.warn(`[admin/invite] CSRF blocked: origin=${origin} referer=${referer} ip=${ip}`)
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 403 })
  }

  // ── Rate Limiting ────────────────────────────────────────────────
  if (isRateLimited(`admin-invite:${ip}`, 3, 3_600_000)) {
    return NextResponse.json(
      { error: "Zu viele Einladungen. Bitte später erneut versuchen." },
      { status: 429 }
    )
  }

  // ── Auth check — only admins ─────────────────────────────────────
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role, email")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Nur Admins können Nutzer anlegen." }, { status: 403 })
  }

  // ── Parse body ───────────────────────────────────────────────────
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

  // ── Disposable email check ───────────────────────────────────────
  const emailDomain = email.split("@")[1]?.toLowerCase()
  if (emailDomain && BLOCKED_DOMAINS.has(emailDomain)) {
    return NextResponse.json(
      { error: "Wegwerf-E-Mail-Adressen sind für Mitarbeiterkonten nicht erlaubt." },
      { status: 400 }
    )
  }

  // ── Create user ──────────────────────────────────────────────────
  const tempPassword = generateTempPassword()

  const { data, error: createError } = await serviceClient.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      role,
      must_change_password: true,
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

  // ── Audit Log ────────────────────────────────────────────────────
  const userAgent = request.headers.get("user-agent") ?? "unknown"
  console.log(
    `[AUDIT] Staff account created: email=${email} role=${role} by=${profile.email} ip=${ip} ua=${userAgent}`
  )

  // ── Email notification to admin ──────────────────────────────────
  const adminEmail = process.env.SMTP_USER || "physiotherapieglawe@gmx.de"
  sendEmail({
    to: adminEmail,
    subject: `⚠️ Neuer Mitarbeiter angelegt: ${firstName} ${lastName} (${role})`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
          <p style="font-weight: 700; color: #92400e; margin: 0 0 8px; font-size: 14px;">
            Sicherheitshinweis: Neuer Mitarbeiter-Account erstellt
          </p>
          <p style="font-size: 13px; color: #78350f; margin: 0;">
            Falls du diesen Account <strong>nicht selbst angelegt hast</strong>, ändere sofort dein Passwort und kontaktiere den Support.
          </p>
        </div>
        <table style="width: 100%; font-size: 13px; color: #475569; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; font-weight: 600; width: 100px;">Name:</td><td>${firstName} ${lastName}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 600;">E-Mail:</td><td>${email}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 600;">Rolle:</td><td>${role}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 600;">Erstellt von:</td><td>${profile.email}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 600;">IP-Adresse:</td><td>${ip}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 600;">Zeitpunkt:</td><td>${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 600;">User-Agent:</td><td style="font-size: 11px; word-break: break-all;">${userAgent}</td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p style="font-size: 11px; color: #94a3b8;">Praxis OS — Automatische Sicherheitsbenachrichtigung</p>
      </div>
    `,
  }).catch((err) => console.error("[admin/invite] Notification email failed:", err))

  return NextResponse.json(
    {
      message: "Nutzer angelegt.",
      userId: data.user?.id,
      tempPassword,
    },
    { status: 201 }
  )
}
