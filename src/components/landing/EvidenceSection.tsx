"use client"

import { ScrollReveal } from "./ScrollReveal"
import { Equal, TrendingUp, ThumbsUp } from "lucide-react"

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
      'Der Patienten bewerten ihre Online-Therapie-Erfahrung als \u201Egut\u201C oder \u201Esehr gut\u201C.',
  },
]

export function EvidenceSection() {
  return (
    <section
      id="evidenz"
      className="py-24 sm:py-32 bg-slate-900 relative overflow-hidden"
    >
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] bg-emerald-500/5 blur-[120px] rounded-full" />

      {/* Smart line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="smart-line-dot animate-dot-pulse" />
        <div className="smart-line h-12" />
      </div>

      <div className="relative container mx-auto px-4 max-w-6xl">
        <ScrollReveal className="text-center mb-16">
          <span className="text-sm font-medium text-emerald-400 uppercase tracking-wider">
            Wissenschaft
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Online-Therapie wirkt.{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Das ist keine Meinung
            </span>{" "}
            — sondern Forschung.
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Internationale Studien belegen: Digitale Physiotherapie ist genauso
            wirksam wie Behandlung vor Ort — bei höherer Therapietreue.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 reveal-stagger">
          {evidence.map((item) => (
            <ScrollReveal key={item.statLabel}>
              <div className="group rounded-2xl glass p-6 sm:p-8 hover:bg-white/[0.06] transition-all duration-500 h-full flex flex-col">
                {/* Stat */}
                <div className="mb-6">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                    <item.icon className="h-6 w-6 text-emerald-400" />
                  </div>
                  <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent tracking-tight">
                    {item.stat}
                  </span>
                  <p className="text-sm font-medium text-slate-300 mt-1">
                    {item.statLabel}
                  </p>
                </div>

                {/* Claim */}
                <p className="text-sm text-slate-400 leading-relaxed flex-1">
                  {item.claim}
                </p>

                {/* Source */}
                <p className="text-xs text-slate-500 mt-4 pt-4 border-t border-slate-700/50">
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
