"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useInView } from "framer-motion"
import { TrendingUp, X } from "lucide-react"

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

const painPoints = [
  {
    icon: TrendingUp,
    iconColor: "text-red-500",
    bgColor: "bg-red-50",
    number: 20,
    suffix: " Tage",
    prefix: "Ø ",
    label: "AU-Tage/MA/Jahr",
    sublabel: "Tendenz steigend",
    accent: "border-red-200",
  },
  {
    icon: TrendingUp,
    iconColor: "text-orange-500",
    bgColor: "bg-orange-50",
    number: 400,
    suffix: "€",
    prefix: "",
    label: "Kosten pro AU-Tag",
    sublabel: "Direkte + indirekte Kosten",
    accent: "border-orange-200",
  },
  {
    icon: TrendingUp,
    iconColor: "text-amber-500",
    bgColor: "bg-amber-50",
    number: 25,
    suffix: "%",
    prefix: "",
    label: "aller AU: Muskuloskelettal",
    sublabel: "#1 Ursache in deutschen Unternehmen",
    accent: "border-amber-200",
  },
]

const failureReasons = [
  {
    title: "Generisch statt individuell",
    desc: "Standard-Programme ignorieren individuelle Risikoprofile. Gleiche Übungen für alle = kaum Wirkung.",
  },
  {
    title: "Einmalig statt täglich",
    desc: "Einmal im Jahr ein Kursangebot schafft keine nachhaltigen Verhaltensänderungen.",
  },
  {
    title: "Nicht messbar",
    desc: "Ohne Daten kein Nachweis. Ohne Nachweis kein Budget. Ohne Budget kein Fortschritt.",
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
        {/* Section label */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-sm font-semibold text-red-500 uppercase tracking-widest">
            Das Problem
          </span>

          {/* Big stat */}
          <div className="mt-6">
            <p className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-landing-fg leading-tight max-w-4xl">
              <span className="text-red-500">
                <CountUpNumber target={18} suffix=" Mrd. €" />
              </span>{" "}
              — Kosten durch Rückenschmerzen in deutschen Unternehmen.{" "}
              <span className="text-landing-fg-subtle">Pro Jahr.</span>
            </p>
          </div>
        </motion.div>

        {/* Pain point cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
          {painPoints.map((point, i) => (
            <motion.div
              key={point.label}
              className={`rounded-2xl border-2 ${point.accent} bg-white p-6 shadow-sm`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
            >
              <div className={`inline-flex p-2 rounded-xl ${point.bgColor} mb-4`}>
                <point.icon className={`h-5 w-5 ${point.iconColor}`} />
              </div>
              <div className={`text-4xl font-bold font-display ${point.iconColor} mb-2`}>
                <CountUpNumber
                  target={point.number}
                  prefix={point.prefix}
                  suffix={point.suffix}
                />
              </div>
              <div className="text-base font-semibold text-landing-fg mb-1">
                {point.label}
              </div>
              <div className="text-xs text-landing-fg-subtle">{point.sublabel}</div>
            </motion.div>
          ))}
        </div>

        {/* Divider text */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-2xl sm:text-3xl font-bold font-display text-landing-fg">
            Die meisten BGF-Programme{" "}
            <span className="text-red-500">scheitern.</span>{" "}
            <span className="text-landing-fg-subtle">Warum?</span>
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
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                <X className="h-4 w-4 text-red-500" />
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
