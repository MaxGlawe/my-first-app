"use client"

import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const LINE = "#e7e1d6"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const
const MC = "/images/masterclass/chronischer-kreuzschmerz"

// Durchlaufende Marquee: nur die PRODUKT-COVER (keine Einzelkarten), in nativer
// Höhe ohne Beschnitt — gemischte Breiten (Challenges 1:1, Masterclass/Deck hochkant).
const MARQUEE = [
  { src: `${MC}/cover.jpg`, w: 1122, h: 1402, alt: "Masterclass · Chronischer Kreuzschmerz" },
  { src: "/images/kurse/hydrations-boost.png", w: 1254, h: 1254, alt: "Challenge · Hydrations-Boost" },
  { src: "/images/decks/vielfahrer-reset/shop-1.png", w: 1122, h: 1402, alt: "Vielfahrer-Reset · Bewegungskarten" },
  { src: "/images/kurse/ruecken-mobility.png", w: 1254, h: 1254, alt: "Challenge · Rücken-Mobility" },
  { src: "/images/kurse/schmerz-tagebuch-routine.png", w: 1254, h: 1254, alt: "Challenge · Schmerz-Tagebuch-Routine" },
  { src: "/images/kurse/faszien-tiefenarbeit.png", w: 1254, h: 1254, alt: "Challenge · Faszien-Tiefenarbeit" },
] as const

const TEASERS = [
  {
    kicker: "Masterclass",
    titel: "Chronischer Kreuzschmerz",
    line: "Verstehen und lösen — begleitet wie in der Praxis.",
    href: "/kurse/chronischer-kreuzschmerz",
  },
  {
    kicker: "Challenges",
    titel: "21-Tage-Programme",
    line: "In drei Wochen zu einer neuen Routine.",
    href: "/kurse",
  },
  {
    kicker: "Bewegungskarten",
    titel: "Decks für unterwegs",
    line: "Bewegung, die in jeden Tag passt.",
    href: "/decks",
  },
] as const

export function ShopShowcaseSection() {
  const track = [...MARQUEE, ...MARQUEE]

  return (
    <section className="overflow-hidden py-24 sm:py-32" style={{ backgroundColor: PAPER }}>
      {/* Kopf */}
      <div className="container mx-auto max-w-3xl px-4 text-center">
        <span
          className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider"
          style={{ color: GREEN }}
        >
          <Sparkles className="h-4 w-4" />
          Der Shop · auch ohne Termin
        </span>
        <h2 className="mt-4 text-4xl leading-[1.08] sm:text-5xl" style={{ ...serif, color: INK }}>
          Nimm deinen Körper selbst in die Hand.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed" style={{ color: MUTED }}>
          Digitale Werkzeuge, die wirklich etwas verändern — für alle, nicht nur für Patienten.
          Verstehen, üben, dranbleiben. Einmal kaufen, lebenslang behalten.
        </p>
      </div>

      {/* Marquee — durchlaufende Produktbilder, klickbar zum Shop */}
      <Link
        href="/kurse"
        aria-label="Zum Shop"
        className="ugc-marquee relative mt-12 block w-full overflow-hidden py-2"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 md:w-28"
          style={{ background: `linear-gradient(to right, ${PAPER}, rgba(248,245,240,0))` }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 md:w-28"
          style={{ background: `linear-gradient(to left, ${PAPER}, rgba(248,245,240,0))` }}
        />
        <ul className="ugc-marquee-track flex w-max items-center">
          {track.map((c, i) => (
            <li
              key={i}
              className="mr-4 shrink-0"
              aria-hidden={i >= MARQUEE.length ? true : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.src}
                alt={c.alt}
                width={c.w}
                height={c.h}
                className="h-56 w-auto rounded-2xl border bg-white object-cover shadow-sm sm:h-64"
                style={{ borderColor: LINE }}
              />
            </li>
          ))}
        </ul>
      </Link>

      {/* Mini-Teaser — minimal Text, Klick zum Produkt */}
      <div className="container mx-auto mt-12 max-w-5xl px-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {TEASERS.map((t) => (
            <Link
              key={t.titel}
              href={t.href}
              className="group flex items-center justify-between gap-3 rounded-2xl border bg-white px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderColor: LINE }}
            >
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: GREEN }}>
                  {t.kicker}
                </p>
                <p className="mt-1 truncate text-base" style={{ ...serif, color: INK }}>
                  {t.titel}
                </p>
                <p className="mt-0.5 text-xs leading-snug" style={{ color: MUTED }}>
                  {t.line}
                </p>
              </div>
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5"
                style={{ backgroundColor: "rgba(44,62,45,0.1)", color: GREEN }}
              >
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-9 text-center">
          <Link
            href="/kurse"
            className="inline-flex h-12 items-center gap-2 rounded-xl px-7 font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: GREEN }}
          >
            Den ganzen Shop entdecken
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
