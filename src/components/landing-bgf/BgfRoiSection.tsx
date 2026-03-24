"use client"

import { useState } from "react"
import { ScrollReveal } from "@/components/landing/ScrollReveal"
import { TrendingDown, TrendingUp, ArrowDown, Calculator } from "lucide-react"

export function BgfRoiSection() {
  const [ma, setMa] = useState(50)
  const [fehltage, setFehltage] = useState(15)
  const [kostenProTag, setKostenProTag] = useState(300)

  const reductionRate = 0.25
  const totalSickDays = ma * fehltage
  const totalCostWithout = totalSickDays * kostenProTag
  const savedDays = Math.round(totalSickDays * reductionRate)
  const savedEuro = savedDays * kostenProTag
  const bgfCost = ma * 39 * 12
  const nettoGewinn = savedEuro - bgfCost
  const roi = bgfCost > 0 ? Math.round((savedEuro / bgfCost) * 100) : 0

  return (
    <section id="roi-rechner" className="py-20 sm:py-28 bg-slate-900 relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-0 left-1/3 h-[400px] w-[400px] bg-emerald-500/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] bg-indigo-500/8 blur-[120px] rounded-full" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,1) 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }} />

      <div className="relative container mx-auto px-4 max-w-5xl">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 mb-4">
              <Calculator className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-emerald-300/90 font-medium">ROI-Rechner</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Was kostet Sie <span className="text-red-400">Nichtstun</span>?
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Passen Sie die Werte an Ihr Unternehmen an und sehen Sie live, wie viel Sie sparen können.
            </p>
          </div>
        </ScrollReveal>

        {/* Sliders */}
        <ScrollReveal>
          <div className="grid sm:grid-cols-3 gap-5 mb-10">
            {[
              { label: "Mitarbeiter", value: ma, set: setMa, min: 10, max: 500, step: 5, suffix: "" },
              { label: "Ø Fehltage/MA/Jahr", value: fehltage, set: setFehltage, min: 5, max: 35, step: 1, suffix: " Tage" },
              { label: "Ø Kosten/Fehltag", value: kostenProTag, set: setKostenProTag, min: 150, max: 600, step: 10, suffix: " €" },
            ].map(({ label, value, set, min, max, step, suffix }) => (
              <div key={label} className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.08] backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-slate-400">{label}</span>
                  <span className="text-xl font-black text-white tabular-nums">{value}{suffix}</span>
                </div>
                <input
                  type="range" min={min} max={max} step={step} value={value}
                  onChange={(e) => set(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Results */}
        <ScrollReveal>
          {/* OHNE BGF */}
          <div className="bg-gradient-to-br from-red-500/15 to-rose-500/5 rounded-2xl p-6 border border-red-500/15 mb-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-red-400" />
              </div>
              <span className="text-xs font-bold text-red-300 uppercase tracking-wider">Ohne BGF — Status quo</span>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-4xl font-black text-red-400 tabular-nums">{totalSickDays.toLocaleString("de-DE")}</p>
                <p className="text-xs text-red-300/60 mt-1">Fehltage pro Jahr</p>
              </div>
              <div>
                <p className="text-4xl font-black text-red-400 tabular-nums">{totalCostWithout.toLocaleString("de-DE")} €</p>
                <p className="text-xs text-red-300/60 mt-1">Kosten durch Krankheit/Jahr</p>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center py-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
              <ArrowDown className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {/* MIT BGF */}
          <div className="bg-gradient-to-br from-emerald-500/15 to-teal-500/5 rounded-2xl p-6 border border-emerald-500/15 mb-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Mit Praxis OS BGF</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">{savedDays.toLocaleString("de-DE")}</p>
                <p className="text-xs text-emerald-300/60 mt-1">Tage eingespart</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">{savedEuro.toLocaleString("de-DE")} €</p>
                <p className="text-xs text-emerald-300/60 mt-1">Einsparung/Jahr</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                  {nettoGewinn > 0 ? "+" : ""}{nettoGewinn.toLocaleString("de-DE")} €
                </p>
                <p className="text-xs text-emerald-300/60 mt-1">nach BGF-Kosten ({bgfCost.toLocaleString("de-DE")} €)</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">{roi}%</p>
                <p className="text-xs text-emerald-300/60 mt-1">ROI</p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center leading-relaxed">
            Konservative Schätzung mit 25% Fehltage-Reduktion. Studien (BAuA, iga-Report) zeigen 25-40% Reduktion bei aktiver BGF.
            ROI-Berechnung: Fehltage-Kosten × Reduktion − BGF-Investition.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
