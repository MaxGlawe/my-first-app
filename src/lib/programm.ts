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
  /** Vertragswert gesamt. */
  gesamtpreis: 447,
  /** Im Buchungskalender bereits bezahlte Videokonsultation. */
  konsultation: 69,
  /** Im Angebot zu zahlender Restbetrag. */
  zuZahlen: 447 - 69,
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

/** Anzahl fest zugesagter Video-Calls (werden bei Absage nachgeholt). */
export const PROGRAMM_CALLS = 5

/**
 * Vertragspositionen. Die erste Zeile macht die Anrechnung sichtbar: Sie steht
 * mit ihrem Preis im Vertrag, ist aber bereits beglichen — dadurch liest sich
 * „später entscheiden" wie derselbe Deal, nicht wie eine zweite Rechnung.
 */
export const PROGRAMM_LEISTUNGEN: Leistung[] = [
  {
    beschreibung: "Videokonsultation (30 Min.) inkl. Eignungsprüfung",
    preis: PROGRAMM.konsultation,
    details: "Bereits im Rahmen der Terminbuchung beglichen",
  },
  {
    beschreibung: `Physiotherapeutische Fernbetreuung über ${PROGRAMM.tage} Tage`,
    preis: PROGRAMM.zuZahlen,
    details: `Einschließlich ${PROGRAMM_CALLS} Video-Sitzungen à ca. 30 Minuten`,
  },
  {
    beschreibung: "Individueller Plan: tägliche Micro-Übungen und Trainingsplan für die vereinbarten Trainingstage",
    preis: 0,
  },
  {
    beschreibung: "Tägliches Kurz-Briefing, wöchentlich ausführliche Verlaufskontrolle",
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
