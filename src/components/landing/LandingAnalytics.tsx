"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { getDeviceType, getBrowser, isBot } from "@/lib/device-detect"

const SESSION_KEY = "landing_session_id"

function getSessionId(): string {
  if (typeof window === "undefined") return ""
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export function LandingAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const mountTime = useRef(Date.now())
  const pageviewId = useRef<string | null>(null)

  useEffect(() => {
    const ua = navigator.userAgent
    if (isBot(ua)) return

    mountTime.current = Date.now()
    const sessionId = getSessionId()

    fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
        utm_source: searchParams.get("utm_source") || null,
        utm_medium: searchParams.get("utm_medium") || null,
        utm_campaign: searchParams.get("utm_campaign") || null,
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

    window.addEventListener("beforeunload", sendDuration)
    return () => {
      sendDuration()
      window.removeEventListener("beforeunload", sendDuration)
    }
  }, [pathname, searchParams])

  return null
}
