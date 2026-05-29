"use client"

import { ScrollReveal } from "./ScrollReveal"
import { Equal, TrendingUp, ThumbsUp } from "lucide-react"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const LINE = "#e7e1d6"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

const evidence = [
  {
    icon: Equal,
    stat: "=",
    statLabel: "Gleichwertig",
    source: "Cochrane Review, Cottrell et al. 2017",
    claim:
      "Telerehabilitation erzielt gleichwertige Ergebnisse wie Präsenzbehandlung bei muskuloskelettalen Beschwerden.",
  },
  {
    icon: TrendingUp,
    stat: "+34%",
    statLabel: "Therapietreue",
    source: "Systematic Review, Hwang et al. 2015",
    claim:
      "Digitale Begleitung führt zu signifikant besserer Therapietreue — Patienten bleiben am Ball.",
  },
  {
    icon: ThumbsUp,
    stat: "92%",
    statLabel: "Zufriedenheit",
    source: "Meta-Analyse, Shukla et al. 2022",
    claim:
      'Die Patienten bewerten ihre Online-Therapie-Erfahrung als „gut“ oder „sehr gut“.',
  },
]

export function EvidenceSection() {
  return (
    <section
      id="evidenz"
      className="py-24 sm:py-32 relative overflow-hidden"
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* Sand-Aura */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(201,183,156,0.18) 0%, transparent 70%)" }}
      />

      {/* Smart line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="smart-line-dot animate-dot-pulse" />
        <div className="smart-line h-12" />
      </div>

      <div className="relative container mx-auto px-4 max-w-6xl">
        <ScrollReveal className="text-center mb-16">
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: GREEN }}>
            Wissenschaft
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl" style={{ ...serif, color: INK }}>
            Online-Therapie wirkt.{" "}
            <span style={{ color: GREEN }}>
              Das ist keine Meinung
            </span>{" "}
            — sondern Forschung.
          </h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: MUTED }}>
            Internationale Studien belegen: Digitale Physiotherapie ist genauso
            wirksam wie Behandlung vor Ort — bei höherer Therapietreue.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 reveal-stagger">
          {evidence.map((item) => (
            <ScrollReveal key={item.statLabel}>
              <div
                className="group rounded-2xl border p-6 sm:p-8 transition-all duration-500 hover:shadow-lg h-full flex flex-col"
                style={{ backgroundColor: PAPER, borderColor: LINE }}
              >
                {/* Stat */}
                <div className="mb-6">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: "rgba(44,62,45,0.1)" }}
                  >
                    <item.icon className="h-6 w-6" style={{ color: GREEN }} />
                  </div>
                  <span className="text-4xl sm:text-5xl" style={{ ...serif, color: INK }}>
                    {item.stat}
                  </span>
                  <p className="text-sm font-medium mt-1" style={{ color: BODY }}>
                    {item.statLabel}
                  </p>
                </div>

                {/* Claim */}
                <p className="text-sm leading-relaxed flex-1" style={{ color: MUTED }}>
                  {item.claim}
                </p>

                {/* Source */}
                <p className="text-xs mt-4 pt-4 border-t" style={{ color: MUTED, borderColor: LINE }}>
                  Quelle: {item.source}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
