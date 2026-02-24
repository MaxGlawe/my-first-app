"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Lock, Clock } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-900">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 animate-gradient" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/8 blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-teal-500/6 blur-[100px] animate-float-delayed" />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,1) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative container mx-auto px-4 pt-24 sm:pt-32 pb-16 sm:pb-20 max-w-6xl">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full glass px-5 py-2 mb-10">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-dot-pulse" />
            <span className="text-sm text-emerald-300/90">
              Heilpraktiker für Physiotherapie — Digitale Praxis
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up animation-delay-150 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-white leading-[1.05]">
            Ihre Therapie.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Digital. Persönlich.
            </span>
            <br />
            Premium.
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up animation-delay-300 mt-8 text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Professionelle Physiotherapie per Video-Termin. Individuelle
            Trainingspläne in der App. Ihr Therapeut — jederzeit erreichbar.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up animation-delay-450 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/anfrage">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-base px-8 h-13 rounded-full shadow-xl shadow-emerald-500/20 transition-all hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 animate-glow-pulse"
              >
                Kostenlos anfragen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#ablauf">
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 h-13 rounded-full border-slate-600 text-slate-300 hover:bg-white/5 hover:text-white hover:border-slate-500 bg-transparent"
              >
                So funktioniert&apos;s
              </Button>
            </a>
          </div>

          {/* Trust badges */}
          <div className="animate-fade-in-up animation-delay-600 mt-10 sm:mt-16 flex flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-12">
            {[
              { icon: Shield, label: "Heilpraktiker-Zulassung" },
              { icon: Lock, label: "DSGVO-konform" },
              { icon: Clock, label: "Jederzeit erreichbar" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <item.icon className="h-4 w-4 text-emerald-400/70" />
                <span className="text-sm text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#faf9f7] to-transparent" />
    </section>
  )
}
