/**
 * PROJ-26: Werktagsrechnung für die zugesagten Fristen.
 *
 * Der Vertrag sagt an zwei Stellen etwas mit Frist zu:
 *   — Antwort im Chat „innerhalb von 24 Stunden an Werktagen"
 *   — Rückmeldung auf eine Verschlechterung „spätestens am nächsten Werktag"
 *
 * Beides braucht dieselbe Rechnung, und sie gehört an EINE Stelle. Eine
 * zweite, leicht abweichende Kopie wäre hier besonders teuer: Sie würde
 * einer Zusage widersprechen, die schriftlich im Behandlungsvertrag steht.
 *
 * BEWUSSTE GRENZE: Gesetzliche Feiertage sind NICHT berücksichtigt. Sie sind
 * bundeslandabhängig und bräuchten eine gepflegte Liste; eine halbfertige
 * Feiertagslogik verschiebt Fristen falsch und ist schlimmer als gar keine.
 * Die Frist fällt an einem Feiertag also auf einen Tag, an dem nicht
 * gearbeitet wird — sie ist damit im Zweifel zu streng, nie zu lax. Falsch
 * herum wäre das Problem.
 */

/** Samstag und Sonntag. */
function istWochenende(d: Date): boolean {
  const tag = d.getDay()
  return tag === 0 || tag === 6
}

/**
 * Der nächste Werktag NACH dem übergebenen Zeitpunkt, auf Tagesbeginn
 * normalisiert plus die übergebene Uhrzeit-Grenze.
 *
 * Meldung Freitagmittag  → Frist Montag
 * Meldung Samstag        → Frist Montag
 * Meldung Montagmorgen   → Frist Dienstag
 */
export function naechsterWerktag(ab: Date = new Date(), stunde = 18): Date {
  const d = new Date(ab)
  d.setDate(d.getDate() + 1)
  while (istWochenende(d)) {
    d.setDate(d.getDate() + 1)
  }
  d.setHours(stunde, 0, 0, 0)
  return d
}

/** Liegt die Frist in der Vergangenheit? */
export function fristUeberschritten(frist: string | Date, jetzt: Date = new Date()): boolean {
  return new Date(frist).getTime() < jetzt.getTime()
}

/** „Montag, 29.09., 18:00 Uhr" — für Mails und Oberfläche. */
export function formatFrist(frist: string | Date): string {
  const d = new Date(frist)
  return (
    d.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "2-digit" }) +
    ", " +
    d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) +
    " Uhr"
  )
}
