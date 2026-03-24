"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { UserPlus, ClipboardList, Dumbbell } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Mitarbeiter freischalten",
    description:
      "HR lädt Mitarbeitende mit einem Klick ein. Jeder MA registriert sich in unter 2 Minuten — kein App-Download nötig, direkt im Browser.",
    visual: (
      <div className="rounded-xl bg-white border border-landing-border p-4 text-sm space-y-2 shadow-sm">
        <div className="flex items-center gap-2 text-landing-fg-subtle text-xs mb-3">
          <span className="font-mono">HR-Portal</span>
          <span className="text-landing-border">›</span>
          <span>Einladungen</span>
        </div>
        {["Max Müller", "Anna Schmidt", "Tom Weber"].map((name, i) => (
          <motion.div
            key={name}
            className="flex items-center justify-between bg-landing-bg rounded-lg px-3 py-2 border border-landing-border/50"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 + i * 0.15 }}
          >
            <span className="text-landing-fg text-xs font-medium">{name}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-landing-accent/10 text-landing-accent font-semibold">
              Eingeladen
            </span>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    number: "02",
    icon: ClipboardList,
    title: "Persönliche Gesundheitsanalyse",
    description:
      "Jeder MA füllt in 5 Minuten eine digitale Ist-Analyse aus. Unser System berechnet einen individuellen Risiko-Score und identifiziert kritische Bereiche.",
    visual: (
      <div className="rounded-xl bg-white border border-landing-border p-4 shadow-sm">
        <div className="text-xs text-landing-fg-subtle mb-3 font-mono">Risiko-Score</div>
        <div className="space-y-2.5">
          {[
            { area: "Lendenwirbelsäule", score: 72, color: "bg-red-400" },
            { area: "Schultern / Nacken", score: 55, color: "bg-orange-400" },
            { area: "Hüfte / Knie", score: 28, color: "bg-landing-accent" },
          ].map((item) => (
            <div key={item.area}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-landing-fg-muted">{item.area}</span>
                <span className="font-bold text-landing-fg">{item.score}</span>
              </div>
              <div className="h-2 bg-landing-border/50 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${item.color}`}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${item.score}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[10px] text-landing-fg-subtle">
          Gesamt-Risiko: <span className="text-orange-500 font-bold">Mittel (52)</span>
        </div>
      </div>
    ),
  },
  {
    number: "03",
    icon: Dumbbell,
    title: "Tägliches Pausen-Fit + Betreuung",
    description:
      "3x täglich erscheinen personalisierte 4-Minuten-Routinen. Das Ampel-System meldet kritische Fälle. Bei Bedarf Zugang zum Therapeuten.",
    visual: (
      <div className="rounded-xl bg-white border border-landing-border p-4 space-y-3 shadow-sm">
        <div className="text-xs text-landing-fg-subtle font-mono mb-1">Heute — Pausen-Fit</div>
        {[
          { time: "10:00", name: "Schulter-Mobilisation", done: true },
          { time: "13:00", name: "LWS-Aktivierung", done: true },
          { time: "15:30", name: "Nacken-Dehnung", done: false },
        ].map((session) => (
          <div
            key={session.time}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border ${session.done ? "bg-landing-bg border-landing-border/50" : "bg-landing-accent/5 border-landing-accent/20"}`}
          >
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${session.done ? "bg-landing-accent" : "bg-landing-accent-warm animate-pulse"}`} />
            <div className="flex-1">
              <p className="text-xs font-medium text-landing-fg">{session.name}</p>
              <p className="text-[10px] text-landing-fg-subtle">{session.time} Uhr</p>
            </div>
            {session.done && <span className="text-[10px] text-landing-accent font-bold">Erledigt</span>}
            {!session.done && <span className="text-[10px] text-landing-accent-warm font-bold">Jetzt starten</span>}
          </div>
        ))}
      </div>
    ),
  },
]

export function BgfHowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section className="py-24 sm:py-32 bg-landing-bg relative overflow-hidden">
      <div ref={sectionRef} className="container mx-auto px-4 max-w-5xl">
        {/* Header — centered */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-sm font-semibold text-landing-accent uppercase tracking-widest">
            Ablauf
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-landing-fg tracking-tight">
            So funktioniert&apos;s
          </h2>
          <p className="mt-4 text-lg text-landing-fg-muted max-w-2xl mx-auto">
            In drei Schritten zu messbarer Gesundheitsförderung — ohne IT-Aufwand.
          </p>
        </motion.div>

        {/* Steps — vertically stacked, centered */}
        <div className="relative max-w-2xl mx-auto">
          {/* Vertical connecting line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-landing-border hidden sm:block">
            <motion.div
              className="w-full bg-landing-accent origin-top"
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
              style={{ height: "100%" }}
            />
          </div>

          <div className="space-y-16">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                className="relative sm:pl-20"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.2, duration: 0.7 }}
              >
                {/* Step number circle — on the line */}
                <div className="hidden sm:flex absolute left-0 top-0 w-12 h-12 rounded-full bg-landing-accent items-center justify-center shadow-lg shadow-landing-accent/25 z-10">
                  <step.icon className="h-5 w-5 text-white" />
                </div>

                {/* Mobile: inline icon */}
                <div className="flex sm:hidden items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-landing-accent flex items-center justify-center shadow-md">
                    <step.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-xs font-bold text-landing-accent-warm uppercase tracking-widest">
                    Schritt {step.number}
                  </div>
                </div>

                {/* Content */}
                <div className="hidden sm:block text-xs font-bold text-landing-accent-warm uppercase tracking-widest mb-2">
                  Schritt {step.number}
                </div>
                <h3 className="font-display font-bold text-xl text-landing-fg mb-3">{step.title}</h3>
                <p className="text-sm text-landing-fg-muted leading-relaxed mb-5">
                  {step.description}
                </p>

                {/* Visual mockup */}
                {step.visual}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
