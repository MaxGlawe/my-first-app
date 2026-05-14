"use client"

/**
 * PROJ-20: Shop-Header — die "Taskleiste" des /shop/*-Bereichs.
 *
 * Biogena-inspirierte Ein-Linien-Leiste: Logo · Nav · Suchfeld · Account · Favoriten · Warenkorb.
 * Echtes Praxis-OS-Logo, sticky Glas-Effekt, Emerald-Akzent, präzise Premium-Farben.
 *
 * - Suche: kontrolliert (Katalog filtert live) oder uncontrolled (Enter → /shop?q=).
 * - Account-Slot: In-App = "Meine Inhalte", Website = "Anmelden" (mode-Prop).
 * - Favoriten: localStorage (useFavorites), Zähler-Badge.
 * - Warenkorb: optisch vorhanden, funktional als eigenes Feature später → dezenter Hinweis.
 */

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { Search, Heart, ShoppingBag, ArrowLeft, UserCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFavorites } from "@/hooks/use-favorites"
import { KurseMenu } from "@/components/shop/KurseMenu"

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
  const [localSearch, setLocalSearch] = useState("")
  const [cartHint, setCartHint] = useState(false)

  const controlled = onSearchChange !== undefined
  const searchText = controlled ? searchValue ?? "" : localSearch

  // Mode-abhängiges Routing — In-App (/shop/*) vs. öffentliche Website (/kurse/*)
  const isWebsite = mode === "website"
  const homeHref = isWebsite ? "/kurse" : "/shop"
  const catalogHref = isWebsite ? "/kurse/alle" : "/shop/kurse"
  const accountHref = isWebsite ? "/login" : "/shop/dashboard"

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

  const showCartHint = () => {
    setCartHint(true)
    window.setTimeout(() => setCartHint(false), 2800)
  }

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center gap-3 sm:gap-5">
          {/* ── Brand — echtes Logo ───────────────────────────────────────── */}
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
                Kurs-Shop
              </span>
            </div>
          </Link>

          {/* ── Zurück-Link (optional) — sonst nichts: Logo + Kurse-Menü genügen ── */}
          {showBack && (
            <Link
              href={backHref}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-emerald-700 transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{backLabel}</span>
            </Link>
          )}

          {/* ── Kurse-Mega-Menü ───────────────────────────────────────────── */}
          <div className="hidden md:flex shrink-0">
            <KurseMenu mode={mode} />
          </div>

          {/* ── Suchfeld ──────────────────────────────────────────────────── */}
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
                placeholder="Kurse durchsuchen …"
                aria-label="Kurse durchsuchen"
                className="w-full h-10 pl-10 pr-4 rounded-full bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </form>

          {/* ── Aktionen — Zur App · Account · Favoriten · Warenkorb ──────── */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 ml-auto md:ml-0">
            {/* Zurück — In-App: zur App · Website: zur Marketing-Website */}
            <Link
              href={mode === "app" ? "/app/dashboard" : "/"}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-[18px] w-[18px]" />
              <span className="hidden sm:inline">
                {mode === "app" ? "Zur App" : "Zur Website"}
              </span>
            </Link>

            {/* Account / Anmelden */}
            <Link
              href={accountHref}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <UserCircle2 className="h-[18px] w-[18px]" />
              <span>{mode === "app" ? "Meine Inhalte" : "Anmelden"}</span>
            </Link>

            {/* Favoriten */}
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

            {/* Warenkorb — optisch vorhanden, funktional bald */}
            <div className="relative">
              <button
                type="button"
                onClick={showCartHint}
                aria-label="Warenkorb"
                className="h-9 w-9 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <ShoppingBag className="h-[18px] w-[18px]" />
              </button>
              {cartHint && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 text-white rounded-xl px-3.5 py-2.5 shadow-xl shadow-slate-900/25 animate-fade-in-up z-50">
                  <p className="text-xs font-semibold mb-0.5">Warenkorb</p>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Mehrere Kurse auf einmal kaufen — bald verfügbar.
                  </p>
                  <div className="absolute -top-1 right-3.5 h-2 w-2 bg-slate-900 rotate-45" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
