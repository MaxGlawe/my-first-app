"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Slider } from "@/components/ui/slider"
import { TrendingDown, Users, Calculator, ArrowRight } from "lucide-react"

function fmt(n: number) {
  return new Intl.NumberFormat("de-DE").format(Math.round(n))
}

export function BgfRoiCalculator() {
  const [mitarbeiter, setMitarbeiter] = useState(100)
  const [auTage, setAuTage] = useState(20)
  const [mskAnteil, setMskAnteil] = useState(25)

  const calc = useMemo(() => {
    const kostenProAuTag = 300
    const reduktionsProzent = 0.2
    const proTierMonat = 39
    const steuerfreiProMa = 600
    const steuerSatz = 0.3

    // Aktuelle AU-Kosten (nur MSK-Anteil)
    const auKostenMsk = mitarbeiter * auTage * (mskAnteil / 100) * kostenProAuTag

    // Geschätzte Einsparung durch BGF (20% Reduktion)
    const einsparung = auKostenMsk * reduktionsProzent

    // Praxis OS Jahreskosten
    const praxisKostenBrutto = mitarbeiter * proTierMonat * 12

    // Steuervorteil (§3 Nr. 34 EStG)
    const steuerVorteil = Math.min(mitarbeiter * steuerfreiProMa * steuerSatz, praxisKostenBrutto * steuerSatz)

    // Netto-Kosten nach Steuervorteil
    const praxisKostenNetto = praxisKostenBrutto - steuerVorteil

    // Effektive Kosten pro MA/Monat nach Steuervorteil
    const effektivProMaMonat = praxisKostenNetto / mitarbeiter / 12

    // Netto-Ergebnis: Einsparung minus Netto-Investition
    const nettoErgebnis = einsparung - praxisKostenNetto

    return {
      auKostenMsk,
      einsparung,
      praxisKostenBrutto,
      steuerVorteil,
      praxisKostenNetto,
      effektivProMaMonat,
      nettoErgebnis,
    }
  }, [mitarbeiter, auTage, mskAnteil])

  return (
    <section id="roi-rechner" className="py-24 sm:py-32 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(#2D6A4F 1px, transparent 1px), linear-gradient(90deg, #2D6A4F 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 max-w-5xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-sm font-semibold text-landing-accent uppercase tracking-widest">
            ROI-Rechner
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-landing-fg tracking-tight">
            Was spart Ihr Unternehmen?
          </h2>
          <p className="mt-4 text-lg text-landing-fg-muted max-w-2xl mx-auto">
            Berechnen Sie Ihren konkreten ROI in unter 30 Sekunden.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8 }}
        >
          {/* Left: Sliders */}
          <div className="rounded-2xl border border-landing-border bg-landing-bg p-8 space-y-8">
            <h3 className="font-bold text-lg text-landing-fg flex items-center gap-2">
              <Calculator className="h-5 w-5 text-landing-accent" />
              Ihr Unternehmen
            </h3>

            {/* Mitarbeiter */}
            <div>
              <div className="flex justify-between mb-3">
                <label className="text-sm font-semibold text-landing-fg flex items-center gap-2">
                  <Users className="h-4 w-4 text-landing-accent" />
                  Anzahl Mitarbeitende
                </label>
                <span className="text-lg font-bold text-landing-accent font-display">
                  {mitarbeiter}
                </span>
              </div>
              <Slider
                value={[mitarbeiter]}
                onValueChange={([v]) => setMitarbeiter(v)}
                min={10}
                max={500}
                step={10}
                className="[&_[role=slider]]:bg-landing-accent [&_[role=slider]]:border-landing-accent [&_.relative]:bg-landing-border [&_span[data-orientation]]:bg-landing-accent"
              />
              <div className="flex justify-between text-xs text-landing-fg-subtle mt-1">
                <span>10</span><span>500</span>
              </div>
            </div>

            {/* AU-Tage */}
            <div>
              <div className="flex justify-between mb-3">
                <label className="text-sm font-semibold text-landing-fg flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-orange-500" />
                  Ø AU-Tage pro MA/Jahr
                </label>
                <span className="text-lg font-bold text-orange-500 font-display">
                  {auTage}
                </span>
              </div>
              <Slider
                value={[auTage]}
                onValueChange={([v]) => setAuTage(v)}
                min={5}
                max={30}
                step={1}
                className="[&_[role=slider]]:bg-orange-500 [&_[role=slider]]:border-orange-500 [&_.relative]:bg-landing-border [&_span[data-orientation]]:bg-orange-500"
              />
              <div className="flex justify-between text-xs text-landing-fg-subtle mt-1">
                <span>5 Tage</span><span>30 Tage</span>
              </div>
            </div>

            {/* MSK Anteil */}
            <div>
              <div className="flex justify-between mb-3">
                <label className="text-sm font-semibold text-landing-fg flex items-center gap-2">
                  Anteil Rücken/Muskuloskelettal
                </label>
                <span className="text-lg font-bold text-landing-accent-warm font-display">
                  {mskAnteil}%
                </span>
              </div>
              <Slider
                value={[mskAnteil]}
                onValueChange={([v]) => setMskAnteil(v)}
                min={10}
                max={50}
                step={5}
                className="[&_[role=slider]]:bg-amber-500 [&_[role=slider]]:border-amber-500 [&_.relative]:bg-landing-border [&_span[data-orientation]]:bg-amber-500"
              />
              <div className="flex justify-between text-xs text-landing-fg-subtle mt-1">
                <span>10%</span><span>50%</span>
              </div>
            </div>

            <div className="rounded-xl bg-landing-bg-warm border border-landing-border p-4 text-xs text-landing-fg-subtle space-y-1">
              <p className="font-semibold text-landing-fg-muted mb-1">Berechnungsgrundlage:</p>
              <p>Kosten pro AU-Tag: 300€ (Branchenschnitt)</p>
              <p>Geschätzte Reduktion durch BGF: 20%</p>
              <p>Steuervorteil: §3 Nr. 34 EStG (600€/MA steuerfrei)</p>
            </div>
          </div>

          {/* Right: Results */}
          <div className="space-y-4">
            {/* Ihre aktuellen Kosten */}
            <div className="rounded-2xl bg-red-50 border border-red-100 p-5">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
                Ihre aktuellen Rücken-AU-Kosten
              </p>
              <p className="text-3xl font-bold text-red-600 font-display">
                {fmt(calc.auKostenMsk)}€
                <span className="text-base font-normal text-red-400"> /Jahr</span>
              </p>
              <p className="text-xs text-red-400 mt-1">
                {mitarbeiter} MA × {auTage} AU-Tage × {mskAnteil}% MSK × 300€
              </p>
            </div>

            {/* Pfeil */}
            <div className="flex justify-center">
              <ArrowRight className="h-5 w-5 text-landing-fg-subtle rotate-90" />
            </div>

            {/* Investition vs. Einsparung */}
            <div className="rounded-2xl border border-landing-border bg-landing-bg p-5 space-y-4">
              <p className="text-xs font-semibold text-landing-fg-muted uppercase tracking-wider">
                Investition & Einsparung
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-landing-fg-subtle mb-1">Praxis OS (Pro-Tier)</p>
                  <p className="text-xl font-bold text-landing-fg font-display">
                    {fmt(calc.praxisKostenBrutto)}€
                  </p>
                  <p className="text-[10px] text-landing-fg-subtle">{mitarbeiter} × 39€ × 12 Mon.</p>
                </div>
                <div>
                  <p className="text-xs text-landing-fg-subtle mb-1">Steuervorteil</p>
                  <p className="text-xl font-bold text-landing-accent font-display">
                    -{fmt(calc.steuerVorteil)}€
                  </p>
                  <p className="text-[10px] text-landing-fg-subtle">§3 Nr. 34 EStG</p>
                </div>
              </div>

              <div className="border-t border-landing-border pt-3">
                <div className="flex justify-between items-baseline">
                  <p className="text-xs text-landing-fg-muted font-semibold">Netto-Investition</p>
                  <p className="text-xl font-bold text-landing-fg font-display">
                    {fmt(calc.praxisKostenNetto)}€<span className="text-sm text-landing-fg-subtle">/Jahr</span>
                  </p>
                </div>
                <p className="text-xs text-landing-accent mt-1">
                  = {fmt(calc.effektivProMaMonat)}€ pro MA/Monat effektiv
                </p>
              </div>
            </div>

            {/* Geschätzte Einsparung */}
            <div className="rounded-2xl bg-landing-accent-light border border-landing-accent/20 p-5">
              <p className="text-xs font-semibold text-landing-accent uppercase tracking-wider mb-1">
                Geschätzte AU-Einsparung (20% Reduktion)
              </p>
              <p className="text-3xl font-bold text-landing-accent font-display">
                {fmt(calc.einsparung)}€
                <span className="text-base font-normal text-landing-accent/60"> /Jahr</span>
              </p>
            </div>

            {/* Netto-Ergebnis */}
            <div className={`rounded-2xl p-6 border-2 ${
              calc.nettoErgebnis >= 0
                ? "bg-landing-accent/5 border-landing-accent/30"
                : "bg-amber-50 border-amber-200"
            }`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                calc.nettoErgebnis >= 0 ? "text-landing-accent" : "text-amber-600"
              }`}>
                Netto-Ergebnis (Einsparung − Investition)
              </p>
              <p className={`text-4xl font-bold font-display ${
                calc.nettoErgebnis >= 0 ? "text-landing-accent" : "text-amber-600"
              }`}>
                {calc.nettoErgebnis >= 0 ? "+" : ""}{fmt(calc.nettoErgebnis)}€
                <span className="text-lg font-normal opacity-60">/Jahr</span>
              </p>
              <p className={`mt-2 text-sm ${
                calc.nettoErgebnis >= 0 ? "text-landing-fg-muted" : "text-amber-600/80"
              }`}>
                {calc.nettoErgebnis >= 0
                  ? "Die geschätzte AU-Einsparung übersteigt Ihre Investition."
                  : `Prävention kostet ${fmt(Math.abs(calc.nettoErgebnis))}€/Jahr netto — rechnet sich langfristig durch Mitarbeiterbindung und steigende AU-Kosten.`
                }
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
