"use client"

import { ScrollReveal } from "./ScrollReveal"
import { ClipboardList, Video, Dumbbell } from "lucide-react"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const LINE = "#e7e1d6"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Anfrage stellen",
    description:
      "Beschreibe deine Beschwerden in unserem kurzen Fragebogen. Wir analysieren deine Situation und melden uns innerhalb von 24 Stunden persönlich.",
    detail: "2 Minuten — kostenlos und unverbindlich",
  },
  {
    number: "02",
    icon: Video,
    title: "Video-Erstgespräch",
    description:
      "In einem persönlichen Video-Termin lernen wir dich kennen, führen eine gründliche Untersuchung durch und erstellen deinen individuellen Behandlungsplan.",
    detail: "30 Minuten — 69€ einmalig, danach 16,99€/Monat Betreuung",
  },
  {
    number: "03",
    icon: Dumbbell,
    title: "Therapie in der App",
    description:
      "Dein persönlicher Trainingsplan mit Video-Anleitungen, täglichem Check-in und direktem Chat mit deinem Therapeuten. Fortschritte in Echtzeit.",
    detail: "Täglich 15–20 Min. — dein Therapeut immer dabei",
  },
]

export function ProcessSection() {
  return (
    <section id="ablauf" className="py-24 sm:py-32 relative overflow-hidden" style={{ backgroundColor: PAPER }}>
      {/* Smart line connector */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="smart-line h-12" />
        <div className="smart-line-dot animate-dot-pulse" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <ScrollReveal className="text-center mb-16">
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: GREEN }}>
            Der Weg
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl" style={{ ...serif, color: INK }}>
            In drei Schritten zur Besserung
          </h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: MUTED }}>
            Von der ersten Anfrage bis zur aktiven Therapie — einfach,
            persönlich und effektiv.
          </p>
        </ScrollReveal>

        {/* Timeline */}
        <div className="relative">
          {/* Horizontal connecting line (desktop) */}
          <div className="hidden md:block absolute top-[4.5rem] left-[10%] right-[10%] h-0.5" style={{ backgroundColor: LINE }} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 reveal-stagger">
            {steps.map((step) => (
              <ScrollReveal key={step.number}>
                <div className="relative text-center group">
                  {/* Number + Icon */}
                  <div className="relative mx-auto mb-6">
                    <div
                      className="relative z-10 h-[4.5rem] w-[4.5rem] mx-auto rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500"
                      style={{ backgroundColor: GREEN }}
                    >
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <span
                      className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white shadow-md flex items-center justify-center text-xs font-bold z-20"
                      style={{ color: BODY }}
                    >
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-xl mb-3" style={{ ...serif, color: INK }}>
                    {step.title}
                  </h3>
                  <p className="leading-relaxed mb-4" style={{ color: MUTED }}>
                    {step.description}
                  </p>
                  <span
                    className="inline-flex items-center rounded-full bg-white px-4 py-1.5 text-xs font-medium shadow-sm border"
                    style={{ color: BODY, borderColor: LINE }}
                  >
                    {step.detail}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
