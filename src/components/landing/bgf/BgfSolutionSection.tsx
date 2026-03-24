"use client"

import { motion } from "framer-motion"
import { Check, X, Brain, Clock, MapPin, Activity } from "lucide-react"

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-64">
      {/* Phone frame */}
      <div className="relative rounded-[2.5rem] bg-landing-fg p-2 shadow-2xl">
        {/* Screen */}
        <div className="rounded-[2rem] bg-white overflow-hidden">
          {/* Status bar */}
          <div className="bg-landing-fg px-6 py-2 flex justify-between items-center">
            <span className="text-white/60 text-[10px] font-mono">9:41</span>
            <div className="w-12 h-3 rounded-full bg-landing-fg" />
            <span className="text-white/60 text-[10px]">●●●</span>
          </div>

          {/* App content */}
          <div className="bg-gradient-to-b from-landing-accent/5 to-white px-5 py-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] text-landing-fg-subtle">Jetzt</p>
                <p className="font-bold text-sm text-landing-fg">Pausen-Fit #2</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-landing-accent flex items-center justify-center">
                <Activity className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* Exercise name */}
            <div className="rounded-xl bg-landing-accent/10 border border-landing-accent/20 p-3 mb-4 text-center">
              <p className="text-xs text-landing-accent font-semibold mb-0.5">Aktuelle Übung</p>
              <p className="font-bold text-sm text-landing-fg">Schulter-Rotation</p>
              <p className="text-[10px] text-landing-fg-subtle mt-0.5">3 × 10 Wiederholungen</p>
            </div>

            {/* Timer circle */}
            <div className="flex justify-center mb-4">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 80 80" className="transform -rotate-90 w-full h-full">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#E8F0EC" strokeWidth="6" />
                  <motion.circle
                    cx="40" cy="40" r="34"
                    fill="none"
                    stroke="#2D6A4F"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={213}
                    initial={{ strokeDashoffset: 213 }}
                    animate={{ strokeDashoffset: 53 }}
                    transition={{ duration: 2.5, delay: 1, ease: "linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    className="text-xl font-bold text-landing-fg font-display"
                    animate={{ opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    3:12
                  </motion.span>
                  <span className="text-[9px] text-landing-fg-subtle">verbleibend</span>
                </div>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={`h-2 rounded-full transition-all ${i === 1 ? "w-6 bg-landing-accent" : "w-2 bg-landing-border"}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                />
              ))}
            </div>

            {/* Bottom indicator */}
            <div className="flex items-center gap-2 bg-landing-bg rounded-lg p-2.5">
              <span className="text-sm">🟢</span>
              <div>
                <p className="text-[10px] font-semibold text-landing-fg">Kein Schmerz</p>
                <p className="text-[9px] text-landing-fg-subtle">Ampelstatus: Grün</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <motion.div
        className="absolute -left-8 top-16 bg-white rounded-xl border border-landing-border shadow-lg px-3 py-2 text-xs"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <span className="font-semibold text-landing-accent">KI-personalisiert</span>
        <br />
        <span className="text-landing-fg-subtle">für Sie angepasst</span>
      </motion.div>
      <motion.div
        className="absolute -right-10 bottom-20 bg-white rounded-xl border border-landing-border shadow-lg px-3 py-2 text-xs"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.8, duration: 0.5 }}
      >
        <span className="font-semibold text-landing-fg">4 Min.</span>
        <br />
        <span className="text-landing-fg-subtle">am Arbeitsplatz</span>
      </motion.div>
    </div>
  )
}

const features = [
  { icon: Clock, text: "3× täglich, 4 Minuten, KI-personalisiert" },
  { icon: MapPin, text: "Am Arbeitsplatz, in der Arbeitszeit" },
  { icon: Brain, text: "Individuell basierend auf Gesundheitsanalyse" },
  { icon: Activity, text: "Ergonomie-Tipps integriert" },
]

const comparison = [
  { feature: "Tägliche Übungen", hansefit: false, bkk: false, praxis: true },
  { feature: "KI-Personalisierung", hansefit: false, bkk: false, praxis: true },
  { feature: "Individuelle Gesundheitsanalyse", hansefit: false, bkk: true, praxis: true },
  { feature: "Therapeuten-Betreuung bei Bedarf", hansefit: false, bkk: false, praxis: true },
  { feature: "HR-Dashboard mit KPIs", hansefit: false, bkk: false, praxis: true },
  { feature: "§3 Nr. 34 EStG Konformität", hansefit: true, bkk: true, praxis: true },
  { feature: "ZPP-Zertifizierung", hansefit: false, bkk: true, praxis: true },
  { feature: "Messbare Ergebnisse", hansefit: false, bkk: false, praxis: true },
]

export function BgfSolutionSection() {
  return (
    <section className="py-24 sm:py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-sm font-semibold text-landing-accent uppercase tracking-widest">
            Unsere Lösung
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-landing-fg tracking-tight">
            Pausen-Fit —{" "}
            <span className="text-landing-accent">Ihr täglicher Gesundheitsimpuls</span>
          </h2>
        </motion.div>

        {/* Two-column: Features + Phone */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          {/* Left: Features */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-landing-fg-muted text-lg leading-relaxed mb-8">
              Statt generischer Kursangebote bekommen Ihre Mitarbeitenden täglich
              eine persönliche, 4-minütige Übungseinheit — direkt im Büro, am Schreibtisch.
              KI-gestützt, evidenzbasiert, messbar.
            </p>

            <div className="space-y-5">
              {features.map((feat, i) => (
                <motion.div
                  key={feat.text}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-landing-accent/10 flex items-center justify-center">
                    <feat.icon className="h-5 w-5 text-landing-accent" />
                  </div>
                  <p className="text-landing-fg font-medium leading-snug pt-2">{feat.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
            className="flex justify-center py-8"
          >
            <PhoneMockup />
          </motion.div>
        </div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
        >
          <h3 className="text-xl font-bold font-display text-landing-fg mb-6 text-center">
            Vergleich: BGF-Anbieter auf einen Blick
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-landing-border shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-landing-bg border-b border-landing-border">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-landing-fg-muted">Feature</th>
                  <th className="py-4 px-4 text-sm font-semibold text-landing-fg-muted text-center">Hansefit</th>
                  <th className="py-4 px-4 text-sm font-semibold text-landing-fg-muted text-center">BKK-BGF</th>
                  <th className="py-4 px-4 text-sm font-bold text-landing-accent text-center bg-landing-accent/5">
                    Praxis OS ✦
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-landing-border/50 ${i % 2 === 0 ? "bg-white" : "bg-landing-bg/50"}`}
                  >
                    <td className="py-3.5 px-6 text-sm text-landing-fg">{row.feature}</td>
                    <td className="py-3.5 px-4 text-center">
                      {row.hansefit ? (
                        <Check className="h-4 w-4 text-landing-accent mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {row.bkk ? (
                        <Check className="h-4 w-4 text-landing-accent mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center bg-landing-accent/5">
                      {row.praxis ? (
                        <Check className="h-4 w-4 text-landing-accent mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-red-400 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
