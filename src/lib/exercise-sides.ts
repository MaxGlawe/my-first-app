/**
 * Erkennung „pro Seite" für Übungen.
 *
 * Bestehende Trainingspläne haben kein Datenfeld dafür — die Information steckt
 * im Freitext („3× 10 Wdh. pro Seite", „Seite wechseln", „beidseitig"). Damit
 * alte Pläne ohne Neuanlage vom Seitenwechsel profitieren, wird sie beim Laden
 * aus den vorhandenen Texten erkannt.
 *
 * Ein explizit gesetztes `params.pro_seite` gewinnt immer gegen die Erkennung,
 * damit Fehltreffer im Plan-Builder korrigierbar sind.
 */

export type Seite = "rechts" | "links"

/**
 * Nur eindeutige Formulierungen. Bewusst NICHT enthalten: „seitlich",
 * „Seitlage", „Seitneigung" — die beschreiben die Ausgangsposition, nicht
 * zwangsläufig zwei Durchgänge.
 */
const PRO_SEITE_MUSTER: RegExp[] = [
  /\bpro\s+seite\b/i,
  /\bje\s+seite\b/i,
  /\bjede\s+seite\b/i,
  /\bbeide\s+seiten\b/i,
  /\bseite\s+wechseln\b/i,
  /\bseitenwechsel\b/i,
  /\bbeidseitig\b/i,
  /\bbeidseits\b/i,
  /\bwechselseitig\b/i,
  /\brechts\s+und\s+links\b/i,
  /\blinks\s+und\s+rechts\b/i,
  /\bje\s+(bein|arm|seite|hand|fuß|fuss|schulter|knie)\b/i,
  /\bpro\s+(bein|arm|hand|fuß|fuss|schulter|knie)\b/i,
  /\bjeweils\s+(links|rechts)\b/i,
]

type SeitenQuelle = {
  name?: string | null
  beschreibung?: string | null
  ausfuehrung?: Array<{ nummer: number; beschreibung: string }> | null
  params?: { pro_seite?: boolean | null; anmerkung?: string | null }
  /** Stammdatum der Übung (exercises.standard_pro_seite) */
  standardProSeite?: boolean | null
}

/** Findet das erste Muster, das anspricht — für Anzeige/Debug. */
export function proSeiteTreffer(ex: SeitenQuelle): string | null {
  const texte = [
    ex.name,
    ex.params?.anmerkung,
    ex.beschreibung,
    ...(ex.ausfuehrung?.map((s) => s.beschreibung) ?? []),
  ].filter((t): t is string => !!t)

  for (const text of texte) {
    for (const muster of PRO_SEITE_MUSTER) {
      const treffer = text.match(muster)
      if (treffer) return treffer[0]
    }
  }
  return null
}

/**
 * Wird diese Übung pro Seite ausgeführt? Vorrang:
 *   1. Plan-Übung (`params.pro_seite`) — Ausnahme für genau diesen Plan
 *   2. Übungs-Stammdatum (`standard_pro_seite`) — gilt in allen Plänen
 *   3. Texterkennung — Rettungsnetz für ungepflegten Altbestand
 */
export function istProSeite(ex: SeitenQuelle): boolean {
  if (ex.params?.pro_seite === true) return true
  if (ex.params?.pro_seite === false) return false
  if (ex.standardProSeite === true) return true
  if (ex.standardProSeite === false) return false
  return proSeiteTreffer(ex) !== null
}

/**
 * Seite für einen Satz-Index (0-basiert) bei `saetzeProSeite` Sätzen je Seite.
 * Erst alle Sätze rechts, dann alle links — so ist der Wechsel ein einzelner
 * Schritt und nicht ein Hin und Her.
 */
export function seiteFuerSatz(satzIndex: number, saetzeProSeite: number): Seite {
  return satzIndex < saetzeProSeite ? "rechts" : "links"
}

/** Ist dieser Satz der letzte der ersten Seite? Danach wird gewechselt. */
export function istSeitenwechselNach(satzIndexAbgeschlossen: number, saetzeProSeite: number): boolean {
  return satzIndexAbgeschlossen === saetzeProSeite
}

export function seiteLabel(seite: Seite): string {
  return seite === "rechts" ? "rechte Seite" : "linke Seite"
}
