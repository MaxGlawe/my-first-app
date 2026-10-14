/**
 * PROJ-26 — Praxis-OS-Programm: die EINZIGE Preis- und Leistungsquelle.
 *
 * Wie `lib/bgf-pakete.ts` für die BGF-Seite: Angebot, Vertrag, Checkout,
 * Rechnung, Willkommensmail und Landingpage lesen ihre Zahlen ausschliesslich
 * hier. Ein Preis, der an zwei Stellen steht, steht irgendwann an zwei Stellen
 * verschieden — und auf einem Behandlungsvertrag ist das teuer.
 *
 * EINSTIEG SEIT 15.10.2026: ein KOSTENLOSES KENNENLERNEN (20 Min. per
 * Video, unverbindlich). Die ausfuehrliche Erstbefundung ist seitdem Teil
 * des Programms, nicht mehr ein eigener Schritt davor.
 *
 * Wortwahl ist hier kein Geschmack, sondern Paragraf 7 HWG: Kostenlos
 * angeboten wird ein GESPRAECH. „Kostenlose Untersuchung", „kostenloser
 * Befund", „kostenlose Behandlung" waeren unzulaessige Zuwendungen und
 * duerfen nirgends stehen — auch nicht sinngemaess.
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

/**
 * Der kostenlose Einstieg (seit 15.10.2026).
 *
 * Ein Gespraech, keine Untersuchung — siehe Kopfkommentar. Wer die Texte
 * anfasst, muss diesen Unterschied halten.
 */
export const KENNENLERNEN = {
  minuten: 20,
  /** Knopfbeschriftung auf allen oeffentlichen Seiten. */
  knopf: "Kostenloses Kennenlernen buchen",
  /** Zeile unter dem Knopf. */
  zusatz: "20 Min. per Video · unverbindlich · deutschlandweit",
  /** Kurzform fuer die feste Leiste am unteren Bildschirmrand. */
  zusatzKurz: "20 Min. per Video · unverbindlich",
  /**
   * Der Slug der Leistung IM BUCHUNGSTOOL — nicht unser Wunschname.
   *
   * Dort heisst sie weiterhin `video-sprechstunde-praxis-os`; nur Name,
   * Dauer (20 Min.), Preis (0 €) und Beschreibung wurden auf das
   * Kennenlernen umgestellt. Am 15.10.2026 stand hier kurzzeitig
   * `kennenlernen-praxis-os` — der Slug existiert dort nicht, das Widget
   * fand nichts, waehlte nichts aus und zeigte die volle Leistungsliste.
   * Kein Sprung zum Kalender, kein Ueberspringen der Zusatzleistungen.
   *
   * Das Widget bringt bereits eine Umschlagtabelle mit
   * (`video-sprechstunde-praxis-os` → `kennenlernen-praxis-os`). Sie zeigt
   * in die ANDERE Richtung: Sie faengt den alten Namen ab, falls der Slug
   * dort einmal umbenannt wird. Bis dahin ist der alte der richtige, und
   * nach einer Umbenennung funktionieren beide.
   *
   * Regel: Dieser Wert ist eine Tatsache ueber ein fremdes System. Er
   * wird geaendert, NACHDEM der Slug dort umbenannt wurde — nie vorher.
   */
  service: "video-sprechstunde-praxis-os",
} as const

/**
 * Wann umgestellt wurde — als Marke in der Auswertung.
 *
 * Vor diesem Zeitpunkt stand am Einstieg eine Konsultation fuer 69 Euro,
 * danach ein kostenloses Gespraech. Klickraten davor und danach zu
 * vergleichen, ohne den Schnitt zu kennen, waere ein Vergleich zweier
 * verschiedener Angebote.
 */
export const UMSTELLUNG_KENNENLERNEN = "2026-10-15T00:00:00+02:00"

/** Gilt für beide Varianten. */
export const PROGRAMM = {
  /** Dauer der Betreuung. */
  tage: 90,
  /**
   * ALTBESTAND: Preis der Videokonsultation, solange sie 69 Euro kostete.
   *
   * Seit dem 15.10.2026 ist der Einstieg kostenlos; neue Faelle erzeugen
   * keine Konsultationsrechnung mehr. Der Wert bleibt, weil Rechnungen und
   * Leistungsnachweise aus der Zeit davor reproduzierbar bleiben muessen —
   * ein Beleg, der sich nachtraeglich aendert, ist kein Beleg.
   */
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
    beschreibung: "Ausführliche Erstbefundung per Video zum Programmstart",
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
        ? `Einschließlich der ausführlichen Erstbefundung und ${v.calls} Video-Sitzungen à ca. 30 Minuten`
        : "Einschließlich der ausführlichen Erstbefundung; laufende Betreuung per Chat",
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
 * `abschnitt` sagt, welcher Teil der Seite die Buchung gebracht hat.
 * `variante` gibt die im Voraus gewaehlte Programm-Variante mit — entschieden
 * wird endgueltig erst im Gespraech.
 *
 * WARUM DIE VARIANTE IN utm_campaign STECKT (23.09.2026):
 * Das Buchungs-Widget liest beim Laden ausschliesslich utm_source,
 * utm_medium und utm_campaign aus der URL. Alles andere verwirft es sofort —
 * es landet nie in der Datenbank und kann folglich auch nicht im Webhook
 * ankommen. Ein eigener Parameter `programm=…` waere also stumm gewesen:
 * sichtbar in der Adresszeile, wirkungslos in der Auswertung.
 *
 * utm_content bleibt trotzdem gesetzt. Es kostet nichts, es ist der richtige
 * Ort fuer den Seitenabschnitt, und sobald die Gegenseite es durchreicht,
 * wirkt es ohne weitere Aenderung hier.
 *
 * Bewusst NICHT zusaetzlich `programm=…`: Dieselbe Tatsache an zwei Stellen
 * driftet irgendwann auseinander, und dann steht in der Auswertung zweimal
 * etwas Verschiedenes ueber dieselbe Buchung.
 */
export function buchungsUrl(abschnitt: string, variante?: ProgrammVariante): string {
  const params = new URLSearchParams({
    service: KENNENLERNEN.service,
    // Die utm_*-Werte sind der RUECKFALL fuer Besucher ohne Kampagne.
    // Kommt jemand ueber eine Anzeige, ersetzt `mitHerkunft()` sie durch
    // deren Werte — die Herkunft der Anzeige ist die wahre, unsere waere
    // nur die Behauptung, der Besuch komme von der eigenen Website.
    utm_source: "praxis-os",
    utm_medium: "website",
    utm_campaign: variante ? `programm-90-tage-${variante}` : "programm-90-tage",
    utm_content: abschnitt,
    // `cta` traegt den GEKLICKTEN KNOPF, und zwar immer.
    //
    // Ohne ihn ging genau diese Angabe verloren, sobald eine Kampagne im
    // Spiel war: `utm_content` kann nur eines von beidem tragen, und dort
    // gewinnt die Anzeige. Bei einer Buchung aus einer Anzeige stand dann
    // zwar „trailer", aber nicht mehr, ob der Besucher oben, unten oder
    // auf der festen Leiste geklickt hat.
    //
    // Eigener Parameter statt Anhaengsel an utm_content: Ein zusammen-
    // gesetzter Wert („trailer|hero") muesste an jeder auswertenden
    // Stelle wieder zerlegt werden, und spaetestens die dritte Stelle
    // vergisst es.
    //
    // `cta` steht NICHT in HERKUNFT_PARAMETER, wird von `mitHerkunft()`
    // also nicht ueberschrieben.
    cta: abschnitt,
  })
  return `https://physiotherapie-glawe.de/termin-buchen.html?${params.toString()}`
}

export function formatEuro(amount: number): string {
  return amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
}
