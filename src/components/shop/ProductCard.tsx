"use client"

/**
 * PROJ-20: ProductCard
 * Einheitliche Produktkarte für den Shop-Katalog.
 * Premium-Markenwelt (Masterclass-Format): warmes Papier, Tinte, Anthrazit-Grün,
 * Sand · ruhig, klar, premium.
 */

import Link from "next/link"
import { CheckCircle2, ArrowRight, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFavorites } from "@/hooks/use-favorites"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const MUTED = "#64748b"
const LINE = "#e7e1d6"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ShopProduct {
  id: string
  slug: string
  titel: string
  kurzbeschreibung: string | null
  hero_bild: string | null
  produkt_typ: "challenge" | "programm" | "masterclass"
  anliegen: string[] | null
  preis: number
  preis_regulaer?: number | null
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
  challenge: "Challenge",
  programm: "Programm",
  masterclass: "Masterclass",
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
    preis_regulaer,
    besitz,
    abo_access,
    effektiver_preis,
  } = product

  const { isFavorite, toggleFavorite } = useFavorites()
  const fav = isFavorite(slug)

  const displayPrice = effektiver_preis ?? preis
  const isDiscounted = effektiver_preis !== undefined && effektiver_preis < preis
  // Regulärer Streichpreis (z. B. Launch-Aktion) — nur wenn kein Abo-Rabatt
  // bereits einen Streichpreis anzeigt und der reguläre Preis höher liegt.
  const launchStrike =
    !isDiscounted &&
    typeof preis_regulaer === "number" &&
    preis_regulaer > displayPrice
      ? preis_regulaer
      : null
  const freigeschaltet = besitz || abo_access

  return (
    <Link
      href={mode === "website" ? `/kurse/${slug}` : `/shop/${slug}`}
      style={{ animationDelay: `${index * 70}ms`, borderColor: LINE }}
      className={cn(
        "group block bg-white rounded-2xl border overflow-hidden animate-fade-in-up",
        "transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1",
        className
      )}
    >
      {/* Bild / Platzhalter */}
      <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: PAPER }}>
        {hero_bild ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero_bild}
            alt={titel}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundColor: SAND }}
          >
            <span
              className="text-5xl select-none drop-shadow-sm"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: "rgba(255,255,255,0.92)" }}
            >
              {titel.charAt(0)}
            </span>
          </div>
        )}

        {/* Typ-Badge */}
        <div className="absolute top-3 left-3">
          <span
            className="bg-white/90 backdrop-blur-sm text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-sm"
            style={{ color: GREEN }}
          >
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
            className="h-4 w-4 transition-colors"
            style={fav ? { fill: GREEN, color: GREEN } : { color: MUTED }}
          />
        </button>

        {/* Status-Overlay */}
        {freigeschaltet && (
          <div
            className="absolute inset-0 backdrop-blur-[1px] flex items-center justify-center"
            style={{ backgroundColor: "rgba(15,23,42,0.35)" }}
          >
            <div className="bg-white rounded-xl px-3.5 py-2 flex items-center gap-1.5 shadow-lg">
              <CheckCircle2 className="h-4 w-4" style={{ color: GREEN }} />
              <span className="text-xs font-bold" style={{ color: INK }}>
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
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "rgba(44,62,45,0.10)", color: GREEN }}
              >
                {ANLIEGEN_LABELS[a] ?? a}
              </span>
            ))}
          </div>
        )}

        {/* Titel */}
        <h3
          className="leading-snug text-base transition-colors line-clamp-2 group-hover:opacity-80"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
        >
          {titel}
        </h3>

        {/* Beschreibung */}
        {kurzbeschreibung && (
          <p className="text-sm leading-relaxed line-clamp-2" style={{ color: MUTED }}>
            {kurzbeschreibung}
          </p>
        )}

        {/* Preis + CTA */}
        <div
          className="pt-2 flex items-center justify-between border-t mt-3"
          style={{ borderColor: LINE }}
        >
          <div className="flex items-baseline gap-2 pt-2">
            {freigeschaltet ? (
              <span className="text-sm font-bold" style={{ color: GREEN }}>
                Freigeschaltet
              </span>
            ) : (
              <>
                <span
                  className="text-lg"
                  style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
                >
                  {displayPrice.toLocaleString("de-DE", { minimumFractionDigits: 0 })} €
                </span>
                {isDiscounted && (
                  <span className="text-sm line-through" style={{ color: MUTED }}>
                    {preis.toLocaleString("de-DE", { minimumFractionDigits: 0 })} €
                  </span>
                )}
                {launchStrike !== null && (
                  <span className="text-sm line-through" style={{ color: MUTED }}>
                    {launchStrike.toLocaleString("de-DE", { minimumFractionDigits: 0 })} €
                  </span>
                )}
              </>
            )}
          </div>
          <span
            className="flex items-center gap-1 text-xs font-semibold pt-2 group-hover:gap-1.5 transition-all"
            style={{ color: GREEN }}
          >
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
    <div
      className="bg-white rounded-2xl border overflow-hidden animate-pulse"
      style={{ borderColor: LINE }}
    >
      <div className="aspect-square" style={{ backgroundColor: PAPER }} />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-full" style={{ backgroundColor: PAPER }} />
          <div className="h-5 w-20 rounded-full" style={{ backgroundColor: PAPER }} />
        </div>
        <div className="h-5 w-3/4 rounded-lg" style={{ backgroundColor: PAPER }} />
        <div className="h-4 w-full rounded-lg" style={{ backgroundColor: PAPER }} />
        <div className="h-9 w-full rounded-lg mt-3" style={{ backgroundColor: PAPER }} />
      </div>
    </div>
  )
}
