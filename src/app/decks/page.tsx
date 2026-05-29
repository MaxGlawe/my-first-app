"use client"

/**
 * PROJ-24: /decks — Karten-Decks-Übersicht (öffentlich)
 *
 * Lädt alle aktiven Produkte über /api/shop/products, filtert auf
 * produkt_typ === 'deck' und zeigt sie als Karten an. Premium-Markenwelt
 * (Paper/Ink/Green/Sand, Serif-Headlines), du-Form, HWG-sauber. ShopHeader
 * im Website-Modus.
 */

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  Layers,
  ShieldCheck,
  Infinity as InfinityIcon,
  Zap,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { ShopHeader } from "@/components/shop/ShopHeader"
import { cn } from "@/lib/utils"

// ── Premium-Markenwelt (Masterclass-Format) ──────────────────────────────────

const PAPER = "#F8F5F0"
const INK = "#0f172a"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const LINE = "#e7e1d6"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

// ── Types ─────────────────────────────────────────────────────────────────────

interface DeckProduct {
  id: string
  slug: string
  titel: string
  kurzbeschreibung: string | null
  hero_bild: string | null
  produkt_typ: string
  preis: number
  waehrung: string
  besitz?: boolean
  abo_access?: boolean
  effektiver_preis?: number
}

const TRUST_SIGNALS = [
  { icon: <ShieldCheck className="h-4 w-4" style={{ color: GREEN }} />, label: "Physiotherapeutisch entwickelt" },
  { icon: <InfinityIcon className="h-4 w-4" style={{ color: GREEN }} />, label: "Lebenslanger Zugriff" },
  { icon: <Zap className="h-4 w-4" style={{ color: GREEN }} />, label: "Sofort nach dem Kauf nutzbar" },
]

// ── Deck-Karte ──────────────────────────────────────────────────────────────

function DeckCard({ deck, index }: { deck: DeckProduct; index: number }) {
  const owned = deck.besitz || deck.abo_access
  const price = deck.effektiver_preis ?? deck.preis

  return (
    <Link
      href={`/decks/${deck.slug}`}
      style={{ animationDelay: `${index * 70}ms`, borderColor: LINE }}
      className={cn(
        "group block bg-white rounded-2xl border overflow-hidden animate-fade-in-up",
        "transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1"
      )}
    >
      {/* Bild — Box-Mockup (Hochformat ~4:5) */}
      <div className="relative aspect-[4/5] overflow-hidden" style={{ backgroundColor: PAPER }}>
        {deck.hero_bild ? (
          <Image
            src={deck.hero_bild}
            alt={deck.titel}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(201,183,156,0.20) 0%, rgba(201,183,156,0.06) 100%)" }}
          >
            <Layers className="h-12 w-12" style={{ color: SAND }} />
          </div>
        )}

        {/* Typ-Badge */}
        <div className="absolute top-3 left-3">
          <span
            className="bg-white/90 backdrop-blur-sm text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-sm"
            style={{ color: GREEN }}
          >
            Bewegungskarten
          </span>
        </div>

        {/* Besitz-Overlay */}
        {owned && (
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-white rounded-xl px-3.5 py-2 flex items-center gap-1.5 shadow-lg">
              <CheckCircle2 className="h-4 w-4" style={{ color: GREEN }} />
              <span className="text-xs font-bold" style={{ color: INK }}>
                {deck.besitz ? "Im Besitz" : "Im Abo enthalten"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Inhalt */}
      <div className="p-4 space-y-2.5">
        <h3
          className="leading-snug text-base line-clamp-2"
          style={{ ...serif, color: INK }}
        >
          {deck.titel}
        </h3>

        {deck.kurzbeschreibung && (
          <p className="text-sm leading-relaxed line-clamp-2" style={{ color: MUTED }}>
            {deck.kurzbeschreibung}
          </p>
        )}

        <div className="pt-2 flex items-center justify-between border-t mt-3" style={{ borderColor: LINE }}>
          <div className="flex items-baseline gap-2 pt-2">
            {owned ? (
              <span className="text-sm font-bold" style={{ color: GREEN }}>Freigeschaltet</span>
            ) : (
              <span className="text-lg font-bold" style={{ color: INK }}>
                {price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </span>
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DecksOverviewPage() {
  const [decks, setDecks] = useState<DeckProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/shop/products")
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((json: { products?: DeckProduct[] }) =>
        setDecks((json.products ?? []).filter((p) => p.produkt_typ === "deck"))
      )
      .catch(() => setDecks([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: PAPER }}>
      <ShopHeader mode="website" />

      {/* ── Kopf / Intro ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ backgroundColor: PAPER }}>
        {/* Sand-Aura */}
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-24 right-0 h-[440px] w-[440px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(201,183,156,0.28) 0%, transparent 70%)" }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <span
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: GREEN }}
          >
            Bewegungskarten · für deinen Alltag
          </span>
          <h1
            className="text-3xl sm:text-4xl leading-[1.15] mt-3 max-w-2xl"
            style={{ ...serif, color: INK }}
          >
            Digitale Bewegungskarten — kurze Impulse, genau dann, wenn du sie brauchst.
          </h1>
          <p className="text-lg leading-relaxed mt-4 max-w-2xl" style={{ color: "#334155" }}>
            Jedes Set bündelt kurze Bewegungskarten zu einem klaren Thema. Karte
            ziehen, mitmachen, weiter im Tag — kein Studio, keine Geräte. Einmal
            kaufen, lebenslang behalten.
          </p>

          <div className="flex flex-wrap gap-2.5 mt-8">
            {TRUST_SIGNALS.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2 bg-white border rounded-full px-3.5 py-2"
                style={{ borderColor: LINE }}
              >
                {s.icon}
                <span className="text-sm font-medium" style={{ color: MUTED }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Deck-Grid ─────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        {loading ? (
          <div className="flex items-center justify-center py-24" style={{ color: SAND }}>
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
        ) : decks.length === 0 ? (
          // ── Leerzustand ──────────────────────────────────────────────────
          <div className="max-w-md mx-auto text-center py-16">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: "rgba(44,62,45,0.1)" }}
            >
              <Layers className="h-7 w-7" style={{ color: GREEN }} />
            </div>
            <h2 className="text-xl mb-2" style={{ ...serif, color: INK }}>
              Bewegungskarten sind bald verfügbar
            </h2>
            <p className="mb-6" style={{ color: MUTED }}>
              Wir arbeiten gerade an den ersten Decks. Schau bald wieder vorbei —
              oder entdecke in der Zwischenzeit unsere Challenges.
            </p>
            <Link
              href="/kurse"
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ color: GREEN }}
            >
              Zu den Challenges
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {decks.map((deck, i) => (
              <DeckCard key={deck.id} deck={deck} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t py-8" style={{ borderColor: LINE }}>
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
