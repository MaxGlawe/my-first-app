/**
 * PROJ-23: Schmerzcheck transactional email templates (Brevo).
 *
 * Copy is verbatim from spec §7. Phase 1 ships T1 (Welcome / Double-Opt-in):
 * the check link doubles as the consent confirmation. HWG compact disclaimer
 * (§7.6) in every footer.
 */

import { escapeHtml } from "@/lib/html-escape"
import { getSchmerzcheckFromEmail } from "@/lib/schmerzcheck/mailer"

// Brand tokens (mirrors the landing page)
const C = {
  ink: "#0f172a",
  slate600: "#475569",
  slate500: "#64748b",
  slate400: "#94a3b8",
  slate200: "#e2e8f0",
  emerald700: "#047857",
  emerald800: "#065f46",
  paper: "#fbfaf6",
}

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
  <div style="background:${C.paper};padding:32px 16px;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid ${C.slate200};border-radius:16px;overflow:hidden;">
      <div style="padding:28px 32px 0;">
        <!-- inline logo via cid attachment (see mailer.ts LOGO_CID) -->
        <img src="cid:praxislogo" width="34" height="34" alt="Praxis OS" style="display:inline-block;vertical-align:middle;border-radius:50%;" />
        <span style="margin-left:8px;font-weight:600;font-size:15px;color:${C.ink};vertical-align:middle;">Praxis OS</span>
      </div>
      <div style="padding:8px 32px 28px;">
        ${inner}
      </div>
      <div style="padding:18px 32px 24px;border-top:1px solid ${C.slate200};background:#fcfcfb;">
        ${opts.footerNote ? `<p style="margin:0 0 10px;font-size:12px;line-height:1.6;color:${C.slate500};font-weight:600;">${opts.footerNote}</p>` : ""}
        <p style="margin:0;font-size:12px;line-height:1.6;color:${C.slate400};">
          Praxis OS ist ein Bildungs- und Orientierungsangebot von Max Glawe,
          Heilpraktiker für Physiotherapie. Inhalte ersetzen keine
          ärztliche Diagnose oder Heilbehandlung im Sinne des HWG.
        </p>
        <p style="margin:10px 0 0;font-size:12px;color:${C.slate400};">
          <a href="${baseUrl}/impressum" style="color:${C.slate500};text-decoration:underline;">Impressum</a>
          &nbsp;·&nbsp;
          <a href="${baseUrl}/datenschutz" style="color:${C.slate500};text-decoration:underline;">Datenschutz</a>
          ${showUnsub ? `&nbsp;·&nbsp;<a href="${unsubHref}" style="color:${C.slate500};text-decoration:underline;">Abmelden</a>` : ""}
        </p>
      </div>
    </div>
  </div>`
}

function ctaButton(label: string, href: string): string {
  return `
    <a href="${href}" style="display:inline-block;background:${C.emerald800};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:15px 28px;border-radius:12px;">
      ${label}
    </a>`
}

interface T1Args {
  firstName: string
  /** Double-Opt-in confirm link (Phase 2: starts the check). */
  checkUrl: string
  baseUrl: string
}

/** T1 — Welcome / Double-Opt-in. Verbatim copy from spec §7.4. */
export function renderT1WelcomeEmail({ firstName, checkUrl, baseUrl }: T1Args): string {
  const name = escapeHtml(firstName)
  const inner = `
    <p style="font-size:16px;color:${C.ink};margin:18px 0 14px;">Hallo ${name},</p>
    <p style="font-size:15px;line-height:1.65;color:${C.slate600};margin:0 0 16px;">
      dein 5-Minuten-Schmerzcheck wartet auf dich. Wir haben ihn so gebaut, dass er
      dich nicht überfordert — 15 Fragen, klar gestellt, ehrlich auswertbar.
    </p>
    <p style="font-size:15px;line-height:1.65;color:${C.slate600};margin:0 0 8px;font-weight:600;">Was dich erwartet:</p>
    <ul style="font-size:15px;line-height:1.7;color:${C.slate600};margin:0 0 22px;padding-left:20px;">
      <li>4–6 Minuten Zeit</li>
      <li>15 strukturierte Fragen</li>
      <li>Ein persönlicher Report direkt im Anschluss</li>
    </ul>
    <div style="margin:0 0 22px;">${ctaButton("Schmerzcheck jetzt starten", checkUrl)}</div>
    <p style="font-size:15px;line-height:1.65;color:${C.slate600};margin:0 0 16px;">
      Solltest du beim Ausfüllen unsicher sein: antworte einfach so ehrlich, wie du
      kannst. Es gibt keine richtigen oder falschen Antworten.
    </p>
    <p style="font-size:15px;line-height:1.65;color:${C.slate600};margin:0 0 22px;">
      Wenn du den Check später machen möchtest: speichere diese Mail. Der Link bleibt
      30 Tage gültig.
    </p>
    <p style="font-size:15px;line-height:1.65;color:${C.slate600};margin:0;">
      Bis gleich,<br/>Max Glawe<br/>
      <span style="color:${C.slate400};">Praxis OS · Therapeut für die Hosentasche</span>
    </p>`
  return shell(inner, baseUrl)
}

interface T2Args {
  firstName: string
  reportUrl: string
  baseUrl: string
  unsubscribeUrl?: string
}

/** T2 — Report delivered. Verbatim copy from spec §7.4. */
export function renderT2ReportEmail({ firstName, reportUrl, baseUrl, unsubscribeUrl }: T2Args): string {
  const name = escapeHtml(firstName)
  const inner = `
    <p style="font-size:16px;color:${C.ink};margin:18px 0 14px;">Hallo ${name},</p>
    <p style="font-size:15px;line-height:1.65;color:${C.slate600};margin:0 0 16px;">
      danke, dass du dir die Zeit genommen hast. Dein Schmerz-Report ist fertig — als PDF im
      Anhang dieser Mail, und online unter dem Link unten.
    </p>
    <p style="font-size:15px;line-height:1.65;color:${C.slate600};margin:0 0 8px;font-weight:600;">Was im Report drinsteht:</p>
    <ul style="font-size:15px;line-height:1.7;color:${C.slate600};margin:0 0 22px;padding-left:20px;">
      <li>Deine persönliche Standortbestimmung</li>
      <li>Was deine Antworten über dein Bewegungsmuster zeigen</li>
      <li>Eine 7-Tage-Bewegungs-Roadmap, abgestimmt auf deinen Bereich</li>
      <li>Eine klare Empfehlung für deinen nächsten Schritt</li>
    </ul>
    <div style="margin:0 0 22px;">${ctaButton("Report ansehen", reportUrl)}</div>
    <p style="font-size:15px;line-height:1.65;color:${C.slate600};margin:0 0 16px;">
      Nimm dir 10–15 Minuten Zeit. Der Report ist so gebaut, dass du etwas mitnimmst, nicht
      dass du dich durchklickst.
    </p>
    <p style="font-size:15px;line-height:1.65;color:${C.slate600};margin:0 0 22px;">
      Wenn etwas unklar ist — antworte einfach auf diese Mail. Ich lese mit.
    </p>
    <p style="font-size:15px;line-height:1.65;color:${C.slate600};margin:0;">
      Herzliche Grüße<br/>Max Glawe<br/>
      <span style="color:${C.slate400};">Praxis OS</span>
    </p>`
  return shell(inner, baseUrl, { unsubscribeUrl })
}

interface T3Args {
  firstName: string
  baseUrl: string
}

/**
 * T3 — Red flag. Verbatim copy from spec §7.4. NO marketing, NO unsubscribe
 * (one-off transactional, physician referral). Emergency note in the footer.
 */
export function renderT3RedFlagEmail({ firstName, baseUrl }: T3Args): string {
  const name = escapeHtml(firstName)
  const inner = `
    <p style="font-size:16px;color:${C.ink};margin:18px 0 14px;">Hallo ${name},</p>
    <p style="font-size:15px;line-height:1.65;color:${C.slate600};margin:0 0 16px;">
      danke, dass du den Schmerzcheck gemacht hast. Auf Basis deiner Antworten gibt es
      einen Punkt, den ich dir direkt sagen möchte:
    </p>
    <div style="border:1px solid #fecaca;background:#fef2f2;border-radius:12px;padding:16px 18px;margin:0 0 18px;">
      <p style="font-size:15px;line-height:1.65;color:${C.ink};margin:0;font-weight:600;">
        Bitte lass deine Beschwerden zeitnah ärztlich abklären, bevor du mit
        Bewegungs-Routinen oder Therapie startest.
      </p>
    </div>
    <p style="font-size:15px;line-height:1.65;color:${C.slate600};margin:0 0 16px;">
      Manche Anzeichen — die du in deinen Antworten genannt hast — können auf etwas
      hinweisen, was nur ein Arzt einordnen kann. Das hat nichts mit Panik zu tun. Das
      ist einfach der nächste richtige Schritt.
    </p>
    <p style="font-size:15px;line-height:1.65;color:${C.slate600};margin:0 0 8px;font-weight:600;">Konkret:</p>
    <ol style="font-size:15px;line-height:1.7;color:${C.slate600};margin:0 0 22px;padding-left:20px;">
      <li>Vereinbare einen Termin bei deinem Hausarzt — die Woche, idealerweise.</li>
      <li>Bei sehr starken oder plötzlich aufgetretenen Beschwerden: Bereitschaftsdienst 116 117 oder direkt in eine Notaufnahme.</li>
    </ol>
    <p style="font-size:15px;line-height:1.65;color:${C.slate600};margin:0 0 22px;">
      Wir wünschen dir alles Gute. Wenn ärztlich abgeklärt ist, was los ist, kannst du
      den Schmerzcheck gerne nochmal machen — und wir helfen dir dann, einen passenden
      Bewegungsweg zu finden.
    </p>
    <p style="font-size:15px;line-height:1.65;color:${C.slate600};margin:0;">
      Pass auf dich auf,<br/>Max Glawe<br/>
      <span style="color:${C.slate400};">Praxis OS</span>
    </p>`
  return shell(inner, baseUrl, {
    showUnsubscribe: false,
    footerNote: "Diese Mail ersetzt keinen medizinischen Notruf. Bei akuter Lebensgefahr: 112.",
  })
}

// ── Drip sequence D1–D4 (spec §7.4) ─────────────────────────────────────────
// Subjects are verbatim from §7.2. Bodies are presentable, HWG-safe placeholders
// to be refined with Max ([TBD by Max]). No outcome/healing promises.

function dripParas(paras: string[]): string {
  return paras
    .map((p) => `<p style="font-size:15px;line-height:1.65;color:${C.slate600};margin:0 0 16px;">${p}</p>`)
    .join("")
}
function dripSignoff(): string {
  return `<p style="font-size:15px;line-height:1.65;color:${C.slate600};margin:8px 0 0;">Herzliche Grüße<br/>Max Glawe<br/><span style="color:${C.slate400};">Praxis OS</span></p>`
}

export interface DripArgs {
  step: 1 | 2 | 3 | 4
  firstName: string
  reportUrl: string
  bookingUrl: string
  baseUrl: string
  unsubscribeUrl: string
  softFlag: boolean
}

export function renderDripEmail(args: DripArgs): { subject: string; html: string } {
  const name = escapeHtml(args.firstName)
  const hi = `<p style="font-size:16px;color:${C.ink};margin:18px 0 14px;">Hallo ${name},</p>`
  const opts = { unsubscribeUrl: args.unsubscribeUrl }
  let subject = ""
  let inner = ""

  if (args.step === 1) {
    subject = "Warum dein Körper Bewegung anders versteht, als du denkst"
    inner =
      hi +
      dripParas([
        "ein Gedanke, der vielen hilft: Schmerz ist nicht immer ein Maß für Schaden. Häufig ist er eher ein Warnsignal deines Nervensystems — und das lässt sich beeinflussen.",
        "Genau deshalb ist sanfte, regelmäßige Bewegung so zentral: Sie gibt deinem Körper die Rückmeldung, dass Bewegung sicher ist.",
        "In deinem Report findest du drei kleine Bausteine, die genau dort ansetzen.",
      ]) +
      `<div style="margin:6px 0 22px;">${ctaButton("Deinen Report ansehen", args.reportUrl)}</div>` +
      dripSignoff()
  } else if (args.step === 2) {
    subject = "Was deine Bewegungs-Standortbestimmung aussagt"
    inner =
      hi +
      dripParas([
        "viele, die ihren Schmerzcheck gemacht haben, erkennen sich in einem Muster wieder: Der Alltag wird vorsichtiger, Bewegungen werden vermieden — und genau das hält den Kreislauf oft in Gang.",
        "Deine Standortbestimmung zeigt dir, wo du auf diesem Weg gerade stehst. Der nächste Schritt ist meist kleiner, als man denkt.",
      ]) +
      `<div style="margin:6px 0 22px;">${ctaButton("Nochmal in den Report schauen", args.reportUrl)}</div>` +
      dripSignoff()
  } else if (args.step === 3) {
    subject = "Wenn du eine professionelle Einordnung willst"
    inner =
      hi +
      dripParas([
        "manchmal kommt man allein nur bis zu einem Punkt. Dann hilft ein Blick von außen.",
        "In der Video-Analyse schaut sich ein Therapeut deine Bewegung an, ordnet deine Standortbestimmung ein und zeigt dir konkret, worauf es bei dir ankommt — 30 Minuten, 69 €.",
      ]) +
      `<div style="margin:6px 0 6px;">${ctaButton("Video-Analyse buchen (69 €)", args.bookingUrl)}</div>` +
      `<p style="font-size:12px;line-height:1.5;color:${C.slate400};margin:0 0 22px;">69 € Erstanalyse · anschließend Betreuung 16,99 €/Monat · monatlich kündbar</p>` +
      dripSignoff()
  } else {
    subject = "Letzter Hinweis — und Glückwunsch zu deinem Schritt"
    const closing = args.softFlag
      ? "Wenn du magst, antworte einfach auf diese Mail — wir helfen dir, den passenden nächsten Schritt zu finden."
      : "Wenn du den nächsten gehen willst, ist eine Video-Analyse der direkteste Weg zu Klarheit."
    inner =
      hi +
      dripParas([
        "du hast etwas getan, das die meisten aufschieben: hingeschaut. Das ist der wichtigste Schritt.",
        closing,
      ]) +
      (args.softFlag
        ? ""
        : `<div style="margin:6px 0 6px;">${ctaButton("Video-Analyse buchen (69 €)", args.bookingUrl)}</div><p style="font-size:12px;line-height:1.5;color:${C.slate400};margin:0 0 22px;">69 € Erstanalyse · anschließend Betreuung 16,99 €/Monat · monatlich kündbar</p>`) +
      dripSignoff()
  }

  return { subject, html: shell(inner, args.baseUrl, opts) }
}
