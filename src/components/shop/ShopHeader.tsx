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

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const MUTED = "#64748b"
const LINE = "#e7e1d6"

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
    <header
      className="sticky top-0 z-40 backdrop-blur-xl border-b"
      style={{ backgroundColor: "rgba(248,245,240,0.85)", borderColor: LINE }}
    >
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
              <span
                className="block text-base tracking-tight"
                style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
              >
                Praxis OS
              </span>
              <span
                className="block text-[10px] font-semibold uppercase tracking-[0.18em] mt-0.5"
                style={{ color: GREEN }}
              >
                Shop
              </span>
            </div>
          </Link>

          {/* Zurück-Link (optional) */}
          {showBack && (
            <Link
              href={backHref}
              className="flex items-center gap-1.5 text-sm font-medium transition-colors shrink-0 hover:opacity-80"
              style={{ color: MUTED }}
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
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-black/[0.04]"
                style={{ color: INK }}
              >
                <Layers className="h-4 w-4" style={{ color: GREEN }} />
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
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors pointer-events-none"
                style={{ color: MUTED }}
              />
              <input
                type="text"
                value={searchText}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Challenges durchsuchen …"
                aria-label="Challenges durchsuchen"
                className="w-full h-10 pl-10 pr-4 rounded-full border text-sm outline-none transition-all duration-200 focus:bg-white focus:ring-4 focus:ring-[#2C3E2D]/15 focus:border-[#2C3E2D]/40"
                style={{ backgroundColor: "#ffffff", borderColor: LINE, color: INK }}
              />
            </div>
          </form>

          {/* Aktionen */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 ml-auto md:ml-0">
            {/* Zur App / Zur Website — md+ mit Text, drunter im Drawer */}
            <Link
              href={backHomeHref}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg hover:bg-black/[0.04] transition-colors"
              style={{ color: INK }}
            >
              <ArrowLeft className="h-[18px] w-[18px]" />
              <span>{backHomeLabel}</span>
            </Link>

            {/* Account / Anmelden — md+ mit Text, drunter im Drawer */}
            <Link
              href={accountHref}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg hover:bg-black/[0.04] transition-colors"
              style={{ color: INK }}
            >
              <UserCircle2 className="h-[18px] w-[18px]" />
              <span>{mode === "app" ? "Meine Inhalte" : "Anmelden"}</span>
            </Link>

            {/* Favoriten — immer sichtbar */}
            <Link
              href={`${catalogHref}?fav=1`}
              aria-label={`Favoriten${count > 0 ? ` (${count})` : ""}`}
              className="relative h-9 w-9 flex items-center justify-center rounded-full transition-colors hover:bg-black/[0.04]"
              style={{ color: count > 0 ? GREEN : MUTED }}
            >
              <Heart
                className="h-[18px] w-[18px] transition-colors"
                style={count > 0 ? { fill: GREEN, color: GREEN } : undefined}
              />
              {count > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold text-white rounded-full ring-2 ring-white"
                  style={{ backgroundColor: GREEN }}
                >
                  {count}
                </span>
              )}
            </Link>

            {/* Warenkorb */}
            <button
              type="button"
              onClick={openCart}
              aria-label={`Warenkorb${cartCount > 0 ? ` (${cartCount})` : ""}`}
              className="relative h-9 w-9 flex items-center justify-center rounded-full transition-colors hover:bg-black/[0.04]"
              style={{ color: INK }}
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold text-white rounded-full ring-2 ring-white"
                  style={{ backgroundColor: INK }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger — nur Mobile */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Menü öffnen"
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-full transition-colors hover:bg-black/[0.04]"
              style={{ color: INK }}
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
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors pointer-events-none"
              style={{ color: MUTED }}
            />
            <input
              type="text"
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Challenges durchsuchen …"
              aria-label="Challenges durchsuchen"
              className="w-full h-10 pl-10 pr-4 rounded-full border text-sm outline-none transition-all duration-200 focus:bg-white focus:ring-4 focus:ring-[#2C3E2D]/15 focus:border-[#2C3E2D]/40"
              style={{ backgroundColor: "#ffffff", borderColor: LINE, color: INK }}
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
          "absolute inset-0 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0"
        )}
        style={{ backgroundColor: "rgba(15,23,42,0.40)" }}
      />

      {/* Drawer */}
      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 w-[85%] max-w-sm shadow-2xl flex flex-col overflow-y-auto transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
        style={{ backgroundColor: "#ffffff" }}
      >
        {/* Drawer-Kopf */}
        <div
          className="flex items-center justify-between p-4 border-b sticky top-0 z-10"
          style={{ borderColor: LINE, backgroundColor: "#ffffff" }}
        >
          <span
            className="text-[10px] font-bold tracking-[0.18em] uppercase"
            style={{ color: GREEN }}
          >
            Praxis OS · Shop
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="h-9 w-9 flex items-center justify-center rounded-full transition-colors hover:bg-black/[0.04]"
            style={{ color: INK }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Anmelden / Account */}
        <Link
          href={accountHref}
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-4 border-b transition-colors hover:bg-black/[0.02]"
          style={{ borderColor: LINE }}
        >
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(44,62,45,0.10)" }}
          >
            <UserCircle2 className="h-5 w-5" style={{ color: GREEN }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold" style={{ color: INK }}>
              {mode === "app" ? "Meine Inhalte" : "Anmelden"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: MUTED }}>
              {mode === "app" ? "Deine gekauften Challenges" : "Zugang zu deinen Käufen"}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0" style={{ color: MUTED }} />
        </Link>

        {/* Challenges-Sektion */}
        <div className="p-3 flex-1">
          <p
            className="px-2 pt-2 pb-2 text-[10px] font-bold tracking-[0.15em] uppercase"
            style={{ color: MUTED }}
          >
            Unsere Challenges
          </p>
          {loading ? (
            <div className="flex items-center justify-center py-10" style={{ color: SAND }}>
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <p className="px-2 py-8 text-sm text-center" style={{ color: MUTED }}>
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
                    className="flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-black/[0.02] group"
                  >
                    <div
                      className="h-14 w-14 rounded-lg overflow-hidden shrink-0 ring-1"
                      style={{ backgroundColor: PAPER, ["--tw-ring-color" as string]: LINE }}
                    >
                      {p.hero_bild ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.hero_bild}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full" style={{ backgroundColor: SAND }} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-sm font-semibold truncate transition-colors group-hover:opacity-80"
                        style={{ color: INK }}
                      >
                        {p.titel}
                      </p>
                      {p.kurzbeschreibung && (
                        <p className="text-xs truncate mt-0.5" style={{ color: MUTED }}>
                          {p.kurzbeschreibung}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right pl-1">
                      {owned ? (
                        <span className="text-xs font-semibold" style={{ color: GREEN }}>
                          Freigeschaltet
                        </span>
                      ) : (
                        <span className="text-sm font-bold" style={{ color: INK }}>
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
            className="flex items-center justify-between mt-3 px-3.5 py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: GREEN }}
          >
            <span>Alle Challenges ansehen</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Karten-Decks — eigener Produkttyp (nur öffentliche Website) */}
          {isWebsite && (
            <Link
              href="/decks"
              onClick={onClose}
              className="flex items-center justify-between mt-2 px-3.5 py-3 rounded-xl font-semibold text-sm transition-colors hover:bg-black/[0.04]"
              style={{ backgroundColor: PAPER, color: INK }}
            >
              <span className="flex items-center gap-2">
                <Layers className="h-4 w-4" style={{ color: GREEN }} />
                Bewegungskarten ansehen
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Drawer-Fuß — Zur App / Zur Website */}
        <div className="border-t p-3" style={{ borderColor: LINE }}>
          <Link
            href={backHomeHref}
            onClick={onClose}
            className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-black/[0.02]"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
            <span className="text-sm font-medium" style={{ color: INK }}>{backHomeLabel}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
