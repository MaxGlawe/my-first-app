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
const C = {
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

interface ShellOpts {
  /** Extra note shown above the disclaimer (e.g. emergency line for T3). */
  footerNote?: string
  /** Show the unsubscribe link (omit for one-off transactional like T3). */
  showUnsubscribe?: boolean
  /** Real 1-click unsubscribe URL; falls back to a mailto when absent. */
  unsubscribeUrl?: string
}

function shell(inner: string, baseUrl: string, opts: ShellOpts = {}): string {
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
function heading(text: string): string {
  return `<h1 style="font-family:${SERIF};font-weight:600;font-size:23px;line-height:1.25;color:${C.green};margin:18px 0 14px;">${text}</h1>`
}

function para(text: string): string {
  return `<p style="font-size:15px;line-height:1.65;color:${C.body};margin:0 0 16px;">${text}</p>`
}

function ctaButton(label: string, href: string): string {
  return `
    <a href="${href}" style="display:inline-block;background:${C.green};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:15px 28px;border-radius:12px;">
      ${label}
    </a>`
}

function priceNote(): string {
  return `<p style="font-size:12px;line-height:1.5;color:${C.faint};margin:8px 0 12px;">69 € Erstanalyse · anschließend optionale Betreuung 16,99 €/Monat · monatlich kündbar</p>`
}

/** Low-emphasis fallback link to the report — sits UNDER the booking CTA from D3 on. */
function reportSecondaryLink(reportUrl: string): string {
  return `<p style="font-size:13px;line-height:1.6;color:${C.muted};margin:0 0 4px;">Lieber erst nochmal nachlesen? <a href="${reportUrl}" style="color:${C.green};text-decoration:underline;">Hier geht's zu deinem Report →</a></p>`
}

function signoff(): string {
  return `<p style="font-size:15px;line-height:1.65;color:${C.body};margin:8px 0 0;">Herzliche Grüße<br/>Max Glawe<br/><span style="color:${C.faint};">Praxis OS</span></p>`
}

/** Tracked booking link (per-email click attribution via /api/schmerzcheck/go). */
function bookingGo(baseUrl: string, token: string, code: string): string {
  return `${baseUrl}/api/schmerzcheck/go?e=${code}&u=${encodeURIComponent(token)}`
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
      <p style="font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${C.sand};margin:0 0 6px;">Wenn du Klarheit willst</p>
      <p style="font-size:15px;line-height:1.65;color:${C.body};margin:0 0 14px;">
        Dein Report zeigt dir, wo du stehst. Wenn du wissen willst, was bei <em>dir</em>
        konkret dran ist, schaut sich ein Therapeut in einer Video-Analyse deine Bewegung an —
        30 Minuten, persönlich.
      </p>
      <div style="margin:0 0 4px;">${ctaButton("Video-Analyse buchen (69 €)", bookingGo(baseUrl, token!, "T2"))}</div>
      <p style="font-size:12px;line-height:1.5;color:${C.faint};margin:8px 0 0;">30 Min. per Video · fachliche Einordnung deiner Antworten · monatlich kündbar</p>
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
  const book = (code: string) => bookingGo(args.baseUrl, args.token, code)

  // Booking bridge to the analyse (used in D1, never for soft-flag).
  // Solid button + price note — the earlier ghost link barely got clicked.
  const softBridge = (code: string) =>
    args.softFlag
      ? ""
      : `<div style="margin:22px 0 0;padding-top:18px;border-top:1px solid ${C.line};">
           <p style="font-size:15px;line-height:1.6;color:${C.body};margin:0 0 12px;">
             Du willst nicht allein herumprobieren? In einer 30-minütigen Video-Analyse ordnet ein Therapeut deine Standortbestimmung ein und zeigt dir konkret deinen nächsten Schritt.
           </p>
           <div style="margin:0 0 4px;">${ctaButton("Jetzt Analyse-Gespräch buchen", book(code))}</div>
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
        para("Diesen Kreislauf allein zu durchbrechen ist schwer. Genau dafür gibt es die Video-Analyse: Ein Therapeut ordnet deine Standortbestimmung ein und zeigt dir konkret den nächsten Schritt — meist kleiner, als du denkst.") +
        `<div style="margin:6px 0 0;">${ctaButton("Jetzt Analyse-Gespräch buchen", book("D2"))}</div>` +
        priceNote() +
        reportSecondaryLink(args.reportUrl) +
        signoff()
    }
  } else if (args.step === 3) {
    subject = "30 Minuten, die dir wochenlanges Ausprobieren ersparen"
    inner =
      heading("30 Minuten, die Klarheit bringen.") +
      hi +
      para("manchmal kommt man allein nur bis zu einem Punkt. Dann bringt ein gezielter Blick von außen mehr als wochenlanges Ausprobieren.") +
      para("Buch dir jetzt dein <strong style=\"color:" + C.ink + "\">gezieltes 30-Minuten-Analyse-Gespräch</strong>: Ein Therapeut schaut sich deine Bewegung an, ordnet deine Standortbestimmung ein und zeigt dir konkret, worauf es bei <em>dir</em> ankommt.") +
      `<p style="font-size:15px;line-height:1.65;color:${C.body};margin:0 0 8px;font-weight:600;">Was du mitnimmst:</p>
       <ul style="font-size:15px;line-height:1.7;color:${C.body};margin:0 0 22px;padding-left:20px;">
         <li>Eine fachliche Einordnung deiner Antworten</li>
         <li>Die 2–3 Punkte, auf die es bei dir zuerst ankommt</li>
         <li>Einen klaren nächsten Schritt — ohne Praxisbesuch, per Video</li>
       </ul>` +
      `<div style="margin:6px 0 0;">${ctaButton("Jetzt Analyse-Gespräch buchen", book("D3"))}</div>` +
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
      subject = "Du hast hingeschaut — jetzt fehlt nur noch ein Schritt"
      inner =
        heading("Jetzt fehlt nur noch der Blick von außen.") +
        hi +
        para("du hast hingeschaut — das ist der wichtigste Schritt. Jetzt fehlt nur noch einer, und der ist näher, als du denkst.") +
        para("In einem <strong style=\"color:" + C.ink + "\">30-minütigen Analyse-Gespräch</strong> weißt du, woran du bist und was dein nächster Schritt ist. Kein langes Programm, keine Praxis — per Video, wann es dir passt. Je früher du deine Bewegung einordnest, desto leichter fällt der Weg.") +
        `<div style="margin:6px 0 0;">${ctaButton("Jetzt Analyse-Gespräch buchen", book("D4"))}</div>` +
        priceNote() +
        reportSecondaryLink(args.reportUrl) +
        signoff()
    }
  } else {
    // D5 — objection handling + strongest booking push. Cron skips this for soft-flag leads.
    subject = "„Lohnt sich das für mich?\" — drei ehrliche Antworten"
    inner =
      heading("„Lohnt sich das für mich?“") +
      hi +
      para("bevor du das Thema zur Seite legst, drei Fragen, die uns oft gestellt werden:") +
      `<p style="font-size:15px;line-height:1.65;color:${C.body};margin:0 0 10px;"><strong style="color:${C.ink};">„Was passiert in den 30 Minuten?“</strong><br/>Ein Therapeut sieht sich per Video deine Bewegung an, geht deine Antworten durch und sagt dir konkret, worauf es bei dir ankommt.</p>` +
      `<p style="font-size:15px;line-height:1.65;color:${C.body};margin:0 0 10px;"><strong style="color:${C.ink};">„Ich hatte noch nie eine Video-Sprechstunde.“</strong><br/>Völlig okay. Du brauchst nur dein Handy und etwas Platz — wir führen dich durch alles.</p>` +
      `<p style="font-size:15px;line-height:1.65;color:${C.body};margin:0 0 18px;"><strong style="color:${C.ink};">„Und dann?“</strong><br/>Du bekommst eine klare Einschätzung. Ob und wie es weitergeht, entscheidest danach allein du.</p>` +
      para("Du hast den ersten Schritt längst gemacht. Mach jetzt den, der dir Klarheit bringt:") +
      `<div style="margin:6px 0 0;">${ctaButton("Jetzt Analyse-Gespräch buchen", book("D5"))}</div>` +
      priceNote() +
      reportSecondaryLink(args.reportUrl) +
      signoff()
  }

  return { subject, html: shell(inner, args.baseUrl, opts) }
}
