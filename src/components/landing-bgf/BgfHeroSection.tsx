"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Building2, TrendingDown, Users, Shield, CheckCircle2 } from "lucide-react"

export function BgfHeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-900">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 animate-gradient" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/8 blur-[120px] animate-float" />
      <div className="absolute bottom-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-emerald-500/6 blur-[100px] animate-float-delayed" />
      <div className="absolute top-2/3 left-1/2 h-[300px] w-[300px] rounded-full bg-violet-500/5 blur-[100px] animate-float-slow" />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,1) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative container mx-auto px-4 pt-24 sm:pt-32 pb-16 sm:pb-20 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full glass px-5 py-2 mb-10">
              <div className="h-2 w-2 rounded-full bg-indigo-400 animate-dot-pulse" />
              <span className="text-sm text-indigo-300/90">
                Betriebliche Gesundheitsförderung — Für Unternehmen
              </span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in-up animation-delay-150 text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05]">
              Gesunde Mitarbeiter.
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                Starkes Unternehmen.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-in-up animation-delay-300 mt-8 text-lg sm:text-xl text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Digitale BGF-Plattform mit KI-gestützten Pausen-Fit Sessions,
              persönlicher Therapeuten-Betreuung und messbarem ROI.
            </p>

            {/* CTAs */}
            <div className="animate-fade-in-up animation-delay-450 mt-10 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
              <Link href="/anfrage">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white text-base px-8 h-13 rounded-full shadow-xl shadow-indigo-500/20 transition-all hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                >
                  Kostenlose Erstberatung
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#preise">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8 h-13 rounded-full border-slate-600 text-slate-300 hover:bg-white/5 hover:text-white hover:border-slate-500 bg-transparent"
                >
                  Tarife ansehen
                </Button>
              </a>
            </div>

            {/* Trust badges */}
            <div className="animate-fade-in-up animation-delay-600 mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              {[
                { icon: Shield, label: "DSGVO-konform" },
                { icon: CheckCircle2, label: "ZPP-zertifiziert" },
                { icon: Building2, label: "§20b SGB V konform" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-indigo-400/70" />
                  <span className="text-sm text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard Preview Card */}
          <div className="hidden lg:block animate-fade-in-up animation-delay-600">
            <div className="relative">
              {/* Glow behind card */}
              <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-3xl scale-110" />

              {/* Dashboard card */}
              <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm shadow-2xl overflow-hidden">
                {/* Header bar */}
                <div className="bg-white/[0.06] px-5 py-3.5 flex items-center gap-3 border-b border-white/[0.06]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/40" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/40" />
                    <div className="w-3 h-3 rounded-full bg-green-400/40" />
                  </div>
                  <span className="text-white/40 text-xs font-mono ml-2">Praxis OS — BGF Dashboard</span>
                </div>

                <div className="p-5 space-y-4">
                  {/* KPI row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Teilnahme", value: "87%", color: "text-indigo-400" },
                      { label: "Schmerz ↓", value: "-34%", color: "text-emerald-400" },
                      { label: "Zufrieden", value: "4.8★", color: "text-amber-400" },
                    ].map((kpi) => (
                      <div key={kpi.label} className="rounded-xl bg-white/[0.04] p-3 text-center border border-white/[0.06]">
                        <div className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</div>
                        <div className="text-[10px] text-slate-500">{kpi.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Mini chart */}
                  <div className="rounded-xl bg-white/[0.04] p-4 border border-white/[0.06]">
                    <div className="text-xs text-slate-500 mb-3 font-medium">Beschwerden-Verlauf</div>
                    <div className="flex items-end gap-1.5 h-16">
                      {[85, 78, 72, 68, 61, 55, 52, 48, 45, 42, 38, 35].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm"
                          style={{
                            height: `${h}%`,
                            background: `linear-gradient(to top, rgba(99,102,241,${0.6 - i * 0.03}), rgba(99,102,241,0.15))`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Status row */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-dot-pulse" />
                      Live-Daten
                    </span>
                    <span className="text-slate-600">Letzte Aktualisierung: gerade eben</span>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-float">
                DSGVO-konform
              </div>
              <div className="absolute -bottom-3 -left-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-float-delayed">
                Anonymisiert
              </div>
            </div>

            {/* Stats below */}
            <div className="mt-6 grid grid-cols-3 gap-4 rounded-2xl glass p-5">
              {[
                { icon: Building2, value: "§20b SGB V", label: "Gesetzlich anerkannt" },
                { icon: TrendingDown, value: "bis 35%", label: "Weniger Fehltage" },
                { icon: Users, value: "bis 600€", label: "Steuerlich begünstigt*" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center">
                  <Icon className="h-5 w-5 text-indigo-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-white">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile stats — only visible on small screens */}
        <div className="lg:hidden animate-fade-in-up animation-delay-600 mt-12 grid grid-cols-3 gap-4">
          {[
            { icon: Building2, value: "§20b SGB V", label: "Gesetzlich anerkannt" },
            { icon: TrendingDown, value: "bis 35%", label: "Weniger Fehltage" },
            { icon: Users, value: "bis 600€", label: "Steuerlich begünstigt*" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <Icon className="h-5 w-5 text-indigo-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}
