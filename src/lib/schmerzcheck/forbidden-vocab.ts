/**
 * PROJ-23 / HWG compliance (spec §2.4).
 *
 * Words that promise *healing* or *outcome* must never appear on any
 * Schmerzcheck surface (landing, check, report, emails). We sell orientation,
 * not outcome.
 *
 * Note on word boundaries: patterns use `\b` so legitimate disclaimer words are
 * NOT flagged — e.g. "Heilbehandlung" and "Heilmittelwerbegesetz" (mandatory in
 * the HWG disclaimer) do not match `\bheilt\b` / `\bheilen\b` / `\bheilung\b`.
 * "Diagnose" and "Behandlung" are intentionally NOT hard-forbidden because they
 * appear in the approved disclaimer ("ersetzt keine ärztliche … Diagnose").
 */

export interface ForbiddenMatch {
  term: string
  /** The forbidden word as it appeared in the text. */
  found: string
}

/** Hard-forbidden patterns — any match must fail the build. */
export const FORBIDDEN_PATTERNS: { label: string; regex: RegExp }[] = [
  { label: "heilen/heilt/Heilung", regex: /\b(heilt|heilen|heilung)\b/gi },
  { label: "schmerzfrei/Schmerzfreiheit", regex: /\bschmerzfrei\w*\b/gi },
  { label: "garantiert/Garantie", regex: /\bgarantie\w*\b/gi },
  // Outcome promise: "in X Tagen/Wochen schmerzfrei/besser/weg"
  { label: "Outcome-Versprechen (in X Tagen …)", regex: /\bin\s+\d+\s+(tag|tage|tagen|woche|wochen)\b[^.]*\b(besser|weg|schmerzfrei)\b/gi },
  // "über X Patienten erfolgreich therapiert/behandelt"
  { label: "Erfolgs-Statistik (X Patienten erfolgreich …)", regex: /\b\d[\d.]*\s+patienten\b[^.]*\berfolgreich\b/gi },
]

/** Return every forbidden term found in the given text. */
export function findForbiddenTerms(text: string): ForbiddenMatch[] {
  const matches: ForbiddenMatch[] = []
  for (const { label, regex } of FORBIDDEN_PATTERNS) {
    regex.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = regex.exec(text)) !== null) {
      matches.push({ term: label, found: m[0] })
      if (m.index === regex.lastIndex) regex.lastIndex++ // guard against zero-width
    }
  }
  return matches
}

/** True when the text contains no forbidden vocabulary. */
export function isHwgClean(text: string): boolean {
  return findForbiddenTerms(text).length === 0
}
