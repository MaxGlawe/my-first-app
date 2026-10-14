"use client"

import { useCallback, useRef } from "react"
import { landingSitzungId } from "@/lib/landing-sitzung"
import { istInternerBesuch } from "@/lib/intern"
import { isBot } from "@/lib/device-detect"

export function useConversionTracker() {
  const lastEvent = useRef<{ type: string; time: number }>({ type: "", time: 0 })

  const trackConversion = useCallback(
    (eventType: string, metadata: Record<string, unknown> = {}) => {
      // Eigene Besuche fliessen nicht in die Messung — bei 442 Sitzungen im
      // Monat verschiebt ein Testklick die Klickrate sichtbar.
      if (istInternerBesuch()) return

      // Bots ebenfalls nicht — nach DERSELBEN Regel wie der Seitenaufruf.
      // Vorher pruefte nur `LandingAnalytics` auf Bots: Deren Seitenaufruf
      // fiel weg, die Ereignisse liefen weiter. Die Auswertung setzt
      // Sitzungen aber aus Seitenaufrufen zusammen — diese Ereignisse
      // landeten also in einer Sitzung, die es dort nicht gibt, und wurden
      // nirgends gezaehlt. Am 13.10.2026 waren das 196 Sitzungen mit 516
      // Ereignissen.
      if (isBot(navigator.userAgent)) return

      // Fehlt die Kennung, wird sie hier angelegt statt das Ereignis zu
      // verwerfen (siehe lib/landing-sitzung).
      const sessionId = landingSitzungId()
      if (!sessionId) return

      // Deduplicate same event within 2s
      const now = Date.now()
      if (lastEvent.current.type === eventType && now - lastEvent.current.time < 2000) return
      lastEvent.current = { type: eventType, time: now }

      const rumpf = JSON.stringify({
        session_id: sessionId,
        event_type: eventType,
        path: window.location.pathname,
        metadata,
      })

      // `sendBeacon`, nicht `fetch`.
      //
      // Der wichtigste Fall ist genau der, bei dem die Seite gleich
      // verschwindet: der Klick auf „Konsultation buchen". Ein laufendes
      // `fetch` bricht der Browser beim Verlassen der Seite ab — das
      // Ereignis waere unterwegs verloren, und ausgerechnet der Schritt,
      // auf den es ankommt, fehlte in der Messung. `sendBeacon` uebergibt
      // die Daten dem Browser, der sie auch nach dem Entladen noch
      // zustellt.
      //
      // Rueckfall auf `fetch` mit `keepalive` fuer Browser ohne Beacon —
      // und weil manche In-App-Ansichten `sendBeacon` zwar kennen, aber
      // `false` zurueckgeben (Warteschlange voll).
      const gesendet =
        typeof navigator.sendBeacon === "function" &&
        navigator.sendBeacon("/api/analytics/conversion", new Blob([rumpf], { type: "application/json" }))

      if (!gesendet) {
        fetch("/api/analytics/conversion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: rumpf,
          keepalive: true,
        }).catch(() => {})
      }
    },
    []
  )

  return { trackConversion }
}
