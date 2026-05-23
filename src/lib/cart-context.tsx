"use client"

/**
 * Mehrartikel-Warenkorb für den Praxis-OS-Shop.
 *
 * - localStorage-persistiert (Key `praxis_shop_cart`).
 * - Pro Produkt genau eine Lizenz → keine Mengen, keine Duplikate (slug-eindeutig).
 * - SSR-sicher: beim Server-Render leerer Zustand, Hydration erst nach mount.
 * - Geteilt über beide Shop-Bäume (/shop/* und /kurse/*) — der Provider hängt
 *   in beiden Layouts, der Zustand wird über localStorage + storage/Custom-Event
 *   synchron gehalten.
 * - Steuert zusätzlich den Drawer (isOpen / open / close).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

// ── Typen ───────────────────────────────────────────────────────────────────

export interface CartItem {
  slug: string
  titel: string
  preis: number
  waehrung: string
  hero_bild: string | null
}

interface CartContextValue {
  items: CartItem[]
  count: number
  total: number
  add: (item: CartItem) => void
  remove: (slug: string) => void
  clear: () => void
  has: (slug: string) => boolean
  /** Drawer-Steuerung */
  isOpen: boolean
  open: () => void
  close: () => void
  /** Markiert, ob localStorage bereits hydriert wurde (vermeidet SSR-Flicker) */
  hydrated: boolean
}

const STORAGE_KEY = "praxis_shop_cart"
const CHANGE_EVENT = "praxis-shop-cart-changed"

// ── localStorage-Helfer ─────────────────────────────────────────────────────

function readCart(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    // Nur valide Items durchlassen (Schutz gegen alte/kaputte Daten)
    return parsed.filter(
      (i): i is CartItem =>
        i &&
        typeof i.slug === "string" &&
        typeof i.titel === "string" &&
        typeof i.preis === "number"
    )
  } catch {
    return []
  }
}

function writeCart(next: CartItem[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* localStorage nicht verfügbar — still ignorieren */
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

// ── Context ─────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Hydration + Sync (gleiche Komponente, andere Tabs, anderer Shop-Baum)
  useEffect(() => {
    setItems(readCart())
    setHydrated(true)

    const sync = () => setItems(readCart())
    window.addEventListener(CHANGE_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  const add = useCallback((item: CartItem) => {
    const current = readCart()
    if (current.some((i) => i.slug === item.slug)) return // keine Duplikate
    const next = [...current, item]
    writeCart(next)
    setItems(next)
  }, [])

  const remove = useCallback((slug: string) => {
    const next = readCart().filter((i) => i.slug !== slug)
    writeCart(next)
    setItems(next)
  }, [])

  const clear = useCallback(() => {
    writeCart([])
    setItems([])
  }, [])

  const has = useCallback(
    (slug: string) => items.some((i) => i.slug === slug),
    [items]
  )

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const total = useMemo(
    () => items.reduce((sum, i) => sum + (i.preis ?? 0), 0),
    [items]
  )

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.length,
      total,
      add,
      remove,
      clear,
      has,
      isOpen,
      open,
      close,
      hydrated,
    }),
    [items, total, add, remove, clear, has, isOpen, open, close, hydrated]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error("useCart muss innerhalb von <CartProvider> verwendet werden.")
  }
  return ctx
}
