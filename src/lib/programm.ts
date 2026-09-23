/**
 * PROJ-26 — Praxis-OS-Programm: die EINZIGE Preis- und Leistungsquelle.
 *
 * Wie `lib/bgf-pakete.ts` für die BGF-Seite: Angebot, Vertrag, Checkout,
 * Rechnung, Willkommensmail und Landingpage lesen ihre Zahlen ausschliesslich
 * hier. Ein Preis, der an zwei Stellen steht, steht irgendwann an zwei Stellen
 * verschieden — und auf einem Behandlungsvertrag ist das teuer.
 *
 * ZWEI VARIANTEN (seit 23.09.2026):
 *
 *   begleitet — 299 €, ohne feste Video-Sitzungen. Der einzige feste
 *               Videotermin ist die Konsultation. Für alle, die ihren Weg
 *               eigenständig gehen und den Therapeuten im Chat haben wollen.
 *
 *   intensiv  — 499 €, alles aus „begleitet“ plus acht gestaffelte
 *               Video-Sitzungen. Das bisherige Programm.
 *
 * Was BEIDE teilen, steht in PROGRAMM und BASIS_LEISTUNGEN. Was sie
 * unterscheidet, steht in VARIANTEN. Wer etwas ergänzt, muss sich also
 * entscheiden, wo es hingehört — und genau das ist der Zweck der Trennung.
 *
 * Steuerlich: Konsultation und Programm sind heilkundliche Leistungen und
 * damit nach § 4 Nr. 14a UStG umsatzsteuerfrei. Der Checkout darf deshalb
 * NIEMALS `UST_TAX_RATE_ID` mitgeben — der hängt an den Shop-Produkten
 * (19 % inklusive) und würde hier eine falsche Rechnung erzeugen.
 */

import type { Leistung } from "@/types/contract"

export type ProgrammVariante = "begleitet" | "intensiv"

/** Gilt für beide Varianten. */
export const PROGRAMM = {
  /** Dauer der Betreuung. */
  tage: 90,
  /** Preis der Videokonsultation, wenn KEIN Programm zustande kommt. */
  konsultation: 69,
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

export interface VariantenDefinition {
  id: ProgrammVariante
  /** Anzeigename, z. B. „Intensiv“. */
  name: string
  /** Vollständige Bezeichnung für Vertrag und Rechnung. */
  vertragsname: string
  untertitel: string
  kurztext: string
  preis: number
  /** Fest zugesagte Video-Sitzungen (0 = keine ausser der Konsultation). */
  calls: number
  /** Auf der Angebotsseite hervorheben? */
  hervorgehoben: boolean
  /** Label über der hervorgehobenen Karte. */
  label?: string
}

export const VARIANTEN: Record<ProgrammVariante, VariantenDefinition> = {
  begleitet: {
    id: "begleitet",
    name: "Begleitet",
    vertragsname: "Praxis-OS-Programm „Begleitet“ (90 Tage Fernbetreuung)",
    untertitel: "In deinem Tempo — per Chat",
    kurztext:
      "Für alle, die ihren Weg lieber eigenständig gehen — mit deinem Therapeuten jederzeit im Chat an deiner Seite.",
    preis: 299,
    calls: 0,
    hervorgehoben: false,
  },
  intensiv: {
    id: "intensiv",
    name: "Intensiv",
    vertragsname: "Praxis-OS-Programm „Intensiv“ (90 Tage Fernbetreuung)",
    untertitel: "Mit regelmäßigen Video-Sitzungen",
    kurztext: "Für alle, die regelmäßig mit ihrem Therapeuten sprechen möchten.",
    preis: 499,
    calls: 8,
    hervorgehoben: true,
    label: "Am engsten begleitet",
  },
}

/** Reihenfolge auf der Angebotsseite: die günstigere zuerst. */
export const VARIANTEN_REIHENFOLGE: ProgrammVariante[] = ["begleitet", "intensiv"]

/** Taktung der Video-Sitzungen — nur „Intensiv“. */
export const CALL_TAKTUNG =
  "Woche 1 bis 4 wöchentlich, Woche 5 bis 8 vierzehntägig, Woche 9 bis 12 eine Zwischensitzung sowie ein Abschlussgespräch"

/**
 * Leistungen, die BEIDE Varianten enthalten.
 *
 * Der zusätzliche Video-Termin bei Verschlechterung steht bewusst hier und
 * nicht nur bei „Intensiv“: Wer sich verschlechtert, darf nicht erst über
 * Geld reden müssen. Das ist die Grundlage des Red-Flag-Versprechens.
 */
export const BASIS_LEISTUNGEN: Leistung[] = [
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
      "Kurzfristige zusätzliche Video-Sitzung bei Verschlechterung (Rückmeldung am nächsten Werktag)",
    preis: 0,
  },
  {
    beschreibung: "Zugang zur Praxis-App als Schaltzentrale der Betreuung — ohne gesonderte Kosten",
    preis: 0,
  },
]

/** Vertragspositionen einer Variante: die bezahlte Position plus die Inklusivleistungen. */
export function leistungenFuer(variante: ProgrammVariante): Leistung[] {
  const v = VARIANTEN[variante]

  const hauptposition: Leistung = {
    beschreibung: `Physiotherapeutische Fernbetreuung über ${PROGRAMM.tage} Tage — ${v.name}`,
    preis: v.preis,
    details:
      v.calls > 0
        ? `Einschließlich der vorausgegangenen Videokonsultation und ${v.calls} Video-Sitzungen à ca. 30 Minuten`
        : "Einschließlich der vorausgegangenen Videokonsultation; laufende Betreuung per Chat",
  }

  const calls: Leistung[] =
    v.calls > 0
      ? [
          {
            beschreibung: `${v.calls} Video-Sitzungen à ca. 30 Minuten`,
            preis: 0,
            details: CALL_TAKTUNG,
          },
        ]
      : []

  return [hauptposition, ...calls, ...BASIS_LEISTUNGEN]
}

/** Preis der Variante. */
export function preisFuer(variante: ProgrammVariante): number {
  return VARIANTEN[variante].preis
}

/**
 * Einstieg in den Buchungskalender. Bewusst ein Link auf
 * physiotherapie-glawe.de statt eines eingebetteten iframes: Der Kalender lebt
 * dort, wir haetten im Rahmen weder Layout-Kontrolle noch verlaessliches
 * Verhalten auf Mobilgeraeten.
 *
 * `abschnitt` landet als utm_content in der Statistik und sagt, welcher Teil
 * der Seite die Buchung gebracht hat. `variante` gibt die im Voraus gewaehlte
 * Programm-Variante mit — entschieden wird endgueltig erst im Gespraech.
 */
export function buchungsUrl(abschnitt: string, variante?: ProgrammVariante): string {
  const params = new URLSearchParams({
    service: "video-sprechstunde-praxis-os",
    utm_source: "praxis-os",
    utm_medium: "website",
    utm_campaign: "programm-90-tage",
    utm_content: variante ? `${abschnitt}-${variante}` : abschnitt,
  })
  if (variante) params.set("programm", variante)
  return `https://physiotherapie-glawe.de/termin-buchen.html?${params.toString()}`
}

export function formatEuro(amount: number): string {
  return amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
}
