/**
 * Woher der Besucher kam — und wie es bis zum Buchungskalender durchkommt.
 *
 * Das Problem: Die Anzeige führt auf wwwpraxis-os.com, gebucht wird auf
 * physiotherapie-glawe.de. Zwei Domänen, zwei Sitzungen. Was in der
 * Adresszeile der Anzeige stand, ist beim Klick auf „Konsultation buchen"
 * längst verloren — der Besucher hat inzwischen drei Seiten gelesen.
 *
 * Deshalb wird die Herkunft beim ERSTEN Seitenaufruf weggeschrieben und an
 * jeden Buchungslink wieder angehängt.
 *
 * `sessionStorage` und nicht `localStorage`: Die Herkunft gilt für diesen
 * Besuch. Wer in drei Wochen direkt wiederkommt, kommt nicht mehr über die
 * Anzeige — ihn der alten Kampagne zuzurechnen wäre eine falsche Zahl.
 *
 * Nur der ERSTE Treffer zählt. Wer über eine Anzeige kommt, intern
 * weiterklickt und dabei einen Link mit anderen Parametern erwischt, ist
 * trotzdem über die Anzeige gekommen.
 */

const KEY = "praxisos_herkunft_v1"

/** Was weitergereicht wird. Mehr nicht — Parameter sind kein Sammelbecken. */
export const HERKUNFT_PARAMETER = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
] as const

export type Herkunft = Partial<Record<(typeof HERKUNFT_PARAMETER)[number], string>>

function lesen(): Herkunft {
  if (typeof window === "undefined") return {}
  try {
    const roh = window.sessionStorage.getItem(KEY)
    return roh ? (JSON.parse(roh) as Herkunft) : {}
  } catch {
    return {}
  }
}

/**
 * Beim Seitenaufruf aufrufen. Speichert die Parameter der Adresszeile, wenn
 * für diesen Besuch noch keine hinterlegt sind.
 */
export function herkunftMerken(): Herkunft {
  if (typeof window === "undefined") return {}

  const vorhanden = lesen()
  if (Object.keys(vorhanden).length > 0) return vorhanden

  const such = new URLSearchParams(window.location.search)
  const gefunden: Herkunft = {}
  for (const p of HERKUNFT_PARAMETER) {
    const wert = such.get(p)?.trim()
    if (wert) gefunden[p] = wert.slice(0, 200)
  }

  if (Object.keys(gefunden).length === 0) return {}

  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(gefunden))
  } catch {
    /* privater Modus — dann gilt die Herkunft nur fuer diese eine Seite */
  }
  return gefunden
}

/**
 * Hängt die gemerkte Herkunft an eine Adresse.
 *
 * EINGEHENDE WERTE GEWINNEN. Die Links tragen eigene UTM-Parameter
 * (`utm_source=praxis-os`, `utm_content=hero`), damit auch eine Buchung ohne
 * Kampagne zuzuordnen ist. Kam der Besucher aber über eine Anzeige, ist deren
 * Herkunft die wahre — die eigene würde sie überschreiben und jede bezahlte
 * Buchung als „von der eigenen Website" ausweisen.
 *
 * Nur die mitgebrachten Schlüssel werden ersetzt: Steht in der Anzeige kein
 * `utm_content`, bleibt der Seitenabschnitt aus dem Link stehen. So geht
 * keine Angabe verloren, die nicht durch eine bessere ersetzt wird.
 */
export function mitHerkunft(url: string): string {
  // Selbst sicherstellen, dass die Herkunft erfasst ist.
  //
  // React fuehrt Effekte von innen nach aussen aus: Der Effekt eines
  // Buchungslinks tief im Baum laeuft VOR dem der Komponente, die die
  // Herkunft wegschreibt. Beim ersten Seitenaufruf las der Link deshalb einen
  // leeren Speicher und trug die Standard-Parameter — genau der Fall, den
  // Test c) aufgedeckt hat.
  //
  // `herkunftMerken` schreibt nur den ersten Treffer, ein zweiter Aufruf
  // kostet also nichts.
  herkunftMerken()

  const herkunft = lesen()
  if (Object.keys(herkunft).length === 0) return url

  try {
    const u = new URL(url)
    for (const [k, v] of Object.entries(herkunft)) {
      u.searchParams.set(k, v)
    }
    return u.toString()
  } catch {
    // Keine absolute Adresse — dann lieber unveraendert lassen als kaputt.
    return url
  }
}
