"use client"

import { ScrollReveal } from "./ScrollReveal"
import { Video, Smartphone, Brain, MessageCircle } from "lucide-react"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const LINE = "#e7e1d6"

const techPoints = [
  {
    icon: Video,
    title: "Video-Therapie",
    description: "HD-Videogespräche für persönliche Diagnose und Behandlung",
  },
  {
    icon: Smartphone,
    title: "App-Tracking",
    description: "Tägliche Erfassung von Schmerz, Schlaf und Fortschritten",
  },
  {
    icon: Brain,
    title: "Intelligente Analyse",
    description: "Datengestützte Anpassung deines Behandlungsplans",
  },
  {
    icon: MessageCircle,
    title: "Echtzeit-Chat",
    description: "Direkter Kontakt zu deinem Therapeuten — jederzeit",
  },
]

export function TechnologySection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden" style={{ backgroundColor: PAPER }}>
      {/* Sand-Aura */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(201,183,156,0.22) 0%, transparent 70%)" }}
      />

      <div className="relative container mx-auto px-4 max-w-6xl">
        <ScrollReveal className="text-center mb-16">
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: GREEN }}>
            Unsere Technologie
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl tracking-tight" style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}>
            Modernste Technologie.
            <br />
            <span style={{ color: MUTED }}>Menschliche Betreuung.</span>
          </h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: MUTED }}>
            Wir verbinden das Beste aus beiden Welten: Digitale Präzision mit
            persönlicher Fürsorge.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 reveal-stagger">
          {techPoints.map((tp) => (
            <ScrollReveal key={tp.title}>
              <div
                className="group text-center p-6 rounded-2xl border bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-lg"
                style={{ borderColor: LINE }}
              >
                <div className="relative mx-auto mb-5">
                  <div
                    className="relative h-14 w-14 mx-auto rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: GREEN }}
                  >
                    <tp.icon className="h-7 w-7 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: INK }}>{tp.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                  {tp.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
