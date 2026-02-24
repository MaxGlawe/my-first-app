"use client"

import { ScrollReveal } from "./ScrollReveal"
import { Video, Smartphone, Brain, MessageCircle } from "lucide-react"

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
    description: "Datengestützte Anpassung Ihres Behandlungsplans",
  },
  {
    icon: MessageCircle,
    title: "Echtzeit-Chat",
    description: "Direkter Kontakt zu Ihrem Therapeuten — jederzeit",
  },
]

export function TechnologySection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-900" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] bg-emerald-500/8 blur-[150px] rounded-full" />

      <div className="relative container mx-auto px-4 max-w-6xl">
        <ScrollReveal className="text-center mb-16">
          <span className="text-sm font-medium text-emerald-400 uppercase tracking-wider">
            Unsere Technologie
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Modernste Technologie.
            <br />
            <span className="text-slate-400">Menschliche Betreuung.</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Wir verbinden das Beste aus beiden Welten: Digitale Präzision mit
            persönlicher Fürsorge.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 reveal-stagger">
          {techPoints.map((tp) => (
            <ScrollReveal key={tp.title}>
              <div className="group text-center p-6 rounded-2xl glass hover:bg-white/[0.06] transition-all duration-500">
                <div className="relative mx-auto mb-5">
                  <div className="absolute inset-0 h-14 w-14 mx-auto rounded-xl bg-emerald-500/20 blur-lg group-hover:bg-emerald-500/30 transition-all" />
                  <div className="relative h-14 w-14 mx-auto rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <tp.icon className="h-7 w-7 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{tp.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
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
