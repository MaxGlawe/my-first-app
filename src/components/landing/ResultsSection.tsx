"use client"

import { ScrollReveal } from "./ScrollReveal"
import { TrendingDown, Star, Clock, UserCheck } from "lucide-react"

// Premium-Markenwelt (Masterclass-Format)
const INK = "#0f172a"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const LINE = "#e7e1d6"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

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
    label: "persönlich — ein Therapeut, dein Therapeut",
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
      className="py-24 sm:py-32 relative overflow-hidden"
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* Sand-Aura */}
      <div
        aria-hidden
        className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(201,183,156,0.18) 0%, transparent 70%)" }}
      />

      {/* Smart line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="smart-line-dot animate-dot-pulse" />
        <div className="smart-line h-12" />
      </div>

      <div className="relative container mx-auto px-4 max-w-6xl">
        <ScrollReveal className="text-center mb-16">
          <span
            className="text-sm font-medium uppercase tracking-wider"
            style={{ color: GREEN }}
          >
            Ergebnisse
          </span>
          <h2
            className="mt-3 text-3xl sm:text-4xl lg:text-5xl tracking-tight"
            style={{ ...serif, color: INK }}
          >
            Ergebnisse, die <span style={{ color: GREEN }}>für sich sprechen</span>
          </h2>
        </ScrollReveal>

        {/* Stats Bar */}
        <ScrollReveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
            {stats.map((item) => {
              const isRating = item.icon === Star
              return (
                <div
                  key={item.stat}
                  className="rounded-2xl border bg-white p-5 sm:p-6 text-center"
                  style={{ borderColor: LINE }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{
                      backgroundColor: isRating
                        ? "rgba(201,183,156,0.22)"
                        : "rgba(44,62,45,0.1)",
                    }}
                  >
                    <item.icon
                      className="h-5 w-5"
                      style={{ color: isRating ? SAND : GREEN }}
                    />
                  </div>
                  <span
                    className="text-3xl sm:text-4xl"
                    style={{ ...serif, color: INK }}
                  >
                    {item.stat}
                  </span>
                  <p className="text-xs sm:text-sm mt-1.5" style={{ color: MUTED }}>
                    {item.label}
                  </p>
                </div>
              )
            })}
          </div>
        </ScrollReveal>

        {/* Mini-Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 reveal-stagger">
          {cases.map((c) => (
            <ScrollReveal key={c.initial}>
              <div
                className="rounded-2xl border bg-white p-5 transition-all duration-500 hover:shadow-lg h-full"
                style={{ borderColor: LINE }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(44,62,45,0.1)" }}
                  >
                    <span className="text-sm font-bold" style={{ color: GREEN }}>
                      {c.initial}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: INK }}>
                      {c.profile}
                    </p>
                    <p className="text-xs" style={{ color: MUTED }}>
                      {c.complaint}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-medium" style={{ color: GREEN }}>
                  {c.result}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Disclaimer */}
        <ScrollReveal>
          <p className="text-center text-xs mt-6" style={{ color: MUTED }}>
            Anonymisierte Daten der Physiotherapie Glawe. Individuelle
            Ergebnisse können variieren.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
