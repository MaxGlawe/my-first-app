"use client"

import { ScrollReveal } from "./ScrollReveal"
import { Shield, Clock, BarChart3 } from "lucide-react"

const usps = [
  {
    icon: Shield,
    title: "Heilpraktiker-Qualität",
    description:
      "Staatlich geprüfte Zulassung nach dem Heilpraktikergesetz. Wir diagnostizieren und behandeln eigenständig — auf höchstem fachlichen Niveau.",
  },
  {
    icon: Clock,
    title: "Immer erreichbar",
    description:
      "Kein Wartezimmer, keine Wartezeiten. Per Chat, Video oder App — Ihr Therapeut ist immer nur eine Nachricht entfernt.",
  },
  {
    icon: BarChart3,
    title: "Evidenzbasiert",
    description:
      "Wissenschaftlich fundierte Methoden. Messbare Fortschritte durch tägliches Tracking. Keine Standard-Programme — nur für Sie.",
  },
]

export function UniqueSection() {
  return (
    <section className="relative py-24 sm:py-32 bg-slate-900 overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[600px] bg-emerald-500/5 blur-[120px] rounded-full" />

      {/* Connecting smart line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="smart-line-dot animate-dot-pulse" />
        <div className="smart-line h-12" />
      </div>

      <div className="relative container mx-auto px-4 max-w-6xl">
        <ScrollReveal className="text-center mb-16">
          <span className="text-sm font-medium text-emerald-400 uppercase tracking-wider">
            Was uns einzigartig macht
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Nicht irgendeine App.
            <br />
            <span className="text-slate-400">Ihre persönliche Praxis.</span>
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 reveal-stagger">
          {usps.map((usp) => (
            <ScrollReveal key={usp.title}>
              <div className="group relative rounded-2xl glass p-6 sm:p-8 hover:bg-white/[0.06] transition-all duration-500">
                {/* Icon with glow */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 h-14 w-14 rounded-xl bg-emerald-500/20 blur-xl group-hover:bg-emerald-500/30 transition-all" />
                  <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <usp.icon className="h-7 w-7 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">
                  {usp.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {usp.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
