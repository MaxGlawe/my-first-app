"use client"

/**
 * PROJ-20: ShopMenu (Datei-Name historisch KurseMenu) — das "Challenges"-
 * Mega-Menü in der Shop-Taskleiste.
 *
 * Sitzt zwischen "Shop" und dem Suchfeld. Öffnet bei Hover (Desktop) und Klick
 * (Touch / In-App), klappt nach unten auf und zeigt alle Challenges als flache
 * Liste mit echtem Cover-Thumbnail, Titel, Kurzbeschreibung und Preis. Bei vier
 * Produkten ist eine Rubrik-Gruppierung Overkill — wenn der Katalog wächst
 * und Programme/Masterclasses dazukommen, kann das Menü in drei Sektionen
 * gruppiert werden (Challenges · Programme · Masterclasses). Klick auf ein
 * Produkt → seine eigene Seite. "Alle Challenges ansehen" → /kurse/alle (oder
 * /shop/kurse in der App).
 */

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, ArrowRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ShopProduct } from "@/components/shop/ProductCard"

// Rubriken — Grundlage für den Rubrik-Filter (auch von /shop/kurse und
// /kurse/alle genutzt). Bewusst hier zentralisiert, damit Filter-Pills und
// (zukünftig) Menü-Gruppierung dieselbe Quelle teilen.
export const ANLIEGEN_LIST = [
  { value: null, label: "Alle", icon: "✦" },
  { value: "ruecken", label: "Rücken", icon: "🦴" },
  { value: "schmerz", label: "Schmerz", icon: "💆" },
  { value: "faszien", label: "Faszien", icon: "🔬" },
  { value: "stress", label: "Stress", icon: "🧘" },
  { value: "beweglichkeit", label: "Beweglichkeit", icon: "🤸" },
  { value: "hydration", label: "Hydration", icon: "💧" },
  { value: "wohlbefinden", label: "Wohlbefinden", icon: "🌿" },
] as const

// Fallback-Gradient, falls ein Produkt (noch) kein hero_bild hat.
const SLUG_GRADIENTS: Record<string, string> = {
  "hydrations-boost": "from-cyan-400 to-teal-500",
  "ruecken-mobility": "from-emerald-400 to-cyan-500",
  "schmerz-tagebuch-routine": "from-rose-400 to-rose-500",
  "faszien-tiefenarbeit": "from-indigo-400 to-purple-500",
}

function gradientFor(slug: string): string {
  return SLUG_GRADIENTS[slug] ?? "from-slate-400 to-slate-500"
}

export function KurseMenu({ mode = "app" }: { mode?: "app" | "website" }) {
  const isWebsite = mode === "website"
  const [open, setOpen] = useState(false)
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/shop/products")
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((json: { products?: ShopProduct[] }) => setProducts(json.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  // Außerhalb klicken schließt (für Touch / In-App)
  useEffect(() => {
    if (!open) return
    const handler = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("pointerdown", handler)
    return () => document.removeEventListener("pointerdown", handler)
  }, [open])

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
      >
        <span>Challenges</span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {/* Mega-Panel — bleibt montiert für sauberen Ein-/Ausgang */}
      <div
        className={cn(
          "absolute left-0 top-full pt-2 w-[440px] max-w-[92vw] origin-top transition-all duration-150",
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/10 overflow-hidden">
          <div className="p-3">
            <p className="px-2 pt-1 pb-2 text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">
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
                {products.map((product) => (
                  <CourseRow
                    key={product.id}
                    product={product}
                    onNavigate={() => setOpen(false)}
                    mode={mode}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <Link
            href={isWebsite ? "/kurse/alle" : "/shop/kurse"}
            onClick={() => setOpen(false)}
            className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-100 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
          >
            <span>Alle Challenges ansehen</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Kurs-Zeile ────────────────────────────────────────────────────────────────

function CourseRow({
  product,
  onNavigate,
  mode,
}: {
  product: ShopProduct
  onNavigate: () => void
  mode: "app" | "website"
}) {
  const owned = product.besitz || product.abo_access
  const price = product.effektiver_preis ?? product.preis

  return (
    <Link
      href={mode === "website" ? `/kurse/${product.slug}` : `/shop/${product.slug}`}
      onClick={onNavigate}
      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
    >
      {/* Cover-Thumbnail — echtes hero_bild, Gradient als Fallback */}
      <div className="h-14 w-14 rounded-lg overflow-hidden shrink-0 bg-slate-100 ring-1 ring-slate-200/60">
        {product.hero_bild ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.hero_bild}
            alt=""
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className={cn(
              "w-full h-full bg-gradient-to-br flex items-center justify-center",
              gradientFor(product.slug)
            )}
          >
            <span className="text-white text-base font-semibold select-none">
              {product.titel.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
          {product.titel}
        </p>
        {product.kurzbeschreibung && (
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {product.kurzbeschreibung}
          </p>
        )}
      </div>

      {/* Preis / Status */}
      <div className="shrink-0 text-right pl-1">
        {owned ? (
          <span className="text-xs font-semibold text-emerald-600">Freigeschaltet</span>
        ) : (
          <span className="text-sm font-bold text-slate-900">
            {price.toLocaleString("de-DE", { minimumFractionDigits: 0 })} €
          </span>
        )}
      </div>
    </Link>
  )
}
