"use client"

import { useEffect, useRef } from "react"

/**
 * Keeps the screen awake during training sessions.
 * Uses the Screen Wake Lock API (supported in modern browsers).
 * Automatically re-acquires lock on visibility change (e.g., tab switch).
 */
export function useWakeLock(enabled = true) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!enabled) return

    const acquire = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request("screen")
        }
      } catch {
        // Wake Lock request failed (e.g., low battery, unsupported)
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        acquire()
      }
    }

    acquire()
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      wakeLockRef.current?.release()
      wakeLockRef.current = null
    }
  }, [enabled])
}
