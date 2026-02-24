"use client"

import { ScrollReveal } from "./ScrollReveal"
import { ClipboardList, Video, Dumbbell } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Anfrage stellen",
    description:
      "Beschreiben Sie Ihre Beschwerden in unserem kurzen Fragebogen. Wir analysieren Ihre Situation und melden uns innerhalb von 24 Stunden persönlich.",
    detail: "2 Minuten — kostenlos und unverbindlich",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    number: "02",
    icon: Video,
    title: "Video-Erstgespräch",
    description:
      "In einem persönlichen Video-Termin lernen wir Sie kennen, führen eine gründliche Untersuchung durch und erstellen Ihren individuellen Behandlungsplan.",
    detail: "45 Minuten — kostenlos & unverbindlich",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    number: "03",
    icon: Dumbbell,
    title: "Therapie in der App",
    description:
      "Ihr persönlicher Trainingsplan mit Video-Anleitungen, täglichem Check-in und direktem Chat mit Ihrem Therapeuten. Fortschritte in Echtzeit.",
    detail: "Täglich 15–20 Min. — Ihr Therapeut immer dabei",
    gradient: "from-violet-500 to-purple-500",
  },
]

export function ProcessSection() {
  return (
    <section id="ablauf" className="py-24 sm:py-32 bg-[#faf9f7] relative overflow-hidden">
      {/* Smart line connector */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="smart-line h-12" />
        <div className="smart-line-dot animate-dot-pulse" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <ScrollReveal className="text-center mb-16">
          <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider">
            Der Weg
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            In drei Schritten zur Besserung
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            Von der ersten Anfrage bis zur aktiven Therapie — einfach,
            persönlich und effektiv.
          </p>
        </ScrollReveal>

        {/* Timeline */}
        <div className="relative">
          {/* Horizontal connecting line (desktop) */}
          <div className="hidden md:block absolute top-[4.5rem] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-emerald-200 via-blue-200 to-violet-200" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 reveal-stagger">
            {steps.map((step) => (
              <ScrollReveal key={step.number}>
                <div className="relative text-center group">
                  {/* Number + Icon */}
                  <div className="relative mx-auto mb-6">
                    <div className={`relative z-10 h-[4.5rem] w-[4.5rem] mx-auto rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white shadow-md flex items-center justify-center text-xs font-bold text-slate-700 z-20">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed mb-4">
                    {step.description}
                  </p>
                  <span className="inline-flex items-center rounded-full bg-white px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm border border-slate-100">
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
