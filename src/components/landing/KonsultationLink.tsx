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

import type { AnchorHTMLAttributes, ReactNode } from "react"
import { buchungsUrl } from "@/lib/programm"
import type { ProgrammVariante } from "@/lib/programm"
import { fireKonsultationKlick } from "@/components/analytics/MetaPixel"

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
  return (
    <a
      href={buchungsUrl(abschnitt, variante)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        // Das Ereignis darf den Klick niemals aufhalten: `target="_blank"`
        // oeffnet ohnehin einen neuen Tab, diese Seite bleibt stehen, und
        // selbst wenn fbq fehlt oder geblockt ist, passiert hier nichts
        // ausser dass nichts gezaehlt wird.
        fireKonsultationKlick(abschnitt)
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
