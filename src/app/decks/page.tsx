"use client"

/**
 * PROJ-24: /decks — Karten-Decks-Übersicht (öffentlich)
 *
 * Lädt alle aktiven Produkte über /api/shop/products, filtert auf
 * produkt_typ === 'deck' und zeigt sie als Karten an. Premium-Stil
 * (Slate/Emerald), du-Form, HWG-sauber. ShopHeader im Website-Modus.
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
  { icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />, label: "Physiotherapeutisch entwickelt" },
  { icon: <InfinityIcon className="h-4 w-4 text-emerald-500" />, label: "Lebenslanger Zugriff" },
  { icon: <Zap className="h-4 w-4 text-emerald-500" />, label: "Sofort nach dem Kauf nutzbar" },
]

// ── Deck-Karte ──────────────────────────────────────────────────────────────

function DeckCard({ deck, index }: { deck: DeckProduct; index: number }) {
  const owned = deck.besitz || deck.abo_access
  const price = deck.effektiver_preis ?? deck.preis

  return (
    <Link
      href={`/decks/${deck.slug}`}
      style={{ animationDelay: `${index * 70}ms` }}
      className={cn(
        "group block bg-white rounded-2xl border border-slate-200 overflow-hidden animate-fade-in-up",
        "transition-all duration-300 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1"
      )}
    >
      {/* Bild — Box-Mockup (Hochformat ~4:5) */}
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
        {deck.hero_bild ? (
          <Image
            src={deck.hero_bild}
            alt={deck.titel}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center">
            <Layers className="h-12 w-12 text-white/80" />
          </div>
        )}

        {/* Typ-Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-sm">
            Bewegungskarten
          </span>
        </div>

        {/* Besitz-Overlay */}
        {owned && (
          <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-white rounded-xl px-3.5 py-2 flex items-center gap-1.5 shadow-lg">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">
                {deck.besitz ? "Im Besitz" : "Im Abo enthalten"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Inhalt */}
      <div className="p-4 space-y-2.5">
        <h3 className="font-bold text-slate-800 leading-snug text-base group-hover:text-emerald-700 transition-colors line-clamp-2">
          {deck.titel}
        </h3>

        {deck.kurzbeschreibung && (
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
            {deck.kurzbeschreibung}
          </p>
        )}

        <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-3">
          <div className="flex items-baseline gap-2 pt-2">
            {owned ? (
              <span className="text-sm font-bold text-emerald-600">Freigeschaltet</span>
            ) : (
              <span className="text-lg font-bold text-slate-900">
                {price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </span>
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
    <div className="min-h-screen bg-slate-50">
      <ShopHeader mode="website" />

      {/* ── Kopf / Intro ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-12 right-8 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute bottom-0 -left-12 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-[0.2em]">
            Bewegungskarten · für deinen Alltag
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-[1.15] mt-3 max-w-2xl">
            Digitale Bewegungskarten — kurze Impulse, genau dann, wenn du sie brauchst.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed mt-4 max-w-2xl">
            Jedes Set bündelt kurze Bewegungskarten zu einem klaren Thema. Karte
            ziehen, mitmachen, weiter im Tag — kein Studio, keine Geräte. Einmal
            kaufen, lebenslang behalten.
          </p>

          <div className="flex flex-wrap gap-2.5 mt-8">
            {TRUST_SIGNALS.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2 bg-white/[0.07] border border-white/10 rounded-full px-3.5 py-2"
              >
                {s.icon}
                <span className="text-sm text-slate-200 font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Deck-Grid ─────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-300">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
        ) : decks.length === 0 ? (
          // ── Leerzustand ──────────────────────────────────────────────────
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Layers className="h-7 w-7 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Bewegungskarten sind bald verfügbar
            </h2>
            <p className="text-slate-500 mb-6">
              Wir arbeiten gerade an den ersten Decks. Schau bald wieder vorbei —
              oder entdecke in der Zwischenzeit unsere Challenges.
            </p>
            <Link
              href="/kurse"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
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
      <footer className="border-t border-slate-200 py-8">
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
