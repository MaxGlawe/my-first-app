import { escapeHtml } from "@/lib/html-escape"

interface ContractConfirmationEmailProps {
  patientName: string
  praxisName: string
  contractNumber: string
  contractType: string
  signedAt: string
}

export function contractConfirmationEmail(props: ContractConfirmationEmailProps): string {
  const { patientName, praxisName, contractNumber, contractType, signedAt } = props

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vertrag unterzeichnet</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf9f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #faf9f7;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981, #14b8a6); padding: 32px 40px; text-align: center;">
              <div style="width: 56px; height: 56px; background-color: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 12px auto; line-height: 56px; font-size: 28px;">
                \u2714
              </div>
              <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0;">
                Vertrag erfolgreich unterzeichnet
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #0f172a; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Guten Tag ${escapeHtml(patientName)},
              </p>
              <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Vielen Dank! Ihr Behandlungsvertrag wurde erfolgreich unterzeichnet. Anbei finden Sie den signierten Vertrag als PDF-Datei f\u00FCr Ihre Unterlagen.
              </p>

              <!-- Contract Details -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #64748b; font-size: 14px; padding: 4px 0;">Vertragsnummer:</td>
                        <td style="color: #0f172a; font-size: 14px; font-weight: 600; text-align: right; padding: 4px 0;">${escapeHtml(contractNumber)}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px; padding: 4px 0;">Behandlung:</td>
                        <td style="color: #0f172a; font-size: 14px; font-weight: 600; text-align: right; padding: 4px 0;">${escapeHtml(contractType)}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px; padding: 4px 0;">Unterzeichnet am:</td>
                        <td style="color: #0f172a; font-size: 14px; font-weight: 600; text-align: right; padding: 4px 0;">${escapeHtml(signedAt)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 8px 0;">
                <strong>Wichtig:</strong> Sie haben ein 14-t\u00E4giges Widerrufsrecht ab dem Datum der Unterzeichnung.
              </p>
              <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">
                Wir freuen uns auf die Zusammenarbeit und melden uns in K\u00FCrze, um Ihren ersten Termin zu vereinbaren.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
                ${escapeHtml(praxisName)} \u00B7 Heilpraktiker f\u00FCr Physiotherapie<br>
                Der signierte Vertrag ist dieser E-Mail als PDF angeh\u00E4ngt.
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
