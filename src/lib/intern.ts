/**
 * Eigene Besuche aus der Messung heraushalten.
 *
 * Bei 442 Sitzungen im Monat ist jeder eigene Seitenaufruf ein Viertelprozent
 * — und wer die Seite baut, verhaelt sich voellig anders als ein Besucher:
 * scrollt gezielt zum Preis, klickt den Buchungsbutton zum Testen, laesst den
 * Tab offen. Genau die Signale, an denen der Trichter haengt. Ungefiltert
 * sieht die Seite dadurch besser aus, als sie ist.
 *
 * Zwei Wege, beide absichtlich banal:
 *
 *   1. `?intern=1` einmal aufrufen -> Markierung im localStorage, gilt fuer
 *      dieses Geraet dauerhaft. `?intern=0` hebt sie auf.
 *   2. `utm_content=test` in der Adresse -> gilt nur fuer diesen Aufruf.
 *      Praktisch fuer Testlinks, die man jemandem schickt.
 *
 * localStorage, nicht sessionStorage: Die Markierung soll den Browser
 * ueberleben, sonst muesste man sie jeden Morgen neu setzen.
 */

const SCHLUESSEL = "praxis_intern"

/** Wertet `?intern=` aus und merkt sich das Ergebnis. Vor jeder Messung aufrufen. */
export function internSchalterLesen(): void {
  if (typeof window === "undefined") return
  const wert = new URLSearchParams(window.location.search).get("intern")
  if (wert === null) return
  try {
    if (wert === "0" || wert === "false") localStorage.removeItem(SCHLUESSEL)
    else localStorage.setItem(SCHLUESSEL, "1")
  } catch {
    // Privater Modus: dann eben ungefiltert. Lieber messen als abstuerzen.
  }
}

/** Soll dieser Aufruf gemessen werden? */
export function istInternerBesuch(): boolean {
  if (typeof window === "undefined") return false
  try {
    if (localStorage.getItem(SCHLUESSEL) === "1") return true
  } catch {
    // ignorieren
  }
  return new URLSearchParams(window.location.search).get("utm_content") === "test"
}
