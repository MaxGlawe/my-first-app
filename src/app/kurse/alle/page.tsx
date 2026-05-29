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

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const GREEN = "#2C3E2D"
const MUTED = "#64748b"
const LINE = "#e7e1d6"

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
    <div className="min-h-screen" style={{ backgroundColor: PAPER }}>
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
  const [selectedTyp, setSelectedTyp] = useState<"challenge" | "masterclass">(
    searchParams.get("typ") === "masterclass" ? "masterclass" : "challenge"
  )
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    fetch("/api/shop/products")
      .then((res) => {
        if (!res.ok) throw new Error("Challenges konnten nicht geladen werden.")
        return res.json()
      })
      .then((json: { products: ShopProduct[] }) => setProducts(json.products ?? []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  const visibleProducts = useMemo(() => {
    let list = products.filter((p) => (p.produkt_typ ?? "challenge") === selectedTyp)
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
  }, [products, favOnly, selectedAnliegen, selectedTyp, searchQuery, favorites])

  const hasActiveFilter = favOnly || !!selectedAnliegen || searchQuery.trim().length > 0

  const clearAll = () => {
    setSelectedAnliegen(null)
    setSearchQuery("")
    if (favOnly) router.replace("/kurse/alle")
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: PAPER }}>
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
          <span
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: GREEN }}
          >
            Praxis OS · Shop
          </span>
          <h1
            className="text-2xl sm:text-3xl mt-1.5"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
          >
            {favOnly ? "Deine Favoriten" : "Alle Challenges"}
          </h1>
          <p className="mt-1 text-sm" style={{ color: MUTED }}>
            {favOnly
              ? `${favCount} ${favCount === 1 ? "Challenge" : "Challenges"} gemerkt`
              : "Von Physiotherapeuten entwickelte 21-Tage-Challenges — einmal kaufen, lebenslang behalten."}
          </p>
        </div>

        {/* Trust-Signale */}
        <TrustRow />

        {/* Produkttyp-Schalter */}
        {!favOnly && (
          <div
            className="inline-flex rounded-full border bg-white p-1 text-sm font-medium"
            style={{ borderColor: LINE }}
          >
            {(
              [
                ["challenge", "Challenges"],
                ["masterclass", "Masterclasses"],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setSelectedTyp(val)}
                className="rounded-full px-4 py-1.5 transition-all"
                style={
                  selectedTyp === val
                    ? { backgroundColor: GREEN, color: "#ffffff" }
                    : { color: MUTED }
                }
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Favoriten-Banner mit Reset */}
        {favOnly && (
          <button
            onClick={() => router.replace("/kurse/alle")}
            className="flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-80"
            style={{ color: GREEN }}
          >
            <X className="h-4 w-4" />
            Alle Challenges anzeigen
          </button>
        )}

        {/* Rubrik-Filter (nur bei Challenges) */}
        {!favOnly && selectedTyp === "challenge" && (
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shrink-0 border transition-all duration-200 hover:opacity-90"
                  style={
                    isActive
                      ? { backgroundColor: GREEN, color: "#ffffff", borderColor: GREEN }
                      : { backgroundColor: "#ffffff", color: MUTED, borderColor: LINE }
                  }
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
              selectedTyp === "masterclass" ? (
                <div className="text-center py-16">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: "rgba(44,62,45,0.10)" }}
                  >
                    <span className="text-3xl">🎓</span>
                  </div>
                  <p
                    className="text-lg mb-1"
                    style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
                  >
                    Masterclasses — in Kürze
                  </p>
                  <p className="text-sm max-w-sm mx-auto" style={{ color: MUTED }}>
                    Tiefere, geführte Programme von Praxis OS. Wir arbeiten daran — bald hier
                    verfügbar.
                  </p>
                  <button
                    onClick={() => setSelectedTyp("challenge")}
                    className="text-sm font-semibold underline underline-offset-2 mt-3"
                    style={{ color: GREEN }}
                  >
                    Challenges ansehen
                  </button>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: "rgba(44,62,45,0.08)" }}
                  >
                    <span className="text-2xl">{favOnly ? "🤍" : "🔍"}</span>
                  </div>
                  <p className="font-semibold mb-1" style={{ color: INK }}>
                    {favOnly
                      ? "Noch keine Favoriten gemerkt"
                      : searchQuery.trim()
                        ? `Keine Treffer für „${searchQuery.trim()}“`
                        : "Keine Challenges in dieser Rubrik"}
                  </p>
                  {hasActiveFilter && (
                    <button
                      onClick={clearAll}
                      className="text-sm font-semibold underline underline-offset-2 mt-1"
                      style={{ color: GREEN }}
                    >
                      Alle Challenges anzeigen
                    </button>
                  )}
                </div>
              )
            ) : (
              <>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm" style={{ color: MUTED }}>
                    {visibleProducts.length}{" "}
                    {visibleProducts.length === 1 ? "Challenge" : "Challenges"}
                    {hasActiveFilter ? " gefunden" : " verfügbar"}
                  </p>
                  {hasActiveFilter && !favOnly && (
                    <button
                      onClick={clearAll}
                      className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: MUTED }}
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

      <footer className="border-t mt-12 py-8" style={{ borderColor: LINE }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs" style={{ color: MUTED }}>
            © {new Date().getFullYear()} Praxis OS · Alle Preise inkl. MwSt. ·
            Lebenslanger Zugriff nach Einmalkauf
          </p>
        </div>
      </footer>
    </div>
  )
}
