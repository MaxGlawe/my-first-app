import { escapeHtml } from "@/lib/html-escape"

interface ChatNotificationEmailProps {
  patientName: string
  praxisName: string
  appUrl: string
}

export function chatNotificationEmail(props: ChatNotificationEmailProps): string {
  const { patientName, praxisName, appUrl } = props

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Neue Mitteilung</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf9f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #faf9f7;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981, #14b8a6); padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">
                ${escapeHtml(praxisName)}
              </h1>
              <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 8px 0 0 0;">
                Neue Mitteilung in Ihrer App
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #0f172a; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Guten Tag ${escapeHtml(patientName)},
              </p>
              <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Sie haben eine neue Mitteilung von Ihrer Praxis erhalten. \u00D6ffnen Sie die App, um die Nachricht zu lesen und zu antworten.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center" style="padding: 8px 0 24px 0;">
                    <a href="${appUrl}/app/chat" style="display: inline-block; background: linear-gradient(135deg, #10b981, #14b8a6); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(16,185,129,0.3);">
                      Nachricht lesen
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0; text-align: center;">
                Falls der Button nicht funktioniert, kopieren Sie diesen Link:<br>
                <a href="${appUrl}/app/chat" style="color: #10b981; word-break: break-all;">${appUrl}/app/chat</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
                ${escapeHtml(praxisName)} \u00B7 Heilpraktiker f\u00FCr Physiotherapie<br>
                Diese E-Mail wurde automatisch versendet.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
