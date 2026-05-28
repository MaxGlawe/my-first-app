/**
 * PROJ-19: POST /api/buyer-accounts
 *
 * Erstellt einen externen Käufer-Account (Rolle: "externer_kaeufer").
 * Wird von PROJ-20 (Shop-Checkout) aufgerufen — nicht vom User selbst.
 *
 * Logik:
 *  1. Gibt es bereits einen Auth-User mit dieser E-Mail?
 *     a) Rolle = "externer_kaeufer" → bestehenden Account zurückgeben (idempotent)
 *     b) Rolle = "patient" → kein neuer Account; Entitlement dem bestehenden Login gutschreiben (PROJ-20)
 *     c) Andere Rolle (Staff) → Fehler (Email gehört einem Mitarbeiter-Account)
 *  2. Kein bestehender User → neuen Account anlegen (auto-confirmed, zufälliges Passwort)
 *     → user_profiles + buyer_profiles anlegen
 *     → Willkommens-E-Mail mit Login-Link senden
 *
 * Security:
 *  - Nur intern aufrufbar (INTERNAL_API_SECRET Header) — kein öffentlicher Endpunkt
 *  - Service-Role für alle DB-Operationen
 *  - Zod-Validierung der Eingabe
 *  - Rate Limiting: 60 Anfragen/Minute pro IP
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { isRateLimited } from "@/lib/rate-limit"
import { sendEmail } from "@/lib/email"
import { renderMasterclassWelcomeEmail } from "@/lib/masterclass/purchase-email"
import { escapeHtml } from "@/lib/html-escape"
import crypto from "crypto"

// ──────────────────────────────────────────────────
// Schema
// ──────────────────────────────────────────────────

const createBuyerSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse."),
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  // Optionaler Produkt-Kontext (vom Stripe-Webhook) → wählt die Willkommens-Mail.
  product: z
    .object({
      produkt_typ: z.string(),
      slug: z.string(),
      titel: z.string(),
    })
    .optional(),
})

// ──────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$"
  const bytes = crypto.randomBytes(16)
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join("")
}

// ──────────────────────────────────────────────────
// Route Handler
// ──────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── Internal-only auth ────────────────────────────────────────────
  // This endpoint is called by PROJ-20 checkout logic, not by browsers.
  // Protected via a shared internal secret to prevent abuse.
  const internalSecret = request.headers.get("x-internal-api-secret")
  const expectedSecret = process.env.INTERNAL_API_SECRET
  if (!expectedSecret || internalSecret !== expectedSecret) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // ── Rate limiting ─────────────────────────────────────────────────
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (isRateLimited(`buyer-create:${ip}`, 60, 60_000)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte später erneut versuchen." },
      { status: 429 }
    )
  }

  // ── Parse body ────────────────────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = createBuyerSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { email, firstName, lastName, product } = parseResult.data
  const supabase = createSupabaseServiceClient()

  // ── Check for an existing account with this email ─────────────────
  // Lookup über user_profiles (per E-Mail, case-insensitive) statt über
  // auth.admin.listUsers(): listUsers() ist paginiert und würde User jenseits
  // der ersten Seite übersehen → Gefahr von Duplikat-Anlagen bei wachsender
  // Nutzerzahl.
  const { data: existingProfile } = await supabase
    .from("user_profiles")
    .select("id, role")
    .ilike("email", email)
    .maybeSingle()

  if (existingProfile) {
    const existingRole = existingProfile.role

    if (existingRole === "externer_kaeufer") {
      // Idempotent: return existing buyer account
      console.log(`[buyer-accounts] Existing externer_kaeufer account for ${email}, reusing.`)
      return NextResponse.json(
        {
          userId: existingProfile.id,
          isNew: false,
          message: "Bestehender Käufer-Account verwendet.",
        },
        { status: 200 }
      )
    }

    if (existingRole === "patient") {
      // Patient account — gut this email/account to PROJ-20 for entitlement linking
      console.log(`[buyer-accounts] Email ${email} already a patient — entitlement goes to existing account.`)
      return NextResponse.json(
        {
          userId: existingProfile.id,
          isNew: false,
          isPatient: true,
          message: "Bestehender Patienten-Account. Entitlement diesem Account gutschreiben.",
        },
        { status: 200 }
      )
    }

    // Staff account — cannot create buyer account for this email
    console.warn(`[buyer-accounts] Email ${email} belongs to a staff account (role=${existingRole}). Blocked.`)
    return NextResponse.json(
      { error: "Diese E-Mail-Adresse ist bereits einem Mitarbeiter-Account zugeordnet." },
      { status: 409 }
    )
  }

  // ── Create new externer_kaeufer account ───────────────────────────
  const tempPassword = generateTempPassword()

  const { data: authData, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      role: "externer_kaeufer",
    },
  })

  if (createError || !authData.user) {
    console.error("[buyer-accounts] Auth user creation failed:", createError?.message)
    return NextResponse.json(
      { error: "Account konnte nicht erstellt werden: " + (createError?.message ?? "Unbekannter Fehler") },
      { status: 500 }
    )
  }

  const userId = authData.user.id

  // ── user_profiles-Zeile sicherstellen ─────────────────────────────
  // Ein DB-Trigger legt die user_profiles-Zeile bei auth.admin.createUser
  // bereits an und liest dabei role/first_name/last_name aus user_metadata.
  // Wir stellen die Werte hier defensiv per UPDATE sicher — idempotent und
  // robust, falls sich Trigger-Details ändern. (Ein INSERT würde am
  // Primärschlüssel-Konflikt scheitern.)
  const { error: profileError } = await supabase
    .from("user_profiles")
    .update({
      email,
      role: "externer_kaeufer",
      status: "aktiv",
      first_name: firstName,
      last_name: lastName,
    })
    .eq("id", userId)

  if (profileError) {
    console.error("[buyer-accounts] user_profiles update failed:", profileError.message)
    // Rollback auth user
    try { await supabase.auth.admin.deleteUser(userId) } catch {}
    return NextResponse.json({ error: "Profil konnte nicht eingerichtet werden." }, { status: 500 })
  }

  // Käufer-Stammdaten (Name, E-Mail) liegen in user_profiles — keine separate
  // buyer_profiles-Tabelle nötig (user_profiles ist die universelle Profil-Tabelle).

  // ── Welcome email (fire-and-forget) ──────────────────────────────
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wwwpraxis-os.com"

  if (product?.produkt_typ === "masterclass") {
    // Premium-Willkommens-Mail im Masterclass-Look (statt der generischen).
    const { subject, html } = renderMasterclassWelcomeEmail({
      firstName,
      email,
      tempPassword,
      loginUrl: `${appUrl}/login`,
      masterclassUrl: `${appUrl}/masterclass/${product.slug}`,
    })
    sendEmail({ to: email, subject, html }).catch((err) =>
      console.error("[buyer-accounts] Masterclass welcome email failed:", err)
    )
  } else {
  sendEmail({
    to: email,
    subject: "Dein Zugang zu Praxis OS — Kurse & Inhalte",
    html: `
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
  </head>
  <body style="margin: 0; padding: 0; background-color: #f1f5f9;">
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px 16px;">
      <div style="background-color: #ecfdf5; border: 1px solid #e2e8f0; border-bottom: none; border-radius: 16px 16px 0 0; padding: 36px 32px;">
        <p style="color: #059669; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px;">
          Praxis OS · Kurse
        </p>
        <h1 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 0;">
          Willkommen bei Praxis OS
        </h1>
      </div>
      <div style="background-color: #ffffff; padding: 36px 32px; border: 1px solid #e2e8f0; border-top: none;">
        <p style="font-size: 16px; color: #1e293b; margin: 0 0 16px; line-height: 1.6;">
          Hallo ${escapeHtml(firstName)},
        </p>
        <p style="font-size: 15px; color: #475569; margin: 0 0 24px; line-height: 1.7;">
          dein Zugang wurde eingerichtet. Du kannst dich ab sofort mit deiner
          E-Mail-Adresse und dem folgenden temporären Passwort anmelden:
        </p>
        <div style="background-color: #f1f5f9; border-radius: 10px; padding: 16px 20px; margin: 0 0 24px; text-align: center;">
          <p style="font-size: 12px; color: #64748b; margin: 0 0 6px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
            Temporäres Passwort
          </p>
          <p style="font-size: 18px; color: #0f172a; margin: 0; font-family: 'Courier New', monospace; font-weight: 700; letter-spacing: 2px;">
            ${tempPassword}
          </p>
          <p style="font-size: 12px; color: #94a3b8; margin: 8px 0 0;">
            Bitte ändere dein Passwort nach dem ersten Login.
          </p>
        </div>
        <div style="text-align: center; margin: 0 0 28px;">
          <a href="${appUrl}/login"
             style="display: inline-block; background-color: #059669; color: #ffffff; padding: 14px 36px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Jetzt anmelden &rarr;
          </a>
        </div>
        <p style="font-size: 14px; color: #64748b; margin: 0; line-height: 1.7;">
          Nach dem Login findest du alle deine gekauften Kurse unter <strong>„Meine Inhalte"</strong>.
        </p>
      </div>
      <div style="background-color: #f8fafc; border-radius: 0 0 16px 16px; padding: 20px 32px; text-align: center; border: 1px solid #e2e8f0; border-top: none;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          Physiotherapie Glawe — Praxis OS
        </p>
      </div>
    </div>
  </body>
</html>
    `,
  }).catch((err) => console.error("[buyer-accounts] Welcome email failed:", err))
  }

  console.log(`[AUDIT] New externer_kaeufer account created: email=${email} userId=${userId} ip=${ip}`)

  return NextResponse.json(
    {
      userId,
      isNew: true,
      message: "Käufer-Account erfolgreich angelegt.",
    },
    { status: 201 }
  )
}
