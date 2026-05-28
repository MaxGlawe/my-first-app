"use client"

/**
 * HighlightChallenges — Produkt-Grid für die Shop-Landings.
 *
 * Zieht die aktiven Produkte aus /api/shop/products und rendert sie als
 * ProductCard-Grid. Loading-State über ProductCardSkeleton. Bei mehr als
 * `limit` Produkten wird die Liste gekürzt — vollständiger Katalog liegt
 * unter /kurse/alle bzw. /shop/kurse.
 */

import { useEffect, useState } from "react"
import { ProductCard, ProductCardSkeleton, type ShopProduct } from "@/components/shop/ProductCard"

interface HighlightChallengesProps {
  mode?: "app" | "website"
  /** Maximal anzuzeigende Produkte (default 4). */
  limit?: number
}

export function HighlightChallenges({ mode = "website", limit = 4 }: HighlightChallengesProps) {
  const [products, setProducts] = useState<ShopProduct[] | null>(null)

  useEffect(() => {
    fetch("/api/shop/products")
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((json: { products?: ShopProduct[] }) => setProducts(json.products ?? []))
      .catch(() => setProducts([]))
  }, [])

  if (products === null) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: limit }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Masterclasses gehören NICHT ins Challenge-Highlight — sie stehen separat
  // (eigene Premium-Sektion / eigener „Masterclasses"-Tab).
  const challenges = products.filter((p) => p.produkt_typ !== "masterclass")

  if (challenges.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">Challenges sind bald verfügbar.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {challenges.slice(0, limit).map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} mode={mode} />
      ))}
    </div>
  )
}
