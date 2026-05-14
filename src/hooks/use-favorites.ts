"use client"

/**
 * PROJ-20: useFavorites
 * Leichtgewichtige Favoriten — localStorage, kein Backend.
 * Synchronisiert über Komponenten (Custom-Event) und Tabs (storage-Event).
 */

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "praxis-os-shop-favorites"
const CHANGE_EVENT = "praxis-os-favorites-changed"

function readFavorites(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeFavorites(next: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* localStorage nicht verfügbar — still ignorieren */
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setFavorites(readFavorites())
    setLoaded(true)

    const sync = () => setFavorites(readFavorites())
    window.addEventListener(CHANGE_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  const toggleFavorite = useCallback((slug: string) => {
    const current = readFavorites()
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug]
    writeFavorites(next)
    setFavorites(next)
  }, [])

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites]
  )

  return { favorites, toggleFavorite, isFavorite, count: favorites.length, loaded }
}
