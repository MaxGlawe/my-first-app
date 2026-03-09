"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAnalytics } from "@/hooks/use-analytics"

/**
 * Invisible component that tracks page views on route changes.
 * Place in a layout to auto-track all child routes.
 */
export function AnalyticsTracker() {
  const pathname = usePathname()
  const { trackEvent } = useAnalytics()

  useEffect(() => {
    trackEvent("page_view", { path: pathname })
  }, [pathname, trackEvent])

  return null
}
