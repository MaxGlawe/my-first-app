/**
 * POST /api/shop/resend-access
 *
 * "Zugang erneut senden" für den öffentlichen Website-Shop (PROJ-21).
 * Käufer, die ihre Zugangs-E-Mail verloren haben, fordern hier einen neuen
 * Zugangslink an.
 *
 * Security:
 *   - Rate-Limiting pro IP + global (strikt — analog Passwort-Reset)
 *   - Zod-Validierung
 *   - KEINE Account-Enumeration: immer dieselbe generische Antwort, egal ob die
 *     E-Mail existiert
 *   - Link nur für Kurs-Käufer-Rollen (externer_kaeufer / patient), nicht für Staff
 *
 * HINWEIS: Wird erst durch die Middleware-Freigabe für anonyme Besucher
 * erreichbar — die wird separat (mit Freigabe) ergänzt.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { isRateLimited } from "@/lib/rate-limit"
import { sendEmail } from "@/lib/email"
import { escapeHtml } from "@/lib/html-escape"

const BodySchema = z.object({
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein.").max(200),
})

// Rollen, die einen Kurs-Zugang haben können
const BUYER_ROLES = new Set(["externer_kaeufer", "patient"])

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  // ── Rate limiting: 3/IP/Stunde + 30 global/Stunde (strikt) ──────────────
  if (isRateLimited(`resend-access:${ip}`, 3, 3_600_000)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuche es später erneut." },
      { status: 429 }
    )
  }
  if (isRateLimited("resend-access:global", 30, 3_600_000)) {
    return NextResponse.json(
      { error: "Derzeit sind zu viele Anfragen eingegangen. Bitte versuche es später." },
      { status: 429 }
    )
  }

  // ── Validierung ─────────────────────────────────────────────────────────
  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await request.json())
  } catch (err) {
    const msg = err instanceof z.ZodError ? err.issues[0]?.message : "Ungültige Eingabe."
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const email = body.email.trim().toLowerCase()
  const sc = createSupabaseServiceClient()

  // ── Account suchen — nur Käufer-Rollen bekommen einen Link ──────────────
  const { data: profile } = await sc
    .from("user_profiles")
    .select("id, role, first_name")
    .ilike("email", email)
    .maybeSingle()

  if (profile && BUYER_ROLES.has(profile.role)) {
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      "https://wwwpraxis-os.com"

    // Recovery-Link erzeugen (nutzt den bestehenden Passwort-Reset-Flow)
    const { data: linkData, error: linkError } = await sc.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: `${appUrl}/login/update-password` },
    })

    const actionLink = linkData?.properties?.action_link

    if (linkError || !actionLink) {
      console.error("[resend-access] generateLink fehlgeschlagen:", linkError?.message)
    } else {
      const firstName = profile.first_name ? escapeHtml(profile.first_name) : "hallo"
      sendEmail({
        to: email,
        subject: "Dein Zugang zu Praxis OS",
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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px 16px;">
      <div style="background-color: #ecfdf5; border: 1px solid #e2e8f0; border-bottom: none; border-radius: 16px 16px 0 0; padding: 36px 32px;">
        <p style="color: #059669; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px;">
          Praxis OS · Kurse
        </p>
        <h1 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0;">
          Dein Zugangslink
        </h1>
      </div>
      <div style="background-color: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
        <p style="font-size: 15px; color: #334155; margin: 0 0 16px; line-height: 1.6;">
          Hallo ${firstName},
        </p>
        <p style="font-size: 15px; color: #475569; margin: 0 0 24px; line-height: 1.7;">
          du hast einen neuen Zugangslink angefordert. Klicke auf den Button, um
          ein Passwort zu setzen und dich bei deinen Kursen anzumelden:
        </p>
        <div style="text-align: center; margin: 0 0 24px;">
          <a href="${actionLink}"
             style="display: inline-block; background-color: #059669; color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Zugang einrichten &rarr;
          </a>
        </div>
        <p style="font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.7;">
          Der Link ist aus Sicherheitsgründen nur begrenzt gültig. Falls du das
          nicht angefordert hast, kannst du diese E-Mail ignorieren.
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
      }).catch((err) => console.error("[resend-access] E-Mail-Versand fehlgeschlagen:", err))
    }
  }

  // ── Immer dieselbe Antwort — keine Account-Enumeration ──────────────────
  return NextResponse.json({ success: true })
}
