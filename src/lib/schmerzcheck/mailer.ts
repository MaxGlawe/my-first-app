/**
 * PROJ-23: Schmerzcheck transactional mailer (SMTP via Nodemailer).
 *
 * Sends the funnel's transactional mail (Phase 1: T1 Double-Opt-in) from the
 * practice's own SiteGround mailbox (info@physiotherapie-glawe.de). Kept
 * separate from the practice's GMX mail (`lib/email.ts`) so the funnel has its
 * own branded sender and its own credentials.
 *
 * Config (server-only):
 *   SCHMERZCHECK_SMTP_HOST       e.g. mail.physiotherapie-glawe.de
 *   SCHMERZCHECK_SMTP_PORT       465 (SSL) or 587 (STARTTLS), default 587
 *   SCHMERZCHECK_SMTP_USER       full mailbox address
 *   SCHMERZCHECK_SMTP_PASS       mailbox password
 *   SCHMERZCHECK_SMTP_FROM_EMAIL defaults to SCHMERZCHECK_SMTP_USER
 *   SCHMERZCHECK_SMTP_FROM_NAME  defaults to "Max Glawe · Praxis OS"
 *
 * Note (deliverability): send AS the SiteGround-hosted domain so SiteGround's
 * SPF/DKIM apply. Don't relay this address through a different provider.
 */

import nodemailer from "nodemailer"
import { readFileSync } from "node:fs"
import { join } from "node:path"

let _transporter: nodemailer.Transporter | null = null

// Practice logo for inline (cid) embedding in emails — read once, cached.
let _logoBuffer: Buffer | null | undefined
function getLogoBuffer(): Buffer | null {
  if (_logoBuffer !== undefined) return _logoBuffer
  try {
    _logoBuffer = readFileSync(join(process.cwd(), "public/images/physio-logo.png"))
  } catch {
    _logoBuffer = null
  }
  return _logoBuffer
}

/** Content-ID referenced from the email HTML as <img src="cid:..."> */
export const LOGO_CID = "praxislogo"

function getTransporter(): nodemailer.Transporter | null {
  const host = process.env.SCHMERZCHECK_SMTP_HOST
  const user = process.env.SCHMERZCHECK_SMTP_USER
  const pass = process.env.SCHMERZCHECK_SMTP_PASS
  if (!host || !user || !pass) return null

  if (!_transporter) {
    const port = Number(process.env.SCHMERZCHECK_SMTP_PORT) || 587
    _transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465 = implicit SSL, 587 = STARTTLS
      auth: { user, pass },
    })
  }
  return _transporter
}

interface SendArgs {
  to: string
  toName?: string
  subject: string
  html: string
  attachments?: { filename: string; content: Buffer }[]
}

interface SendResult {
  success: boolean
  messageId?: string
  error?: string
}

/** Send one transactional Schmerzcheck email. Fails soft when unconfigured. */
export async function sendSchmerzcheckEmail({
  to,
  toName,
  subject,
  html,
  attachments,
}: SendArgs): Promise<SendResult> {
  const transporter = getTransporter()
  if (!transporter) {
    console.warn("[Schmerzcheck Mail] SMTP nicht konfiguriert — überspringe Versand")
    return { success: false, error: "SMTP nicht konfiguriert" }
  }

  const fromEmail =
    process.env.SCHMERZCHECK_SMTP_FROM_EMAIL || process.env.SCHMERZCHECK_SMTP_USER!
  const fromName = process.env.SCHMERZCHECK_SMTP_FROM_NAME || "Max Glawe · Praxis OS"

  try {
    // Das Logo nur anhängen, wenn die Mail es auch referenziert. Sonst würde es
    // als sichtbarer Anhang erscheinen (Büroklammer-Symbol) — irritierend bei
    // Mails, die es gar nicht einbetten, z.B. der Kauf-Zugangsmail.
    const logo = html.includes(`cid:${LOGO_CID}`) ? getLogoBuffer() : null
    const allAttachments = [
      ...(attachments?.map((a) => ({ filename: a.filename, content: a.content })) ?? []),
      // inline logo (cid) — shows even when the client blocks external images
      ...(logo ? [{ filename: "praxis-logo.png", content: logo, cid: LOGO_CID }] : []),
    ]

    const info = await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: toName ? `${toName} <${to}>` : to,
      subject,
      html,
      attachments: allAttachments.length ? allAttachments : undefined,
    })
    return { success: true, messageId: info.messageId }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler"
    console.error("[Schmerzcheck Mail] Versand fehlgeschlagen:", message)
    return { success: false, error: message }
  }
}

/** The funnel sender address (used e.g. for unsubscribe mailto). */
export function getSchmerzcheckFromEmail(): string {
  return (
    process.env.SCHMERZCHECK_SMTP_FROM_EMAIL ||
    process.env.SCHMERZCHECK_SMTP_USER ||
    "info@physiotherapie-glawe.de"
  )
}
