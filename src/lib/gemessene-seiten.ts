/**
 * Welche Seiten ihre Abschnitte melden — und wie die Abschnitte heißen.
 *
 * Eine Stelle für drei Verwender:
 *
 *   1. die Seiten selbst (`AufmerksamkeitMessen abschnitte={…}`),
 *   2. die Auswertung (`/api/analytics/trichter`) für die Leseleiter,
 *   3. das Dashboard, das die Leiter überschreibt.
 *
 * Getrennt gehalten wären das drei Listen, die auseinanderlaufen — und eine
 * Leseleiter, in der ein Abschnitt fehlt, sieht aus wie ein Abbruch an
 * dieser Stelle. Ein fehlender Eintrag wäre also nicht nur unvollständig,
 * er wäre eine falsche Aussage.
 *
 * `preis` nennt den Abschnitt, der im Trichter als „Preis gesehen" zählt.
 * Auf der Startseite und bei „Sabines Weg" heißt er `preis`, auf der
 * Erstattungsseite `pakete` — derselbe Schritt, anderer Name.
 *
 * Die Reihenfolge ist die Leserichtung. Sie ist die Aussage der Leiter.
 */

export interface Abschnitt {
  id: string
  titel: string
}

export interface GemesseneSeite {
  /** Pfad, unter dem die Seite erreichbar ist — der Einstiegspfad der Sitzung. */
  pfad: string
  /** Was im Dashboard über der Leiter steht. */
  titel: string
  /** ID des Abschnitts, der im Trichter „Preis gesehen" bedeutet. */
  preis: string
  abschnitte: Abschnitt[]
}

export const GEMESSENE_SEITEN = {
  startseite: {
    pfad: "/",
    titel: "Startseite",
    preis: "preis",
    abschnitte: [
      { id: "was-ist-praxis-os", titel: "Was ist Praxis OS" },
      { id: "ablauf", titel: "Ablauf" },
      { id: "wer-betreut-dich", titel: "Wer betreut dich" },
      { id: "eignung", titel: "Passt das zu mir" },
      { id: "preis", titel: "Preis" },
      { id: "faq", titel: "Häufige Fragen" },
    ],
  },
  "start-sabine": {
    pfad: "/start/sabine",
    titel: "Anzeige · Sabines Weg",
    preis: "preis",
    abschnitte: [
      { id: "einstieg", titel: "Einstieg" },
      { id: "wo-stehst-du", titel: "Wo stehst du" },
      { id: "was-ist-praxis-os", titel: "Was ist Praxis OS" },
      { id: "deine-90-tage", titel: "Deine 90 Tage" },
      { id: "wer-betreut-dich", titel: "Wer betreut dich" },
      { id: "preis", titel: "Preis" },
      { id: "faq", titel: "Häufige Fragen" },
      { id: "abschluss", titel: "Abschluss" },
    ],
  },
  "start-alltag": {
    pfad: "/start/alltag",
    titel: "Anzeige · Alltag",
    preis: "preis",
    abschnitte: [
      { id: "einstieg", titel: "Einstieg" },
      { id: "wo-stehst-du", titel: "Wo stehst du" },
      { id: "was-ist-praxis-os", titel: "Was ist Praxis OS" },
      { id: "deine-90-tage", titel: "Deine 90 Tage" },
      { id: "wer-betreut-dich", titel: "Wer betreut dich" },
      { id: "preis", titel: "Preis" },
      { id: "faq", titel: "Häufige Fragen" },
      { id: "abschluss", titel: "Abschluss" },
    ],
  },
  "start-erstattung": {
    pfad: "/start/erstattung",
    titel: "Anzeige · Erstattung",
    preis: "pakete",
    abschnitte: [
      { id: "einstieg", titel: "Einstieg" },
      { id: "was-ist-anders", titel: "Was ist anders" },
      { id: "deine-90-tage", titel: "Deine 90 Tage" },
      { id: "was-du-davon-hast", titel: "Was du davon hast" },
      { id: "pakete", titel: "Pakete" },
      { id: "versicherung", titel: "Versicherung" },
      { id: "wer-betreut-dich", titel: "Wer betreut dich" },
      { id: "faq", titel: "Häufige Fragen" },
      { id: "abschluss", titel: "Abschluss" },
    ],
  },
} as const satisfies Record<string, GemesseneSeite>

export type SeitenSchluessel = keyof typeof GEMESSENE_SEITEN

/** Alle gemessenen Seiten, Startseite zuerst. */
export const SEITEN_LISTE: (GemesseneSeite & { schluessel: string })[] = Object.entries(
  GEMESSENE_SEITEN
).map(([schluessel, s]) => ({ schluessel, ...(s as GemesseneSeite) }))

/** Zu welchem Eintrag gehört dieser Pfad? `null`, wenn die Seite nicht meldet. */
export function seiteZuPfad(pfad: string): (GemesseneSeite & { schluessel: string }) | null {
  return SEITEN_LISTE.find((s) => s.pfad === pfad) ?? null
}
