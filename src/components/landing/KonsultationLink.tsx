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

/**
 * Misst, was nach dem Klick passiert — genau einmal je Seitenaufruf.
 *
 * `klick_verlassen` mit der Zeit in Millisekunden: Der Besucher hat die
 * Seite verlassen, ist also unterwegs zur Buchung. Unter etwa einer
 * Sekunde heisst das: die Weiterleitung hat gegriffen.
 *
 * `klick_geblieben`: Nach drei Sekunden ist er noch da. Entweder hat der
 * Link nichts getan, oder er hat einen zweiten Tab geoeffnet und ist
 * zurueckgewechselt. Beides muss man wissen.
 */
function verbleibMessen(
  melden: (typ: string, daten?: Record<string, unknown>) => void,
  abschnitt: string
) {
  if (typeof window === "undefined") return
  const w = window as unknown as { __praxisKlickGemessen?: boolean }
  if (w.__praxisKlickGemessen) return
  w.__praxisKlickGemessen = true

  const start = Date.now()
  let fertig = false

  const beenden = (typ: string) => {
    if (fertig) return
    fertig = true
    window.clearTimeout(uhr)
    window.removeEventListener("pagehide", beimVerlassen)
    melden(typ, { abschnitt, ms: Date.now() - start })
  }

  // `pagehide` und nicht `beforeunload`: Auf iOS feuert `beforeunload`
  // nicht, wenn die Seite in den Seiten-Cache wandert — und iOS ist der
  // groesste Teil des Anzeigen-Verkehrs.
  const beimVerlassen = () => beenden("klick_verlassen")
  window.addEventListener("pagehide", beimVerlassen)

  const uhr = window.setTimeout(() => beenden("klick_geblieben"), 3000)
}

interface KonsultationLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  /** Welcher Abschnitt der Seite — landet in utm_content und im Ereignis. */
  abschnitt: string
  variante?: ProgrammVariante
  /**
   * Meldet der Klick auch an Meta (`InitiateCheckout`)?
   *
   * Voreinstellung ja — auf der oeffentlichen Website laeuft das so seit dem
   * 09.10.2026. Auf den Anzeigen-Landingpages unter /start ist es
   * ausdruecklich AUS: Dort darf nur ein PageView an Meta gehen. Ein
   * Ereignis am Buchungsknopf sagt Meta, dass dieser Mensch einen
   * Physiotherapie-Termin anstrebt, und das ist eine Angabe zur Gesundheit
   * (Art. 9 DSGVO). Die eigene Messung zaehlt den Klick trotzdem — sie
   * verlaesst das Haus nicht.
   */
  metaMelden?: boolean
  /**
   * Oeffnet der Link einen neuen Tab?
   *
   * Auf der Website ja — dort soll die gelesene Seite stehen bleiben.
   * Auf den Anzeigen-Seiten NEIN: Neun von zehn Besuchern kommen dort im
   * Browser INNERHALB der Facebook- oder Instagram-App an, und was `_blank`
   * dort tut, haengt von App-Version und Einstellung ab — mal ein zweites
   * Fenster, aus dem man schwer zurueckfindet, mal gar nichts. Ein
   * Buchungsknopf, der bei einem Teil der Besucher nichts tut, ist der
   * teuerste denkbare Fehler: Die Anzeige ist bezahlt, der Klick gezaehlt,
   * und der Termin kommt nie zustande.
   */
  neuerTab?: boolean
  children: ReactNode
}

export function KonsultationLink({
  abschnitt,
  variante,
  metaMelden = true,
  neuerTab = true,
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
      {...(neuerTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={(e) => {
        // KEIN preventDefault, nirgends. Der Browser folgt dem `href`, und
        // alles hier drin ist nur Beiwerk. Faellt es aus — Pixel geblockt,
        // Beacon abgelehnt, JavaScript-Fehler —, geht der Besucher trotzdem
        // zur Buchungsseite. Ein Tracking, das den Weg verstellen kann,
        // waere die Messung nicht wert.
        if (metaMelden) fireKonsultationKlick(abschnitt)
        if (metaMelden) fireKonsultationKlick(abschnitt)

        // Und in die EIGENE Messung. Bis zum 10.10.2026 wurde dieser Klick
        // nirgends festgehalten — ausgerechnet der entscheidende Schritt.
        // In der Auswertung endete der Weg jedes Besuchers auf der
        // Startseite, und ob er weiterging, war schlicht unbekannt.
        //
        // Meta-Pixel reicht dafuer nicht: Er feuert nur mit Einwilligung, und
        // in den ersten dreissig Tagen hatte von 218 bezahlten Besuchern
        // niemand eine erteilt. Die eigene Messung laeuft cookiefrei ueber
        // eine Sitzungskennung und zaehlt deshalb jeden.
        // Seit dem 15.10.2026 heisst der Einstieg „Kennenlernen" und ist
        // kostenlos. Der Ereignisname zieht mit — sonst steht in der
        // Auswertung jahrelang der Name eines Angebots, das es nicht mehr
        // gibt. Die Auswertung nimmt BEIDE Namen fuer dieselbe Stufe, damit
        // die Zeit davor vergleichbar bleibt; der Schnitt ist als Marke
        // hinterlegt (UMSTELLUNG_KENNENLERNEN).
        trackConversion("kennenlernen_klick", { abschnitt, variante: variante ?? null })

        // Und dann: Kommt er ueberhaupt dort an?
        //
        // Der Klick allein sagt das nicht. Verlaesst er die Seite gleich
        // danach, ist er unterwegs; ist er nach drei Sekunden noch hier,
        // hat die Weiterleitung nicht stattgefunden. Ohne diese beiden
        // Ereignisse laesst sich „niemand klickt" nicht von „der Knopf tut
        // nichts" unterscheiden — und das sind entgegengesetzte Probleme.
        verbleibMessen(trackConversion, abschnitt)

        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
