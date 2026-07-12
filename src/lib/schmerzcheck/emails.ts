/**
 * PROJ-23: Schmerzcheck transactional + drip email templates.
 *
 * Sent via Nodemailer / SiteGround SMTP (see mailer.ts). Design follows the
 * Premium-Rebrand ("neue Welt"): Paper background, Ink text, Green CTAs, Sand
 * accent, serif headings (Georgia stack — email-safe). HWG-compact disclaimer
 * in every footer. Booking CTAs route through /api/schmerzcheck/go for
 * per-email click attribution (utm_content = email code).
 *
 * Safety rule: soft-flag / "ärztlich abklären" leads NEVER get a booking pitch.
 */

import { escapeHtml } from "@/lib/html-escape"
import { getSchmerzcheckFromEmail } from "@/lib/schmerzcheck/mailer"

// ── Brand tokens (Premium-Rebrand / Masterclass-Welt) ────────────────────────
// Exportiert, damit die Masterclass-Kampagne (emails-masterclass.ts) exakt
// dieselben Bausteine nutzt statt sie zu duplizieren.
export const C = {
  paper: "#F8F5F0",
  card: "#FFFFFF",
  ink: "#0f172a",
  body: "#334155",
  muted: "#64748b",
  faint: "#94a3b8",
  line: "#e7e1d6",
  green: "#2C3E2D",
  greenSoft: "#5b6b56",
  sand: "#C9B79C",
}
const SERIF = "Georgia,'Times New Roman',serif"
const SANS = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"

export interface ShellOpts {
  /** Extra note shown above the disclaimer (e.g. emergency line for T3). */
  footerNote?: string
  /** Show the unsubscribe link (omit for one-off transactional like T3). */
  showUnsubscribe?: boolean
  /** Real 1-click unsubscribe URL; falls back to a mailto when absent. */
  unsubscribeUrl?: string
}

export function shell(inner: string, baseUrl: string, opts: ShellOpts = {}): string {
  const showUnsub = opts.showUnsubscribe !== false
  const unsubHref = opts.unsubscribeUrl || `mailto:${getSchmerzcheckFromEmail()}?subject=Abmelden`
  return `
  <div style="background:${C.paper};padding:32px 16px;font-family:${SANS};">
    <div style="max-width:560px;margin:0 auto;background:${C.card};border:1px solid ${C.line};border-radius:18px;overflow:hidden;">
      <!-- brand accent bar -->
      <div style="height:4px;background:${C.green};"></div>
      <div style="padding:26px 32px 0;">
        <!-- inline logo via cid attachment (see mailer.ts LOGO_CID) -->
        <img src="cid:praxislogo" width="34" height="34" alt="Praxis OS" style="display:inline-block;vertical-align:middle;border-radius:50%;" />
        <span style="margin-left:9px;font-weight:600;font-size:15px;color:${C.ink};vertical-align:middle;">Praxis OS</span>
        <span style="margin-left:6px;font-size:12px;color:${C.faint};vertical-align:middle;">· Therapeut für die Hosentasche</span>
      </div>
      <div style="padding:10px 32px 28px;">
        ${inner}
      </div>
      <div style="padding:18px 32px 24px;border-top:1px solid ${C.line};background:#FCFAF6;">
        ${opts.footerNote ? `<p style="margin:0 0 10px;font-size:12px;line-height:1.6;color:${C.muted};font-weight:600;">${opts.footerNote}</p>` : ""}
        <p style="margin:0;font-size:12px;line-height:1.6;color:${C.faint};">
          Praxis OS ist ein Bildungs- und Orientierungsangebot von Max Glawe,
          Heilpraktiker für Physiotherapie. Inhalte ersetzen keine
          ärztliche Diagnose oder Heilbehandlung im Sinne des HWG.
        </p>
        <p style="margin:10px 0 0;font-size:12px;color:${C.faint};">
          <a href="${baseUrl}/impressum" style="color:${C.muted};text-decoration:underline;">Impressum</a>
          &nbsp;·&nbsp;
          <a href="${baseUrl}/datenschutz" style="color:${C.muted};text-decoration:underline;">Datenschutz</a>
          ${showUnsub ? `&nbsp;·&nbsp;<a href="${unsubHref}" style="color:${C.muted};text-decoration:underline;">Abmelden</a>` : ""}
        </p>
      </div>
    </div>
  </div>`
}

/** Serif headline (email-safe Georgia stack), evokes the rebrand display font. */
export function heading(text: string): string {
  return `<h1 style="font-family:${SERIF};font-weight:600;font-size:23px;line-height:1.25;color:${C.green};margin:18px 0 14px;">${text}</h1>`
}

export function para(text: string): string {
  return `<p style="font-size:15px;line-height:1.65;color:${C.body};margin:0 0 16px;">${text}</p>`
}

export function ctaButton(label: string, href: string): string {
  return `
    <a href="${href}" style="display:inline-block;background:${C.green};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:15px 28px;border-radius:12px;">
      ${label}
    </a>`
}

/**
 * Preis-Block des aktuellen Angebots (Masterclass, seit 07/2026).
 *
 * Aufbau nach Spec B3: Anker → Preis → Begleitung GLEICHWERTIG → Klarna.
 * Die Begleitung wird bewusst nicht als Zugabe geframt — sie begründet den Preis.
 * Das alte Angebot (69 € Video-Analyse + 16,99 €/Monat) ist abgelöst.
 */
function priceNote(): string {
  return `<p style="font-size:13px;line-height:1.7;color:${C.muted};margin:8px 0 12px;">
    <span style="text-decoration:line-through;color:${C.faint};">499 €</span>
    <strong style="color:${C.ink};font-size:15px;">&nbsp;399 €</strong> · einmalig · lebenslanger Kurszugriff<br/>
    <strong style="color:${C.ink};">inkl. 3 Monate persönliche Begleitung per App</strong><br/>
    <span style="color:${C.faint};">oder 3 × 133 € mit Klarna — ohne Aufpreis</span>
  </p>`
}

/** Low-emphasis fallback link to the report — sits UNDER the booking CTA from D3 on. */
function reportSecondaryLink(reportUrl: string): string {
  return `<p style="font-size:13px;line-height:1.6;color:${C.muted};margin:0 0 4px;">Lieber erst nochmal nachlesen? <a href="${reportUrl}" style="color:${C.green};text-decoration:underline;">Hier geht's zu deinem Report →</a></p>`
}

export function signoff(): string {
  return `<p style="font-size:15px;line-height:1.65;color:${C.body};margin:8px 0 0;">Herzliche Grüße<br/>Max Glawe<br/><span style="color:${C.faint};">Praxis OS</span></p>`
}

/**
 * Getrackter Angebots-Link (Klick-Attribution je Mail via /api/schmerzcheck/go).
 * Zielt seit 07/2026 auf die Masterclass-Salespage statt auf den externen
 * Video-Analyse-Kalender — `t=salespage` steuert das Ziel.
 */
function offerGo(baseUrl: string, token: string, code: string): string {
  return `${baseUrl}/api/schmerzcheck/go?e=${code}&t=salespage&u=${encodeURIComponent(token)}`
}

// ── T1 — Welcome / Double-Opt-in ─────────────────────────────────────────────

interface T1Args {
  firstName: string
  /** Double-Opt-in confirm link (Phase 2: starts the check). */
  checkUrl: string
  baseUrl: string
}

export function renderT1WelcomeEmail({ firstName, checkUrl, baseUrl }: T1Args): string {
  const name = escapeHtml(firstName)
  const inner = `
    ${heading("Dein Schmerzcheck ist bereit.")}
    <p style="font-size:16px;color:${C.ink};margin:0 0 14px;">Hallo ${name},</p>
    ${para("dein 5-Minuten-Schmerzcheck wartet auf dich. Wir haben ihn so gebaut, dass er dich nicht überfordert — 15 Fragen, klar gestellt, ehrlich auswertbar.")}
    <p style="font-size:15px;line-height:1.65;color:${C.body};margin:0 0 8px;font-weight:600;">Was dich erwartet:</p>
    <ul style="font-size:15px;line-height:1.7;color:${C.body};margin:0 0 22px;padding-left:20px;">
      <li>4–6 Minuten Zeit</li>
      <li>15 strukturierte Fragen</li>
      <li>Ein persönlicher Report direkt im Anschluss</li>
    </ul>
    <div style="margin:0 0 22px;">${ctaButton("Schmerzcheck jetzt starten", checkUrl)}</div>
    ${para("Solltest du beim Ausfüllen unsicher sein: antworte einfach so ehrlich, wie du kannst. Es gibt keine richtigen oder falschen Antworten.")}
    ${para("Wenn du den Check später machen möchtest: speichere diese Mail. Der Link bleibt 30 Tage gültig.")}
    <p style="font-size:15px;line-height:1.65;color:${C.body};margin:0;">
      Bis gleich,<br/>Max Glawe<br/>
      <span style="color:${C.faint};">Praxis OS · Therapeut für die Hosentasche</span>
    </p>`
  return shell(inner, baseUrl)
}

// ── T2 — Report delivered (+ optional dezenter Analyse-Hinweis) ───────────────

interface T2Args {
  firstName: string
  reportUrl: string
  baseUrl: string
  unsubscribeUrl?: string
  /** Lead token — enables the tracked secondary analyse hint. */
  token?: string
  /** Soft-flag leads get NO booking hint (safety). */
  softFlag?: boolean
}

export function renderT2ReportEmail({ firstName, reportUrl, baseUrl, unsubscribeUrl, token, softFlag }: T2Args): string {
  const name = escapeHtml(firstName)
  const showHint = !softFlag && !!token
  const hint = showHint
    ? `
    <div style="margin:24px 0 4px;padding-top:18px;border-top:1px solid ${C.line};">
      <p style="font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${C.sand};margin:0 0 6px;">Du musst da nicht allein durch</p>
      <p style="font-size:15px;line-height:1.65;color:${C.body};margin:0 0 14px;">
        Dein Report zeigt dir, wo du stehst. Den Weg dorthin musst du aber nicht allein gehen:
        In der <strong style="color:${C.ink};">Masterclass</strong> verstehst du, was bei dir passiert —
        und hast <strong style="color:${C.ink};">3 Monate lang jemanden an deiner Seite</strong>, der mitliest
        und dein Programm anpasst. Direkt auf deinem Handy.
      </p>
      <div style="margin:0 0 4px;">${ctaButton("Die Masterclass ansehen", offerGo(baseUrl, token!, "T2"))}</div>
      ${priceNote()}
    </div>`
    : ""
  const inner = `
    ${heading("Dein Schmerz-Report ist fertig.")}
    <p style="font-size:16px;color:${C.ink};margin:0 0 14px;">Hallo ${name},</p>
    ${para("danke, dass du dir die Zeit genommen hast. Dein Report liegt als PDF im Anhang dieser Mail — und online unter dem Link unten.")}
    <p style="font-size:15px;line-height:1.65;color:${C.body};margin:0 0 8px;font-weight:600;">Was im Report drinsteht:</p>
    <ul style="font-size:15px;line-height:1.7;color:${C.body};margin:0 0 22px;padding-left:20px;">
      <li>Deine persönliche Standortbestimmung</li>
      <li>Was deine Antworten über dein Bewegungsmuster zeigen</li>
      <li>Eine 7-Tage-Bewegungs-Roadmap, abgestimmt auf deinen Bereich</li>
      <li>Eine klare Empfehlung für deinen nächsten Schritt</li>
    </ul>
    <div style="margin:0 0 22px;">${ctaButton("Report ansehen", reportUrl)}</div>
    ${para("Nimm dir 10–15 Minuten Zeit. Der Report ist so gebaut, dass du etwas mitnimmst, nicht dass du dich durchklickst.")}
    ${para("Wenn etwas unklar ist — antworte einfach auf diese Mail. Ich lese mit.")}
    ${signoff()}
    ${hint}`
  return shell(inner, baseUrl, { unsubscribeUrl })
}

// ── T3 — Red flag (NO marketing, NO unsubscribe, physician referral) ─────────

interface T3Args {
  firstName: string
  baseUrl: string
}

export function renderT3RedFlagEmail({ firstName, baseUrl }: T3Args): string {
  const name = escapeHtml(firstName)
  const inner = `
    ${heading("Ein wichtiger Hinweis zu deinem Check.")}
    <p style="font-size:16px;color:${C.ink};margin:0 0 14px;">Hallo ${name},</p>
    ${para("danke, dass du den Schmerzcheck gemacht hast. Auf Basis deiner Antworten gibt es einen Punkt, den ich dir direkt sagen möchte:")}
    <div style="border:1px solid #fecaca;background:#fef2f2;border-radius:12px;padding:16px 18px;margin:0 0 18px;">
      <p style="font-size:15px;line-height:1.65;color:${C.ink};margin:0;font-weight:600;">
        Bitte lass deine Beschwerden zeitnah ärztlich abklären, bevor du mit
        Bewegungs-Routinen oder Therapie startest.
      </p>
    </div>
    ${para("Manche Anzeichen — die du in deinen Antworten genannt hast — können auf etwas hinweisen, was nur ein Arzt einordnen kann. Das hat nichts mit Panik zu tun. Das ist einfach der nächste richtige Schritt.")}
    <p style="font-size:15px;line-height:1.65;color:${C.body};margin:0 0 8px;font-weight:600;">Konkret:</p>
    <ol style="font-size:15px;line-height:1.7;color:${C.body};margin:0 0 22px;padding-left:20px;">
      <li>Vereinbare einen Termin bei deinem Hausarzt — die Woche, idealerweise.</li>
      <li>Bei sehr starken oder plötzlich aufgetretenen Beschwerden: Bereitschaftsdienst 116 117 oder direkt in eine Notaufnahme.</li>
    </ol>
    ${para("Wir wünschen dir alles Gute. Wenn ärztlich abgeklärt ist, was los ist, kannst du den Schmerzcheck gerne nochmal machen — und wir helfen dir dann, einen passenden Bewegungsweg zu finden.")}
    <p style="font-size:15px;line-height:1.65;color:${C.body};margin:0;">
      Pass auf dich auf,<br/>Max Glawe<br/>
      <span style="color:${C.faint};">Praxis OS</span>
    </p>`
  return shell(inner, baseUrl, {
    showUnsubscribe: false,
    footerNote: "Diese Mail ersetzt keinen medizinischen Notruf. Bei akuter Lebensgefahr: 112.",
  })
}

// ── Check-Reminder R1–R2 (Lead bestätigt, Check nicht abgeschlossen) ─────────
// Nur an consent_status=confirmed-Leads (DOI gegeben), die awaiting_check /
// check_started sind. Holt Abschlüsse zurück. Sanft, transaktional gehalten.

export interface ReminderArgs {
  step: 1 | 2
  firstName: string
  /** Resume/Start the check (token-gated /check/start). */
  checkUrl: string
  baseUrl: string
  unsubscribeUrl: string
}

export function renderReminderEmail(args: ReminderArgs): { subject: string; html: string } {
  const name = escapeHtml(args.firstName)
  const hi = `<p style="font-size:16px;color:${C.ink};margin:0 0 14px;">Hallo ${name},</p>`
  const opts = { unsubscribeUrl: args.unsubscribeUrl }
  let subject = ""
  let inner = ""

  if (args.step === 1) {
    subject = "Dein Schmerzcheck wartet noch auf dich"
    inner =
      heading("Nur 5 Minuten bis zu deinem Report.") +
      hi +
      para("du hast deinen Schmerzcheck begonnen, aber noch nicht abgeschlossen — schade, denn dein persönlicher Report liegt schon bereit.") +
      para("Es sind nur 15 kurze Fragen, rund 5 Minuten. Danach bekommst du sofort deine persönliche Standortbestimmung.") +
      `<div style="margin:6px 0 0;">${ctaButton("Schmerzcheck jetzt abschließen", args.checkUrl)}</div>` +
      `<div style="margin-top:18px;">${signoff()}</div>`
  } else {
    subject = "5 Minuten, die du dir wert bist"
    inner =
      heading("Dein Report ist nur einen Schritt entfernt.") +
      hi +
      para("manchmal kommt der Alltag dazwischen — völlig normal. Dein Schmerzcheck steht aber weiterhin für dich bereit.") +
      para("Nimm dir kurz die 5 Minuten. Du bekommst eine ehrliche Einordnung, wo du gerade stehst — ohne Floskeln.") +
      `<div style="margin:6px 0 0;">${ctaButton("Jetzt abschließen", args.checkUrl)}</div>` +
      para("Falls der Check für dich gerade nicht passt, ignoriere diese Mail einfach — wir melden uns dann nicht weiter dazu.") +
      `<div style="margin-top:6px;">${signoff()}</div>`
  }

  return { subject, html: shell(inner, args.baseUrl, opts) }
}

// ── Drip sequence D1–D5 ──────────────────────────────────────────────────────
// Moderate push: D1/D2 educate + plant the analyse seed (soft bridge), D3 sells,
// D4 last-call, D5 handles objections. Soft-flag leads NEVER get a booking CTA
// (the cron also skips D3 + D5 for them).

export interface DripArgs {
  step: 1 | 2 | 3 | 4 | 5
  firstName: string
  reportUrl: string
  /** Lead token — used to build tracked booking links. */
  token: string
  baseUrl: string
  unsubscribeUrl: string
  softFlag: boolean
}

export function renderDripEmail(args: DripArgs): { subject: string; html: string } {
  const name = escapeHtml(args.firstName)
  const hi = `<p style="font-size:16px;color:${C.ink};margin:0 0 14px;">Hallo ${name},</p>`
  const opts = { unsubscribeUrl: args.unsubscribeUrl }
  const offer = (code: string) => offerGo(args.baseUrl, args.token, code)

  // Angebots-Brücke (D1). Für soft-flag-Leads („ärztlich abklären") wird sie
  // ausgelassen — kein Angebot bei ungeklärten Warnzeichen. D3 und D5 überspringt
  // der Cron für sie komplett.
  const softBridge = (code: string) =>
    args.softFlag
      ? ""
      : `<div style="margin:22px 0 0;padding-top:18px;border-top:1px solid ${C.line};">
           <p style="font-size:15px;line-height:1.6;color:${C.body};margin:0 0 12px;">
             Du musst das nicht allein herausfinden. In der Masterclass verstehst du, was bei dir passiert — und hast 3 Monate lang jemanden an deiner Seite, der mitliest und dein Übungsprogramm anpasst.
           </p>
           <div style="margin:0 0 4px;">${ctaButton("Die Masterclass ansehen", offer(code))}</div>
           ${priceNote()}
         </div>`

  let subject = ""
  let inner = ""

  if (args.step === 1) {
    subject = "Schmerz ist nicht gleich Schaden — was das für dich heißt"
    inner =
      heading("Schmerz ist nicht gleich Schaden.") +
      hi +
      para("ein Gedanke, der vielen hilft: Schmerz ist nicht immer ein Maß für Schaden. Häufig ist er eher ein Warnsignal deines Nervensystems — und das lässt sich beeinflussen.") +
      para("Genau deshalb ist sanfte, regelmäßige Bewegung so zentral: Sie gibt deinem Körper die Rückmeldung, dass Bewegung sicher ist.") +
      para("In deinem Report findest du drei kleine Bausteine, die genau dort ansetzen.") +
      `<div style="margin:6px 0 4px;">${ctaButton("Deinen Report ansehen", args.reportUrl)}</div>` +
      softBridge("D1") +
      `<div style="margin-top:18px;">${signoff()}</div>`
  } else if (args.step === 2) {
    subject = "Erkennst du dich in diesem Muster wieder?"
    const lead2 =
      heading("Erkennst du dich wieder?") +
      hi +
      para("viele, die ihren Schmerzcheck gemacht haben, erkennen sich in einem Muster wieder: Der Alltag wird vorsichtiger, Bewegungen werden vermieden — und genau das hält den Kreislauf oft in Gang.")
    if (args.softFlag) {
      inner =
        lead2 +
        para("Deine Standortbestimmung zeigt dir, wo du auf diesem Weg gerade stehst. Der nächste Schritt ist meist kleiner, als man denkt.") +
        `<div style="margin:6px 0 4px;">${ctaButton("Nochmal in den Report schauen", args.reportUrl)}</div>` +
        `<div style="margin-top:18px;">${signoff()}</div>`
    } else {
      inner =
        lead2 +
        para("Diesen Kreislauf allein zu durchbrechen ist schwer — nicht weil dir Disziplin fehlt, sondern weil dir jemand fehlt, der von außen draufschaut. Genau dafür ist die Masterclass gebaut: 27 Lektionen zum Verstehen, dazu 3 Monate persönliche Begleitung per App, in denen ich dein Programm an dich anpasse.") +
        `<div style="margin:6px 0 0;">${ctaButton("Die Masterclass ansehen", offer("D2"))}</div>` +
        priceNote() +
        reportSecondaryLink(args.reportUrl) +
        signoff()
    }
  } else if (args.step === 3) {
    subject = "Was in den 3 Monaten Begleitung passiert"
    inner =
      heading("Der Teil, über den kaum jemand spricht.") +
      hi +
      para("die meisten Kurse geben dir Inhalte und lassen dich damit allein. Genau daran scheitert es meistens — nicht am Wissen, sondern an den Fragen, die unterwegs auftauchen.") +
      para("Deshalb sind in der Masterclass <strong style=\"color:" + C.ink + "\">3 Monate persönliche Begleitung</strong> fester Bestandteil, kein Beiwerk:") +
      `<ul style="font-size:15px;line-height:1.75;color:${C.body};margin:0 0 22px;padding-left:20px;">
         <li><strong style="color:${C.ink};">Direkter Draht per Chat</strong> — du schreibst mir, ich antworte innerhalb von 48 h werktags</li>
         <li><strong style="color:${C.ink};">Ein Übungsprogramm, das zu dir passt</strong> — nicht von der Stange</li>
         <li><strong style="color:${C.ink};">Verlaufskontrolle</strong> — du siehst, was sich über die Wochen verändert</li>
         <li><strong style="color:${C.ink};">Workbook synchron in der App</strong> — kein Zettelchaos</li>
       </ul>` +
      para("Die 27 Lektionen und das Kartendeck bleiben dir dauerhaft — auch nach den drei Monaten.") +
      `<div style="margin:6px 0 0;">${ctaButton("Ansehen, was enthalten ist", offer("D3"))}</div>` +
      priceNote() +
      reportSecondaryLink(args.reportUrl) +
      signoff()
  } else if (args.step === 4) {
    if (args.softFlag) {
      subject = "Glückwunsch zu deinem Schritt"
      inner =
        heading("Du hast den wichtigsten Schritt schon gemacht.") +
        hi +
        para("du hast etwas getan, das die meisten aufschieben: hingeschaut. Das ist der wichtigste Schritt.") +
        para("Wenn du magst, antworte einfach auf diese Mail — wir helfen dir, den passenden nächsten Schritt zu finden.") +
        signoff()
    } else {
      subject = "„Kann ich das nicht auch allein hinbekommen?“"
      inner =
        heading("Die Frage, die ich am häufigsten höre.") +
        hi +
        para("kurze, ehrliche Antwort: vielleicht. Manche schaffen das allein. Wenn du es allerdings schon länger allein versuchst und immer wieder an derselben Stelle landest, dann fehlt dir nicht Disziplin — dann fehlt jemand, der von außen draufschaut.") +
        para("Genau deshalb sind die <strong style=\"color:" + C.ink + "\">3 Monate Begleitung</strong> der Kern der Masterclass. Du schickst mir, was dich beschäftigt. Ich ordne es ein und passe dein Programm an. Du musst nicht raten, ob du gerade das Richtige tust.") +
        para("Was ich dir nicht verspreche: dass du danach beschwerdefrei bist. Das kann seriös niemand. Die Masterclass ersetzt weder Arzt noch Therapie — sie hilft dir zu verstehen, was bei dir los ist, und gibt dir einen Weg, der zu dir passt.") +
        `<div style="margin:6px 0 0;">${ctaButton("Zur Masterclass", offer("D4"))}</div>` +
        priceNote() +
        reportSecondaryLink(args.reportUrl) +
        signoff()
    }
  } else {
    // D5 — Einwände + letzter Anstoß. Der Cron überspringt D5 für soft-flag-Leads.
    subject = "„Lohnt sich das für mich?\" — drei ehrliche Antworten"
    inner =
      heading("„Lohnt sich das für mich?“") +
      hi +
      para("bevor du das Thema zur Seite legst, drei Fragen, die mir oft gestellt werden:") +
      `<p style="font-size:15px;line-height:1.65;color:${C.body};margin:0 0 10px;"><strong style="color:${C.ink};">„Wie schnell antwortest du?“</strong><br/>Innerhalb von 48 Stunden werktags. Das ist eine Zusage, die ich halten kann — keine Rund-um-die-Uhr-Erreichbarkeit. Für akute Beschwerden ist der Chat nicht der richtige Ort.</p>` +
      `<p style="font-size:15px;line-height:1.65;color:${C.body};margin:0 0 10px;"><strong style="color:${C.ink};">„Was passiert nach den 3 Monaten?“</strong><br/>Die Begleitung endet automatisch. Kein Abo, das sich still verlängert, nichts wird abgebucht. Die Lektionen, das Workbook und das Kartendeck behältst du dauerhaft.</p>` +
      `<p style="font-size:15px;line-height:1.65;color:${C.body};margin:0 0 18px;"><strong style="color:${C.ink};">„Ersetzt das meine Therapie?“</strong><br/>Nein. Die Masterclass ist ein Bildungs- und Orientierungsangebot. Sie ersetzt weder eine ärztliche Abklärung noch eine laufende Therapie — sie kann sie ergänzen.</p>` +
      para("Du hast den ersten Schritt längst gemacht. Wenn du weitergehen willst:") +
      `<div style="margin:6px 0 0;">${ctaButton("Zur Masterclass", offer("D5"))}</div>` +
      priceNote() +
      reportSecondaryLink(args.reportUrl) +
      signoff()
  }

  return { subject, html: shell(inner, args.baseUrl, opts) }
}

// ── W1 — Win-back / Re-Engagement ────────────────────────────────────────────
// Einmalig, frühestens ~14 Tage nach Check-Abschluss (deutlich nach D5). Holt
// alte Nicht-Käufer mit der neuen Positionierung zurück ("wir haben es
// überarbeitet"). Der Cron sendet NUR an buchungs-berechtigte Leads (kein
// soft-flag) und nie während eines laufenden Drips.

export interface WinbackArgs {
  firstName: string
  reportUrl: string
  token: string
  baseUrl: string
  unsubscribeUrl: string
}

export function renderWinbackEmail(args: WinbackArgs): { subject: string; html: string } {
  const name = escapeHtml(args.firstName)
  const hi = `<p style="font-size:16px;color:${C.ink};margin:0 0 14px;">Hallo ${name},</p>`
  const subject = "Letzte Mail dazu von mir"
  const inner =
    heading("Ich habe nochmal an dich gedacht.") +
    hi +
    para("vor einer Weile hast du deinen Schmerzcheck gemacht. Ich weiß nicht, wo du gerade stehst — vielleicht hat sich etwas getan, vielleicht ist alles beim Alten.") +
    para("Falls Letzteres: Die <strong style=\"color:" + C.ink + "\">Masterclass</strong> ist genau für den Punkt gebaut, an dem man allein nicht weiterkommt. 27 Lektionen zum Verstehen, ein Workbook, ein Kartendeck — und <strong style=\"color:" + C.ink + "\">3 Monate persönliche Begleitung per App</strong>, in denen ich dein Programm an dich anpasse und du mir schreiben kannst, wenn etwas hakt.") +
    `<div style="margin:6px 0 0;">${ctaButton("Die Masterclass ansehen", offerGo(args.baseUrl, args.token, "W1"))}</div>` +
    priceNote() +
    reportSecondaryLink(args.reportUrl) +
    para("Das ist meine letzte Mail dazu — danach lasse ich dich damit in Ruhe. Falls es gerade nicht passt, ist das völlig in Ordnung.") +
    signoff()
  return { subject, html: shell(inner, args.baseUrl, { unsubscribeUrl: args.unsubscribeUrl }) }
}
