/**
 * PROJ-26 — Praxis-OS-Programm: die EINZIGE Preisquelle.
 *
 * Wie `lib/bgf-pakete.ts` für die BGF-Seite: Angebot, Vertrag, Checkout,
 * Rechnung und Landingpage lesen ihre Zahlen ausschließlich hier. Ein Preis,
 * der an zwei Stellen steht, steht irgendwann an zwei Stellen verschieden.
 *
 * Steuerlich: Konsultation und Programm sind heilkundliche Leistungen und
 * damit nach § 4 Nr. 14a UStG umsatzsteuerfrei. Der Checkout darf deshalb
 * NIEMALS `UST_TAX_RATE_ID` mitgeben — der hängt an den Shop-Produkten
 * (19 % inklusive) und würde hier eine falsche Rechnung erzeugen.
 */

import type { Leistung } from "@/types/contract"

export const PROGRAMM = {
  /** Vertragswert gesamt — die Konsultation ist darin enthalten. */
  gesamtpreis: 499,
  /**
   * Preis der Videokonsultation, wenn der Patient NICHT ins Programm startet.
   * Startet er direkt, ist sie im Gesamtpreis enthalten und wird nie separat
   * berechnet. Hat er sie vorher einzeln bezahlt, wird sie angerechnet.
   */
  konsultation: 69,
  /** Voller Programmbetrag, wenn noch nichts bezahlt wurde. */
  zuZahlen: 499,
  /** Restbetrag, wenn die Konsultation bereits einzeln bezahlt wurde. */
  zuZahlenNachKonsultation: 499 - 69,
  /** Dauer der Betreuung. */
  tage: 90,
  /** Gültigkeit des Angebots-Links. */
  angebotGueltigStunden: 48,
  /**
   * Danach ist der Befund aus der Konsultation zu alt — es braucht eine neue
   * Konsultation statt eines neu ausgestellten Angebots.
   */
  nachfristWochen: 6,
  /** Zugesagtes Antwortfenster im Chat. */
  chatAntwortStunden: 24,
} as const

/**
 * Anzahl fest zugesagter Video-Sitzungen (werden bei Absage nachgeholt).
 *
 * Ergibt sich zwingend aus der Taktung: Woche 1-4 woechentlich = 4,
 * Woche 5-8 vierzehntaegig = 2, Woche 9-12 Zwischen- und Abschlussgespraech
 * = 2. Wer die Taktung aendert, muss diese Zahl mitaendern - sie steht als
 * zugesicherte Leistung im Behandlungsvertrag.
 */
export const PROGRAMM_CALLS = 8

/**
 * Vertragspositionen. Die erste Zeile macht die Anrechnung sichtbar: Sie steht
 * mit ihrem Preis im Vertrag, ist aber bereits beglichen — dadurch liest sich
 * „später entscheiden" wie derselbe Deal, nicht wie eine zweite Rechnung.
 */
export const PROGRAMM_LEISTUNGEN: Leistung[] = [
  {
    beschreibung: `Physiotherapeutische Fernbetreuung über ${PROGRAMM.tage} Tage`,
    preis: PROGRAMM.gesamtpreis,
    details: `Einschließlich der vorausgegangenen Videokonsultation und ${PROGRAMM_CALLS} Video-Sitzungen à ca. 30 Minuten`,
  },
  {
    beschreibung: "Videokonsultation (30 Min.) mit Eignungsprüfung",
    preis: 0,
  },
  {
    beschreibung:
      "Individueller Plan: tägliche Micro-Übungen und Trainingsplan für die vereinbarten Trainingstage",
    preis: 0,
  },
  {
    beschreibung:
      "Tägliches Kurz-Check-in, wöchentlich ausführliche Verlaufskontrolle, laufende Anpassung des Plans",
    preis: 0,
  },
  {
    beschreibung: `Persönlicher Chat mit dem Behandler (Antwort innerhalb von ${PROGRAMM.chatAntwortStunden} Stunden an Werktagen)`,
    preis: 0,
  },
  {
    beschreibung:
      "Zusätzliche Video-Sitzung bei Verschlechterung (Rückmeldung am nächsten Werktag)",
    preis: 0,
  },
  {
    beschreibung: "Zugang zur Praxis-App als Schaltzentrale der Betreuung — ohne gesonderte Kosten",
    preis: 0,
  },
]

/** Taktung der Video-Sitzungen — für Vertragstext und Landingpage. */
export const PROGRAMM_CALL_TAKTUNG =
  "Woche 1 bis 4 wöchentlich, Woche 5 bis 8 vierzehntägig, Woche 9 bis 12 eine Zwischensitzung sowie ein Abschlussgespräch"

export function formatEuro(amount: number): string {
  return amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
}

/**
 * Einstieg in den Buchungskalender. Bewusst ein Link auf physiotherapie-glawe.de
 * statt eines eingebetteten iframes: Der Kalender lebt dort, wir haetten im
 * Rahmen weder Layout-Kontrolle noch verlaessliches Verhalten auf
 * Mobilgeraeten. `abschnitt` landet als utm_content in der Statistik und sagt,
 * welcher Teil der Seite die Buchung gebracht hat.
 */
export function buchungsUrl(abschnitt: string): string {
  const params = new URLSearchParams({
    service: "video-sprechstunde-praxis-os",
    utm_source: "praxis-os",
    utm_medium: "website",
    utm_campaign: "programm-90-tage",
    utm_content: abschnitt,
  })
  return `https://physiotherapie-glawe.de/termin-buchen.html?${params.toString()}`
}
