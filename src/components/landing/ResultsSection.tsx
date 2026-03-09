"use client"

import { ScrollReveal } from "./ScrollReveal"
import { TrendingDown, Star, Clock, UserCheck } from "lucide-react"

const stats = [
  {
    icon: TrendingDown,
    stat: "87%",
    label: "berichten Schmerzreduktion nach 4 Wochen",
  },
  {
    icon: Star,
    stat: "5.0/5",
    label: "Google-Bewertung",
  },
  {
    icon: Clock,
    stat: "<24h",
    label: "bis zur ersten Rückmeldung",
  },
  {
    icon: UserCheck,
    stat: "100%",
    label: "persönlich — ein Therapeut, Ihr Therapeut",
  },
]

const cases = [
  {
    initial: "S",
    profile: "Büroangestellte, 42",
    complaint: "Chronische LWS — 3 Jahre",
    result: "7/10 → 2/10 Schmerz, kein Arbeitsausfall mehr",
  },
  {
    initial: "M",
    profile: "Handwerker, 35",
    complaint: "Schulter-Impingement — 8 Monate",
    result: "Volle Beweglichkeit nach 8 Wochen, OP vermieden",
  },
  {
    initial: "K",
    profile: "Rentnerin, 67",
    complaint: "Knie-Arthrose beidseitig",
    result: "Schmerzmedikation −60%, tägliche Spaziergänge wieder möglich",
  },
]

export function ResultsSection() {
  return (
    <section
      id="ergebnisse"
      className="py-24 sm:py-32 bg-slate-900 relative overflow-hidden"
    >
      {/* Glow */}
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] bg-teal-500/5 blur-[120px] rounded-full" />

      {/* Smart line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="smart-line-dot animate-dot-pulse" />
        <div className="smart-line h-12" />
      </div>

      <div className="relative container mx-auto px-4 max-w-6xl">
        <ScrollReveal className="text-center mb-16">
          <span className="text-sm font-medium text-emerald-400 uppercase tracking-wider">
            Ergebnisse
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Ergebnisse, die{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              für sich sprechen
            </span>
          </h2>
        </ScrollReveal>

        {/* Stats Bar */}
        <ScrollReveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
            {stats.map((item) => (
              <div
                key={item.stat}
                className="rounded-2xl glass p-5 sm:p-6 text-center"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {item.stat}
                </span>
                <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Mini-Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 reveal-stagger">
          {cases.map((c) => (
            <ScrollReveal key={c.initial}>
              <div className="rounded-2xl glass p-5 hover:bg-white/[0.06] transition-all duration-500 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-emerald-400">
                      {c.initial}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {c.profile}
                    </p>
                    <p className="text-xs text-slate-500">{c.complaint}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-emerald-400">
                  {c.result}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Disclaimer */}
        <ScrollReveal>
          <p className="text-center text-xs text-slate-500 mt-6">
            Anonymisierte Daten der Physiotherapie Glawe. Individuelle
            Ergebnisse können variieren.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
