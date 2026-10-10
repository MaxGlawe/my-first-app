"use client"

/**
 * Wie weit jemand auf der Startseite liest.
 *
 * Ohne diese Zahl weiss man nur, DASS 91 Prozent der Besucher nach einer
 * Seite gehen — nicht, ob sie nach drei Sekunden abgesprungen sind oder bis
 * zum Preis gescrollt und sich dann anders entschieden haben. Das sind zwei
 * voellig verschiedene Probleme: Das erste ist ein Anzeigen-Problem (falsches
 * Publikum), das zweite ein Seiten-Problem (Angebot ueberzeugt nicht).
 *
 * Gemessen werden vier Marken (25/50/75/100 Prozent), jede genau einmal je
 * Sitzung. Kein Cookie, keine Einwilligung noetig: Es wird nichts gespeichert
 * ausser der ohnehin bestehenden Sitzungskennung, und nichts verlaesst das
 * eigene Haus.
 */

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useConversionTracker } from "@/hooks/use-conversion-tracker"

const MARKEN = [25, 50, 75, 100] as const

export function LesetiefeMessen({ seite }: { seite?: string }) {
  const pfad = usePathname()
  const { trackConversion } = useConversionTracker()
  const gemeldet = useRef<Set<number>>(new Set())

  useEffect(() => {
    gemeldet.current = new Set()

    function pruefen() {
      const hoehe = document.documentElement.scrollHeight - window.innerHeight
      if (hoehe <= 0) return
      const anteil = Math.min(100, Math.round(((window.scrollY || 0) / hoehe) * 100))

      for (const marke of MARKEN) {
        if (anteil >= marke && !gemeldet.current.has(marke)) {
          gemeldet.current.add(marke)
          // Der Ereignisname traegt die Marke, nicht nur die Metadaten: So
          // laesst sich der Trichter ohne JSON-Auswertung bauen.
          trackConversion(`lesetiefe_${marke}`, { seite: seite ?? pfad })
        }
      }
    }

    // `passive`, damit das Scrollen nicht ins Stocken geraet — eine Messung,
    // die das Lesen stoert, misst am Ende sich selbst.
    window.addEventListener("scroll", pruefen, { passive: true })
    pruefen()
    return () => window.removeEventListener("scroll", pruefen)
  }, [pfad, seite, trackConversion])

  return null
}
