"use client"

/**
 * Merkt sich beim ersten Seitenaufruf, über welche Kampagne jemand kam.
 *
 * Eigene Komponente und nicht im Einwilligungsbanner mit erledigt: Das hier
 * ist keine Einwilligungsfrage. Es werden keine Daten an Dritte gegeben und
 * nichts über den Besuch hinaus gespeichert — die Parameter stehen in der
 * Adresszeile, die der Besucher ohnehin mitgebracht hat, und werden nur an
 * den Buchungslink weitergereicht. `sessionStorage` ist dafür technisch
 * notwendig, weil Anzeige und Kalender auf verschiedenen Domänen liegen.
 *
 * Läuft deshalb auch ohne Zustimmung. Wäre es anders, verlöre jede abgelehnte
 * Einwilligung zugleich die Information, über welchen Kanal gebucht wurde —
 * und die braucht die Praxis für ihre eigene Auswertung, nicht Meta.
 */

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { herkunftMerken } from "@/lib/kampagnen-herkunft"

export function HerkunftMerken() {
  const pfad = usePathname()
  const such = useSearchParams()

  useEffect(() => {
    herkunftMerken()
    // `such` steht in den Abhaengigkeiten, damit ein Wechsel der Adresszeile
    // ohne Neuladen (Next.js-Navigation) nicht uebersehen wird. Gespeichert
    // wird trotzdem nur der erste Treffer — das entscheidet die Funktion.
  }, [pfad, such])

  return null
}
