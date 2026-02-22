"use client"

import { useCallback, useRef } from "react"

/**
 * Lightweight analytics hook for tracking feature usage.
 * Fires and forgets — never blocks the UI.
 * Deduplicates identical events within 2 seconds to prevent double-fires.
 */
export function useAnalytics() {
  const lastEvent = useRef<{ type: string; time: number }>({ type: "", time: 0 })

  const trackEvent = useCallback(
    (eventType: string, metadata: Record<string, unknown> = {}) => {
      // Deduplicate same event within 2s
      const now = Date.now()
      if (lastEvent.current.type === eventType && now - lastEvent.current.time < 2000) {
        return
      }
      lastEvent.current = { type: eventType, time: now }

      // Fire and forget
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: eventType, metadata }),
      }).catch(() => {
        // Silently ignore analytics failures
      })
    },
    []
  )

  return { trackEvent }
}
