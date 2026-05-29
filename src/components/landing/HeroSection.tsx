"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Lock, Clock } from "lucide-react"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const MUTED = "#64748b"
const LINE = "#e7e1d6"

// Realistisches Handy-Mockup (Dynamic Island, schmaler Tinten-Rahmen, 9:16).
function PhoneMock({
  src,
  alt,
  className,
  priority,
}: {
  src: string
  alt: string
  className?: string
  priority?: boolean
}) {
  return (
    <div className={className}>
      <div
        className="relative rounded-[2.3rem] p-1.5"
        style={{ backgroundColor: INK, boxShadow: "0 28px 56px rgba(15,23,42,0.28)" }}
      >
        <div className="absolute left-1/2 top-2 z-10 h-3.5 w-12 -translate-x-1/2 rounded-full bg-black" />
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[1.9rem] bg-white">
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="14rem"
            className="object-cover object-top"
          />
        </div>
      </div>
    </div>
  )
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: PAPER }}>
      {/* Sand-Aura */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 h-[440px] w-[440px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(201,183,156,0.28) 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-28 sm:pt-36 lg:grid-cols-2 lg:gap-16">
        {/* Text */}
        <div>
          <div
            className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
            style={{ borderColor: LINE, backgroundColor: "rgba(255,255,255,0.6)" }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: GREEN }} />
            <span
              className="text-[11px] font-medium uppercase tracking-[0.18em]"
              style={{ color: GREEN }}
            >
              Heilpraktiker für Physiotherapie · Digitale Praxis
            </span>
          </div>

          <h1
            className="animate-fade-in-up animation-delay-150 mt-7 text-4xl leading-[1.05] sm:text-5xl md:text-6xl"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
          >
            Dein Physiotherapeut für die Hosentasche.
          </h1>

          <p
            className="animate-fade-in-up animation-delay-300 mt-6 max-w-xl text-lg leading-relaxed"
            style={{ color: "#334155" }}
          >
            Echte Physiotherapie per Video-Termin, dein persönlicher Trainingsplan in der App
            und dein Therapeut — jederzeit erreichbar. Verstehen, üben, dranbleiben.
          </p>

          <div className="animate-fade-in-up animation-delay-450 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/anfrage">
              <Button
                size="lg"
                className="h-12 rounded-xl px-7 text-base font-semibold text-white hover:opacity-90"
                style={{ backgroundColor: GREEN }}
              >
                Video-Analyse buchen · 69 €
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#ablauf">
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-xl px-7 text-base font-medium hover:bg-black/[0.03]"
                style={{ borderColor: SAND, color: GREEN, backgroundColor: "transparent" }}
              >
                So funktioniert&apos;s
              </Button>
            </a>
          </div>

          <div className="animate-fade-in-up animation-delay-600 mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
            {[
              { icon: Shield, label: "Heilpraktiker-Zulassung" },
              { icon: Lock, label: "DSGVO-konform" },
              { icon: Clock, label: "Jederzeit erreichbar" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm" style={{ color: MUTED }}>
                <item.icon className="h-4 w-4" style={{ color: GREEN }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Echte App — Handy-Mockups */}
        <div className="animate-fade-in-up animation-delay-300 relative mx-auto h-[470px] w-full max-w-[420px] sm:h-[560px]">
          {/* hinteres Handy: Trainingsmodus */}
          <PhoneMock
            src="/images/app/training.png"
            alt="Praxis-OS-App — Trainingsmodus"
            className="absolute right-1 top-2 w-36 rotate-6 sm:w-44"
          />
          {/* vorderes Handy: Dashboard */}
          <PhoneMock
            src="/images/app/dashboard.png"
            alt="Praxis-OS-App — Dashboard"
            priority
            className="absolute bottom-0 left-1 w-44 -rotate-3 sm:w-52"
          />
        </div>
      </div>
    </section>
  )
}
