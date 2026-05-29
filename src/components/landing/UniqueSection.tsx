"use client"

import { ScrollReveal } from "./ScrollReveal"
import { Shield, Clock, BarChart3 } from "lucide-react"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const LINE = "#e7e1d6"

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
      "Kein Wartezimmer, keine Wartezeiten. Per Chat, Video oder App — dein Therapeut ist immer nur eine Nachricht entfernt.",
  },
  {
    icon: BarChart3,
    title: "Evidenzbasiert",
    description:
      "Wissenschaftlich fundierte Methoden. Messbare Fortschritte durch tägliches Tracking. Keine Standard-Programme — nur für dich.",
  },
]

export function UniqueSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32" style={{ backgroundColor: PAPER }}>
      {/* Sand-Aura */}
      <div
        aria-hidden
        className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(201,183,156,0.22) 0%, transparent 70%)" }}
      />

      {/* Connecting smart line */}
      <div className="absolute left-1/2 top-0 flex -translate-x-1/2 flex-col items-center">
        <div className="smart-line-dot animate-dot-pulse" />
        <div className="smart-line h-12" />
      </div>

      <div className="relative container mx-auto max-w-6xl px-4">
        <ScrollReveal className="mb-16 text-center">
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: GREEN }}>
            Was uns einzigartig macht
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl" style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}>
            Nicht irgendeine App.
            <br />
            <span style={{ color: MUTED }}>Deine persönliche Praxis.</span>
          </h2>
        </ScrollReveal>

        <div className="reveal-stagger grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {usps.map((usp) => (
            <ScrollReveal key={usp.title}>
              <div
                className="group relative rounded-2xl border bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg sm:p-8"
                style={{ borderColor: LINE }}
              >
                <div className="relative mb-6">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-xl"
                    style={{ backgroundColor: GREEN }}
                  >
                    <usp.icon className="h-7 w-7 text-white" />
                  </div>
                </div>

                <h3 className="mb-3 text-xl" style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}>
                  {usp.title}
                </h3>
                <p className="leading-relaxed" style={{ color: MUTED }}>
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
