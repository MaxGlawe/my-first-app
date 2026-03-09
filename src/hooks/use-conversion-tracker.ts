"use client"

import { useCallback, useRef } from "react"

const SESSION_KEY = "landing_session_id"

export function useConversionTracker() {
  const lastEvent = useRef<{ type: string; time: number }>({ type: "", time: 0 })

  const trackConversion = useCallback(
    (eventType: string, metadata: Record<string, unknown> = {}) => {
      const sessionId = typeof window !== "undefined"
        ? sessionStorage.getItem(SESSION_KEY)
        : null
      if (!sessionId) return

      // Deduplicate same event within 2s
      const now = Date.now()
      if (lastEvent.current.type === eventType && now - lastEvent.current.time < 2000) return
      lastEvent.current = { type: eventType, time: now }

      fetch("/api/analytics/conversion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          event_type: eventType,
          path: window.location.pathname,
          metadata,
        }),
      }).catch(() => {})
    },
    []
  )

  return { trackConversion }
}
