/**
 * POST /api/bgf-anfrage — Public B2B (Unternehmen) contact form (no auth)
 *
 * Sends a notification email to the practice. No DB persistence.
 * Security: Rate-limited, honeypot, disposable-email blocklist, timing check.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { isRateLimited } from "@/lib/rate-limit"
import { sendEmail } from "@/lib/email"
import { escapeHtml } from "@/lib/html-escape"

// ── Disposable / testing email domain blocklist ──────────────────────
const BLOCKED_EMAIL_DOMAINS = new Set([
  "mailnull.com", "maildrop.cc", "mailsac.com", "mailinator.com",
  "guerrillamail.com", "guerrillamail.de", "grr.la", "guerrillamailblock.com",
  "sharklasers.com", "guerrillamail.info", "guerrillamail.net",
  "tempmail.com", "temp-mail.org", "tempmailo.com", "tempail.com",
  "throwaway.email", "throwawaymail.com", "trashmail.com", "trashmail.de",
  "trashmail.net", "trashmail.me", "trash-mail.com",
  "yopmail.com", "yopmail.fr", "yopmail.net",
  "10minutemail.com", "10minutemail.net", "10minutemail.de",
  "minutemail.com", "tempinbox.com",
  "dispostable.com", "discard.email", "discardmail.com", "discardmail.de",
  "mailcatch.com", "mailexpire.com", "mailnesia.com",
  "spamgourmet.com", "spamgourmet.net",
  "fakeinbox.com", "fakemail.net",
  "mohmal.com", "mailtemp.info",
  "getairmail.com", "filzmail.com",
  "einrot.com", "einrot.de",
  "getnada.com", "binkmail.com",
  "harakirimail.com", "mailforspam.com",
  "mytemp.email", "tempmail.de", "wegwerfmail.de", "wegwerfmail.net",
  "spoofmail.de", "objectmail.com",
  "mailnull.net", "devnull.email",
  "mailtothis.com", "emkei.cz",
])

function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase()
  if (!domain) return true
  return BLOCKED_EMAIL_DOMAINS.has(domain)
}

// ── Schema ───────────────────────────────────────────────────────────

const anfrageSchema = z.object({
  firma: z.string().min(1, "Firmenname ist erforderlich.").max(150),
  vorname: z.string().min(1, "Vorname ist erforderlich.").max(100),
  nachname: z.string().min(1, "Nachname ist erforderlich.").max(100),
  position: z.string().max(120).optional().default(""),
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein.").max(200),
  telefon: z.string().max(40).optional().default(""),
  mitarbeiter: z.string().min(1, "Bitte wählen Sie die Unternehmensgröße.").max(40),
  modell: z.string().min(1, "Bitte wählen Sie ein präferiertes Modell.").max(60),
  pilot: z.boolean().optional().default(false),
  nachricht: z.string().min(10, "Bitte beschreiben Sie Ihr Anliegen genauer.").max(4000),
  datenschutz_akzeptiert: z.boolean().refine((v) => v === true, "Pflichtfeld"),
  // Honeypot fields (must stay empty)
  website: z.string().max(0, "Bot erkannt.").optional().default(""),
  fax_number: z.string().max(0, "Bot erkannt.").optional().default(""),
  // Timing check: form load timestamp (ms)
  _t: z.number().optional(),
})

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  // Rate limiting: 2 requests per minute per IP
  if (isRateLimited(`bgf-anfrage:${ip}`, 2, 60_000)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuchen Sie es in einer Minute erneut." },
      { status: 429 }
    )
  }

  // Global rate limit: max 30 requests per hour total
  if (isRateLimited("bgf-anfrage:global", 30, 3_600_000)) {
    return NextResponse.json(
      { error: "Derzeit sind zu viele Anfragen eingegangen. Bitte versuchen Sie es später." },
      { status: 429 }
    )
  }

  let body: z.infer<typeof anfrageSchema>
  try {
    body = anfrageSchema.parse(await request.json())
  } catch (err) {
    const msg = err instanceof z.ZodError ? err.issues[0]?.message : "Ungültige Eingabe."
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  // Honeypot — bots fill hidden fields. Silent success to not reveal detection.
  if (body.website || body.fax_number) {
    return NextResponse.json({ success: true })
  }

  // Timing check — real users need at least 5 seconds to fill a form
  if (body._t) {
    const elapsedMs = Date.now() - body._t
    if (elapsedMs < 5_000) {
      return NextResponse.json({ success: true })
    }
  }

  // Disposable email blocklist
  if (isDisposableEmail(body.email)) {
    return NextResponse.json(
      { error: "Bitte verwenden Sie eine reguläre (geschäftliche) E-Mail-Adresse." },
      { status: 400 }
    )
  }

  const notifyEmail = process.env.SMTP_USER || "physiotherapieglawe@gmx.de"
  const row = (label: string, value: string) =>
    `<tr><td style="padding: 8px 0; font-weight: 600; width: 180px; vertical-align: top;">${label}</td><td>${value}</td></tr>`

  const result = await sendEmail({
    to: notifyEmail,
    subject: `BGF-Anfrage: ${body.firma} (${body.mitarbeiter})`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1A1A2E; font-size: 20px; margin-bottom: 4px;">Neue Unternehmens-Anfrage (BGF)</h2>
        <p style="color: #8896A6; font-size: 13px; margin: 0 0 20px;">Über /unternehmen/kontakt</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #4A5568;">
          ${row("Unternehmen:", escapeHtml(body.firma))}
          ${row("Ansprechpartner:", `${escapeHtml(body.vorname)} ${escapeHtml(body.nachname)}${body.position ? ` — ${escapeHtml(body.position)}` : ""}`)}
          ${row("E-Mail:", `<a href="mailto:${escapeHtml(body.email)}">${escapeHtml(body.email)}</a>`)}
          ${body.telefon ? row("Telefon:", escapeHtml(body.telefon)) : ""}
          ${row("Mitarbeitende:", escapeHtml(body.mitarbeiter))}
          ${row("Gewähltes Paket:", `<strong>${escapeHtml(body.modell)}</strong>`)}
          ${row("Pilot-Programm:", body.pilot ? "Ja, Interesse" : "—")}
        </table>
        <div style="margin-top: 16px; padding: 14px 16px; background: #F5F2ED; border-radius: 8px; border: 1px solid #E2DDD5;">
          <p style="font-weight: 600; margin: 0 0 6px; font-size: 14px; color: #1A1A2E;">Nachricht / Fragen:</p>
          <p style="margin: 0; font-size: 14px; color: #4A5568; white-space: pre-wrap;">${escapeHtml(body.nachricht)}</p>
        </div>
        <div style="margin-top: 20px;">
          <a href="mailto:${escapeHtml(body.email)}"
             style="display: inline-block; background: #2D6A4F; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Direkt antworten
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #E2DDD5; margin: 24px 0;" />
        <p style="color: #8896A6; font-size: 12px;">Praxis OS — Automatische Benachrichtigung</p>
      </div>
    `,
  })

  if (!result.success) {
    console.error("[POST /api/bgf-anfrage] Email send failed:", result.error)
    return NextResponse.json(
      { error: "Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es später oder schreiben Sie uns direkt." },
      { status: 502 }
    )
  }

  return NextResponse.json({ success: true })
}
