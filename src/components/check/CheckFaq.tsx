"use client"

/**
 * Die häufigen Fragen auf /check — zu, bis jemand eine öffnet.
 *
 * Gemessen wird nur, DASS eine Frage geöffnet wurde, und welche (als
 * Nummer): `faq_offen` mit `frage: 1…6`, je Frage einmal pro Seitenaufruf.
 * Das sagt, welcher Einwand die Leute vor dem Buchen beschäftigt — die
 * Kostenfrage oder die Versicherung. Zuklappen zählt nicht.
 */

import { useRef } from "react"
import { useConversionTracker } from "@/hooks/use-conversion-tracker"

export interface FaqEintrag {
  frage: string
  antwort: string
}

export function CheckFaq({ eintraege }: { eintraege: readonly FaqEintrag[] }) {
  const { trackConversion } = useConversionTracker()
  const gemeldet = useRef<Set<number>>(new Set())

  return (
    <>
      {eintraege.map((e, i) => (
        <details
          key={e.frage}
          className="faq"
          onToggle={(ev) => {
            if (!(ev.currentTarget as HTMLDetailsElement).open) return
            if (gemeldet.current.has(i)) return
            gemeldet.current.add(i)
            trackConversion("faq_offen", { frage: i + 1 })
          }}
        >
          <summary>
            <span>{e.frage}</span>
            <span className="sign" aria-hidden="true"></span>
          </summary>
          <p>{e.antwort}</p>
        </details>
      ))}
    </>
  )
}
