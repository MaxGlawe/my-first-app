/**
 * PROJ-26: Angebots-Mail für das Praxis-OS-Programm.
 *
 * Geht direkt im Anschluss an die Videokonsultation raus — meist schaut der
 * Patient noch im Call auf den Bildschirm. Die Mail ist deshalb kurz: die
 * Aufstellung mit der angerechneten Konsultation, ein Knopf, eine Frist.
 *
 * Kein Werbetext. Die Entscheidung ist im Gespräch gefallen; hier geht es nur
 * noch darum, sie sauber zu dokumentieren und zu bezahlen.
 */

import { escapeHtml } from "@/lib/html-escape"
import { PROGRAMM, formatEuro } from "@/lib/programm"

const PAPER = "#F8F5F0"
const CARD = "#FFFFFF"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const FAINT = "#94a3b8"
const LINE = "#e7e1d6"
const GREEN = "#2C3E2D"
const SERIF = "Georgia,'Times New Roman',serif"
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"

export interface ProgrammAngebotMailProps {
  patientName: string
  /** Öffentlicher Link auf die Angebotsseite (/vertrag/<token>). */
  angebotUrl: string
  contractNumber: string
  /** Ablauf des Links, bereits formatiert (z. B. „24.09.2026 um 14:30 Uhr"). */
  gueltigBis: string
  praxisName: string
  behandlerName: string
  siteUrl: string
}

export function programmAngebotEmail(props: ProgrammAngebotMailProps): {
  subject: string
  html: string
} {
  const name = escapeHtml(props.patientName)
  const behandler = escapeHtml(props.behandlerName)
  const praxis = escapeHtml(props.praxisName)

  const zeile = (label: string, wert: string, stark = false) => `
    <tr>
      <td style="padding:7px 0;font-size:14px;color:${stark ? INK : BODY};${stark ? "font-weight:700;" : ""}">${label}</td>
      <td align="right" style="padding:7px 0;font-size:14px;color:${stark ? INK : BODY};${stark ? "font-weight:700;" : ""}white-space:nowrap;">${wert}</td>
    </tr>`

  const html = `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Dein Angebot</title></head>
<body style="margin:0;padding:0;background:${PAPER};">
  <div style="background:${PAPER};padding:32px 16px;font-family:${SANS};">
    <div style="max-width:560px;margin:0 auto;background:${CARD};border:1px solid ${LINE};border-radius:18px;overflow:hidden;">
      <div style="height:4px;background:${GREEN};"></div>

      <div style="padding:26px 32px 0;">
        <span style="font-weight:600;font-size:15px;color:${INK};">${praxis}</span>
        <span style="margin-left:6px;font-size:12px;color:${FAINT};">· Praxis OS</span>
      </div>

      <div style="padding:10px 32px 28px;">
        <h1 style="font-family:${SERIF};font-weight:600;font-size:23px;line-height:1.25;color:${GREEN};margin:18px 0 14px;">
          Dein Angebot aus der Konsultation
        </h1>

        <p style="font-size:15px;line-height:1.65;color:${BODY};margin:0 0 16px;">Hallo ${name},</p>
        <p style="font-size:15px;line-height:1.65;color:${BODY};margin:0 0 20px;">
          wie eben besprochen — hier ist dein Angebot für die ${PROGRAMM.tage}-tägige Betreuung.
          Die Videokonsultation ist darin bereits angerechnet.
        </p>

        <div style="border:1px solid ${LINE};border-radius:14px;padding:18px 20px;background:${PAPER};margin:0 0 22px;">
          <table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
            ${zeile("Betreuung über " + PROGRAMM.tage + " Tage", formatEuro(PROGRAMM.gesamtpreis))}
            ${zeile("Videokonsultation — bereits beglichen", "− " + formatEuro(PROGRAMM.konsultation))}
            <tr><td colspan="2" style="border-top:1px solid ${LINE};font-size:0;line-height:0;">&nbsp;</td></tr>
            ${zeile("Jetzt zu zahlen", formatEuro(PROGRAMM.zuZahlen), true)}
          </table>
        </div>

        <div style="margin:0 0 16px;">
          <a href="${props.angebotUrl}" style="display:inline-block;background:${GREEN};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:15px 28px;border-radius:12px;">
            Angebot ansehen und starten &rarr;
          </a>
        </div>

        <p style="font-size:13px;line-height:1.6;color:${MUTED};margin:0 0 20px;">
          Auf der Seite findest du den vollständigen Behandlungsvertrag. Bezahlen kannst du per
          Karte oder Klarna. Der Link gilt bis <strong style="color:${INK};">${escapeHtml(props.gueltigBis)}</strong> —
          wenn du länger brauchst, sag kurz Bescheid, dann stelle ich ihn dir neu aus.
        </p>

        <p style="font-size:13px;line-height:1.6;color:${FAINT};margin:0 0 20px;">
          Vertragsnummer ${escapeHtml(props.contractNumber)}
        </p>

        <p style="font-size:15px;line-height:1.65;color:${BODY};margin:8px 0 0;">
          Viele Grüße<br/>${behandler}<br/><span style="color:${FAINT};">${praxis}</span>
        </p>
      </div>

      <div style="padding:18px 32px 24px;border-top:1px solid ${LINE};background:#FCFAF6;">
        <p style="margin:0;font-size:12px;line-height:1.6;color:${FAINT};">
          Heilkundliche Leistung nach § 4 Nr. 14a UStG — umsatzsteuerfrei.
          Bei akuten Notfällen wende dich bitte an den ärztlichen Notdienst oder die 112.
        </p>
        <p style="margin:10px 0 0;font-size:12px;color:${FAINT};">
          <a href="${props.siteUrl}/impressum" style="color:${MUTED};text-decoration:underline;">Impressum</a>
          &nbsp;·&nbsp;
          <a href="${props.siteUrl}/datenschutz" style="color:${MUTED};text-decoration:underline;">Datenschutz</a>
        </p>
      </div>
    </div>
  </div>
</body></html>`

  return { subject: `Dein Angebot: ${PROGRAMM.tage} Tage Betreuung (${props.contractNumber})`, html }
}
