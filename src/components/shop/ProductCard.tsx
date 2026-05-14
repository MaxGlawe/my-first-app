"use client"

/**
 * PROJ-20: ProductCard
 * Einheitliche Produktkarte für den Shop-Katalog.
 * Praxis-OS-Palette (Slate/Emerald), Biogena-inspiriert: ruhig, klar, premium.
 */

import Link from "next/link"
import { CheckCircle2, ArrowRight, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFavorites } from "@/hooks/use-favorites"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ShopProduct {
  id: string
  slug: string
  titel: string
  kurzbeschreibung: string | null
  hero_bild: string | null
  produkt_typ: "kurs" | "programm" | "masterclass"
  anliegen: string[] | null
  preis: number
  waehrung: string
  abo_inkludiert: boolean
  abo_rabatt_prozent: number | null
  // enriched by API
  besitz?: boolean
  abo_access?: boolean
  kaufbar?: boolean
  effektiver_preis?: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYP_LABELS: Record<string, string> = {
  kurs: "Kurs",
  programm: "Programm",
  masterclass: "Masterclass",
}

const ANLIEGEN_COLORS: Record<string, string> = {
  ruecken: "bg-sky-50 text-sky-700",
  schmerz: "bg-rose-50 text-rose-700",
  stress: "bg-violet-50 text-violet-700",
  faszien: "bg-indigo-50 text-indigo-700",
  beweglichkeit: "bg-emerald-50 text-emerald-700",
  hydration: "bg-cyan-50 text-cyan-700",
  wohlbefinden: "bg-teal-50 text-teal-700",
  "chronische-beschwerden": "bg-amber-50 text-amber-700",
}

const ANLIEGEN_LABELS: Record<string, string> = {
  ruecken: "Rücken",
  schmerz: "Schmerz",
  stress: "Stress",
  faszien: "Faszien",
  beweglichkeit: "Beweglichkeit",
  hydration: "Hydration",
  wohlbefinden: "Wohlbefinden",
  "chronische-beschwerden": "Chronische Beschwerden",
}

// Per-Kurs-Verlauf als Bild-Platzhalter (bis KI-Hero-Bilder vorliegen)
const SLUG_GRADIENTS: Record<string, string> = {
  "hydrations-boost": "from-cyan-400 via-sky-400 to-teal-500",
  "ruecken-mobility": "from-emerald-400 via-teal-400 to-cyan-500",
  "schmerz-tagebuch-routine": "from-rose-400 via-pink-400 to-rose-500",
  "faszien-tiefenarbeit": "from-indigo-400 via-violet-400 to-purple-500",
}

function getGradient(slug: string): string {
  return SLUG_GRADIENTS[slug] ?? "from-slate-400 to-slate-500"
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: ShopProduct
  /** Stagger-Index für die Eingangs-Animation */
  index?: number
  className?: string
  /** "app" → /shop/[slug] · "website" → /kurse/[slug] */
  mode?: "app" | "website"
}

export function ProductCard({ product, index = 0, className, mode = "app" }: ProductCardProps) {
  const {
    slug,
    titel,
    kurzbeschreibung,
    hero_bild,
    produkt_typ,
    anliegen,
    preis,
    besitz,
    abo_access,
    effektiver_preis,
  } = product

  const { isFavorite, toggleFavorite } = useFavorites()
  const fav = isFavorite(slug)

  const displayPrice = effektiver_preis ?? preis
  const isDiscounted = effektiver_preis !== undefined && effektiver_preis < preis
  const freigeschaltet = besitz || abo_access

  return (
    <Link
      href={mode === "website" ? `/kurse/${slug}` : `/shop/${slug}`}
      style={{ animationDelay: `${index * 70}ms` }}
      className={cn(
        "group block bg-white rounded-2xl border border-slate-200 overflow-hidden animate-fade-in-up",
        "transition-all duration-300 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1",
        className
      )}
    >
      {/* Bild / Platzhalter-Verlauf */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {hero_bild ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero_bild}
            alt={titel}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className={cn(
              "w-full h-full bg-gradient-to-br flex items-center justify-center transition-transform duration-500 group-hover:scale-105",
              getGradient(slug)
            )}
          >
            <span className="text-white/90 text-5xl font-light select-none drop-shadow-sm">
              {titel.charAt(0)}
            </span>
          </div>
        )}

        {/* Typ-Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-sm">
            {TYP_LABELS[produkt_typ] ?? produkt_typ}
          </span>
        </div>

        {/* Favoriten-Herz */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleFavorite(slug)
          }}
          aria-label={fav ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
          className="absolute top-3 right-3 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200 hover:scale-110 hover:bg-white active:scale-95"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              fav ? "fill-emerald-500 text-emerald-600" : "text-slate-400"
            )}
          />
        </button>

        {/* Status-Overlay */}
        {freigeschaltet && (
          <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-white rounded-xl px-3.5 py-2 flex items-center gap-1.5 shadow-lg">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">
                {besitz ? "Im Besitz" : "Im Abo enthalten"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Inhalt */}
      <div className="p-4 space-y-2.5">
        {/* Anliegen-Tags */}
        {anliegen && anliegen.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {anliegen.slice(0, 2).map((a) => (
              <span
                key={a}
                className={cn(
                  "text-[11px] font-semibold px-2 py-0.5 rounded-full",
                  ANLIEGEN_COLORS[a] ?? "bg-slate-100 text-slate-600"
                )}
              >
                {ANLIEGEN_LABELS[a] ?? a}
              </span>
            ))}
          </div>
        )}

        {/* Titel */}
        <h3 className="font-bold text-slate-800 leading-snug text-base group-hover:text-emerald-700 transition-colors line-clamp-2">
          {titel}
        </h3>

        {/* Beschreibung */}
        {kurzbeschreibung && (
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
            {kurzbeschreibung}
          </p>
        )}

        {/* Preis + CTA */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-3">
          <div className="flex items-baseline gap-2 pt-2">
            {freigeschaltet ? (
              <span className="text-sm font-bold text-emerald-600">Freigeschaltet</span>
            ) : (
              <>
                <span className="text-lg font-bold text-slate-900">
                  {displayPrice.toLocaleString("de-DE", { minimumFractionDigits: 0 })} €
                </span>
                {isDiscounted && (
                  <span className="text-sm text-slate-400 line-through">
                    {preis.toLocaleString("de-DE", { minimumFractionDigits: 0 })} €
                  </span>
                )}
              </>
            )}
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 pt-2 group-hover:gap-1.5 transition-all">
            Ansehen
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

// ── Loading-Skeleton ──────────────────────────────────────────────────────────

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="aspect-square bg-slate-100" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-slate-100 rounded-full" />
          <div className="h-5 w-20 bg-slate-100 rounded-full" />
        </div>
        <div className="h-5 w-3/4 bg-slate-100 rounded-lg" />
        <div className="h-4 w-full bg-slate-100 rounded-lg" />
        <div className="h-9 w-full bg-slate-100 rounded-lg mt-3" />
      </div>
    </div>
  )
}
