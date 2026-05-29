"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ClipboardList, Video, MessageCircle, LineChart, Stethoscope } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Ist-Analyse für jeden Mitarbeitenden",
    description:
      "Ihr Therapeut startet mit einer digitalen Gesundheits- und Risiko-Analyse. In 5 Minuten pro MA entsteht ein klares Bild: Wo drückt es, wer ist gefährdet, wo lohnt sich Prävention zuerst.",
    visual: (
      <div className="rounded-xl bg-white border border-landing-border p-4 shadow-sm">
        <div className="text-xs text-landing-fg-subtle mb-3 font-mono">Risiko-Score · anonymisiert</div>
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
      </div>
    ),
  },
  {
    number: "02",
    icon: Video,
    title: "Persönlicher Plan & Video-Analyse",
    description:
      "Auf Basis der Analyse erstellt Ihr Therapeut individuelle Übungspläne — bei Bedarf inklusive Video-Haltungsanalyse. Kein Standardprogramm: Jeder bekommt genau das, was sein Körper braucht.",
    visual: (
      <div className="rounded-xl bg-white border border-landing-border p-4 shadow-sm space-y-3">
        <div className="text-xs text-landing-fg-subtle font-mono">Ihr Plan · KW 21</div>
        {[
          { name: "LWS-Stabilisation", meta: "3× / Woche · 4 Min" },
          { name: "Schulter-Mobilität", meta: "täglich · 3 Min" },
        ].map((p) => (
          <div key={p.name} className="flex items-center gap-3 rounded-lg bg-landing-bg px-3 py-2.5 border border-landing-border/50">
            <div className="w-8 h-8 rounded-lg bg-landing-accent/10 flex items-center justify-center flex-shrink-0">
              <Video className="h-4 w-4 text-landing-accent" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-landing-fg">{p.name}</p>
              <p className="text-[10px] text-landing-fg-subtle">{p.meta}</p>
            </div>
            <span className="text-[10px] text-landing-accent font-bold">vom Therapeuten</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    number: "03",
    icon: MessageCircle,
    title: "Tägliche Begleitung & Therapeuten-Draht",
    description:
      "Die App liefert tägliche Pausen-Fits am Arbeitsplatz — aber niemand ist allein. Bei Beschwerden meldet das Ampel-System, und Ihr Therapeut ist per Chat direkt erreichbar. Kritische Fälle fängt er aktiv auf.",
    visual: (
      <div className="rounded-xl bg-white border border-landing-border p-4 shadow-sm space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs text-landing-fg-subtle mb-1">
          <MessageCircle className="h-3.5 w-3.5 text-landing-accent" />
          <span className="font-medium">Therapeuten-Draht</span>
        </div>
        <div className="flex justify-end">
          <span className="text-[11px] bg-landing-accent text-white rounded-2xl rounded-br-sm px-3 py-1.5 max-w-[80%]">
            Nacken macht heute Probleme.
          </span>
        </div>
        <div className="flex justify-start">
          <span className="text-[11px] bg-landing-bg border border-landing-border text-landing-fg rounded-2xl rounded-bl-sm px-3 py-1.5 max-w-[85%]">
            Hab dir eine sanfte Routine freigeschaltet — und einen Termin vorgeschlagen. 👍
          </span>
        </div>
      </div>
    ),
  },
  {
    number: "04",
    icon: LineChart,
    title: "Quartals-Check & Reporting",
    description:
      "Alle drei Monate wertet Ihr Therapeut die anonymisierten Daten aus und bespricht mit HR konkrete Maßnahmen. Sie sehen schwarz auf weiß, wie Beschwerden sinken und Teilnahme steigt — DSGVO-konform, ohne Einzeldaten.",
    visual: (
      <div className="rounded-xl bg-white border border-landing-border p-4 shadow-sm">
        <div className="text-xs text-landing-fg-subtle mb-3 font-mono">Quartals-Report Q2</div>
        <div className="flex items-end gap-1.5 h-16 mb-3">
          {[80, 74, 69, 63, 57, 52, 47, 43, 39, 36, 33, 30].map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t-sm bg-landing-accent/30"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              style={{ height: `${h}%`, transformOrigin: "bottom" }}
              transition={{ delay: 0.2 + i * 0.04, duration: 0.4 }}
            >
              <div
                className="w-full h-full rounded-t-sm"
                style={{ background: `linear-gradient(to top, #2D6A4F, #2D6A4F40)` }}
              />
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-landing-fg-subtle">
          <span>Beschwerden-Index</span>
          <span className="text-landing-accent font-bold">−34 % in 6 Monaten</span>
        </div>
      </div>
    ),
  },
]

export function BgfTherapeutSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section className="py-24 sm:py-32 bg-landing-bg relative overflow-hidden">
      <div ref={sectionRef} className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-sm font-semibold text-landing-accent uppercase tracking-widest">
            So begleitet Sie Ihr Therapeut
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-landing-fg tracking-tight">
            Ein Mensch, der dranbleibt —{" "}
            <span className="text-landing-accent">nicht nur eine App</span>
          </h2>
          <p className="mt-4 text-lg text-landing-fg-muted max-w-2xl mx-auto">
            Die Technik skaliert die Betreuung. Den Unterschied macht der Therapeut,
            der Ihr Team von der ersten Analyse bis zum Quartals-Check begleitet.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-2xl mx-auto">
          {/* Vertical connecting line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-landing-border hidden sm:block">
            <motion.div
              className="w-full bg-landing-accent origin-top"
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ duration: 1.6, delay: 0.3, ease: "easeOut" }}
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
                transition={{ delay: i * 0.15, duration: 0.7 }}
              >
                {/* Step circle on the line */}
                <div className="hidden sm:flex absolute left-0 top-0 w-12 h-12 rounded-full bg-landing-accent items-center justify-center shadow-lg shadow-landing-accent/25 z-10">
                  <step.icon className="h-5 w-5 text-white" />
                </div>

                {/* Mobile inline icon */}
                <div className="flex sm:hidden items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-landing-accent flex items-center justify-center shadow-md">
                    <step.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-xs font-bold text-landing-accent-warm uppercase tracking-widest">
                    Schritt {step.number}
                  </div>
                </div>

                <div className="hidden sm:block text-xs font-bold text-landing-accent-warm uppercase tracking-widest mb-2">
                  Schritt {step.number}
                </div>
                <h3 className="font-display font-bold text-xl text-landing-fg mb-3">{step.title}</h3>
                <p className="text-sm text-landing-fg-muted leading-relaxed mb-5">
                  {step.description}
                </p>

                {step.visual}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Closing line */}
        <motion.div
          className="mt-20 flex items-center justify-center gap-3 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-11 h-11 rounded-full bg-landing-accent/10 flex items-center justify-center flex-shrink-0">
            <Stethoscope className="h-5 w-5 text-landing-accent" />
          </div>
          <p className="font-display text-xl sm:text-2xl font-bold text-landing-fg max-w-xl text-left">
            Derselbe Therapeut. Vom ersten Tag bis zum messbaren Ergebnis.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
