"use client"

import { ScrollReveal } from "./ScrollReveal"
import { Shield, Lock, Server, Award } from "lucide-react"

const trustItems = [
  {
    icon: Shield,
    title: "DSGVO-konform",
    description:
      "Vollständige Konformität mit der Datenschutz-Grundverordnung. Ihre Gesundheitsdaten sind bei uns sicher.",
  },
  {
    icon: Lock,
    title: "Verschlüsselte Kommunikation",
    description:
      "Ende-zu-Ende-Verschlüsselung für alle Nachrichten und Video-Gespräche. Kein unbefugter Zugriff.",
  },
  {
    icon: Server,
    title: "Deutsche Server",
    description:
      "Alle Daten werden auf Servern in Deutschland gehostet. Keine Datenübertragung ins Ausland.",
  },
  {
    icon: Award,
    title: "Heilpraktiker-Zulassung",
    description:
      "Staatlich geprüfte Zulassung nach dem Heilpraktikergesetz. Qualifizierte, eigenständige Behandlung.",
  },
]

export function TrustSection() {
  return (
    <section className="py-24 sm:py-32 bg-slate-900 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[300px] w-[600px] bg-emerald-500/5 blur-[120px] rounded-full" />

      {/* Smart line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="smart-line-dot animate-dot-pulse" />
        <div className="smart-line h-12" />
      </div>

      <div className="relative container mx-auto px-4 max-w-6xl">
        <ScrollReveal className="text-center mb-16">
          <span className="text-sm font-medium text-emerald-400 uppercase tracking-wider">
            Vertrauen & Sicherheit
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Ihre Daten. Sicher geschützt.
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Gesundheitsdaten verdienen höchsten Schutz. Bei uns ist das keine
            Option, sondern Standard.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 reveal-stagger">
          {trustItems.map((item) => (
            <ScrollReveal key={item.title}>
              <div className="group rounded-2xl glass p-6 hover:bg-white/[0.06] transition-all duration-500 h-full">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  <item.icon className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
