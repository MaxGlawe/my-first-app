/**
 * PROJ-21: /kurse — Öffentliche Shop-Landing (Website-Shop)
 *
 * Marken-Landing für nicht eingeloggte Besucher: dunkler Praxis-OS-Hero mit CTA
 * in die Kurs-Übersicht, "Neu bei Praxis OS", "Wissen"-Sektion und Voll-App-
 * Upsell. Kein Karten-Grid — Kurse werden über das "Kurse"-Mega-Menü und
 * /kurse/alle entdeckt. Pendant zur In-App-Landing /shop.
 *
 * Server-Component (keine Hooks) → eigene SEO-Metadaten möglich.
 */

import type { Metadata } from "next"
import Link from "next/link"
import { ShopHeader } from "@/components/shop/ShopHeader"
import { AppUpsell } from "@/components/shop/AppUpsell"
import {
  Sparkles,
  ShieldCheck,
  Infinity as InfinityIcon,
  Zap,
  ArrowRight,
  GraduationCap,
  Activity,
  BookOpen,
  Lightbulb,
} from "lucide-react"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Kurse — von Physiotherapeuten entwickelt",
  description:
    "Geführte 21-Tage-Kurse für Rücken, Schmerz, Faszien und mehr. Von Physiotherapeuten entwickelt — einmal kaufen, lebenslang behalten, Zugang sofort nach dem Kauf.",
  alternates: { canonical: "/kurse" },
}

// ── Trust signals ─────────────────────────────────────────────────────────────

const TRUST_SIGNALS = [
  { icon: <ShieldCheck className="h-4 w-4 text-emerald-400" />, label: "Physiotherapeutisch entwickelt" },
  { icon: <InfinityIcon className="h-4 w-4 text-emerald-400" />, label: "Lebenslanger Zugriff" },
  { icon: <Zap className="h-4 w-4 text-emerald-400" />, label: "Zugang sofort nach dem Kauf" },
]

// ── Updates — Platzhalter, Inhalt wird später gepflegt ───────────────────────

interface ShopUpdate {
  tag: string
  tagColor: string
  icon: React.ReactNode
  title: string
  text: string
  href?: string
}

const UPDATES: ShopUpdate[] = [
  {
    tag: "Neu im Shop",
    tagColor: "bg-emerald-50 text-emerald-700",
    icon: <Sparkles className="h-5 w-5 text-emerald-600" />,
    title: "21-Tage-Kurse jetzt verfügbar",
    text: "Vier geführte Programme für Rücken, Schmerz, Faszien und mehr — sofort kaufen, lebenslang behalten.",
    href: "/kurse/alle",
  },
  {
    tag: "In Kürze",
    tagColor: "bg-slate-100 text-slate-600",
    icon: <GraduationCap className="h-5 w-5 text-slate-500" />,
    title: "Masterclasses",
    text: "Intensive Workshops zu spezifischen Themen — mehr Tiefe, von Physiotherapeuten geführt.",
  },
  {
    tag: "In Kürze",
    tagColor: "bg-slate-100 text-slate-600",
    icon: <Activity className="h-5 w-5 text-slate-500" />,
    title: "Schmerzcheck",
    text: "Ein geführter Selbst-Check, der dir den passenden Kurs für dein Anliegen empfiehlt.",
  },
]

// ── Wissens-Layer — Platzhalter, echte Artikel folgen ───────────────────────

const KNOWLEDGE = [
  {
    icon: <Lightbulb className="h-5 w-5 text-emerald-600" />,
    title: "Warum 21 Tage?",
    text: "Wie Routinen entstehen — und warum drei Wochen ein sinnvolles Maß für nachhaltige Veränderung sind.",
  },
  {
    icon: <Activity className="h-5 w-5 text-emerald-600" />,
    title: "Faszien verstehen",
    text: "Was Faszien sind, warum sie verkleben — und wie gezielte Arbeit Beweglichkeit zurückbringt.",
  },
  {
    icon: <BookOpen className="h-5 w-5 text-emerald-600" />,
    title: "Schmerz richtig einordnen",
    text: "Akut oder chronisch? Ein kurzer Leitfaden, wann welche Strategie greift.",
  },
]

const DELAY = ["", "animation-delay-150", "animation-delay-300"]

// ── Component ─────────────────────────────────────────────────────────────────

export default function PublicKurseLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <ShopHeader mode="website" />

      {/* ── Hero — dunkel, Praxis-OS-gebrandet, zweispaltig ───────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-12 right-8 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute bottom-0 -left-12 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">

            {/* Linke Spalte — Text */}
            <div className="animate-fade-in-up">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-[0.2em]">
                  Praxis OS · Kurse
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] mb-5">
                Kurse, die wirklich{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  wirken
                </span>
                .
              </h1>

              <p className="text-slate-300 text-lg leading-relaxed mb-8">
                Von Physiotherapeuten entwickelte 21-Tage-Programme — für Rücken,
                Schmerz, Faszien und mehr. Einmal kaufen, lebenslang behalten,
                Zugang sofort nach dem Kauf.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-8">
                <Link
                  href="/kurse/alle"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl px-5 h-12 transition-colors shadow-lg shadow-emerald-500/25"
                >
                  Alle Kurse entdecken
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {TRUST_SIGNALS.map((s, i) => (
                  <div
                    key={s.label}
                    className={cn(
                      "flex items-center gap-2 bg-white/[0.07] border border-white/10 rounded-full px-3.5 py-2 animate-fade-in-up",
                      DELAY[i]
                    )}
                  >
                    {s.icon}
                    <span className="text-sm text-slate-200 font-medium">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rechte Spalte — Hero-Bild */}
            <div className="hidden lg:block animate-fade-in-up animation-delay-150">
              <div className="relative aspect-square rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-emerald-900/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/kurse/hero.png"
                  alt="Praxis OS Kurse"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Neu bei Praxis OS ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-7">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Neu bei Praxis OS
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            Was sich im Shop tut — neue Kurse, Angebote und Ankündigungen.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {UPDATES.map((update, i) => {
            const card = (
              <div
                className={cn(
                  "h-full bg-white rounded-2xl border border-slate-200 p-6 flex flex-col animate-fade-in-up transition-all duration-300",
                  update.href && "hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1",
                  DELAY[i]
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    {update.icon}
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide",
                      update.tagColor
                    )}
                  >
                    {update.tag}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 mb-1.5">{update.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed flex-1">
                  {update.text}
                </p>
                {update.href && (
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 mt-4">
                    Ansehen
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            )

            return update.href ? (
              <Link key={update.title} href={update.href} className="block group">
                {card}
              </Link>
            ) : (
              <div key={update.title}>{card}</div>
            )
          })}
        </div>
      </section>

      {/* ── Wissen ────────────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="mb-7">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-[0.2em]">
              Wissen
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1.5">
              Verstehen, bevor du startest
            </h2>
            <p className="text-slate-500 mt-1 text-sm">
              Hintergrundwissen aus der Physiotherapie — fundiert, verständlich erklärt.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {KNOWLEDGE.map((card, i) => (
              <div
                key={card.title}
                className={cn(
                  "h-full bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col animate-fade-in-up",
                  DELAY[i]
                )}
              >
                <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center mb-4">
                  {card.icon}
                </div>
                <h3 className="font-bold text-slate-800 mb-1.5">{card.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed flex-1">
                  {card.text}
                </p>
                <span className="text-[11px] font-bold text-slate-400 mt-4 uppercase tracking-wide">
                  Artikel folgt
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Voll-App-Upsell ───────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <AppUpsell />
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Praxis OS · Alle Preise inkl. MwSt. ·
            Lebenslanger Zugriff nach Einmalkauf
          </p>
        </div>
      </footer>
    </div>
  )
}
