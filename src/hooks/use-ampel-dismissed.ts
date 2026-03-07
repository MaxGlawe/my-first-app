"use client"

/**
 * PROJ-17: Shared hook for Ampel dismissals stored in localStorage.
 * Dismissals reset automatically each new day.
 * Uses a custom event so sidebar badge updates instantly when Ampel page dismisses.
 */

import { useState, useCallback, useEffect } from "react"

const DISMISS_KEY = "ampel-dismissed"
const DISMISS_EVENT = "ampel-dismissed-change"

function todayStr(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISS_KEY)
    if (!raw) return new Set()
    const { date, ids } = JSON.parse(raw)
    if (date !== todayStr()) return new Set()
    return new Set(ids as string[])
  } catch {
    return new Set()
  }
}

function save(ids: Set<string>) {
  localStorage.setItem(
    DISMISS_KEY,
    JSON.stringify({ date: todayStr(), ids: [...ids] }),
  )
  // Notify other components in the same tab
  window.dispatchEvent(new Event(DISMISS_EVENT))
}

export function useAmpelDismissed() {
  const [dismissed, setDismissed] = useState<Set<string>>(() => load())

  // Listen for changes from other components
  useEffect(() => {
    function onUpdate() {
      setDismissed(load())
    }
    window.addEventListener(DISMISS_EVENT, onUpdate)
    window.addEventListener("storage", onUpdate)
    return () => {
      window.removeEventListener(DISMISS_EVENT, onUpdate)
      window.removeEventListener("storage", onUpdate)
    }
  }, [])

  const dismiss = useCallback((id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev).add(id)
      save(next)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setDismissed(new Set())
    save(new Set())
  }, [])

  return { dismissed, dismiss, clearAll }
}
