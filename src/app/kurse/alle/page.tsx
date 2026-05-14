"use client"

/**
 * PROJ-21: /kurse/alle — Öffentliche Kurs-Gesamtübersicht (Website-Shop)
 *
 * Der "Alle Kurse"-Katalog: Ziel der Suche, des Favoriten-Buttons und des
 * "Alle Kurse ansehen"-Links aus dem Mega-Menü. Pendant zu /shop/kurse.
 * Liest ?q= (Suche), ?fav=1 (Favoriten), ?anliegen= (Rubrik).
 */

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ShopHeader } from "@/components/shop/ShopHeader"
import { ProductCard, ProductCardSkeleton, type ShopProduct } from "@/components/shop/ProductCard"
import { ANLIEGEN_LIST } from "@/components/shop/KurseMenu"
import { TrustRow } from "@/components/shop/TrustRow"
import { AppUpsell } from "@/components/shop/AppUpsell"
import { useFavorites } from "@/hooks/use-favorites"
import { Heart, X } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Page (Suspense-Wrapper für useSearchParams) ──────────────────────────────

export default function PublicKurseAllePage() {
  return (
    <Suspense fallback={<KurseFallback />}>
      <PublicKurseAlle />
    </Suspense>
  )
}

function KurseFallback() {
  return (
    <div className="min-h-screen bg-slate-50">
      <ShopHeader mode="website" showBack backHref="/kurse" backLabel="Übersicht" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Katalog ───────────────────────────────────────────────────────────────────

function PublicKurseAlle() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const favOnly = searchParams.get("fav") === "1"

  const { favorites, count: favCount } = useFavorites()

  const [products, setProducts] = useState<ShopProduct[]>([])
  const [selectedAnliegen, setSelectedAnliegen] = useState<string | null>(
    searchParams.get("anliegen")
  )
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    fetch("/api/shop/products")
      .then((res) => {
        if (!res.ok) throw new Error("Kurse konnten nicht geladen werden.")
        return res.json()
      })
      .then((json: { products: ShopProduct[] }) => setProducts(json.products ?? []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  const visibleProducts = useMemo(() => {
    let list = products
    if (favOnly) list = list.filter((p) => favorites.includes(p.slug))
    if (selectedAnliegen) list = list.filter((p) => p.anliegen?.includes(selectedAnliegen))
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          p.titel.toLowerCase().includes(q) ||
          (p.kurzbeschreibung?.toLowerCase().includes(q) ?? false)
      )
    }
    return list
  }, [products, favOnly, selectedAnliegen, searchQuery, favorites])

  const hasActiveFilter = favOnly || !!selectedAnliegen || searchQuery.trim().length > 0

  const clearAll = () => {
    setSelectedAnliegen(null)
    setSearchQuery("")
    if (favOnly) router.replace("/kurse/alle")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ShopHeader
        mode="website"
        showBack
        backHref="/kurse"
        backLabel="Übersicht"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-7">
        {/* Kopf */}
        <div className="animate-fade-in-up">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-[0.2em]">
            Praxis OS · Kurse
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5">
            {favOnly ? "Deine Favoriten" : "Alle Kurse"}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {favOnly
              ? `${favCount} ${favCount === 1 ? "Kurs" : "Kurse"} gemerkt`
              : "Von Physiotherapeuten entwickelte 21-Tage-Programme — einmal kaufen, lebenslang behalten."}
          </p>
        </div>

        {/* Trust-Signale */}
        <TrustRow />

        {/* Favoriten-Banner mit Reset */}
        {favOnly && (
          <button
            onClick={() => router.replace("/kurse/alle")}
            className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <X className="h-4 w-4" />
            Alle Kurse anzeigen
          </button>
        )}

        {/* Rubrik-Filter */}
        {!favOnly && (
          <div
            className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
            style={{ scrollbarWidth: "none" }}
          >
            {ANLIEGEN_LIST.map((item) => {
              const isActive = selectedAnliegen === item.value
              return (
                <button
                  key={item.label}
                  onClick={() => setSelectedAnliegen(item.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shrink-0 border transition-all duration-200",
                    isActive
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/25"
                      : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700"
                  )}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
            <p className="text-rose-700 text-sm font-medium mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-rose-600 font-semibold underline underline-offset-2"
            >
              Erneut versuchen
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Produkte */}
        {!isLoading && !error && (
          <>
            {visibleProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{favOnly ? "🤍" : "🔍"}</span>
                </div>
                <p className="text-slate-600 font-semibold mb-1">
                  {favOnly
                    ? "Noch keine Favoriten gemerkt"
                    : searchQuery.trim()
                      ? `Keine Treffer für „${searchQuery.trim()}“`
                      : "Keine Kurse in dieser Rubrik"}
                </p>
                {hasActiveFilter && (
                  <button
                    onClick={clearAll}
                    className="text-sm text-emerald-600 font-semibold underline underline-offset-2 mt-1"
                  >
                    Alle Kurse anzeigen
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-slate-500">
                    {visibleProducts.length}{" "}
                    {visibleProducts.length === 1 ? "Kurs" : "Kurse"}
                    {hasActiveFilter ? " gefunden" : " verfügbar"}
                  </p>
                  {hasActiveFilter && !favOnly && (
                    <button
                      onClick={clearAll}
                      className="flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                      Filter zurücksetzen
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {visibleProducts.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={i}
                      mode="website"
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Voll-App-Upsell */}
        {!isLoading && !error && <AppUpsell />}
      </section>

      <footer className="border-t border-slate-200 mt-12 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Praxis OS · Alle Preise inkl. MwSt. ·
            Lebenslanger Zugriff nach Einmalkauf
          </p>
        </div>
      </footer>
    </div>
  )
}
