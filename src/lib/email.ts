import nodemailer from "nodemailer"

/**
 * Postausgang von Praxis OS.
 *
 * ABSENDER UND VERSANDWEG GEHOEREN ZUSAMMEN. Am 26.09.2026 fiel auf, dass ein
 * Bucher zwei Mails von zwei verschiedenen Absendern bekam: die Bestaetigung
 * des Kalenders von info@physiotherapie-glawe.de, unsere von der
 * GMX-Adresse. Das sieht nach zwei Absendern aus, weil es zwei sind.
 *
 * Die Adresse allein umzustellen waere ein Eigentor: Wer als
 * info@physiotherapie-glawe.de auftritt, aber ueber GMX verschickt, scheitert
 * am SPF-Eintrag der Domain — die Mail landet im Spam oder wird abgewiesen.
 * Deshalb muss der SMTP-Zugang mitwechseln, nicht nur der Name auf dem
 * Umschlag.
 *
 * SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS bestimmen den Weg.
 * EMAIL_FROM_ADDRESS bestimmt, was der Empfaenger sieht — normalerweise
 * dasselbe wie SMTP_USER, und genau das ist die Voreinstellung. Auseinander
 * laufen duerfen sie nur, wenn das Postfach das ausdruecklich erlaubt.
 */
let _transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!user || !pass) return null

  if (!_transporter) {
    const port = Number(process.env.SMTP_PORT) || 587
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "mail.gmx.net",
      port,
      // 465 ist von Beginn an verschluesselt, 587 steigt per STARTTLS um.
      // Fest auf `false` zu stehen hiesse: Port 465 funktioniert nie.
      secure: port === 465,
      auth: { user, pass },
    })
  }

  return _transporter
}

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  /**
   * Textfassung. Fehlt sie, wird eine aus dem HTML abgeleitet — NIEMALS gar
   * keine.
   *
   * Eine Mail ohne Textteil ist eines der aeltesten Spam-Merkmale ueberhaupt:
   * Ein Mensch, der eine Mail schreibt, hat Text; ein Werkzeug, das
   * Werbebilder verschickt, oft nur HTML. Bis zum 26.09.2026 ging JEDE Mail
   * aus Praxis OS ohne Textteil hinaus - auch die Einladung, die ihre
   * Textfassung sogar baut und dann verwarf.
   */
  text?: string
  attachments?: { filename: string; content: Buffer }[]
}

/**
 * Notduerftige, aber ehrliche Textfassung aus dem HTML: Links behalten ihre
 * Adresse, Absaetze ihre Umbrueche. Besser als nichts, und „nichts" war die
 * Alternative.
 */
export function textAusHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_m, url, text) =>
      `${String(text).replace(/<[^>]+>/g, "").trim()} (${url})`
    )
    .replace(/<\/(p|div|tr|li|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_m, n) => String.fromCodePoint(Number(n)))
    .replace(/&[a-z]+;/gi, (e) =>
      ({ "&rarr;": "→", "&ndash;": "–", "&mdash;": "—", "&hellip;": "…", "&euro;": "€",
         "&auml;": "ä", "&ouml;": "ö", "&uuml;": "ü", "&Auml;": "Ä", "&Ouml;": "Ö",
         "&Uuml;": "Ü", "&szlig;": "ß", "&bull;": "·", "&middot;": "·" }[e] ?? "")
    )
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export async function sendEmail({ to, subject, html, text, attachments }: SendEmailOptions) {
  const transporter = getTransporter()
  if (!transporter) {
    console.warn("[Email] SMTP_USER/SMTP_PASS not set — skipping email send")
    return { success: false, error: "SMTP nicht konfiguriert" }
  }

  const absender = process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER
  const from = `${process.env.EMAIL_FROM_NAME || "Physiotherapie Glawe"} <${absender}>`

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text?.trim() || textAusHtml(html),
      html,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
      })),
    })

    return { success: true, messageId: info.messageId }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler"
    console.error("[Email] Send failed:", message)
    return { success: false, error: message }
  }
}
