"use client"

/**
 * PROJ-20: Shop-Header — die "Taskleiste" des /shop/*-Bereichs.
 *
 * Biogena-inspirierte Premium-Leiste mit zwei Layouts:
 *
 *   Desktop (md+):  Logo · Mega-Menü · Suche · Aktionen — alles in einer Zeile.
 *   Mobile (md-):   Zeile 1 Logo + Quick-Actions + Hamburger,
 *                   Zeile 2 Suchfeld (volle Breite),
 *                   Hamburger öffnet Drawer (Challenges-Liste, Anmelden, Back).
 *
 * - Suche: kontrolliert (Katalog filtert live) oder uncontrolled (Enter → /shop?q=).
 * - Account-Slot: In-App = "Meine Inhalte", Website = "Anmelden" (mode-Prop).
 * - Favoriten: localStorage (useFavorites), Zähler-Badge.
 * - Warenkorb: optisch vorhanden, funktional als eigenes Feature später → dezenter Hinweis.
 */

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, type FormEvent } from "react"
import {
  Search,
  Heart,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  UserCircle2,
  Menu,
  X,
  Loader2,
  Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useFavorites } from "@/hooks/use-favorites"
import { useCart } from "@/lib/cart-context"
import { KurseMenu } from "@/components/shop/KurseMenu"
import type { ShopProduct } from "@/components/shop/ProductCard"

interface ShopHeaderProps {
  showBack?: boolean
  backHref?: string
  backLabel?: string
  /** "app" = eingeloggter In-App-Nutzer · "website" = öffentliche Shop-Version */
  mode?: "app" | "website"
  /** Kontrollierte Suche — wenn gesetzt, filtert die Kursübersicht live mit. */
  searchValue?: string
  onSearchChange?: (value: string) => void
}

export function ShopHeader({
  showBack = false,
  backHref = "/shop",
  backLabel = "Zurück",
  mode = "app",
  searchValue,
  onSearchChange,
}: ShopHeaderProps) {
  const router = useRouter()
  const { count } = useFavorites()
  const { count: cartCount, open: openCart } = useCart()
  const [localSearch, setLocalSearch] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)

  const controlled = onSearchChange !== undefined
  const searchText = controlled ? searchValue ?? "" : localSearch

  // Mode-abhängiges Routing — In-App (/shop/*) vs. öffentliche Website (/kurse/*)
  const isWebsite = mode === "website"
  const homeHref = isWebsite ? "/kurse" : "/shop"
  const catalogHref = isWebsite ? "/kurse/alle" : "/shop/kurse"
  const accountHref = isWebsite ? "/login" : "/shop/dashboard"
  const backHomeHref = mode === "app" ? "/app/dashboard" : "/"
  const backHomeLabel = mode === "app" ? "Zur App" : "Zur Website"

  const handleSearchChange = (value: string) => {
    if (controlled) onSearchChange!(value)
    else setLocalSearch(value)
  }

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!controlled && localSearch.trim()) {
      router.push(`${catalogHref}?q=${encodeURIComponent(localSearch.trim())}`)
    }
  }

  // Body-Scroll-Lock + ESC bei offenem Drawer
  useEffect(() => {
    if (!mobileOpen) return
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      document.removeEventListener("keydown", onKey)
    }
  }, [mobileOpen])

  return (
    <>
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* ── Zeile 1 — Logo · Nav · Suche (md+) · Aktionen · Hamburger (md-) ── */}
        <div className="h-16 flex items-center gap-3 sm:gap-5">
          {/* Brand — echtes Logo */}
          <Link href={homeHref} className="flex items-center gap-2.5 shrink-0 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/physio-logo.png"
              alt="Praxis OS"
              className="h-9 w-auto transition-transform duration-300 group-hover:scale-105"
            />
            <div className="hidden sm:block leading-none">
              <span className="block font-bold text-slate-900 text-sm tracking-tight">
                Praxis OS
              </span>
              <span className="block text-[10px] font-semibold text-emerald-600 uppercase tracking-[0.18em] mt-0.5">
                Shop
              </span>
            </div>
          </Link>

          {/* Zurück-Link (optional) */}
          {showBack && (
            <Link
              href={backHref}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-emerald-700 transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{backLabel}</span>
            </Link>
          )}

          {/* Desktop: Mega-Menü */}
          <div className="hidden md:flex items-center shrink-0">
            <KurseMenu mode={mode} />
            {/* Decks — eigener Produkttyp (Karten-Sets), nur öffentliche Website */}
            {isWebsite && (
              <Link
                href="/decks"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <Layers className="h-4 w-4" />
                <span>Bewegungskarten</span>
              </Link>
            )}
          </div>

          {/* Desktop: Suchfeld */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 justify-center"
          >
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Challenges durchsuchen …"
                aria-label="Challenges durchsuchen"
                className="w-full h-10 pl-10 pr-4 rounded-full bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </form>

          {/* Aktionen */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 ml-auto md:ml-0">
            {/* Zur App / Zur Website — md+ mit Text, drunter im Drawer */}
            <Link
              href={backHomeHref}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-[18px] w-[18px]" />
              <span>{backHomeLabel}</span>
            </Link>

            {/* Account / Anmelden — md+ mit Text, drunter im Drawer */}
            <Link
              href={accountHref}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <UserCircle2 className="h-[18px] w-[18px]" />
              <span>{mode === "app" ? "Meine Inhalte" : "Anmelden"}</span>
            </Link>

            {/* Favoriten — immer sichtbar */}
            <Link
              href={`${catalogHref}?fav=1`}
              aria-label={`Favoriten${count > 0 ? ` (${count})` : ""}`}
              className="relative h-9 w-9 flex items-center justify-center rounded-full text-slate-500 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
            >
              <Heart
                className={cn(
                  "h-[18px] w-[18px] transition-colors",
                  count > 0 && "fill-emerald-500 text-emerald-600"
                )}
              />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-emerald-600 rounded-full ring-2 ring-white">
                  {count}
                </span>
              )}
            </Link>

            {/* Warenkorb */}
            <button
              type="button"
              onClick={openCart}
              aria-label={`Warenkorb${cartCount > 0 ? ` (${cartCount})` : ""}`}
              className="relative h-9 w-9 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-slate-900 rounded-full ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger — nur Mobile */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Menü öffnen"
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── Zeile 2 (nur Mobile) — Suchfeld in voller Breite ── */}
        <form
          onSubmit={handleSearchSubmit}
          className="md:hidden pb-3"
        >
          <div className="relative w-full group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Challenges durchsuchen …"
              aria-label="Challenges durchsuchen"
              className="w-full h-10 pl-10 pr-4 rounded-full bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </form>
      </div>
    </header>

    {/* ── Mobile-Drawer ───────────────────────────────────────────────────── */}
    {/*
        Sibling zum Header (NICHT Kind!), weil backdrop-blur-xl + sticky am
        Header einen Containing-Block erzeugen, der fixed-Children einsperrt
        (iOS-Safari-Stacking-Context-Quirk). Außerhalb funktioniert "fixed"
        wieder relativ zum Viewport.
    */}
    <MobileDrawer
      open={mobileOpen}
      onClose={() => setMobileOpen(false)}
      mode={mode}
      isWebsite={isWebsite}
      accountHref={accountHref}
      catalogHref={catalogHref}
      backHomeHref={backHomeHref}
      backHomeLabel={backHomeLabel}
    />
    </>
  )
}

// ── MobileDrawer ──────────────────────────────────────────────────────────────

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  mode: "app" | "website"
  isWebsite: boolean
  accountHref: string
  catalogHref: string
  backHomeHref: string
  backHomeLabel: string
}

function MobileDrawer({
  open,
  onClose,
  mode,
  isWebsite,
  accountHref,
  catalogHref,
  backHomeHref,
  backHomeLabel,
}: MobileDrawerProps) {
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [loading, setLoading] = useState(true)

  // Erst beim ersten Öffnen fetchen
  useEffect(() => {
    if (!open || products.length > 0 || !loading) return
    fetch("/api/shop/products")
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((json: { products?: ShopProduct[] }) => setProducts(json.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [open, products.length, loading])

  return (
    <div
      className={cn("md:hidden fixed inset-0 z-50", !open && "pointer-events-none")}
      aria-hidden={!open}
    >
      {/* Overlay */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Menü schließen"
        className={cn(
          "absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Drawer */}
      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col overflow-y-auto transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer-Kopf */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <span className="text-[10px] font-bold tracking-[0.18em] text-emerald-600 uppercase">
            Praxis OS · Shop
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="h-9 w-9 flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Anmelden / Account */}
        <Link
          href={accountHref}
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <UserCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800">
              {mode === "app" ? "Meine Inhalte" : "Anmelden"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === "app" ? "Deine gekauften Challenges" : "Zugang zu deinen Käufen"}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
        </Link>

        {/* Challenges-Sektion */}
        <div className="p-3 flex-1">
          <p className="px-2 pt-2 pb-2 text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">
            Unsere Challenges
          </p>
          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-300">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <p className="px-2 py-8 text-sm text-slate-400 text-center">
              Challenges sind bald verfügbar.
            </p>
          ) : (
            <div className="space-y-0.5">
              {products.map((p) => {
                const owned = p.besitz || p.abo_access
                const price = p.effektiver_preis ?? p.preis
                return (
                  <Link
                    key={p.id}
                    href={isWebsite ? `/kurse/${p.slug}` : `/shop/${p.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="h-14 w-14 rounded-lg overflow-hidden shrink-0 bg-slate-100 ring-1 ring-slate-200/60">
                      {p.hero_bild ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.hero_bild}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
                        {p.titel}
                      </p>
                      {p.kurzbeschreibung && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {p.kurzbeschreibung}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right pl-1">
                      {owned ? (
                        <span className="text-xs font-semibold text-emerald-600">
                          Freigeschaltet
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-slate-900">
                          {price.toLocaleString("de-DE", { minimumFractionDigits: 0 })} €
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          <Link
            href={catalogHref}
            onClick={onClose}
            className="flex items-center justify-between mt-3 px-3.5 py-3 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-sm hover:bg-emerald-100 transition-colors"
          >
            <span>Alle Challenges ansehen</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Karten-Decks — eigener Produkttyp (nur öffentliche Website) */}
          {isWebsite && (
            <Link
              href="/decks"
              onClick={onClose}
              className="flex items-center justify-between mt-2 px-3.5 py-3 rounded-xl bg-slate-50 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-slate-500" />
                Bewegungskarten ansehen
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Drawer-Fuß — Zur App / Zur Website */}
        <div className="border-t border-slate-100 p-3">
          <Link
            href={backHomeHref}
            onClick={onClose}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">{backHomeLabel}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
