"use client"

import { ScrollReveal } from "./ScrollReveal"
import { Check, X, Clock, Timer, UserX } from "lucide-react"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const LINE = "#e7e1d6"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

const painPoints = [
  {
    icon: Clock,
    stat: "4–6",
    unit: "Wochen",
    label: "Wartezeit auf einen Kassentermin",
    ours: "Bei uns: Erstgespräch innerhalb von 24h",
  },
  {
    icon: Timer,
    stat: "15–20",
    unit: "Min.",
    label: "Behandlungszeit pro KG-Termin",
    ours: "Bei uns: Individualisierte Therapie, deutlich mehr Zeit",
  },
  {
    icon: UserX,
    stat: "0",
    unit: "Kontakt",
    label: "zwischen den Terminen mit deinem Therapeuten",
    ours: "Bei uns: Jederzeit per Chat & Video erreichbar",
  },
]

const comparisons = [
  { ours: "Erstgespräch innerhalb von 24h", theirs: "4–6 Wochen Wartezeit" },
  { ours: "Individuelle Behandlungsdauer", theirs: "Nur 15–20 Min. pro Termin" },
  { ours: "Therapeut jederzeit erreichbar", theirs: "Nur zu Sprechzeiten" },
  { ours: "Flexible Zeiten, 24/7", theirs: "Feste Termine, Mo–Fr" },
  { ours: "Überall trainieren", theirs: "Anfahrt zur Praxis nötig" },
  { ours: "Fortschritte digital sichtbar", theirs: "Kein systematisches Tracking" },
  { ours: "DSGVO-konforme Plattform", theirs: "Papierakten, Faxgeräte" },
]

export function ComparisonSection() {
  return (
    <section id="vorteile" className="py-24 sm:py-32 relative overflow-hidden" style={{ backgroundColor: PAPER }}>
      {/* Smart line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="smart-line h-12" />
        <div className="smart-line-dot animate-dot-pulse" />
      </div>

      <div className="container mx-auto px-4 max-w-5xl">
        <ScrollReveal className="text-center mb-6">
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: GREEN }}>
            Vorteile
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl" style={{ ...serif, color: INK }}>
            Warum Online-Therapie{" "}
            <span style={{ color: GREEN }}>
              besser passt
            </span>
          </h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: MUTED }}>
            Die Realität in deutschen Physiotherapie-Praxen — und warum es anders geht.
          </p>
        </ScrollReveal>

        {/* Pain Point Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {painPoints.map((point, i) => (
            <ScrollReveal key={i}>
              <div
                className="group relative rounded-2xl border bg-white p-6 transition-all duration-500 hover:shadow-lg h-full"
                style={{ borderColor: LINE }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <point.icon className="h-5 w-5 text-red-400" />
                  </div>
                  <span className="text-xs font-medium text-red-400 uppercase tracking-wider">Das Problem</span>
                </div>

                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-4xl sm:text-5xl" style={{ ...serif, color: INK }}>
                    {point.stat}
                  </span>
                  <span className="text-lg font-semibold" style={{ color: MUTED }}>
                    {point.unit}
                  </span>
                </div>
                <p className="text-sm mb-4" style={{ color: MUTED }}>
                  {point.label}
                </p>

                <div className="pt-3 border-t" style={{ borderColor: LINE }}>
                  <p className="text-sm font-medium" style={{ color: GREEN }}>
                    {point.ours}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Comparison table — Desktop: 2-column grid, Mobile: stacked cards */}
        <ScrollReveal>
          {/* Desktop table (hidden on mobile) */}
          <div className="hidden sm:block rounded-3xl overflow-hidden shadow-xl shadow-black/5 border" style={{ borderColor: LINE }}>
            {/* Header */}
            <div className="grid grid-cols-2">
              <div className="px-6 sm:px-8 py-5" style={{ backgroundColor: GREEN }}>
                <span className="text-sm sm:text-base font-bold text-white">
                  Praxis OS — Online
                </span>
              </div>
              <div className="px-6 sm:px-8 py-5" style={{ backgroundColor: PAPER }}>
                <span className="text-sm sm:text-base font-bold" style={{ color: MUTED }}>
                  Klassische Praxis
                </span>
              </div>
            </div>

            {/* Rows */}
            {comparisons.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-2"
                style={i < comparisons.length - 1 ? { borderBottom: `1px solid ${LINE}` } : undefined}
              >
                <div
                  className="flex items-center gap-3 px-6 sm:px-8 py-4"
                  style={{ backgroundColor: "rgba(44,62,45,0.05)" }}
                >
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: GREEN }}
                  >
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm sm:text-base font-medium" style={{ color: BODY }}>
                    {row.ours}
                  </span>
                </div>
                <div className="flex items-center gap-3 px-6 sm:px-8 py-4 bg-white">
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: LINE }}
                  >
                    <X className="h-3.5 w-3.5" style={{ color: MUTED }} />
                  </div>
                  <span className="text-sm sm:text-base" style={{ color: MUTED }}>
                    {row.theirs}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile stacked cards (hidden on sm+) */}
          <div className="sm:hidden space-y-3">
            {comparisons.map((row, i) => (
              <div key={i} className="rounded-2xl border overflow-hidden" style={{ borderColor: LINE }}>
                <div
                  className="flex items-center gap-2.5 px-4 py-3"
                  style={{ backgroundColor: "rgba(44,62,45,0.05)" }}
                >
                  <div
                    className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: GREEN }}
                  >
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium" style={{ color: BODY }}>{row.ours}</span>
                </div>
                <div
                  className="flex items-center gap-2.5 px-4 py-2.5"
                  style={{ backgroundColor: PAPER }}
                >
                  <div
                    className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: LINE }}
                  >
                    <X className="h-3 w-3" style={{ color: MUTED }} />
                  </div>
                  <span className="text-xs line-through" style={{ color: MUTED }}>{row.theirs}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
