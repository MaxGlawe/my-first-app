/**
 * PROJ-26 — Vorschau der Programm-Mails verschicken, ohne eine Zahlung auszulösen.
 *
 * Rendert beide Vorlagen mit Beispieldaten und schickt sie an eine Adresse.
 * Gedacht zum Gegenlesen von Text, Layout und Darstellung im echten Postfach.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/send-programm-mail-preview.ts <empfaenger> [variante]
 *
 * Ohne Variante werden BEIDE geschickt — „Begleitet" und „Intensiv" —, und die
 * Angebotsmail jeweils in beiden Zahlungsfällen (Konsultation angerechnet oder
 * nicht). Genau in diesem Zusammenspiel steckte der Abzugsfehler vom 23.09.2026,
 * deshalb ist der Vollversand die Vorgabe.
 *
 * Verschickt über dieselbe SMTP-Konfiguration wie die App (.env.local).
 * Die Links in den Mails sind Beispiel-Links und führen ins Leere — es wird
 * weder ein Vertrag angelegt noch ein Zugang gewährt.
 */

import { config } from "dotenv"
import nodemailer from "nodemailer"
import { programmAngebotEmail } from "../src/lib/email-templates/programm-angebot"
import { programmWillkommenEmail } from "../src/lib/email-templates/programm-willkommen"
import {
  PROGRAMM,
  VARIANTEN,
  VARIANTEN_REIHENFOLGE,
  formatEuro,
  type ProgrammVariante,
} from "../src/lib/programm"

config({ path: ".env.local" })

const empfaenger = process.argv[2]
const nurVariante = process.argv[3] as ProgrammVariante | undefined

if (!empfaenger) {
  console.error(
    "Empfängeradresse fehlt.\n" +
      "  npx tsx scripts/send-programm-mail-preview.ts du@example.com [begleitet|intensiv]"
  )
  process.exit(1)
}
if (nurVariante && !VARIANTEN[nurVariante]) {
  console.error(`Unbekannte Variante „${nurVariante}“ — erlaubt: begleitet, intensiv`)
  process.exit(1)
}

/**
 * Bewusst NICHT NEXT_PUBLIC_SITE_URL: Das Skript laeuft auf dem Rechner des
 * Behandlers, dort steht dort `http://localhost:3000` — und dann stehen in der
 * Vorschau localhost-Links an genau der Stelle, an der der Patient spaeter sein
 * Passwort setzt. Das sieht nach einem Fehler in der echten Mail aus, ist aber
 * nur ein Artefakt der Vorschau. Eine Vorschau muss zeigen, was der Patient
 * sieht, also die Produktionsadresse.
 *
 * Fuer einen bewussten Test gegen die lokale Instanz: PREVIEW_SITE_URL setzen.
 */
const siteUrl = process.env.PREVIEW_SITE_URL ?? "https://wwwpraxis-os.com"
const varianten = nurVariante ? [nurVariante] : VARIANTEN_REIHENFOLGE

interface Versand {
  label: string
  subject: string
  html: string
}

function bauen(): Versand[] {
  const raus: Versand[] = []

  for (const id of varianten) {
    const v = VARIANTEN[id]

    // Angebotsmail in beiden Zahlungsfällen. Die Vertragsnummer trägt die
    // Variante, weil der Betreff sonst bei beiden identisch wäre und sich die
    // Mails im Postfach nicht auseinanderhalten liessen.
    for (const bereitsBeglichen of [0, PROGRAMM.konsultation]) {
      const suffix = bereitsBeglichen > 0 ? "MIT-ANRECHNUNG" : "OHNE-ANRECHNUNG"
      const mail = programmAngebotEmail({
        patientName: "Max",
        variante: id,
        bereitsBeglichen,
        angebotUrl: `${siteUrl}/vertrag/BEISPIEL-LINK-NUR-ZUR-ANSICHT`,
        contractNumber: `${v.name.toUpperCase()}-${suffix}`,
        gueltigBis: "25.09.2026 um 14:30",
        praxisName: "Physiotherapie Glawe",
        behandlerName: "Max Glawe",
        siteUrl,
      })
      raus.push({
        label:
          `Angebot · ${v.name} · ` +
          (bereitsBeglichen > 0
            ? `${formatEuro(bereitsBeglichen)} angerechnet → ${formatEuro(v.preis - bereitsBeglichen)}`
            : `nichts angerechnet → ${formatEuro(v.preis)}`),
        subject: mail.subject,
        html: mail.html,
      })
    }

    const willkommen = programmWillkommenEmail({
      firstName: "Max",
      variante: id,
      appUrl: `${siteUrl}/app/dashboard`,
      endetAm: "22.12.2026",
      behandlerName: "Max Glawe",
      praxisName: "Physiotherapie Glawe",
      siteUrl,
    })
    raus.push({
      label: `Willkommen · ${v.name}`,
      subject: `${willkommen.subject} (${v.name})`,
      html: willkommen.html,
    })
  }

  return raus
}

async function main() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })

  const from = `${process.env.EMAIL_FROM_NAME || "Physiotherapie Glawe"} <${process.env.SMTP_USER}>`
  const mails = bauen()

  console.log(`Empfänger: ${empfaenger}`)
  console.log(`Absender:  ${from}`)
  console.log(`Basis-URL: ${siteUrl}${process.env.PREVIEW_SITE_URL ? " (per PREVIEW_SITE_URL)" : ""}`)
  console.log(`Mails:     ${mails.length}\n`)

  for (const m of mails) {
    const info = await transporter.sendMail({
      from,
      to: empfaenger,
      subject: `[VORSCHAU] ${m.subject}`,
      html: m.html,
    })
    console.log(`  gesendet — ${m.label}`)
    console.log(`             ${info.messageId}`)
  }

  console.log("\nHinweis: Es wurde kein Vertrag angelegt und kein Zugang gewährt.")
}

main().catch((err) => {
  console.error("Fehlgeschlagen:", err.message)
  process.exit(1)
})
