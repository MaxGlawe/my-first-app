/**
 * Alle Zeilen holen — auch wenn es mehr als tausend sind.
 *
 * ── Die Falle ────────────────────────────────────────────────────────────
 *
 * Supabase deckelt JEDE Antwort bei 1000 Zeilen. `.limit(20000)` ändert
 * daran nichts: Die Zahl wird angenommen, und es kommen trotzdem 1000.
 * Kein Fehler, keine Warnung, kein abweichender Statuscode — die Abfrage
 * sieht erfolgreich aus und ist unvollständig.
 *
 * Schlimmer: Ohne `order()` sind es die ZUERST GESCHRIEBENEN 1000, also die
 * ältesten. Eine Auswertung über dreissig Tage zeigt dann die ersten Tage
 * vollständig und den Rest gar nicht.
 *
 * Genau das ist am 20.10.2026 aufgefallen: Das Dashboard meldete 135
 * Besucher auf /check und NULL gestartete Checks, obwohl in der Datenbank
 * 530 Check-Ereignisse standen und 68 Sitzungen den Check begonnen hatten.
 * Die Route hatte die 1000 ältesten Ereignisse geholt — die jüngsten davon
 * waren eine Woche alt, aus der Zeit vor der Seite. Betroffen war nicht nur
 * der Check: JEDE ereignisbasierte Zahl im Dashboard war seit dem Tag zu
 * niedrig, an dem die tausendste Zeile im Zeitfenster geschrieben wurde.
 *
 * ── Die Regel ────────────────────────────────────────────────────────────
 *
 * Wer mehr als tausend Zeilen erwarten könnte, holt sie seitenweise — und
 * sagt, wenn er die Obergrenze erreicht hat. Ein stillschweigend
 * abgeschnittener Datensatz ergibt eine Auswertung, die falsch ist, ohne
 * falsch auszusehen.
 */

export interface SeitenErgebnis<T> {
  zeilen: T[]
  /**
   * Obergrenze erreicht — es gibt vermutlich noch mehr.
   *
   * Gehört ins Dashboard und nicht nur ins Protokoll: Eine Zahl, die auf
   * unvollständigen Daten beruht, muss sich selbst als solche zu erkennen
   * geben.
   */
  abgeschnitten: boolean
}

/**
 * Seitenweise holen, bis nichts mehr kommt.
 *
 * `bauen` muss die Abfrage JEDES MAL neu erzeugen: Ein Supabase-Builder
 * lässt sich nur einmal ausführen, ein wiederverwendeter liefert beim
 * zweiten Aufruf denselben Ausschnitt.
 *
 * Die Sortierung gehört in `bauen` — ohne sie ist die Reihenfolge zwischen
 * zwei Seiten nicht garantiert, und dann fehlen beim Blättern Zeilen oder
 * erscheinen doppelt.
 */
export async function alleZeilen<T>(
  bauen: (von: number, bis: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  { hoechstens = 50_000, name = "Abfrage" }: { hoechstens?: number; name?: string } = {}
): Promise<SeitenErgebnis<T>> {
  const SEITE = 1000
  const zeilen: T[] = []

  for (let i = 0; i * SEITE < hoechstens; i++) {
    const { data, error } = await bauen(i * SEITE, i * SEITE + SEITE - 1)
    if (error) throw new Error(`${name}: ${error.message}`)
    zeilen.push(...(data ?? []))
    // Weniger als eine volle Seite: Das war der Rest.
    if (!data || data.length < SEITE) return { zeilen, abgeschnitten: false }
  }

  console.warn(`[alleZeilen] ${name}: Obergrenze von ${hoechstens} Zeilen erreicht.`)
  return { zeilen, abgeschnitten: true }
}
