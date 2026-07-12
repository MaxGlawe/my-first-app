/**
 * Masterclass-Kampagne (2026-07) — Mail-Vorlagen.
 *
 * Löst den Video-Analyse-Pitch ab. Verkauft wird die Masterclass „Chronischer
 * Kreuzschmerz" (399 €, einmalig) inklusive 3 Monaten persönlicher Begleitung
 * per App.
 *
 * Wording-Regeln (verbindlich):
 *   VERBOTEN: alles aus der HWG-Sperrliste (siehe lib/schmerzcheck/forbidden-vocab.ts
 *   — Outcome- und Heilversprechen), dazu „Live-Begleitung", „kostenlos dabei",
 *   „gratis". Der Check `npm run hwg:check` erzwingt das über alle Dateien.
 *   SONDERN: „3 Monate persönliche Begleitung per App", „Antwort innerhalb von
 *   48 h werktags", „ersetzt nicht Arzt oder Therapie" — Orientierung statt Outcome.
 *
 * Die Begleitung wird NIE als Gratis-Zugabe geframt — sie ist der Hauptteil des
 * Angebots, nicht ein Bonus. Was gratis ist, ist nichts wert.
 */
import { escapeHtml } from "@/lib/html-escape"
import { C, shell, heading, para, ctaButton, signoff } from "./emails"

/** Getrackter Link: Klick-Attribution je Mail UND je Ziel (/api/schmerzcheck/go). */
function trackedLink(baseUrl: string, token: string, code: string, target: string): string {
  return `${baseUrl}/api/schmerzcheck/go?e=${code}&t=${target}&u=${encodeURIComponent(token)}`
}

const bold = (t: string) => `<strong style="color:${C.ink}">${t}</strong>`

/**
 * Preis-Block nach Spec B3: Anker → Preis → Begleitung GLEICHWERTIG GROSS →
 * Klarna direkt darunter (nicht als Fußnote). Kein Cent-Wert-Stacking.
 */
function priceBlock(): string {
  return `<p style="font-size:13px;line-height:1.7;color:${C.muted};margin:10px 0 14px;">
    <span style="text-decoration:line-through;color:${C.faint};">499 €</span>
    <strong style="color:${C.ink};font-size:16px;">&nbsp;399 €</strong> · einmalig · lebenslanger Kurszugriff<br/>
    <strong style="color:${C.ink};font-size:15px;">inkl. 3 Monate persönliche Begleitung per App</strong><br/>
    <span style="color:${C.faint};">oder 3 × 133 € mit Klarna — ohne Aufpreis</span>
  </p>`
}

// ═══ M1–M4 — Segment A (Check abgeschlossen, kein Red-Flag) ═══════════════════

export interface MasterclassMailArgs {
  step: 1 | 2 | 3 | 4
  firstName: string
  token: string
  baseUrl: string
  unsubscribeUrl: string
  /** Fehlt bei Leads ohne Report (z.B. ärztlich abgeklärte Red-Flag-Leads). */
  reportUrl?: string | null
  /**
   * Lead kam über die Routing-Mail RT1 herein (hatte im Check „mehrere Bereiche"
   * angegeben und dann „Unterer Rücken" geklickt). M1 braucht dann einen anderen
   * Einstieg: Ein Rückbezug auf „dein Ergebnis" wäre unehrlich — sein Report
   * zeigt ja gerade KEINEN klaren LWS-Befund. Stattdessen wird offen gesagt,
   * warum wir trotzdem am unteren Rücken ansetzen.
   */
  viaRouting?: boolean
}

export function renderMasterclassEmail(args: MasterclassMailArgs): { subject: string; html: string } {
  const name = escapeHtml(args.firstName)
  const hi = `<p style="font-size:16px;color:${C.ink};margin:0 0 14px;">Hallo ${name},</p>`
  const code = `M${args.step}`
  const sales = trackedLink(args.baseUrl, args.token, code, "salespage")

  const secondary = args.reportUrl
    ? `<p style="font-size:13px;line-height:1.6;color:${C.muted};margin:0 0 4px;">Dein Schmerz-Report liegt weiterhin für dich bereit: <a href="${trackedLink(args.baseUrl, args.token, code, "report")}" style="color:${C.green};text-decoration:underline;">nochmal ansehen &rarr;</a></p>`
    : ""

  let subject: string
  let inner: string

  switch (args.step) {
    // M1 — Ehrlichkeit zuerst: das alte Angebot war das falsche.
    case 1:
      subject = "Ich habe mein Angebot komplett überarbeitet"
      inner =
        heading("Ich lag daneben — und habe es geändert.") +
        hi +
        (args.viaRouting
          ? // RT1-Klicker: Er hat „mehrere Bereiche" angegeben. So zu tun, als
            // zeige sein Report einen klaren Kreuzschmerz-Befund, wäre gelogen.
            // Also sagen wir offen, warum wir trotzdem dort ansetzen.
            para(
              `danke für deinen Klick. Du hast mehrere Baustellen angegeben — und der untere Rücken ist der Punkt, an dem wir anfangen. Nicht, weil der Rest egal wäre, sondern weil er bei mehreren Beschwerdebereichen am häufigsten der Treiber ist.`
            )
          : para(
              "du hast damals deinen Schmerzcheck gemacht, und danach habe ich dir eine Video-Analyse angeboten: einen einzelnen Termin. Ehrlich gesagt war das das falsche Angebot. Chronische Rückenbeschwerden verschwinden nicht durch ein Gespräch — sie brauchen Verstehen, und danach jemanden, der dranbleibt."
            )) +
        para(
          `Deshalb gibt es jetzt etwas anderes: die ${bold("Masterclass Chronischer Kreuzschmerz")} — 27 vertonte Lektionen, ein 270-seitiges Workbook, ein Bewegungs-Kartendeck. Und, für mich der wichtigste Teil: ${bold("3 Monate persönliche Begleitung per App")}. Du schreibst mir direkt im Chat, ich antworte innerhalb von 48 Stunden werktags, und du bekommst ein Übungsprogramm, das zu deiner Situation passt.`
        ) +
        para("Du arbeitest dich also nicht allein durch ein Video-Archiv. Du hast jemanden, der mitliest.") +
        `<div style="margin:6px 0 0;">${ctaButton("Die Masterclass ansehen", sales)}</div>` +
        priceBlock() +
        secondary +
        signoff()
      break

    // M2 — Was drin ist. Begleitung an Position 1 (Spec B3).
    case 2:
      subject = "Was in den 3 Monaten Begleitung passiert"
      inner =
        heading("Der Teil, über den kaum jemand spricht.") +
        hi +
        para(
          "die meisten Kurse geben dir Inhalte und lassen dich damit allein. Genau daran scheitert es meistens — nicht am Wissen, sondern am Dranbleiben und an den Fragen, die unterwegs auftauchen."
        ) +
        `<p style="font-size:15px;line-height:1.65;color:${C.body};margin:0 0 8px;font-weight:600;">Deshalb sind 3 Monate Begleitung fester Bestandteil:</p>
        <ul style="font-size:15px;line-height:1.75;color:${C.body};margin:0 0 20px;padding-left:20px;">
          <li>${bold("Direkter Draht per Chat")} — du schreibst mir, ich antworte innerhalb von 48 h werktags</li>
          <li>${bold("Ein Übungsprogramm, das zu dir passt")} — nicht von der Stange</li>
          <li>${bold("Verlaufskontrolle")} — du siehst, was sich über die Wochen verändert</li>
          <li>${bold("Das Workbook synchron in der App")} — kein Zettelchaos</li>
        </ul>` +
        para(
          "Dazu die 27 Lektionen und das Kartendeck — die bleiben dir dauerhaft erhalten, auch nach den drei Monaten."
        ) +
        `<div style="margin:6px 0 0;">${ctaButton("Ansehen, was enthalten ist", sales)}</div>` +
        priceBlock() +
        secondary +
        signoff()
      break

    // M3 — Der häufigste Einwand, ehrlich beantwortet.
    case 3:
      subject = "Kann ich das nicht auch allein hinbekommen?"
      inner =
        heading("Die Frage, die ich am häufigsten höre.") +
        hi +
        para(
          "kurze, ehrliche Antwort: vielleicht. Manche schaffen das allein. Wenn du es allerdings schon länger allein versuchst und immer wieder an derselben Stelle landest, dann fehlt dir nicht Disziplin — dann fehlt jemand, der von außen draufschaut."
        ) +
        para(
          `Genau deshalb sind die ${bold("3 Monate Begleitung")} kein Beiwerk, sondern der Kern. Du schickst mir, was dich beschäftigt. Ich ordne es ein und passe dein Programm an. Du musst nicht raten, ob du gerade das Richtige tust.`
        ) +
        para(
          `Was ich dir nicht verspreche: dass du danach beschwerdefrei bist. Das kann seriös niemand. Die Masterclass ${bold("ersetzt weder Arzt noch Therapie")} — sie hilft dir zu verstehen, was bei dir los ist, und gibt dir einen Weg, der zu dir passt.`
        ) +
        `<div style="margin:6px 0 0;">${ctaButton("Zur Masterclass", sales)}</div>` +
        priceBlock() +
        secondary +
        signoff()
      break

    // M4 — Ruhiger Abschluss. Kein Countdown, keine Verknappung.
    default:
      subject = "Letzte Mail dazu von mir"
      inner =
        heading("Das war's von meiner Seite.") +
        hi +
        para(
          "das ist meine letzte Mail zur Masterclass — danach lasse ich dich damit in Ruhe. Kein Countdown, keine künstliche Verknappung; ich mag das selbst nicht."
        ) +
        para(
          "Falls es gerade nicht passt: völlig in Ordnung. Falls du unsicher bist, ob es das Richtige für dich ist, antworte einfach auf diese Mail und schreib mir, was dich beschäftigt. Ich lese jede Antwort selbst."
        ) +
        para(`Und falls du starten möchtest: die ${bold("Masterclass mit 3 Monaten Begleitung")} wartet auf dich.`) +
        `<div style="margin:6px 0 0;">${ctaButton("Jetzt starten", sales)}</div>` +
        priceBlock() +
        secondary +
        signoff()
      break
  }

  return { subject, html: shell(inner, args.baseUrl, { unsubscribeUrl: args.unsubscribeUrl }) }
}

// ═══ B1/B2 — Brücke für Red-Flag-Leads (Segment B) ════════════════════════════
//
// Diese Mails verkaufen NICHTS. Sie fragen nach dem Stand der ärztlichen
// Abklärung. Wer aktiv bestätigt, dass abgeklärt wurde, wandert in Segment A
// und bekommt erst DANN die Masterclass angeboten.
//
// Grund: Die Masterclass enthält Bewegungskarten und ein Übungsprogramm. Sie
// jemandem anzubieten, dessen Warnzeichen (Sattel-Taubheit, Kontrollverlust
// über Blase/Darm, zunehmende Lähmung) ungeklärt sind, wäre genau das, was der
// Red-Flag-Stopp verhindern soll — egal, wie man es formuliert.

export interface BridgeMailArgs {
  step: 1 | 2
  firstName: string
  token: string
  baseUrl: string
  unsubscribeUrl: string
}

export function renderBridgeEmail(args: BridgeMailArgs): { subject: string; html: string } {
  const name = escapeHtml(args.firstName)
  const hi = `<p style="font-size:16px;color:${C.ink};margin:0 0 14px;">Hallo ${name},</p>`
  const code = `B${args.step}`
  const answer = (a: string) =>
    `${args.baseUrl}/api/schmerzcheck/abklaerung?a=${a}&e=${code}&u=${encodeURIComponent(args.token)}`

  // Zwei gleichwertige Antwort-Buttons — bewusst KEIN Verkaufs-CTA.
  const answerButtons = `
    <div style="margin:6px 0 18px;">
      <a href="${answer("cleared")}" style="display:inline-block;background:${C.green};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 24px;border-radius:12px;margin:0 8px 10px 0;">
        Ja, ich war beim Arzt
      </a>
      <a href="${answer("not_yet")}" style="display:inline-block;background:#ffffff;color:${C.green};border:1px solid ${C.line};text-decoration:none;font-weight:600;font-size:15px;padding:13px 24px;border-radius:12px;margin:0 0 10px;">
        Noch nicht
      </a>
    </div>`

  const subject =
    args.step === 1 ? "Kurze Frage zu deinem Schmerzcheck" : "Warst du inzwischen bei der Ärztin?"

  const inner =
    args.step === 1
      ? heading("Ich wollte kurz nachhaken.") +
        hi +
        para(
          "bei deinem Schmerzcheck sind Angaben aufgetaucht, bei denen ich dir geraten habe, das zuerst ärztlich abklären zu lassen. Das war kein Standardsatz — bei solchen Zeichen gehört ein Arzt drauf, bevor man mit Bewegung oder Training anfängt."
        ) +
        para(`Deshalb ganz direkt: ${bold("Warst du inzwischen dort?")}`) +
        answerButtons +
        para(
          "Ich frage nicht, um dir etwas zu verkaufen. Ich frage, weil ich dir erst dann sinnvoll weiterhelfen kann, wenn das geklärt ist. Ein Klick genügt."
        ) +
        signoff()
      : heading("Nur noch einmal — dann lasse ich dich in Ruhe.") +
        hi +
        para(
          "ich hatte dir geschrieben, weil dein Schmerzcheck Zeichen gezeigt hat, die zuerst ärztlich abgeklärt gehören. Ich weiß nicht, ob du dazu gekommen bist — deshalb frage ich ein letztes Mal."
        ) +
        answerButtons +
        para(
          "Falls du noch nicht dort warst: Bitte hol das nach. Nicht, weil ich dir Angst machen möchte, sondern weil sich diese Dinge ernst nehmen lassen sollten. Sobald das geklärt ist, kann ich dir zeigen, was danach für dich sinnvoll ist."
        ) +
        signoff()

  return {
    subject,
    html: shell(inner, args.baseUrl, {
      unsubscribeUrl: args.unsubscribeUrl,
      footerNote:
        "Bei akuten Symptomen — plötzliche Taubheit im Genital- oder Sattelbereich, Kontrollverlust über Blase oder Darm, rasch zunehmende Lähmung — bitte sofort die Notaufnahme aufsuchen oder den Notruf 112 wählen.",
    }),
  }
}

// ═══ C1R — Reaktivierung (Segment C: Check begonnen, nie beendet) ═════════════

export interface ReactivationArgs {
  firstName: string
  checkUrl: string
  baseUrl: string
  unsubscribeUrl: string
}

export function renderReactivationEmail(args: ReactivationArgs): { subject: string; html: string } {
  const name = escapeHtml(args.firstName)
  const subject = "Dein Schmerzcheck ist noch offen"
  const inner =
    heading("Du warst fast durch.") +
    `<p style="font-size:16px;color:${C.ink};margin:0 0 14px;">Hallo ${name},</p>` +
    para(
      "du hast deinen Schmerzcheck angefangen, aber nicht zu Ende gebracht. Kein Vorwurf, das passiert. Deine Antworten sind noch gespeichert — du kannst dort weitermachen, wo du aufgehört hast."
    ) +
    para(
      "Am Ende bekommst du deinen persönlichen Report: eine Einordnung deiner Beschwerden und was in deiner Situation sinnvoll ist. Das dauert keine fünf Minuten mehr."
    ) +
    `<div style="margin:6px 0 16px;">${ctaButton("Check zu Ende bringen", args.checkUrl)}</div>` +
    para("Wenn du kein Interesse mehr hast, ist das völlig okay — dann melde dich unten einfach ab.") +
    signoff()

  return { subject, html: shell(inner, args.baseUrl, { unsubscribeUrl: args.unsubscribeUrl }) }
}

// ═══ RT1/RT2 — Routing-Mail an Leads mit unbekannter Region (PROJ-25b) ════════
//
// DAS PROBLEM, DAS SIE LÖST: 77 Leads in Segment A haben im Check „Mehrere
// Bereiche gleichzeitig" geklickt — eine Einfachauswahl, die ihre eigene
// Detailangabe überschrieben hat. Wir wissen bei ihnen nicht, ob der untere
// Rücken überhaupt betroffen ist. Die Masterclass ist aber ein LWS-Kurs.
//
// RT1 VERKAUFT NICHTS. Sie stellt eine Frage mit fünf Ein-Klick-Antworten.
// Kein Preis, kein Salespage-Link, kein Kauf-Button — das wird automatisch
// geprüft (npm run test:no-offer). Wer „Unterer Rücken" klickt, wird zum
// legitimen Empfänger der M-Sequenz. Alle anderen werden sauber geparkt,
// statt ein Produkt angeboten zu bekommen, das ihr Problem nicht behandelt.

/** Die fünf Antwortmöglichkeiten — Reihenfolge = Häufigkeit in den Daten. */
const REGION_OPTIONS: { value: string; label: string }[] = [
  { value: "unterer_ruecken", label: "Unterer Rücken / Kreuz" },
  { value: "nacken_schulter", label: "Nacken & Schulter" },
  { value: "oberer_ruecken", label: "Oberer Rücken" },
  { value: "knie_huefte_fuss", label: "Knie, Hüfte oder Fuß" },
  { value: "wechselt_staendig", label: "Das wechselt ständig" },
]

export interface RoutingMailArgs {
  step: 1 | 2
  firstName: string
  token: string
  baseUrl: string
  unsubscribeUrl: string
}

export function renderRoutingEmail(args: RoutingMailArgs): { subject: string; html: string } {
  const name = escapeHtml(args.firstName)
  const hi = `<p style="font-size:16px;color:${C.ink};margin:0 0 14px;">Hallo ${name},</p>`
  const code = `RT${args.step}`

  // Jede Option ein eigener, getrackter Link. Ein Klick genügt — kein Formular,
  // keine Anmeldung. Als Tabelle gebaut, damit es auch in Outlook hält.
  const buttons = REGION_OPTIONS.map((opt) => {
    const href =
      `${args.baseUrl}/api/schmerzcheck/region` +
      `?r=${opt.value}&e=${code}&u=${encodeURIComponent(args.token)}`
    return `
      <tr><td style="padding:0 0 8px;">
        <a href="${href}" style="display:block;background:#ffffff;border:1px solid ${C.line};border-left:3px solid ${C.green};color:${C.ink};text-decoration:none;font-weight:600;font-size:15px;padding:14px 18px;border-radius:10px;">
          ${opt.label}
        </a>
      </td></tr>`
  }).join("")

  const buttonBlock = `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:6px 0 18px;">
      ${buttons}
    </table>`

  const frage = `<p style="font-size:16px;line-height:1.6;color:${C.ink};font-weight:700;margin:0 0 12px;">
    Wo schränkt dich dein Schmerz im Alltag am meisten ein?
  </p>`

  const subject =
    args.step === 1
      ? "Kurze Frage zu deinem Schmerzcheck"
      : "Falls es untergegangen ist: ein Klick reicht"

  const inner =
    args.step === 1
      ? heading("Eine Frage, ein Klick.") +
        hi +
        para(
          "du hast vor einiger Zeit meinen Schmerzcheck gemacht und dabei mehrere Bereiche angegeben, die dir zu schaffen machen. Das ist übrigens häufiger, als du vielleicht denkst."
        ) +
        para(
          "Damit ich dir künftig nur Inhalte schicke, die wirklich zu dir passen — und keine Allgemeinplätze — hilf mir mit einem Klick:"
        ) +
        frage +
        buttonBlock +
        para(
          "Ein Klick genügt, keine Anmeldung, kein Formular. Danach bekommst du von mir nur noch das, was zu deinem Schwerpunkt gehört."
        ) +
        `<p style="font-size:15px;line-height:1.65;color:${C.body};margin:8px 0 0;">Danke dir!<br/>Max Glawe<br/><span style="color:${C.faint};">Physiotherapeut &amp; sektoraler Heilpraktiker für Physiotherapie · Physiotherapie Glawe, Wildau</span></p>`
      : heading("Ein Klick — dann habe ich es.") +
        hi +
        para(
          "meine letzte Mail ist vielleicht untergegangen. Ich frage nochmal kurz, weil ich dir sonst Inhalte schicke, die an deinem eigentlichen Problem vorbeigehen."
        ) +
        frage +
        buttonBlock +
        para("Danach ist Schluss mit dem Nachfragen — versprochen.") +
        `<p style="font-size:15px;line-height:1.65;color:${C.body};margin:8px 0 0;">Danke dir!<br/>Max Glawe<br/><span style="color:${C.faint};">Physiotherapie Glawe, Wildau</span></p>`

  return { subject, html: shell(inner, args.baseUrl, { unsubscribeUrl: args.unsubscribeUrl }) }
}

// ═══ RF1 — „Check nachgeschärft" an die 45 zu Unrecht Gestoppten ══════════════
//
// Diese 45 Menschen wurden im Juni aus dem Check geworfen, weil sie
// „Beschwerden, die dich nachts aufwecken" angekreuzt hatten — und NUR deswegen.
// Nach der entschärften Regel wäre keiner von ihnen gestoppt worden: Nächtlicher
// Schmerz ist bei chronischen Beschwerden der Normalfall und hat als alleiniges
// Kriterium keine Trennschärfe.
//
// Sie haben damals eine Mail bekommen, die sinngemäß sagte „lass das ärztlich
// abklären". Das war ein Fehlalarm, den WIR verursacht haben. Diese Mail sagt
// das offen — ohne Ausflüchte, ohne Verkauf.
//
// KEIN Kaufangebot. Der Link führt zurück in den Check, nicht in den Shop.

export interface RecheckMailArgs {
  firstName: string
  token: string
  baseUrl: string
  unsubscribeUrl: string
}

export function renderRecheckEmail(args: RecheckMailArgs): { subject: string; html: string } {
  const name = escapeHtml(args.firstName)
  const checkUrl = `${args.baseUrl}/api/schmerzcheck/recheck?e=RF1&u=${encodeURIComponent(args.token)}`

  const subject = "Dein Schmerzcheck — du hast noch ein Ergebnis offen"

  const inner =
    heading("Ich habe dich zu früh gestoppt.") +
    `<p style="font-size:16px;color:${C.ink};margin:0 0 14px;">Hallo ${name},</p>` +
    para(
      "du hast im Juni meinen Schmerzcheck gemacht — und ihn nicht abschließen können. Der Grund, ehrlich gesagt: Der Check war an einer Stelle strenger eingestellt, als es fachlich nötig ist."
    ) +
    para(
      `Deine Angabe zu ${bold("nächtlichen Beschwerden")} hat damals automatisch zum Stopp geführt. Dabei ist nächtlicher Schmerz bei anhaltenden Beschwerden für sich allein kein Alarmzeichen — sondern leider ziemlich normal. Als alleiniges Kriterium war das schlicht zu grob.`
    ) +
    para(
      "Ich habe den Check inzwischen fachlich nachgeschärft. Er prüft Warnzeichen jetzt präziser — und du kannst dir das Ergebnis holen, das damals offen geblieben ist:"
    ) +
    `<div style="margin:6px 0 16px;">${ctaButton("Check abschließen und Ergebnis ansehen", checkUrl)}</div>` +
    para("Dauert etwa 3 Minuten — deine bisherigen Antworten sind noch gespeichert.") +
    para(
      `Und falls der Check dir auch nach der neuen Prüfung rät, etwas ärztlich abklären zu lassen: ${bold("Nimm das bitte ernst")} — genau dafür ist er da.`
    ) +
    `<p style="font-size:15px;line-height:1.65;color:${C.body};margin:8px 0 0;">Beste Grüße aus Wildau<br/>Max Glawe<br/><span style="color:${C.faint};">Physiotherapeut &amp; sektoraler Heilpraktiker für Physiotherapie</span></p>`

  return { subject, html: shell(inner, args.baseUrl, { unsubscribeUrl: args.unsubscribeUrl }) }
}

// ═══ N1 / OB1 / K1 — Wert-Mail + Warteliste an die 79 Geparkten ══════════════
//
// Diese Menschen haben den Check komplett gemacht, einen Report bekommen und ein
// echtes chronisches Problem — aber ihr Schwerpunkt ist Nacken, oberer Rücken
// oder Knie. Für sie gibt es kein Produkt: Die Masterclass ist ein LWS-Kurs.
//
// Statt sie stillschweigend zu parken, bekommen sie das Einzige, was wir ihnen
// ehrlich geben können — fachlichen Inhalt. Drei Dinge, die Max seinen Patienten
// zu ihrer Region am häufigsten erklärt. Danach ein Ein-Klick-Link auf eine
// Warteliste. KEIN Kauf-Link.
//
// Die Klickzahl ist zugleich die Vorab-Validierung für die Produktentscheidung:
// Ab ~15 Klicks aus 73 Nacken+BWS-Leads lohnt sich ein eigenes Modul.

type WaitlistRegion = "nacken_schulter" | "oberer_ruecken" | "knie_huefte_fuss"

interface WaitlistInhalt {
  code: "N1" | "OB1" | "K1"
  subject: string
  headline: string
  intro: string
  punkte: { titel: string; text: string }[]
  ausblick: string
  schluss: string
}

const WAITLIST_INHALTE: Record<WaitlistRegion, WaitlistInhalt> = {
  nacken_schulter: {
    code: "N1",
    subject: "Dein Nacken — drei Dinge, die kaum jemand dazusagt",
    headline: "Drei Dinge über deinen Nacken.",
    intro:
      "du hast bei meinem Schmerzcheck Nacken und Schulter als deinen Schwerpunkt angegeben. Dazu bekommst du heute keine Werbung, sondern drei Dinge, die ich meinen Patienten in der Praxis dazu am häufigsten erkläre:",
    punkte: [
      {
        titel: "Dein Nacken ist selten „verspannt“, weil er zu viel arbeitet — sondern weil er zu lange dasselbe tut.",
        text: "Nicht die eine falsche Bewegung ist das Problem, sondern die fehlende Abwechslung. Deshalb hilft „Haltung verbessern“ allein meist so wenig: Die beste Haltung ist die nächste.",
      },
      {
        titel: "Knirschen und Knacken sind fast nie das Warnsignal, für das sie gehalten werden.",
        text: "Diese Geräusche entstehen in gesunden Gelenken genauso. Beunruhigender als das Geräusch ist die Schonung, die viele sich deshalb angewöhnen — sie macht den Nacken empfindlicher, nicht robuster.",
      },
      {
        titel: "Stress ist beim Nacken kein Nebenfaktor, sondern Hauptdarsteller.",
        text: "Die Nacken-Schulter-Muskulatur reagiert auf Anspannung wie kaum eine andere Region. Wenn dein Nacken in stressigen Wochen schlimmer ist, bildest du dir das nicht ein — das ist Physiologie.",
      },
    ],
    ausblick:
      "Für den unteren Rücken habe ich bereits ein strukturiertes Programm gebaut. Für Nacken und Schulter arbeite ich gerade an einem eigenen — mit demselben Ansatz: verstehen, gezielt handeln, dranbleiben.",
    schluss: "Bis dahin: Beweg deinen Nacken heute einmal öfter, als du es sonst tun würdest.",
  },

  oberer_ruecken: {
    code: "OB1",
    subject: "Zwischen den Schulterblättern — drei Dinge dazu",
    headline: "Drei Dinge über deinen oberen Rücken.",
    intro:
      "du hast bei meinem Schmerzcheck den oberen Rücken als deinen Schwerpunkt angegeben. Dazu bekommst du heute keine Werbung, sondern drei Dinge, die ich meinen Patienten dazu am häufigsten erkläre:",
    punkte: [
      {
        titel: "Der Schmerz zwischen den Schulterblättern kommt selten aus den Schulterblättern.",
        text: "Meistens ist er ein Bote — aus dem Nacken, aus der Brustwirbelsäule, manchmal aus der Atmung. Deshalb bringt das Kneten genau der schmerzenden Stelle oft nur kurz Erleichterung: Die Ursache sitzt woanders.",
      },
      {
        titel: "Deine Brustwirbelsäule ist zum Drehen gebaut, nicht zum Stillhalten.",
        text: "Rotation ist ihre Kernaufgabe — und genau die kommt im Alltag am kürzesten. Wer den ganzen Tag geradeaus schaut, nimmt ihr das, wofür sie gemacht ist.",
      },
      {
        titel: "Der Schreibtisch ist nicht der Bösewicht, für den er gehalten wird.",
        text: "Sitzen an sich schadet dem Rücken nicht. Bewegungslosigkeit tut es. Der Unterschied klingt klein, ist aber entscheidend — er verlagert die Lösung vom teuren Stuhl zur regelmäßigen Unterbrechung.",
      },
    ],
    ausblick:
      "Für den unteren Rücken habe ich bereits ein strukturiertes Programm gebaut. Für Nacken und oberen Rücken arbeite ich gerade an einem eigenen — mit demselben Ansatz: verstehen, gezielt handeln, dranbleiben.",
    schluss: "Bis dahin: Dreh dich heute ein paar Mal bewusst zur Seite. Deine Brustwirbelsäule mag das.",
  },

  knie_huefte_fuss: {
    code: "K1",
    subject: "Knie, Hüfte, Fuß — drei Dinge dazu",
    headline: "Drei Dinge über Belastung.",
    intro:
      "du hast bei meinem Schmerzcheck Knie, Hüfte oder Fuß als deinen Schwerpunkt angegeben. Dazu bekommst du heute keine Werbung, sondern drei Dinge, die ich meinen Patienten dazu am häufigsten erkläre:",
    punkte: [
      {
        titel: "Knorpel mag Bewegung — er lebt davon.",
        text: "Er hat keine eigene Blutversorgung und wird nur über Be- und Entlastung ernährt. Wer aus Sorge vor Verschleiß schont, entzieht ihm genau das, was er braucht.",
      },
      {
        titel: "„Abnutzung“ im Bild sagt erstaunlich wenig über deinen Schmerz aus.",
        text: "Es gibt Menschen mit deutlichen Veränderungen im Röntgenbild und ohne jede Beschwerde — und umgekehrt. Der Befund ist nicht die Erklärung deines Schmerzes.",
      },
      {
        titel: "Nicht die Belastung ist das Problem, sondern der Sprung.",
        text: "Gelenke passen sich an fast alles an, wenn man ihnen Zeit lässt. Beschwerden entstehen meist dort, wo die Belastung schneller steigt als die Anpassung — nach dem Umzug, dem neuen Job, dem plötzlichen Trainingsstart.",
      },
    ],
    ausblick:
      "Für den unteren Rücken habe ich bereits ein strukturiertes Programm gebaut. Ob und wann etwas für Knie, Hüfte und Fuß dazukommt, hängt davon ab, wie viele Menschen es tatsächlich brauchen.",
    schluss: "Bis dahin: Bewegung in kleinen Dosen schlägt Schonung. Fast immer.",
  },
}

export interface WaitlistMailArgs {
  region: WaitlistRegion
  firstName: string
  token: string
  baseUrl: string
  unsubscribeUrl: string
}

export function renderWaitlistEmail(args: WaitlistMailArgs): { subject: string; html: string } {
  const name = escapeHtml(args.firstName)
  const inhalt = WAITLIST_INHALTE[args.region]

  const wartelisteUrl =
    `${args.baseUrl}/api/schmerzcheck/warteliste` +
    `?r=${args.region}&e=${inhalt.code}&u=${encodeURIComponent(args.token)}`

  const punkte = inhalt.punkte
    .map(
      (p, i) => `
      <div style="margin:0 0 18px;">
        <p style="font-size:15px;line-height:1.55;color:${C.ink};font-weight:700;margin:0 0 5px;">
          ${i + 1}. ${p.titel}
        </p>
        <p style="font-size:15px;line-height:1.65;color:${C.body};margin:0;">${p.text}</p>
      </div>`
    )
    .join("")

  const inner =
    heading(inhalt.headline) +
    `<p style="font-size:16px;color:${C.ink};margin:0 0 14px;">Hallo ${name},</p>` +
    para(inhalt.intro) +
    punkte +
    `<div style="margin:22px 0 0;padding-top:18px;border-top:1px solid ${C.line};">
      ${para("Und jetzt der ehrliche Teil: " + inhalt.ausblick)}
      ${para("Wenn du erfahren willst, sobald es fertig ist:")}
      <div style="margin:6px 0 10px;">${ctaButton("Ja, informier mich als Erste/r", wartelisteUrl)}</div>
      <p style="font-size:13px;line-height:1.6;color:${C.faint};margin:0 0 14px;">Ein Klick, mehr nicht. Keine Vorkasse, keine Verpflichtung.</p>
    </div>` +
    para(inhalt.schluss) +
    `<p style="font-size:15px;line-height:1.65;color:${C.body};margin:8px 0 0;">Beste Grüße aus Wildau<br/>Max Glawe<br/><span style="color:${C.faint};">Physiotherapeut &amp; sektoraler Heilpraktiker für Physiotherapie</span></p>`

  return {
    subject: inhalt.subject,
    html: shell(inner, args.baseUrl, { unsubscribeUrl: args.unsubscribeUrl }),
  }
}
