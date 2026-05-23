"use client"

/**
 * Leert den Warenkorb beim Mounten — für Erfolgsseiten nach abgeschlossenem Kauf.
 * Rendert nichts.
 */

import { useEffect } from "react"
import { useCart } from "@/lib/cart-context"

export function ClearCartOnMount() {
  const { clear } = useCart()
  useEffect(() => {
    clear()
  }, [clear])
  return null
}
