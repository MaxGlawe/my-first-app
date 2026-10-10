/**
 * Die Sitzungskennung der öffentlichen Seiten — an EINER Stelle.
 *
 * Vorher legte `LandingAnalytics` sie an, und `useConversionTracker` las sie
 * nur: fehlte sie, verwarf er das Ereignis stillschweigend. Beide hängen
 * aber am gleichen Baum, und React führt Effekte in Baumreihenfolge aus —
 * `AufmerksamkeitMessen` steht über dem `<Suspense>` mit `LandingAnalytics`
 * und misst deshalb zuerst. Wer über einen Ankerlink (`/#preis`) oder mit
 * wiederhergestellter Scrollposition kommt, verlor so genau die Ereignisse,
 * die am meisten gesagt hätten. Derselbe Fehler wie beim Herkunfts-Merker.
 *
 * Also: Wer die Kennung braucht, legt sie an. Erster ist egal.
 */

import { randomUUID } from "@/lib/uuid"

const SCHLUESSEL = "landing_session_id"

export function landingSitzungId(): string {
  if (typeof window === "undefined") return ""
  try {
    let id = sessionStorage.getItem(SCHLUESSEL)
    if (!id) {
      id = randomUUID()
      sessionStorage.setItem(SCHLUESSEL, id)
    }
    return id
  } catch {
    // Privater Modus ohne sessionStorage: ohne Kennung keine Messung.
    return ""
  }
}
