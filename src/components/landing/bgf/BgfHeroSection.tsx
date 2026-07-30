"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Stethoscope, MessageCircle, Lock } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"

function AnimatedKpiCounter({
  value,
  suffix,
  label,
  delay,
}: {
  value: number
  suffix: string
  label: string
  delay: number
}) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    const timer = setTimeout(() => {
      const duration = 1600
      const startTime = performance.now()
      function animate(now: number) {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.round(value * eased))
        if (progress < 1) requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)
    }, delay)
    return () => clearTimeout(timer)
  }, [started, value, delay])

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl font-bold font-display text-landing-fg">
        {count}{suffix}
      </div>
      <div className="text-xs text-landing-fg-subtle mt-1">{label}</div>
    </div>
  )
}

function TherapistCockpit() {
  return (
    <motion.div
      className="relative w-full max-w-lg mx-auto"
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: "1000px" }}
    >
      {/* Glow */}
      <div className="absolute inset-0 bg-landing-accent/10 blur-3xl rounded-3xl scale-110" />

      {/* Cockpit card */}
      <div className="relative rounded-2xl border border-landing-border bg-white shadow-2xl overflow-hidden">
        {/* Header bar */}
        <div className="bg-landing-fg px-5 py-3.5 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
            <div className="w-3 h-3 rounded-full bg-green-400/60" />
          </div>
          <span className="text-white/60 text-xs font-mono ml-2">Praxis OS — Ihr Therapeut</span>
        </div>

        <div className="p-5 space-y-4">
          {/* Therapist row */}
          <div className="flex items-center gap-3 rounded-xl bg-landing-bg p-3 border border-landing-border/50">
            <div className="w-10 h-10 rounded-full bg-landing-accent/15 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="h-5 w-5 text-landing-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-landing-fg truncate">Max Glawe</p>
              <p className="text-[11px] text-landing-fg-subtle">Heilpraktiker · Ihr fester Ansprechpartner</p>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-landing-accent">
              <span className="w-2 h-2 rounded-full bg-landing-accent animate-pulse" />
              Online
            </span>
          </div>

          {/* KPI row — illustrativer Dashboard-Snapshot (Nutzung, keine Ergebnis-Claims) */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Team aktiv", value: "24/30", color: "text-landing-accent" },
              { label: "Fits/Woche", value: "18", color: "text-emerald-600" },
              { label: "Zufrieden", value: "4,8★", color: "text-landing-accent-warm" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-xl bg-landing-bg p-3 text-center border border-landing-border/50">
                <div className={`text-lg font-bold font-display ${kpi.color}`}>{kpi.value}</div>
                <div className="text-[10px] text-landing-fg-subtle">{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Chat snippet */}
          <div className="rounded-xl bg-landing-bg p-4 border border-landing-border/50 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs text-landing-fg-subtle mb-1">
              <MessageCircle className="h-3.5 w-3.5 text-landing-accent" />
              <span className="font-medium">Therapeuten-Draht</span>
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-landing-fg-subtle">
                <Lock className="h-3 w-3" /> vertraulich
              </span>
            </div>
            <div className="flex justify-end">
              <span className="text-[11px] bg-landing-accent text-white rounded-2xl rounded-br-sm px-3 py-1.5 max-w-[80%]">
                Mein Rücken zwickt seit gestern beim Sitzen.
              </span>
            </div>
            <div className="flex justify-start">
              <span className="text-[11px] bg-white border border-landing-border text-landing-fg rounded-2xl rounded-bl-sm px-3 py-1.5 max-w-[85%]">
                Ich habe Ihnen eine 3-Minuten-Routine freigeschaltet. Schauen wir morgen drauf. 💪
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <motion.div
        className="absolute -top-3 -right-3 bg-landing-accent text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        Echter Mensch
      </motion.div>
    </motion.div>
  )
}

export function BgfHeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })
  const textY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 80])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-white pt-16"
    >
      {/* Subtle grid background */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0"
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#1A1A2E 1px, transparent 1px), linear-gradient(90deg, #1A1A2E 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-[10%] left-[5%] h-[500px] w-[500px] rounded-full bg-landing-accent/[0.06] blur-[120px]"
          animate={{ scale: [1, 1.15, 1], x: [0, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[10%] right-[5%] h-[400px] w-[400px] rounded-full bg-landing-accent-warm/[0.07] blur-[100px]"
          animate={{ scale: [1.1, 1, 1.1], x: [0, -15, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
      </motion.div>

      <motion.div
        style={{ y: textY }}
        className="relative z-10 container mx-auto px-4 py-24 max-w-7xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div>
            {/* Eyebrow */}
            <motion.div
              className="inline-flex items-center gap-2 rounded-full bg-landing-accent/10 px-4 py-2 mb-8 border border-landing-accent/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Stethoscope className="h-3.5 w-3.5 text-landing-accent" />
              <span className="text-sm text-landing-accent font-semibold tracking-wide">
                Betriebliche Gesundheitsförderung
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.08] text-landing-fg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              Ihr Therapeut.
              <br />
              <span className="text-landing-accent">In der Tasche jedes Mitarbeiters.</span>
            </motion.h1>

            {/* Subline */}
            <motion.p
              className="mt-6 text-lg text-landing-fg-muted leading-relaxed max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7 }}
            >
              Jeder Mitarbeiter bekommt einen echten Physiotherapeuten als
              persönlichen Ansprechpartner — in einer App, die täglich begleitet.{" "}
              <span className="font-semibold text-landing-fg">
                Sie zahlen pro Kopf; was Ihr Team mit dem Therapeuten bespricht,
                bleibt vertraulich.
              </span>
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="mt-8 flex flex-col sm:flex-row items-start gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Link href="/unternehmen/kontakt">
                <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    className="bg-landing-accent hover:bg-landing-accent-hover text-white text-base px-8 h-12 rounded-full shadow-xl shadow-landing-accent/25"
                  >
                    Pilot-Programm anfragen
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <a href="#roi-rechner">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-base px-8 h-12 rounded-full border-landing-border text-landing-fg-muted hover:bg-landing-accent/5 hover:text-landing-accent hover:border-landing-accent/30 bg-transparent"
                  >
                    Was kostet uns Krankheit?
                  </Button>
                </a>
              </motion.div>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              className="mt-10 flex flex-wrap gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              {[
                { icon: Stethoscope, label: "Echter Therapeut, kein Chatbot" },
                { icon: Lock, label: "Vertraulich — der Chef sieht nichts" },
                { icon: Shield, label: "DSGVO-konform, EU-gehostet" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-landing-border shadow-sm text-sm text-landing-fg-muted font-medium"
                >
                  <Icon className="h-3.5 w-3.5 text-landing-accent" />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Therapist cockpit */}
          <div className="hidden lg:block">
            <TherapistCockpit />

            {/* Product facts (keine erfundenen Ergebnis-Zahlen — Wirtschaftlichkeit im ROI-Rechner) */}
            <motion.div
              className="mt-6 rounded-2xl bg-landing-bg border border-landing-border p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest text-landing-fg-subtle text-center mb-3">
                Was jeder Mitarbeiter bekommt
              </p>
              <div className="grid grid-cols-3 gap-4">
                <AnimatedKpiCounter value={3} suffix=" Min" label="pro Routine, direkt am Platz" delay={1200} />
                <AnimatedKpiCounter value={365} suffix="" label="Tage im Jahr begleitet" delay={1400} />
                <AnimatedKpiCounter value={1} suffix=":1" label="echter Therapeut, kein Bot" delay={1600} />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
