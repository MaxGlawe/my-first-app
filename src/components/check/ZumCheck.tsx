"use client"

/**
 * „Noch unsicher? Mach zuerst den Check" — scrollt zurück zur Karte im Hero.
 *
 * Ein Knopf statt eines Ankerlinks: `#check` in der Adresszeile bliebe
 * beim Weitertippen stehen, und das Zurück des Browsers spränge dann
 * innerhalb der Seite statt zur Anzeige zurück. Gemeldet wird
 * `check_sprung` mit dem Abschnitt, aus dem gesprungen wurde.
 */

import type { CSSProperties, ReactNode } from "react"
import { useConversionTracker } from "@/hooks/use-conversion-tracker"

export function ZumCheck({
  abschnitt,
  style,
  children,
}: {
  abschnitt: string
  style?: CSSProperties
  children: ReactNode
}) {
  const { trackConversion } = useConversionTracker()
  return (
    <button
      type="button"
      onClick={() => {
        trackConversion("check_sprung", { abschnitt })
        document.getElementById("check")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }}
      style={style}
    >
      {children}
    </button>
  )
}
