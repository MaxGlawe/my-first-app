"use client"

import { ScrollReveal } from "./ScrollReveal"
import { Check, X, Clock, Timer, UserX } from "lucide-react"

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
    label: "zwischen den Terminen mit Ihrem Therapeuten",
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
    <section id="vorteile" className="py-24 sm:py-32 bg-white relative overflow-hidden">
      {/* Smart line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="smart-line h-12" />
        <div className="smart-line-dot animate-dot-pulse" />
      </div>

      <div className="container mx-auto px-4 max-w-5xl">
        <ScrollReveal className="text-center mb-6">
          <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider">
            Vorteile
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Warum Online-Therapie{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              besser passt
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            Die Realität in deutschen Physiotherapie-Praxen — und warum es anders geht.
          </p>
        </ScrollReveal>

        {/* Pain Point Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {painPoints.map((point, i) => (
            <ScrollReveal key={i}>
              <div className="group relative rounded-2xl border border-slate-100 bg-slate-50/50 p-6 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-500 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <point.icon className="h-5 w-5 text-red-400" />
                  </div>
                  <span className="text-xs font-medium text-red-400 uppercase tracking-wider">Das Problem</span>
                </div>

                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
                    {point.stat}
                  </span>
                  <span className="text-lg font-semibold text-slate-500">
                    {point.unit}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-4">
                  {point.label}
                </p>

                <div className="pt-3 border-t border-slate-100">
                  <p className="text-sm font-medium text-emerald-600">
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
          <div className="hidden sm:block rounded-3xl overflow-hidden shadow-xl shadow-black/5 border border-slate-100">
            {/* Header */}
            <div className="grid grid-cols-2">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 sm:px-8 py-5">
                <span className="text-sm sm:text-base font-bold text-white">
                  Praxis OS — Online
                </span>
              </div>
              <div className="bg-slate-100 px-6 sm:px-8 py-5">
                <span className="text-sm sm:text-base font-bold text-slate-500">
                  Klassische Praxis
                </span>
              </div>
            </div>

            {/* Rows */}
            {comparisons.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-2 ${
                  i < comparisons.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <div className="flex items-center gap-3 px-6 sm:px-8 py-4 bg-emerald-50/30">
                  <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm sm:text-base text-slate-800 font-medium">
                    {row.ours}
                  </span>
                </div>
                <div className="flex items-center gap-3 px-6 sm:px-8 py-4 bg-white">
                  <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <X className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <span className="text-sm sm:text-base text-slate-400">
                    {row.theirs}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile stacked cards (hidden on sm+) */}
          <div className="sm:hidden space-y-3">
            {comparisons.map((row, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50/50">
                  <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-slate-800 font-medium">{row.ours}</span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50">
                  <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <X className="h-3 w-3 text-slate-400" />
                  </div>
                  <span className="text-xs text-slate-400 line-through">{row.theirs}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
