import nodemailer from "nodemailer"

let _transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!user || !pass) return null

  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "mail.gmx.net",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // STARTTLS
      auth: { user, pass },
    })
  }

  return _transporter
}

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  attachments?: { filename: string; content: Buffer }[]
}

export async function sendEmail({ to, subject, html, attachments }: SendEmailOptions) {
  const transporter = getTransporter()
  if (!transporter) {
    console.warn("[Email] SMTP_USER/SMTP_PASS not set — skipping email send")
    return { success: false, error: "SMTP nicht konfiguriert" }
  }

  const from = `${process.env.EMAIL_FROM_NAME || "Physiotherapie Glawe"} <${process.env.SMTP_USER}>`

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
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
