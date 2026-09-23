/**
 * PROJ-26 — Vorschau der Programm-Mails verschicken, ohne eine Zahlung auszulösen.
 *
 * Rendert beide Vorlagen mit Beispieldaten und schickt sie an eine Adresse.
 * Gedacht zum Gegenlesen von Text, Layout und Darstellung im echten Postfach.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/send-programm-mail-preview.ts <empfaenger>
 *
 * Verschickt über dieselbe SMTP-Konfiguration wie die App (.env.local).
 * Die Links in den Mails sind Beispiel-Links und führen ins Leere — es wird
 * weder ein Vertrag angelegt noch ein Zugang gewährt.
 */

import { config } from "dotenv"
import nodemailer from "nodemailer"
import { programmAngebotEmail } from "../src/lib/email-templates/programm-angebot"
import { programmWillkommenEmail } from "../src/lib/email-templates/programm-willkommen"

config({ path: ".env.local" })

const empfaenger = process.argv[2]
if (!empfaenger) {
  console.error("Empfängeradresse fehlt.\n  npx tsx scripts/send-programm-mail-preview.ts du@example.com")
  process.exit(1)
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wwwpraxis-os.com"

const angebot = programmAngebotEmail({
  patientName: "Max",
  variante: "intensiv",
  bereitsBeglichen: 0,
  angebotUrl: `${siteUrl}/vertrag/BEISPIEL-LINK-NUR-ZUR-ANSICHT`,
  contractNumber: "V-2026-0099",
  gueltigBis: "24.09.2026 um 14:30",
  praxisName: "Physiotherapie Glawe",
  behandlerName: "Max Glawe",
  siteUrl,
})

const willkommen = programmWillkommenEmail({
  firstName: "Max",
  variante: "intensiv",
  appUrl: `${siteUrl}/app/dashboard`,
  endetAm: "21.12.2026",
  behandlerName: "Max Glawe",
  praxisName: "Physiotherapie Glawe",
  siteUrl,
})

async function main() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })

  const from = `${process.env.EMAIL_FROM_NAME || "Physiotherapie Glawe"} <${process.env.SMTP_USER}>`

  for (const [label, mail] of [
    ["Angebot", angebot],
    ["Willkommen", willkommen],
  ] as const) {
    const info = await transporter.sendMail({
      from,
      to: empfaenger,
      subject: `[VORSCHAU] ${mail.subject}`,
      html: mail.html,
    })
    console.log(`${label}: gesendet (${info.messageId})`)
  }
}

main().catch((err) => {
  console.error("Fehlgeschlagen:", err.message)
  process.exit(1)
})
