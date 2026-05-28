/**
 * Premium-Willkommens-E-Mail nach dem Kauf der Masterclass „Chronischer
 * Kreuzschmerz". Wird von /api/buyer-accounts gerendert, wenn der gekaufte
 * Artikel ein Produkt mit `produkt_typ='masterclass'` ist (sonst bleibt die
 * generische Praxis-OS-Willkommens-Mail).
 *
 * Design folgt der Masterclass-/Workbook-Welt: Off-White-Papier, Tinte,
 * Anthrazit-Grün, Sand, Serif-Headlines. E-Mail-sicher (Inline-Styles,
 * Georgia-Serif als Fallback). HWG-konform — keine Heilversprechen.
 *
 * Enthält die Zugangsdaten (E-Mail + temporäres Passwort), da der Käufer-
 * Account frisch angelegt wurde und sich erst anmelden muss.
 */

import { escapeHtml } from "@/lib/html-escape"

const PAPER = "#F8F5F0"
const INK = "#0f172a"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const MUTED = "#64748b"
const LINE = "#e7e1d6"

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"

export interface MasterclassWelcomeEmailOptions {
  firstName: string
  email: string
  tempPassword: string
  loginUrl: string
  masterclassUrl: string
}

export function renderMasterclassWelcomeEmail({
  firstName,
  email,
  tempPassword,
  loginUrl,
  masterclassUrl,
}: MasterclassWelcomeEmailOptions): { subject: string; html: string } {
  const subject = "Willkommen in deiner Masterclass · Chronischer Kreuzschmerz"

  const html = `
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
  </head>
  <body style="margin: 0; padding: 0; background-color: ${PAPER};">
    <div style="font-family: ${SANS}; max-width: 560px; margin: 0 auto; padding: 24px 16px;">

      <!-- Kopf -->
      <div style="background-color: #ffffff; border: 1px solid ${LINE}; border-bottom: none; border-radius: 18px 18px 0 0; padding: 40px 36px 32px;">
        <p style="color: ${GREEN}; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 14px;">
          Masterclass
        </p>
        <h1 style="color: ${INK}; font-family: ${SERIF}; font-size: 28px; font-weight: 600; line-height: 1.2; margin: 0;">
          Willkommen in deiner Masterclass
        </h1>
        <p style="color: ${GREEN}; font-family: ${SERIF}; font-size: 18px; margin: 8px 0 0;">
          Chronischer Kreuzschmerz
        </p>
        <div style="height: 2px; width: 44px; background-color: ${SAND}; margin: 22px 0 0;"></div>
      </div>

      <!-- Körper -->
      <div style="background-color: #ffffff; padding: 8px 36px 36px; border: 1px solid ${LINE}; border-top: none;">
        <p style="font-size: 16px; color: ${INK}; margin: 0 0 16px; line-height: 1.6;">
          Hallo ${escapeHtml(firstName)},
        </p>
        <p style="font-size: 15px; color: #334155; margin: 0 0 22px; line-height: 1.75;">
          schön, dass du dabei bist. Deine Masterclass ist freigeschaltet — du
          kannst ab sofort in deinem Tempo starten.
        </p>

        <!-- Das erwartet dich -->
        <div style="background-color: ${PAPER}; border: 1px solid ${LINE}; border-radius: 12px; padding: 18px 22px; margin: 0 0 24px;">
          <p style="font-size: 11px; color: ${GREEN}; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin: 0 0 12px;">
            Das ist alles dabei
          </p>
          <p style="font-size: 14px; color: ${INK}; margin: 0 0 8px; line-height: 1.5;">
            &middot;&nbsp; 27 vertonte Lektionen in sechs Sektionen
          </p>
          <p style="font-size: 14px; color: ${INK}; margin: 0 0 8px; line-height: 1.5;">
            &middot;&nbsp; Interaktives Workbook zum Mitmachen &amp; Ausdrucken
          </p>
          <p style="font-size: 14px; color: ${INK}; margin: 0; line-height: 1.5;">
            &middot;&nbsp; Bonus: Übungskartendeck für unterwegs
          </p>
        </div>

        <!-- Zugang -->
        <p style="font-size: 11px; color: ${MUTED}; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin: 0 0 10px;">
          So startest du
        </p>
        <p style="font-size: 15px; color: #334155; margin: 0 0 16px; line-height: 1.7;">
          Melde dich mit deiner E-Mail-Adresse und dem folgenden temporären
          Passwort an:
        </p>
        <div style="background-color: ${PAPER}; border: 1px solid ${LINE}; border-radius: 10px; padding: 16px 20px; margin: 0 0 22px;">
          <p style="font-size: 11px; color: ${MUTED}; margin: 0 0 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
            E-Mail
          </p>
          <p style="font-size: 15px; color: ${INK}; margin: 0 0 14px; font-weight: 600; word-break: break-all;">
            ${escapeHtml(email)}
          </p>
          <p style="font-size: 11px; color: ${MUTED}; margin: 0 0 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
            Temporäres Passwort
          </p>
          <p style="font-size: 18px; color: ${INK}; margin: 0; font-family: 'Courier New', monospace; font-weight: 700; letter-spacing: 2px;">
            ${escapeHtml(tempPassword)}
          </p>
          <p style="font-size: 12px; color: #94a3b8; margin: 10px 0 0;">
            Bitte ändere dein Passwort nach dem ersten Login.
          </p>
        </div>

        <div style="text-align: center; margin: 0 0 24px;">
          <a href="${loginUrl}"
             style="display: inline-block; background-color: ${GREEN}; color: #ffffff; padding: 15px 38px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Jetzt anmelden &amp; starten &rarr;
          </a>
        </div>

        <p style="font-size: 14px; color: ${MUTED}; margin: 0; line-height: 1.7;">
          Danach findest du deine Masterclass jederzeit hier:<br />
          <a href="${masterclassUrl}" style="color: ${GREEN}; word-break: break-all;">${masterclassUrl}</a>
        </p>
      </div>

      <!-- Fuß -->
      <div style="background-color: ${PAPER}; border-radius: 0 0 18px 18px; padding: 22px 36px; text-align: center; border: 1px solid ${LINE}; border-top: none;">
        <p style="font-size: 13px; color: #475569; margin: 0 0 6px; line-height: 1.6;">
          Fragen? Antworte einfach auf diese E-Mail.
        </p>
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          Physiotherapie Glawe — Praxis OS
        </p>
      </div>

    </div>
  </body>
</html>
  `

  return { subject, html }
}
