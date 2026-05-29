"use client"

import { ScrollReveal } from "./ScrollReveal"
import { Shield, Lock, Server, Award } from "lucide-react"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const LINE = "#e7e1d6"

const trustItems = [
  {
    icon: Shield,
    title: "DSGVO-konform",
    description:
      "Vollständige Konformität mit der Datenschutz-Grundverordnung. Deine Gesundheitsdaten sind bei uns sicher.",
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
    <section className="py-24 sm:py-32 relative overflow-hidden" style={{ backgroundColor: PAPER }}>
      {/* Sand-Aura */}
      <div
        aria-hidden
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[300px] w-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(201,183,156,0.22) 0%, transparent 70%)" }}
      />

      {/* Smart line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="smart-line-dot animate-dot-pulse" />
        <div className="smart-line h-12" />
      </div>

      <div className="relative container mx-auto px-4 max-w-6xl">
        <ScrollReveal className="text-center mb-16">
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: GREEN }}>
            Vertrauen & Sicherheit
          </span>
          <h2
            className="mt-3 text-3xl sm:text-4xl lg:text-5xl tracking-tight"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
          >
            Deine Daten. Sicher geschützt.
          </h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: MUTED }}>
            Gesundheitsdaten verdienen höchsten Schutz. Bei uns ist das keine
            Option, sondern Standard.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 reveal-stagger">
          {trustItems.map((item) => (
            <ScrollReveal key={item.title}>
              <div
                className="group rounded-2xl border bg-white p-5 sm:p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg h-full"
                style={{ borderColor: LINE }}
              >
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: "rgba(44,62,45,0.1)" }}
                >
                  <item.icon className="h-6 w-6" style={{ color: GREEN }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: INK }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
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
