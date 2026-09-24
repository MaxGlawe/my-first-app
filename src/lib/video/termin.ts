/**
 * PROJ-27 — Terminlogik der digitalen Sprechstunde.
 *
 * Alles, was mit Zeiten zu tun hat, steht hier. Die Regel „fünf Minuten
 * vorher auf, Dauer plus dreissig Minuten wieder zu" taucht sonst in der
 * Terminanlage, im Zutritt, in der Einladungsmail, in zwei Erinnerungen und
 * in der Oberfläche auf — sechs Orte, an denen sie irgendwann sechsmal
 * leicht verschieden lautet.
 */

/**
 * Die Praxis steht in Wildau, die Patienten sitzen in Deutschland, und der
 * Server läuft in UTC. Ohne feste Zone rendert jede serverseitig erzeugte
 * Zeit in der Zeitzone der Maschine — im Sommer zwei Stunden zu früh.
 *
 * Genau das stand am 24.09.2026 in der ersten echten Einladung: „um 08:00
 * Uhr" für einen Termin um 10:00. Im Browser fiel es nicht auf, weil der
 * Rechner des Behandlers ohnehin auf Berlin steht — die Mail entsteht aber
 * auf dem Server.
 *
 * Die Zone ist bewusst fest und nicht die des Empfängers: Ein Termin in
 * einer deutschen Praxis findet zur deutschen Ortszeit statt, auch wenn
 * jemand die Mail im Urlaub öffnet. Der Kalendereintrag trägt echte
 * UTC-Zeitstempel und rechnet für den, der wirklich woanders sitzt, selbst
 * um.
 */
export const ZONE = "Europe/Berlin"

export const VORLAUF_MINUTEN = 5
/**
 * Nachlauf. Faengt ab, dass ein Gespraech laenger dauert als geplant. Ein
 * Zutritt, der puenktlich zuschlaegt, waehrend beide noch reden, waere
 * absurd — und niemand mag es, mitten im Satz hinausgeworfen zu werden.
 */
export const NACHLAUF_MINUTEN = 30

export function oeffnetAm(geplant: Date | string): Date {
  return new Date(new Date(geplant).getTime() - VORLAUF_MINUTEN * 60_000)
}

export function schliesstAm(geplant: Date | string, dauerMinuten: number): Date {
  return new Date(
    new Date(geplant).getTime() + (dauerMinuten + NACHLAUF_MINUTEN) * 60_000
  )
}

/**
 * Zustände, aus denen kein Zutritt mehr wird. Alles andere ist eine Frage der
 * Uhrzeit, nicht des Status.
 */
export const ABGESCHLOSSEN: readonly string[] = ["beendet", "abgebrochen", "abgesagt"]

/** Dieselbe Liste in der Schreibweise, die PostgREST für `not.in` erwartet. */
export const ABGESCHLOSSEN_FILTER = "(beendet,abgebrochen,abgesagt)"

/**
 * Steht der Zutritt offen?
 *
 * DIE ZEIT ENTSCHEIDET, NICHT DER STATUS. Das klingt nach einer Feinheit und
 * war am 24.09.2026 ein stiller Totalausfall:
 *
 * Aus dem alten Ad-hoc-Modell kamen Gespräche direkt als `offen` auf die Welt.
 * Seit sie Termine sind, beginnen sie als `geplant` — und niemand schaltete
 * sie je weiter. Beitritt, Patienten-App und der LiveKit-Haken fragten alle
 * nach `offen`, und bekamen es nie zu sehen. Das erste echte Gespräch lief
 * trotzdem, weil ausgerechnet der Gast-Link sich seinen Zustand aus der
 * Uhrzeit ausrechnete — der Weg für Leute OHNE Konto funktionierte, der für
 * Leute MIT Konto nicht.
 *
 * Seitdem gilt: Ob der Zugang offen ist, sagt das Zeitfenster. Der Status hält
 * nur fest, was die Uhr nicht wissen kann — dass jemand drin ist (`laeuft`),
 * dass es vorbei ist (`beendet`), dass abgesagt wurde.
 */
export function zutrittOffen(
  call: { status: string; oeffnet_at: string; schliesst_at: string },
  jetzt: Date = new Date()
): boolean {
  if (ABGESCHLOSSEN.includes(call.status)) return false
  const t = jetzt.getTime()
  return (
    t >= new Date(call.oeffnet_at).getTime() && t <= new Date(call.schliesst_at).getTime()
  )
}

export type TerminZustand = "vorbei" | "laeuft" | "offen" | "wartet"

export function zustand(
  geplant: string,
  dauerMinuten: number,
  jetzt: Date = new Date()
): TerminZustand {
  const t = jetzt.getTime()
  if (t > schliesstAm(geplant, dauerMinuten).getTime()) return "vorbei"
  if (t >= new Date(geplant).getTime()) return "laeuft"
  if (t >= oeffnetAm(geplant).getTime()) return "offen"
  return "wartet"
}

/** „Mittwoch, 24. September 2026" */
export function formatDatum(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    timeZone: ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/** „14:00" */
export function formatUhrzeit(iso: string): string {
  return new Date(iso).toLocaleTimeString("de-DE", {
    timeZone: ZONE,
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** „Mi, 24.09. um 14:00 Uhr" — kompakt für Listen. */
export function formatKurz(iso: string): string {
  const d = new Date(iso)
  return (
    d.toLocaleDateString("de-DE", {
      timeZone: ZONE,
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    }) +
    " um " +
    formatUhrzeit(iso) +
    " Uhr"
  )
}

/** „in 3 Tagen", „in 2 Stunden", „jetzt" — für die Übersicht. */
export function relativ(iso: string, jetzt: Date = new Date()): string {
  const diff = new Date(iso).getTime() - jetzt.getTime()
  const min = Math.round(diff / 60_000)
  if (min < -60) return "vorbei"
  if (min < 0) return "läuft"
  if (min < 2) return "jetzt"
  if (min < 60) return `in ${min} Min.`
  const std = Math.round(min / 60)
  if (std < 24) return `in ${std} Std.`
  const tage = Math.round(std / 24)
  return tage === 1 ? "morgen" : `in ${tage} Tagen`
}

/**
 * Kalendereintrag zum Übernehmen.
 *
 * Bewusst ohne Bibliothek: Das Format ist ein paar Zeilen Text, und jede
 * Abhängigkeit an dieser Stelle waere mehr Pflege als Nutzen.
 *
 * Zwei Feinheiten, die sonst Ärger machen:
 *
 *   — Zeilen müssen mit CRLF enden. Outlook ignoriert Dateien mit blossen
 *     Zeilenumbrüchen kommentarlos, und niemand erfährt, warum der Termin
 *     nicht im Kalender auftaucht.
 *   — Zeilen über 75 Zeichen gehören gefaltet. Der Beschreibungstext mit dem
 *     Link ist regelmässig länger.
 */
export function kalendereintrag(args: {
  uid: string
  geplantAt: string
  dauerMinuten: number
  titel: string
  beschreibung: string
  url: string
  organisator: string
  organisatorEmail: string
}): string {
  const stempel = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
  const beginn = new Date(args.geplantAt)
  const ende = new Date(beginn.getTime() + args.dauerMinuten * 60_000)

  const escape = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n")

  const falten = (zeile: string): string => {
    if (zeile.length <= 75) return zeile
    const teile: string[] = [zeile.slice(0, 75)]
    let rest = zeile.slice(75)
    while (rest.length > 74) {
      teile.push(" " + rest.slice(0, 74))
      rest = rest.slice(74)
    }
    if (rest) teile.push(" " + rest)
    return teile.join("\r\n")
  }

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Praxis OS//Digitale Sprechstunde//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${args.uid}@wwwpraxis-os.com`,
    `DTSTAMP:${stempel(new Date())}`,
    `DTSTART:${stempel(beginn)}`,
    `DTEND:${stempel(ende)}`,
    falten(`SUMMARY:${escape(args.titel)}`),
    falten(`DESCRIPTION:${escape(args.beschreibung)}`),
    falten(`URL:${args.url}`),
    falten(`LOCATION:${escape(args.url)}`),
    falten(`ORGANIZER;CN=${escape(args.organisator)}:mailto:${args.organisatorEmail}`),
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Videotermin in 15 Minuten",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
}
