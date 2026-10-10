"use client"

/**
 * Der Link auf den Buchungskalender — an einer Stelle.
 *
 * Fünfzehn Knöpfe auf der öffentlichen Seite führen zur Konsultation. Vorher
 * baute jeder sein eigenes `<a href={buchungsUrl(…)} target="_blank">`. Das
 * funktionierte, solange der Link nichts weiter tun musste; sobald er ein
 * Ereignis an Meta meldet, wäre es fünfzehnmal dieselbe Zeile — und beim
 * sechzehnten Knopf vergisst sie jemand.
 *
 * Hier gilt deshalb: Wer auf die Konsultation verlinkt, nimmt diese
 * Komponente. Dann ist der Klick gezählt, ohne dass jemand daran denken muss.
 *
 * Der Kalender liegt auf physiotherapie-glawe.de, also auf einer fremden
 * Seite ohne unseren Pixel. Ohne das Ereignis hier endet die Spur beim
 * Verlassen der Seite.
 */

import { useEffect, useState } from "react"
import type { AnchorHTMLAttributes, ReactNode } from "react"
import { buchungsUrl } from "@/lib/programm"
import type { ProgrammVariante } from "@/lib/programm"
import { fireKonsultationKlick } from "@/components/analytics/MetaPixel"
import { mitHerkunft } from "@/lib/kampagnen-herkunft"
import { useConversionTracker } from "@/hooks/use-conversion-tracker"

interface KonsultationLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  /** Welcher Abschnitt der Seite — landet in utm_content und im Ereignis. */
  abschnitt: string
  variante?: ProgrammVariante
  children: ReactNode
}

export function KonsultationLink({
  abschnitt,
  variante,
  children,
  onClick,
  ...rest
}: KonsultationLinkProps) {
  const standard = buchungsUrl(abschnitt, variante)
  const [ziel, setZiel] = useState(standard)
  const { trackConversion } = useConversionTracker()

  useEffect(() => {
    // Erst nach dem Einhaengen: `sessionStorage` gibt es auf dem Server nicht,
    // und eine serverseitig andere Adresse als im Browser waere ein
    // Hydrations-Fehler. Die erste Darstellung traegt deshalb die
    // Standard-Parameter, die Kampagnen-Herkunft kommt einen Wimpernschlag
    // spaeter dazu — lange bevor jemand klicken kann.
    setZiel(mitHerkunft(standard))
  }, [standard])

  return (
    <a
      href={ziel}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        // Das Ereignis darf den Klick niemals aufhalten: `target="_blank"`
        // oeffnet ohnehin einen neuen Tab, diese Seite bleibt stehen, und
        // selbst wenn fbq fehlt oder geblockt ist, passiert hier nichts
        // ausser dass nichts gezaehlt wird.
        fireKonsultationKlick(abschnitt)

        // Und in die EIGENE Messung. Bis zum 10.10.2026 wurde dieser Klick
        // nirgends festgehalten — ausgerechnet der entscheidende Schritt.
        // In der Auswertung endete der Weg jedes Besuchers auf der
        // Startseite, und ob er weiterging, war schlicht unbekannt.
        //
        // Meta-Pixel reicht dafuer nicht: Er feuert nur mit Einwilligung, und
        // in den ersten dreissig Tagen hatte von 218 bezahlten Besuchern
        // niemand eine erteilt. Die eigene Messung laeuft cookiefrei ueber
        // eine Sitzungskennung und zaehlt deshalb jeden.
        trackConversion("konsultation_klick", { abschnitt, variante: variante ?? null })

        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
