"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useInView } from "framer-motion"
import { Eye, EyeOff, UserX, Bot, CalendarX, ArrowDown } from "lucide-react"

function CountUpNumber({
  target,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  target: number
  prefix?: string
  suffix?: string
  decimals?: number
}) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  useEffect(() => {
    if (!isInView) return
    const duration = 2000
    const start = performance.now()
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(parseFloat((target * eased).toFixed(decimals)))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [isInView, target, decimals])

  return (
    <span ref={ref}>
      {prefix}
      {decimals > 0 ? val.toFixed(decimals) : Math.round(val)}
      {suffix}
    </span>
  )
}

const failureReasons = [
  {
    icon: Bot,
    title: "Eine App ist kein Therapeut",
    desc: "Reine Tools und Mitgliedschaften lassen Ihre Mitarbeitenden allein. Niemand schaut hin, niemand greift ein, niemand bleibt dran.",
  },
  {
    icon: CalendarX,
    title: "Einmalig statt dauerhaft",
    desc: "Der Rückenkurs einmal im Jahr verpufft. Gesundheit entsteht durch tägliche Begleitung — nicht durch ein Event.",
  },
  {
    icon: UserX,
    title: "Generisch statt persönlich",
    desc: "Die gleichen Übungen für alle ignorieren das individuelle Risiko. Ohne persönlichen Plan bleibt die Wirkung aus.",
  },
]

export function BgfProblemSection() {
  return (
    <section className="py-24 sm:py-32 bg-landing-bg-warm relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle, #1A1A2E 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
        {/* Section label + big stat */}
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-sm font-semibold text-red-500 uppercase tracking-widest">
            Das Problem
          </span>

          <div className="mt-6">
            <p className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-landing-fg leading-tight max-w-4xl">
              Ein kranker oder unfitter Mitarbeiter kostet Sie{" "}
              <span className="text-red-500">weit mehr</span> als die paar Fehltage,
              die Sie sehen.
            </p>
            <p className="mt-5 text-lg text-landing-fg-muted max-w-2xl">
              Die Fehltage sind nur die Spitze des Eisbergs. Der teuerste Teil ist
              unsichtbar — und steht in keiner Statistik.
            </p>
          </div>
        </motion.div>

        {/* Iceberg: sichtbar vs. unsichtbar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-16">
          {/* Sichtbar */}
          <motion.div
            className="rounded-2xl border-2 border-red-200 bg-white p-7 shadow-sm"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="inline-flex p-2 rounded-xl bg-red-50">
                <Eye className="h-5 w-5 text-red-500" />
              </div>
              <span className="text-xs font-bold text-red-500 uppercase tracking-wider">
                Was Sie sehen — Absentismus
              </span>
            </div>
            <div className="text-4xl font-bold font-display text-red-500 mb-2">
              <CountUpNumber target={15} suffix=" Tage" prefix="Ø " />
            </div>
            <p className="text-base font-semibold text-landing-fg mb-1">Krankheitstage pro MA / Jahr</p>
            <p className="text-sm text-landing-fg-muted leading-relaxed">
              Lohnfortzahlung, Vertretung, liegengebliebene Arbeit. Spürbar, aber
              nur der kleinere Teil der Rechnung.
            </p>
          </motion.div>

          {/* Unsichtbar */}
          <motion.div
            className="rounded-2xl border-2 border-landing-fg/15 bg-landing-fg p-7 shadow-sm relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: 0.12, duration: 0.6 }}
          >
            <div className="absolute -bottom-10 -right-8 h-40 w-40 rounded-full bg-landing-accent-warm/10 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="inline-flex p-2 rounded-xl bg-white/10">
                  <EyeOff className="h-5 w-5 text-landing-accent-warm" />
                </div>
                <span className="text-xs font-bold text-landing-accent-warm uppercase tracking-wider">
                  Was Sie nicht sehen — Präsentismus
                </span>
              </div>
              <div className="text-4xl font-bold font-display text-white mb-2">
                bis <CountUpNumber target={2} decimals={1} suffix="×" />
              </div>
              <p className="text-base font-semibold text-white mb-1">teurer als die Fehltage selbst</p>
              <p className="text-sm text-white/60 leading-relaxed">
                Anwesend, aber durch Schmerzen und Erschöpfung kaum leistungsfähig.
                Studien beziffern diesen unsichtbaren Verlust auf das 1,5- bis 2,3-fache
                der reinen Fehltage-Kosten.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bridge to calculator */}
        <motion.div
          className="flex flex-col items-center text-center mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-lg text-landing-fg-muted max-w-xl mb-4">
            Dazu kommt Fluktuation: Wer dauerhaft Schmerzen hat, kündigt. Jede
            Neubesetzung kostet ein Vielfaches.{" "}
            <span className="font-semibold text-landing-fg">
              Rechnen Sie es für Ihr Unternehmen aus.
            </span>
          </p>
          <a
            href="#roi-rechner"
            className="inline-flex items-center gap-2 text-landing-accent font-semibold hover:gap-3 transition-all"
          >
            Zum Kosten-Rechner
            <ArrowDown className="h-4 w-4" />
          </a>
        </motion.div>

        {/* Divider text */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-2xl sm:text-3xl font-bold font-display text-landing-fg">
            Und warum die meisten BGF-Angebote{" "}
            <span className="text-red-500">nichts ändern:</span>
          </p>
        </motion.div>

        {/* Failure reasons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {failureReasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              className="flex gap-4 bg-white rounded-2xl p-6 border border-landing-border shadow-sm"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                <reason.icon className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-landing-fg mb-2">{reason.title}</h3>
                <p className="text-sm text-landing-fg-muted leading-relaxed">{reason.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
