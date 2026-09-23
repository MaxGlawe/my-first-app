/**
 * PROJ-27 — Einladung und Erinnerung zur digitalen Sprechstunde.
 *
 * Diese Mail ist für viele Patienten der erste Kontakt mit Praxis OS
 * überhaupt — sie kommt vor dem Konto, vor dem Vertrag, vor allem anderen.
 * Sie muss deshalb ohne Rückfrage verständlich sein.
 *
 * Aufbau nach dem, was jemand wirklich wissen will, in dieser Reihenfolge:
 * WANN, WIE KOMME ICH REIN, WAS BRAUCHE ICH, WAS WENN ETWAS DAZWISCHENKOMMT.
 *
 * Drei bewusste Entscheidungen:
 *
 *   — Der Link steht als ganze Adresse im Text und nicht nur hinter einem
 *     Knopf. Viele Mailprogramme zeigen Knöpfe nicht an, und wer die Mail
 *     vom Rechner aufs Handy weiterleitet, braucht etwas zum Antippen.
 *
 *   — „Ab fünf Minuten vorher" steht ausdrücklich da. Sonst klickt jemand
 *     am Vorabend, landet auf einer Warteseite und hält den Termin für
 *     kaputt.
 *
 *   — KEINE Angaben zur Beschwerde, auch nicht im Betreff. Eine Mail liegt
 *     auf fremden Servern und wird auf gesperrten Bildschirmen als Vorschau
 *     angezeigt. „Videotermin" genügt; worum es geht, weiss der Patient.
 */

import { formatDatum, formatUhrzeit } from "@/lib/video/termin"

export interface EinladungProps {
  vorname: string
  geplantAt: string
  dauerMinuten: number
  beitrittsUrl: string
  behandlerName: string
  praxisName: string
  siteUrl: string
  hinweis?: string | null
  /** Erinnerung statt Ersteinladung — ändert Betreff und Einstieg. */
  erinnerung?: "24h" | "1h"
}

export interface Mail {
  subject: string
  html: string
  text: string
}

const PAPER = "#F8F5F0"
const CARD = "#FFFFFF"
const INK = "#12160f"
const BODY = "#3a4038"
const MUTED = "#6b7365"
const LINE = "#e3ddd1"
const GREEN = "#2C3E2D"
const SERIF = "Georgia,'Times New Roman',serif"
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

export function sprechzimmerEinladung(props: EinladungProps): Mail {
  const name = escapeHtml(props.vorname || "")
  const datum = formatDatum(props.geplantAt)
  const uhrzeit = formatUhrzeit(props.geplantAt)

  const betreff =
    props.erinnerung === "1h"
      ? `Gleich geht es los — dein Videotermin um ${uhrzeit} Uhr`
      : props.erinnerung === "24h"
      ? `Erinnerung: dein Videotermin morgen um ${uhrzeit} Uhr`
      : `Dein Videotermin am ${datum} um ${uhrzeit} Uhr`

  const einstieg =
    props.erinnerung === "1h"
      ? `in einer Stunde sehen wir uns. Hier ist dein Zugang noch einmal.`
      : props.erinnerung === "24h"
      ? `morgen ist dein Videotermin. Damit du ihn nicht suchen musst, hier noch einmal alles auf einen Blick.`
      : `hier ist dein Termin für die Video-Sprechstunde.`

  const zeile = (bezeichnung: string, wert: string) => `
    <tr>
      <td style="padding:7px 0;font-size:13px;color:${MUTED};white-space:nowrap;vertical-align:top;width:92px;">${bezeichnung}</td>
      <td style="padding:7px 0;font-size:15px;color:${INK};font-weight:600;">${wert}</td>
    </tr>`

  const html = `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:${PAPER};">
  <div style="max-width:560px;margin:0 auto;padding:28px 16px;font-family:${SANS};">
    <div style="background:${CARD};border:1px solid ${LINE};border-radius:16px;overflow:hidden;">
      <div style="padding:28px 32px 4px;">
        <p style="margin:0;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${GREEN};font-weight:700;">
          ${props.erinnerung ? "Erinnerung" : "Einladung"}
        </p>
        <h1 style="font-family:${SERIF};font-weight:600;font-size:24px;line-height:1.25;color:${INK};margin:14px 0 0;">
          Video-Sprechstunde
        </h1>
      </div>

      <div style="padding:18px 32px 0;">
        <p style="font-size:15px;line-height:1.65;color:${BODY};margin:0 0 6px;">Hallo ${name},</p>
        <p style="font-size:15px;line-height:1.65;color:${BODY};margin:0 0 20px;">${einstieg}</p>

        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background:${PAPER};border-radius:12px;padding:0;">
          <tr><td style="padding:6px 18px;">
            <table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
              ${zeile("Wann", `${datum}<br />um ${uhrzeit} Uhr`)}
              ${zeile("Dauer", `etwa ${props.dauerMinuten} Minuten`)}
              ${zeile("Mit", escapeHtml(props.behandlerName))}
            </table>
          </td></tr>
        </table>

        <div style="margin:24px 0 8px;">
          <a href="${props.beitrittsUrl}" style="display:inline-block;background:${GREEN};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:15px 28px;border-radius:12px;">
            Zum Sprechzimmer &rarr;
          </a>
        </div>
        <p style="font-size:13px;line-height:1.6;color:${MUTED};margin:0 0 4px;">
          Falls der Knopf nicht funktioniert, öffne diese Adresse:
        </p>
        <p style="font-size:12.5px;line-height:1.6;color:${GREEN};margin:0 0 20px;word-break:break-all;">
          ${props.beitrittsUrl}
        </p>

        <div style="border-top:1px solid ${LINE};padding-top:18px;">
          <p style="font-size:14px;line-height:1.65;color:${BODY};margin:0 0 12px;">
            <strong style="color:${INK};">Der Zugang öffnet sich fünf Minuten vor Beginn.</strong>
            Vorher siehst du nur einen Hinweis — das ist richtig so. Komm ruhig ein paar Minuten
            früher, dann kannst du in Ruhe Kamera und Mikrofon prüfen.
          </p>
          <p style="font-size:14px;line-height:1.65;color:${BODY};margin:0 0 12px;">
            <strong style="color:${INK};">Was du brauchst:</strong> ein Handy, Tablet oder einen
            Computer mit Kamera und Mikrofon, dazu etwas Platz zum Bewegen. Installieren musst du
            nichts. Am besten stellst du dein Handy so auf, dass du ganz zu sehen bist, und
            suchst dir Licht von vorn.
          </p>
          ${
            props.hinweis
              ? `<p style="font-size:14px;line-height:1.65;color:${BODY};margin:0 0 12px;">
            <strong style="color:${INK};">Bitte vorbereiten:</strong> ${escapeHtml(props.hinweis)}
          </p>`
              : ""
          }
          <p style="font-size:14px;line-height:1.65;color:${BODY};margin:0 0 18px;">
            <strong style="color:${INK};">Du kannst nicht?</strong> Antworte einfach auf diese
            Mail, dann finden wir einen neuen Termin.
          </p>
        </div>
      </div>

      <div style="padding:6px 32px 26px;">
        <p style="font-size:12px;line-height:1.6;color:${MUTED};margin:0;">
          ${escapeHtml(props.praxisName)} · Die Video-Sprechstunde ist kein Notdienst. Bei starken,
          plötzlich aufgetretenen Beschwerden wende dich bitte an den ärztlichen Notdienst oder
          die 112.
        </p>
      </div>
    </div>
  </div>
</body></html>`

  const text = [
    `Hallo ${props.vorname},`,
    "",
    einstieg.replace(/<[^>]+>/g, ""),
    "",
    `Wann:  ${datum} um ${uhrzeit} Uhr`,
    `Dauer: etwa ${props.dauerMinuten} Minuten`,
    `Mit:   ${props.behandlerName}`,
    "",
    "Zum Sprechzimmer:",
    props.beitrittsUrl,
    "",
    "Der Zugang öffnet sich fünf Minuten vor Beginn. Du brauchst nichts zu installieren.",
    props.hinweis ? `\nBitte vorbereiten: ${props.hinweis}` : "",
    "",
    "Du kannst nicht? Antworte einfach auf diese Mail.",
    "",
    `${props.praxisName} — kein Notdienst. Bei akuten Beschwerden: ärztlicher Notdienst oder 112.`,
  ]
    .filter(Boolean)
    .join("\n")

  return { subject: betreff, html, text }
}
