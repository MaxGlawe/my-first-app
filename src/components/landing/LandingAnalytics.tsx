"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { getDeviceType, getBrowser, isBot } from "@/lib/device-detect"
import { landingSitzungId } from "@/lib/landing-sitzung"
import { internSchalterLesen, istInternerBesuch } from "@/lib/intern"

export function LandingAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const mountTime = useRef(Date.now())
  const pageviewId = useRef<string | null>(null)

  useEffect(() => {
    const ua = navigator.userAgent
    if (isBot(ua)) return

    // `?intern=1` zuerst auswerten, dann pruefen: so wirkt der Schalter
    // schon fuer den Aufruf, mit dem er gesetzt wird.
    internSchalterLesen()
    if (istInternerBesuch()) return

    mountTime.current = Date.now()
    const sessionId = landingSitzungId()
    if (!sessionId) return

    fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
        utm_source: searchParams.get("utm_source") || null,
        utm_medium: searchParams.get("utm_medium") || null,
        utm_campaign: searchParams.get("utm_campaign") || null,
        // utm_content traegt bei Meta die Anzeigen-Kennung. Ohne sie weiss
        // man, dass Meta Besucher bringt — aber nicht, welche Anzeige.
        utm_content: searchParams.get("utm_content") || null,
        utm_term: searchParams.get("utm_term") || null,
        device_type: getDeviceType(ua),
        browser: getBrowser(ua),
        session_id: sessionId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.id) pageviewId.current = data.id
      })
      .catch(() => {})

    function sendDuration() {
      if (!pageviewId.current) return
      const seconds = Math.floor((Date.now() - mountTime.current) / 1000)
      if (seconds < 1) return
      const blob = new Blob(
        [JSON.stringify({ pageview_id: pageviewId.current, duration_seconds: seconds })],
        { type: "application/json" }
      )
      navigator.sendBeacon("/api/analytics/duration", blob)
    }

    // `pagehide` zusaetzlich zu `beforeunload`: Auf iOS feuert
    // `beforeunload` nicht, wenn die Seite in den Seiten-Cache wandert —
    // dort faellt also jede Dauer weg, und iOS ist der groesste Teil des
    // Anzeigen-Traffics.
    window.addEventListener("beforeunload", sendDuration)
    window.addEventListener("pagehide", sendDuration)
    return () => {
      sendDuration()
      window.removeEventListener("beforeunload", sendDuration)
      window.removeEventListener("pagehide", sendDuration)
    }
  }, [pathname, searchParams])

  return null
}
