"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Slider } from "@/components/ui/slider"
import {
  Users,
  CalendarX,
  Eye,
  EyeOff,
  UserMinus,
  Calculator,
  ArrowDown,
  TrendingDown,
  Sparkles,
  Info,
} from "lucide-react"
import { fmtEuro as fmt, monatspreis } from "@/lib/bgf-pakete"

export function BgfRoiCalculator() {
  // Ihr Unternehmen
  const [mitarbeiter, setMitarbeiter] = useState(30)
  const [auTage, setAuTage] = useState(15)
  const [kostenProTag, setKostenProTag] = useState(300)

  // Feinjustierung (DE-Benchmarks als Default)
  const [praesentismusFaktor, setPraesentismusFaktor] = useState(1.5)
  const [mskAnteil, setMskAnteil] = useState(23)
  const [fluktQuote, setFluktQuote] = useState(2)
  const [wiederbesetzung, setWiederbesetzung] = useState(15000)
  const [reduktion, setReduktion] = useState(25)

  const calc = useMemo(() => {
    // Fester Monatspreis nach Teamgröße — über 50 MA nur noch Richtwert.
    const { preis: paketMonat, paket } = monatspreis(mitarbeiter)
    const steuerfreiProMa = 600
    const steuerSatz = 0.3

    // Die drei Kostenblöcke
    const absentismus = mitarbeiter * auTage * kostenProTag
    const praesentismus = absentismus * praesentismusFaktor
    const fluktuation = mitarbeiter * (fluktQuote / 100) * wiederbesetzung
    const gesamtkosten = absentismus + praesentismus + fluktuation

    // Adressierbar (Rücken/MSK-Anteil) + Einsparpotenzial
    const adressierbar = gesamtkosten * (mskAnteil / 100)
    const einsparung = adressierbar * (reduktion / 100)

    // Investition & Steuervorteil
    const investitionBrutto = paketMonat * 12
    const steuerVorteil = Math.min(
      mitarbeiter * steuerfreiProMa * steuerSatz,
      investitionBrutto * steuerSatz
    )
    const investitionNetto = investitionBrutto - steuerVorteil
    const effektivProMaMonat = investitionNetto / mitarbeiter / 12

    // Ergebnis
    const nettoNutzen = einsparung - investitionNetto
    const roi = investitionNetto > 0 ? Math.round((einsparung / investitionNetto) * 100) : 0

    return {
      paketMonat,
      paket,
      absentismus,
      praesentismus,
      fluktuation,
      gesamtkosten,
      adressierbar,
      einsparung,
      investitionBrutto,
      steuerVorteil,
      investitionNetto,
      effektivProMaMonat,
      nettoNutzen,
      roi,
    }
  }, [
    mitarbeiter,
    auTage,
    kostenProTag,
    praesentismusFaktor,
    mskAnteil,
    fluktQuote,
    wiederbesetzung,
    reduktion,
  ])

  const sliderCls =
    "[&_[role=slider]]:bg-landing-accent [&_[role=slider]]:border-landing-accent [&_.relative]:bg-landing-border [&_span[data-orientation]]:bg-landing-accent"

  return (
    <section id="roi-rechner" className="py-24 sm:py-32 bg-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(#2D6A4F 1px, transparent 1px), linear-gradient(90deg, #2D6A4F 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-landing-accent uppercase tracking-widest">
            <Calculator className="h-4 w-4" />
            Kosten-Rechner
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-landing-fg tracking-tight">
            Was kostet Sie eine{" "}
            <span className="text-red-500">unfitte Belegschaft</span>?
          </h2>
          <p className="mt-4 text-lg text-landing-fg-muted max-w-2xl mx-auto">
            Inklusive der versteckten Kosten, die in keiner Fehltage-Statistik
            stehen. Alle Annahmen sind Branchen-Benchmarks — justierbar auf Ihr Unternehmen.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8 }}
        >
          {/* ── Left: Inputs ───────────────────────────── */}
          <div className="space-y-6">
            {/* Ihr Unternehmen */}
            <div className="rounded-2xl border border-landing-border bg-landing-bg p-7 space-y-7">
              <h3 className="font-bold text-lg text-landing-fg flex items-center gap-2">
                <Users className="h-5 w-5 text-landing-accent" />
                Ihr Unternehmen
              </h3>

              <SliderRow
                icon={<Users className="h-4 w-4 text-landing-accent" />}
                label="Anzahl Mitarbeitende"
                value={mitarbeiter}
                display={`${mitarbeiter}`}
                min={5}
                max={150}
                step={5}
                minLabel="5"
                maxLabel="150"
                onChange={setMitarbeiter}
                cls={sliderCls}
                hint="Bis 50 Mitarbeitende gilt der Listenpreis. Darüber rechnen wir mit einem Richtwert — das Angebot machen wir individuell."
              />
              <SliderRow
                icon={<CalendarX className="h-4 w-4 text-orange-500" />}
                label="Ø Krankheitstage / MA / Jahr"
                value={auTage}
                display={`${auTage} Tage`}
                min={5}
                max={30}
                step={1}
                minLabel="5"
                maxLabel="30"
                onChange={setAuTage}
                accent="orange"
              />
              <SliderRow
                icon={<TrendingDown className="h-4 w-4 text-orange-500" />}
                label="Ø Kosten / Krankheitstag"
                value={kostenProTag}
                display={`${kostenProTag} €`}
                min={150}
                max={600}
                step={10}
                minLabel="150 €"
                maxLabel="600 €"
                onChange={setKostenProTag}
                accent="orange"
              />
            </div>

            {/* Feinjustierung */}
            <div className="rounded-2xl border border-landing-border bg-white p-7 space-y-7">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-lg text-landing-fg">Feinjustierung</h3>
                <span className="text-[11px] text-landing-fg-subtle text-right max-w-[55%] leading-snug">
                  Defaults = deutsche Branchen-Benchmarks
                </span>
              </div>

              <SliderRow
                icon={<EyeOff className="h-4 w-4 text-landing-accent-warm" />}
                label="Präsentismus-Faktor"
                value={praesentismusFaktor}
                display={`${praesentismusFaktor.toFixed(1)}×`}
                min={1}
                max={2.3}
                step={0.1}
                minLabel="1,0×"
                maxLabel="2,3×"
                onChange={setPraesentismusFaktor}
                accent="warm"
              />
              <SliderRow
                label="Anteil Rücken / Muskel-Skelett"
                value={mskAnteil}
                display={`${mskAnteil} %`}
                min={10}
                max={40}
                step={1}
                minLabel="10 %"
                maxLabel="40 %"
                onChange={setMskAnteil}
                cls={sliderCls}
                hint="Anteil Ihrer Kosten, den ein Bewegungs-Programm adressieren kann — nicht Ihre Gesamt-Gesundheit."
              />
              <SliderRow
                icon={<UserMinus className="h-4 w-4 text-orange-500" />}
                label="Gesundheitsbed. Fluktuation / Jahr"
                value={fluktQuote}
                display={`${fluktQuote} %`}
                min={0}
                max={6}
                step={0.5}
                minLabel="0 %"
                maxLabel="6 %"
                onChange={setFluktQuote}
                accent="orange"
              />
              <SliderRow
                label="Wiederbesetzungskosten / MA"
                value={wiederbesetzung}
                display={`${fmt(wiederbesetzung)} €`}
                min={5000}
                max={40000}
                step={1000}
                minLabel="5.000 €"
                maxLabel="40.000 €"
                onChange={setWiederbesetzung}
                cls={sliderCls}
              />
              <SliderRow
                icon={<TrendingDown className="h-4 w-4 text-landing-accent" />}
                label="Erwartete Reduktion durch Praxis OS"
                value={reduktion}
                display={`${reduktion} %`}
                min={10}
                max={40}
                step={1}
                minLabel="10 %"
                maxLabel="40 %"
                onChange={setReduktion}
                cls={sliderCls}
              />
            </div>
          </div>

          {/* ── Right: Results ─────────────────────────── */}
          <div className="space-y-4">
            {/* Gesamtkosten — Aufschlüsselung */}
            <div className="rounded-2xl bg-landing-fg p-6 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-red-500/10 blur-2xl" />
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-5">
                Ihre Kosten einer unfitten Belegschaft / Jahr
              </p>

              <div className="space-y-3 mb-5">
                <CostRow
                  icon={<Eye className="h-4 w-4 text-red-300" />}
                  label="Absentismus (Fehltage)"
                  hint={`${mitarbeiter} × ${auTage} Tage × ${kostenProTag} €`}
                  value={calc.absentismus}
                />
                <CostRow
                  icon={<EyeOff className="h-4 w-4 text-landing-accent-warm" />}
                  label="Präsentismus (unsichtbar)"
                  hint={`Absentismus × ${praesentismusFaktor.toFixed(1)}`}
                  value={calc.praesentismus}
                />
                <CostRow
                  icon={<UserMinus className="h-4 w-4 text-orange-300" />}
                  label="Fluktuation"
                  hint={`${mitarbeiter} × ${fluktQuote} % × ${fmt(wiederbesetzung)} €`}
                  value={calc.fluktuation}
                />
              </div>

              <div className="border-t border-white/10 pt-4 flex items-end justify-between">
                <span className="text-sm font-semibold text-white/70">Gesamtkosten</span>
                <span className="font-display text-4xl font-bold text-red-400">
                  {fmt(calc.gesamtkosten)} €
                </span>
              </div>
            </div>

            {/* Pfeil */}
            <div className="flex justify-center">
              <div className="w-9 h-9 rounded-full bg-landing-accent/10 border border-landing-accent/20 flex items-center justify-center">
                <ArrowDown className="h-4 w-4 text-landing-accent" />
              </div>
            </div>

            {/* Adressierbar + Einsparung */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-landing-border bg-landing-bg p-5">
                <p className="text-xs font-semibold text-landing-fg-muted uppercase tracking-wider mb-1">
                  Davon Rücken / MSK
                </p>
                <p className="font-display text-2xl font-bold text-landing-fg">
                  {fmt(calc.adressierbar)} €
                </p>
                <p className="text-[11px] text-landing-fg-subtle mt-1">
                  der adressierbare Anteil ({mskAnteil} %)
                </p>
              </div>
              <div className="rounded-2xl bg-landing-accent-light border border-landing-accent/20 p-5">
                <p className="text-xs font-semibold text-landing-accent uppercase tracking-wider mb-1">
                  Einsparpotenzial
                </p>
                <p className="font-display text-2xl font-bold text-landing-accent">
                  {fmt(calc.einsparung)} €
                </p>
                <p className="text-[11px] text-landing-accent/70 mt-1">
                  bei {reduktion} % Reduktion / Jahr
                </p>
              </div>
            </div>

            {/* Investition */}
            <div className="rounded-2xl border border-landing-border bg-white p-5 space-y-4">
              <p className="text-xs font-semibold text-landing-fg-muted uppercase tracking-wider">
                Ihre Investition
                {calc.paket ? ` (Paket ${calc.paket.size} Mitarbeitende)` : " (Richtwert)"}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-landing-fg-subtle mb-1">Jahreskosten brutto</p>
                  <p className="text-xl font-bold font-display text-landing-fg">
                    {fmt(calc.investitionBrutto)} €
                  </p>
                  <p className="text-[10px] text-landing-fg-subtle">
                    {fmt(calc.paketMonat)} € / Monat × 12
                    {calc.paket ? "" : " · individuelles Angebot"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-landing-fg-subtle mb-1">Steuervorteil (optional)</p>
                  <p className="text-xl font-bold font-display text-landing-accent">
                    −{fmt(calc.steuerVorteil)} €
                  </p>
                  <p className="text-[10px] text-landing-fg-subtle">§3 Nr. 34 · bei zert. Kursen*</p>
                </div>
              </div>
              <div className="border-t border-landing-border pt-3 flex justify-between items-baseline">
                <p className="text-xs font-semibold text-landing-fg-muted">Netto-Investition</p>
                <div className="text-right">
                  <p className="text-xl font-bold font-display text-landing-fg">
                    {fmt(calc.investitionNetto)} €
                    <span className="text-sm font-normal text-landing-fg-subtle">/Jahr</span>
                  </p>
                  <p className="text-[11px] text-landing-accent">
                    ≈ {fmt(calc.effektivProMaMonat)} € pro MA/Monat effektiv
                  </p>
                </div>
              </div>
            </div>

            {/* Netto-Nutzen + ROI */}
            <div
              className={`rounded-2xl p-6 border-2 ${
                calc.nettoNutzen >= 0
                  ? "bg-landing-accent/5 border-landing-accent/30"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
                      calc.nettoNutzen >= 0 ? "text-landing-accent" : "text-amber-600"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Netto-Nutzen / Jahr
                  </p>
                  <p
                    className={`font-display text-4xl font-bold ${
                      calc.nettoNutzen >= 0 ? "text-landing-accent" : "text-amber-600"
                    }`}
                  >
                    {calc.nettoNutzen >= 0 ? "+" : ""}
                    {fmt(calc.nettoNutzen)} €
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider mb-2 text-landing-fg-muted">
                    ROI
                  </p>
                  <p className="font-display text-4xl font-bold text-landing-fg">{calc.roi} %</p>
                </div>
              </div>
              <p
                className={`mt-3 text-sm leading-relaxed ${
                  calc.nettoNutzen >= 0 ? "text-landing-fg-muted" : "text-amber-700/80"
                }`}
              >
                {calc.nettoNutzen >= 0
                  ? "Die geschätzte Einsparung übersteigt Ihre Netto-Investition — Gesundheit rechnet sich messbar."
                  : `Die Investition liegt ${fmt(Math.abs(calc.nettoNutzen))} € über der reinen Kosten-Einsparung — rechnet sich aber über Mitarbeiterbindung, Arbeitgeber-Attraktivität und steigende Krankheitskosten.`}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          className="mt-10 max-w-3xl mx-auto flex gap-3 text-xs text-landing-fg-subtle leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-landing-fg-subtle" />
          <p>
            Modellrechnung mit branchenüblichen Annahmen (BAuA / iga-Report: 25–40 %
            Reduktion bei aktiver BGF; Präsentismus 1,5–2,3× der Fehltage-Kosten).
            Keine zugesicherte Ersparnis. *Der Steuervorteil nach §3 Nr. 34 EStG
            (bis 600 €/MA steuerfrei) gilt für zertifizierte Präventionskurse
            (zubuchbar), nicht automatisch für die Software-Lizenz — bitte mit Ihrem
            Steuerberater klären.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

/* ── Helpers ─────────────────────────────────────────── */

function SliderRow({
  icon,
  label,
  value,
  display,
  min,
  max,
  step,
  minLabel,
  maxLabel,
  onChange,
  accent = "green",
  cls,
  hint,
}: {
  icon?: React.ReactNode
  label: string
  value: number
  display: string
  min: number
  max: number
  step: number
  minLabel: string
  maxLabel: string
  onChange: (v: number) => void
  accent?: "green" | "orange" | "warm"
  cls?: string
  hint?: string
}) {
  const accentMap = {
    green: {
      text: "text-landing-accent",
      slider:
        "[&_[role=slider]]:bg-landing-accent [&_[role=slider]]:border-landing-accent [&_.relative]:bg-landing-border [&_span[data-orientation]]:bg-landing-accent",
    },
    orange: {
      text: "text-orange-500",
      slider:
        "[&_[role=slider]]:bg-orange-500 [&_[role=slider]]:border-orange-500 [&_.relative]:bg-landing-border [&_span[data-orientation]]:bg-orange-500",
    },
    warm: {
      text: "text-landing-accent-warm",
      slider:
        "[&_[role=slider]]:bg-amber-500 [&_[role=slider]]:border-amber-500 [&_.relative]:bg-landing-border [&_span[data-orientation]]:bg-amber-500",
    },
  }
  const a = accentMap[accent]
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-semibold text-landing-fg flex items-center gap-2">
          {icon}
          {label}
        </label>
        <span className={`text-lg font-bold font-display ${a.text}`}>{display}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className={cls ?? a.slider}
      />
      <div className="flex justify-between text-xs text-landing-fg-subtle mt-1">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
      {hint && (
        <p className="mt-2 flex items-start gap-1.5 text-[11px] text-landing-fg-subtle leading-snug">
          <Info className="h-3.5 w-3.5 flex-shrink-0 mt-px text-landing-fg-subtle" />
          {hint}
        </p>
      )}
    </div>
  )
}

function CostRow({
  icon,
  label,
  hint,
  value,
}: {
  icon: React.ReactNode
  label: string
  hint: string
  value: number
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="flex-shrink-0">{icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{label}</p>
          <p className="text-[10px] text-white/40 truncate">{hint}</p>
        </div>
      </div>
      <span className="font-display text-lg font-bold text-white/90 tabular-nums whitespace-nowrap">
        {fmt(value)} €
      </span>
    </div>
  )
}
