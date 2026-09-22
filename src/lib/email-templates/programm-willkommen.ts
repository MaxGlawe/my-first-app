/**
 * PROJ-26: Willkommensmail nach bezahltem Programm.
 *
 * Kommt direkt nach der Zahlung — oft noch während der Patient im Call sitzt.
 * Sie erklärt nicht das Angebot (das ist entschieden), sondern was ab jetzt
 * passiert: Plan, Check-in, Chat, Calls. Und sie sagt klar, wann es endet.
 *
 * Kein Verkauf, kein Heilversprechen (HWG), kein Abo-Vokabular.
 */

import { escapeHtml } from "@/lib/html-escape"
import { PROGRAMM, PROGRAMM_CALLS, PROGRAMM_CALL_TAKTUNG } from "@/lib/programm"

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

export interface ProgrammWillkommenProps {
  firstName: string
  /** Magiclink in die App. */
  appUrl: string
  /** Ende der Betreuung, bereits formatiert (TT.MM.JJJJ). */
  endetAm: string
  behandlerName: string
  praxisName: string
  siteUrl: string
}

export function programmWillkommenEmail(props: ProgrammWillkommenProps): {
  subject: string
  html: string
} {
  const name = escapeHtml(props.firstName)
  const behandler = escapeHtml(props.behandlerName)
  const praxis = escapeHtml(props.praxisName)

  const punkte: [string, string][] = [
    [
      "Dein persönlicher Plan",
      `${behandler} stellt ihn in den nächsten Tagen zusammen: kurze Übungen für jeden Tag und ein Trainingsplan für deine Trainingstage. Du bekommst Bescheid, sobald er bereitsteht.`,
    ],
    [
      "Täglich kurz einchecken",
      "Ein paar Fragen zu Schmerz, Schlaf und Belastung — das dauert weniger als eine Minute und zeigt uns beiden, wie es läuft. Einmal pro Woche etwas ausführlicher.",
    ],
    [
      "Chat mit deinem Behandler",
      `Fragen zwischendurch gehen direkt an ${behandler}. Antwort innerhalb von ${PROGRAMM.chatAntwortStunden} Stunden an Werktagen.`,
    ],
    [
      `${PROGRAMM_CALLS} Video-Sitzungen`,
      `${PROGRAMM_CALL_TAKTUNG.charAt(0).toUpperCase() + PROGRAMM_CALL_TAKTUNG.slice(1)}. Termine vereinbart ihr gemeinsam.`,
    ],
    [
      "Wenn es schlechter wird",
      "Melde dich — dann schieben wir eine zusätzliche Sitzung ein. Rückmeldung spätestens am nächsten Werktag.",
    ],
  ]

  const html = `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Dein Programm ist freigeschaltet</title></head>
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
          Deine Betreuung läuft
        </h1>

        <p style="font-size:15px;line-height:1.65;color:${BODY};margin:0 0 16px;">Hallo ${name},</p>
        <p style="font-size:15px;line-height:1.65;color:${BODY};margin:0 0 20px;">
          deine Zahlung ist angekommen — ab jetzt sind wir die nächsten ${PROGRAMM.tage} Tage
          gemeinsam unterwegs. Hier ist, was dich erwartet.
        </p>

        ${punkte
          .map(
            ([titel, text]) => `
        <div style="margin:0 0 16px;">
          <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:${INK};">${titel}</p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:${MUTED};">${text}</p>
        </div>`
          )
          .join("")}

        <h2 style="font-family:${SERIF};font-weight:600;font-size:17px;color:${INK};margin:26px 0 8px;">
          So kommst du rein
        </h2>
        <p style="font-size:14px;line-height:1.65;color:${MUTED};margin:0 0 16px;">
          Über den Knopf unten bist du direkt angemeldet — beim ersten Mal legst du dort dein
          eigenes Passwort fest. Danach meldest du dich ganz normal mit deiner E-Mail-Adresse
          und diesem Passwort an, auf jedem Gerät.
        </p>
        <div style="margin:0 0 14px;">
          <a href="${props.appUrl}" style="display:inline-block;background:${GREEN};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:15px 28px;border-radius:12px;">
            Passwort festlegen und starten &rarr;
          </a>
        </div>
        <p style="font-size:13px;line-height:1.6;color:${FAINT};margin:0 0 20px;">
          Dieser Link ist persönlich und nur begrenzte Zeit gültig. Deine Anmeldeseite findest du
          jederzeit unter <a href="${props.siteUrl}/login" style="color:${MUTED};">${props.siteUrl.replace(/^https?:\/\//, "")}/login</a>.
        </p>

        <div style="padding:16px 18px;background:${PAPER};border:1px solid ${LINE};border-radius:12px;margin:0 0 20px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:${BODY};">
            Deine Betreuung endet am <strong style="color:${INK};">${escapeHtml(props.endetAm)}</strong>.
            Sie läuft <strong>automatisch aus</strong> — es gibt kein Abonnement, keine
            Verlängerung und keine weitere Abbuchung. Dein Verlauf bleibt dir danach erhalten.
          </p>
        </div>

        <p style="font-size:15px;line-height:1.65;color:${BODY};margin:8px 0 0;">
          Bis gleich<br/>${behandler}<br/><span style="color:${FAINT};">${praxis}</span>
        </p>
      </div>

      <div style="padding:18px 32px 24px;border-top:1px solid ${LINE};background:#FCFAF6;">
        <p style="margin:0;font-size:12px;line-height:1.6;color:${FAINT};">
          Praxis OS ist kein Notdienst. Bei akuten Beschwerden wende dich bitte an den
          ärztlichen Notdienst oder die 112.
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

  return { subject: `Deine Betreuung läuft — willkommen bei Praxis OS`, html }
}
