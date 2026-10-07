/**
 * PROJ-29 — Die Mail zum Kostenvoranschlag.
 *
 * Sie hat zwei Leser, und das bestimmt den ganzen Text:
 *
 *   1. DER PATIENT. Er will wissen, was es kostet und was er jetzt tun soll.
 *
 *   2. SEINE VERSICHERUNG. Denn er wird genau diese Mail weiterleiten — das
 *      ist der schnellste Weg, und niemand lädt vorher ein PDF herunter, um
 *      es neu anzuhängen.
 *
 * Deshalb steht hier nichts, was ein Sachbearbeiter nicht lesen soll, und
 * nichts, was ihm fehlt: Nummer, Betrag, Gültigkeit, Diagnose, die
 * Rechtsgrundlage und der ausdrückliche Satz, dass dies keine Rechnung ist.
 *
 * Kein Du. Der Rest von Praxis OS duzt, hier nicht: Das Blatt geht an eine
 * Versicherung, und die Mail daneben soll denselben Ton haben wie das
 * Dokument.
 */

export interface KostenvoranschlagMailProps {
  empfaengerName: string
  nummer: string
  summe: number
  gueltigBis: string | null
  diagnose: string | null
  variantenName: string
  praxisName: string
  behandlerName: string
  praxisTelefon?: string | null
  praxisEmail?: string | null
}

const PAPER = "#F8F5F0"
const CARD = "#FFFFFF"
const INK = "#12160f"
const BODY = "#3a4038"
const MUTED = "#6b7365"
const LINE = "#e3ddd1"
const GREEN = "#2C3E2D"
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"

function euro(n: number): string {
  return n.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
}

function datum(iso: string | null): string | null {
  if (!iso) return null
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function kostenvoranschlagEmail(p: KostenvoranschlagMailProps): {
  subject: string
  html: string
  text: string
} {
  const bis = datum(p.gueltigBis)
  const anrede = p.empfaengerName.trim().split(" ")[0]
    ? `Guten Tag ${escapeHtml(p.empfaengerName.trim())},`
    : "Guten Tag,"

  const subject = `Ihr Kostenvoranschlag ${p.nummer} — ${p.praxisName}`

  const zeile = (bezeichnung: string, wert: string) => `
    <tr>
      <td style="padding:7px 0;font-size:13px;color:${MUTED};white-space:nowrap;vertical-align:top;width:120px;">${bezeichnung}</td>
      <td style="padding:7px 0;font-size:13px;color:${INK};font-weight:600;">${wert}</td>
    </tr>`

  const html = `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8"></head>
<body style="margin:0;background:${PAPER};">
  <div style="max-width:600px;margin:0 auto;padding:28px 16px;font-family:${SANS};">
    <div style="background:${CARD};border:1px solid ${LINE};border-radius:16px;overflow:hidden;">

      <div style="padding:26px 32px 0;">
        <p style="font-size:13px;color:${MUTED};margin:0 0 4px;">${escapeHtml(p.praxisName)}</p>
        <h1 style="font-size:21px;color:${INK};margin:0 0 18px;font-weight:700;">Ihr Kostenvoranschlag</h1>
      </div>

      <div style="padding:0 32px;">
        <p style="font-size:14px;line-height:1.65;color:${BODY};margin:0 0 16px;">
          ${anrede}<br><br>
          im Anhang finden Sie den Kostenvoranschlag für
          <strong style="color:${INK};">${escapeHtml(p.variantenName)}</strong>.
          Er listet die geplanten Leistungen einzeln nach dem Gebührenverzeichnis für
          Heilpraktiker auf.
        </p>

        <div style="border-top:1px solid ${LINE};border-bottom:1px solid ${LINE};padding:6px 0;margin:0 0 18px;">
          <table style="width:100%;border-collapse:collapse;">
            ${zeile("Nummer", escapeHtml(p.nummer))}
            ${zeile("Gesamtbetrag", euro(p.summe))}
            ${bis ? zeile("Gültig bis", bis) : ""}
            ${p.diagnose ? zeile("Diagnose", escapeHtml(p.diagnose)) : ""}
          </table>
        </div>

        <div style="background:#f1f5f9;border-radius:10px;padding:14px 16px;margin:0 0 18px;">
          <p style="font-size:13px;line-height:1.6;color:${INK};margin:0 0 5px;font-weight:600;">
            Dies ist keine Rechnung
          </p>
          <p style="font-size:13px;line-height:1.6;color:${BODY};margin:0;">
            Die aufgeführten Leistungen sind geplant und noch nicht erbracht. Es ist nichts
            zu zahlen.
          </p>
        </div>

        <p style="font-size:14px;line-height:1.65;color:${BODY};margin:0 0 16px;">
          <strong style="color:${INK};">Wenn Sie eine Erstattung prüfen lassen möchten:</strong>
          Sie können diese E-Mail mit dem Anhang direkt an Ihre private Krankenversicherung,
          Ihre Beihilfestelle oder Ihre Heilpraktiker-Zusatzversicherung weiterleiten und um
          eine Kostenübernahmeerklärung bitten.
        </p>

        <p style="font-size:13px;line-height:1.6;color:${MUTED};margin:0 0 18px;">
          Gesetzliche Krankenkassen erstatten Leistungen von Heilpraktikern grundsätzlich
          nicht. Bei privater Versicherung, Beihilfe oder Zusatzversicherung hängt die
          Erstattung vom jeweiligen Tarif ab; eine Zusicherung können wir nicht geben.
          Heilkundliche Leistung, umsatzsteuerfrei nach § 4 Nr. 14a UStG.
        </p>

        <p style="font-size:14px;line-height:1.65;color:${BODY};margin:0 0 22px;">
          Haben Sie Fragen dazu? Antworten Sie einfach auf diese E-Mail.
        </p>

        <p style="font-size:14px;line-height:1.65;color:${BODY};margin:0 0 26px;">
          Freundliche Grüße<br>
          <strong style="color:${INK};">${escapeHtml(p.behandlerName)}</strong>
        </p>
      </div>

      <div style="padding:0 32px 26px;">
        <p style="font-size:12px;line-height:1.6;color:${MUTED};margin:0;border-top:1px solid ${LINE};padding-top:14px;">
          ${escapeHtml(p.praxisName)}${p.praxisTelefon ? ` · Tel. ${escapeHtml(p.praxisTelefon)}` : ""}${
            p.praxisEmail ? ` · ${escapeHtml(p.praxisEmail)}` : ""
          }
        </p>
      </div>
    </div>
    <p style="text-align:center;font-size:11px;color:${MUTED};margin:16px 0 0;">
      <span style="color:${GREEN};">●</span> Praxis OS
    </p>
  </div>
</body></html>`

  const textZeilen: (string | null)[] = [
    anrede.replace(/<[^>]+>/g, ""),
    "",
    `im Anhang finden Sie den Kostenvoranschlag für ${p.variantenName}. Er listet die`,
    `geplanten Leistungen einzeln nach dem Gebührenverzeichnis für Heilpraktiker auf.`,
    "",
    `Nummer:       ${p.nummer}`,
    `Gesamtbetrag: ${euro(p.summe)}`,
    bis ? `Gültig bis:   ${bis}` : null,
    p.diagnose ? `Diagnose:     ${p.diagnose}` : null,
    "",
    "DIES IST KEINE RECHNUNG. Die aufgeführten Leistungen sind geplant und noch nicht",
    "erbracht. Es ist nichts zu zahlen.",
    "",
    "Wenn Sie eine Erstattung prüfen lassen möchten: Sie können diese E-Mail mit dem",
    "Anhang direkt an Ihre private Krankenversicherung, Ihre Beihilfestelle oder Ihre",
    "Heilpraktiker-Zusatzversicherung weiterleiten und um eine Kostenübernahmeerklärung",
    "bitten.",
    "",
    "Gesetzliche Krankenkassen erstatten Leistungen von Heilpraktikern grundsätzlich",
    "nicht. Bei privater Versicherung, Beihilfe oder Zusatzversicherung hängt die",
    "Erstattung vom jeweiligen Tarif ab; eine Zusicherung können wir nicht geben.",
    "Heilkundliche Leistung, umsatzsteuerfrei nach § 4 Nr. 14a UStG.",
    "",
    "Haben Sie Fragen dazu? Antworten Sie einfach auf diese E-Mail.",
    "",
    "Freundliche Grüße",
    p.behandlerName,
    "",
    [p.praxisName, p.praxisTelefon ? `Tel. ${p.praxisTelefon}` : "", p.praxisEmail ?? ""]
      .filter(Boolean)
      .join(" · "),
  ]

  // `null` heisst "Zeile entfaellt", `""` ist eine gewollte Leerzeile.
  // Vorher filterte hier `!== ""` — und zog damit saemtliche Absaetze aus der
  // Nur-Text-Fassung heraus. Uebrig blieb eine Textwand.
  const text = textZeilen.filter((z) => z !== null).join("\n")

  return { subject, html, text }
}
