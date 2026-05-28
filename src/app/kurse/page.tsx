/**
 * PROJ-21: /kurse — Öffentliche Shop-Landing (Website-Shop)
 *
 * Story-First-Aufbau: Hero → So funktioniert → Unsere Challenges → Nach
 * Anliegen finden → In Kürze (Outlook) → Voll-App-Upsell. Wissen-Sektion
 * kommt zurück, sobald echte Artikel vorhanden sind.
 *
 * Server Component (eigene SEO-Metadaten). Produkt-Grid und Hero-Carousel
 * sind eingebettete Client-Inseln.
 */

import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ShopHeader } from "@/components/shop/ShopHeader"
import { AppUpsell } from "@/components/shop/AppUpsell"
import { Hero3DCarousel } from "@/components/shop/Hero3DCarousel"
import { HighlightChallenges } from "@/components/shop/HighlightChallenges"
import {
  ShieldCheck,
  Infinity as InfinityIcon,
  Zap,
  ArrowRight,
  Target,
  Activity,
  Trophy,
  HeartPulse,
  Layers,
  Leaf,
} from "lucide-react"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "21-Tage-Challenges — von Physiotherapeuten entwickelt",
  description:
    "Geführte 21-Tage-Challenges für Rücken, Schmerz, Faszien und mehr. Von Physiotherapeuten entwickelt — einmal kaufen, lebenslang behalten, Zugang sofort nach dem Kauf.",
  alternates: { canonical: "/kurse" },
}

// ── Trust signals ─────────────────────────────────────────────────────────────

const TRUST_SIGNALS = [
  { icon: <ShieldCheck className="h-4 w-4 text-emerald-400" />, label: "Physiotherapeutisch entwickelt" },
  { icon: <InfinityIcon className="h-4 w-4 text-emerald-400" />, label: "Lebenslanger Zugriff" },
  { icon: <Zap className="h-4 w-4 text-emerald-400" />, label: "Zugang sofort nach dem Kauf" },
]

// ── So funktioniert — 3 Schritte ─────────────────────────────────────────────

const STEPS = [
  {
    icon: <Target className="h-6 w-6 text-emerald-600" />,
    title: "Wähle deine Challenge",
    text: "Vier Themen, ein klares Ziel. Such dir aus, was dein Körper jetzt braucht — Rücken, Schmerz, Faszien oder Hydration.",
  },
  {
    icon: <Activity className="h-6 w-6 text-emerald-600" />,
    title: "21 Tage, dein Tempo",
    text: "Eine tägliche Einheit — 15 bis 20 Minuten. Eingebettet in deinen Alltag, ohne Studio, ohne starre Termine.",
  },
  {
    icon: <Trophy className="h-6 w-6 text-emerald-600" />,
    title: "Routine ist da",
    text: "Am Ende hat dein Körper sich umgestellt. Wissen, Übungen und Teilnahmezertifikat bleiben dir lebenslang.",
  },
]

// ── Nach Anliegen finden — 4 Filter-Cards ────────────────────────────────────

const ANLIEGEN_CARDS = [
  {
    slug: "ruecken",
    label: "Rücken",
    text: "Mobilität, Stabilität, weniger Schmerz im Alltag.",
    icon: <Activity className="h-6 w-6" />,
    tint: "from-sky-50 to-cyan-50 text-sky-700",
    accent: "bg-sky-100",
  },
  {
    slug: "schmerz",
    label: "Schmerz",
    text: "Verstehen statt verdrängen — Strategien aus der Physio.",
    icon: <HeartPulse className="h-6 w-6" />,
    tint: "from-rose-50 to-pink-50 text-rose-700",
    accent: "bg-rose-100",
  },
  {
    slug: "faszien",
    label: "Faszien",
    text: "Mehr Beweglichkeit durch tieferes Bindegewebe.",
    icon: <Layers className="h-6 w-6" />,
    tint: "from-indigo-50 to-violet-50 text-indigo-700",
    accent: "bg-indigo-100",
  },
  {
    slug: "wohlbefinden",
    label: "Wohlbefinden",
    text: "Routine, die Energie zurückbringt — sanft & nachhaltig.",
    icon: <Leaf className="h-6 w-6" />,
    tint: "from-emerald-50 to-teal-50 text-emerald-700",
    accent: "bg-emerald-100",
  },
]

const DELAY = ["", "animation-delay-150", "animation-delay-300"]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PublicKurseLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <ShopHeader mode="website" />

      {/* ── Hero — dunkel, zweispaltig (Bild oben auf Mobile, rechts auf Desktop) ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-12 right-8 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute bottom-0 -left-12 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">

            {/* Text */}
            <div className="animate-fade-in-up order-2 lg:order-1">
              <div className="flex items-center gap-3 mb-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/physio-logo.png"
                  alt="Praxis OS"
                  className="h-12 w-auto"
                />
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-[0.2em]">
                  Praxis OS · Shop
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] mb-5">
                Dein Körper. Geleitet.{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  Verstanden
                </span>
                .
              </h1>

              <p className="text-slate-300 text-lg leading-relaxed mb-8">
                Praxis OS — von Physiotherapeuten entwickelte Inhalte für
                Rücken, Schmerz und Bewegung. Einmal kaufen, lebenslang
                behalten.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-8">
                <Link
                  href="/kurse/alle"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl px-5 h-12 transition-colors shadow-lg shadow-emerald-500/25"
                >
                  Alle Challenges entdecken
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

            {/* Hero-Carousel */}
            <div className="animate-fade-in-up animation-delay-150 order-1 lg:order-2">
              <Hero3DCarousel fallback="/images/kurse/hero.png" />
            </div>

          </div>
        </div>
      </section>

      {/* ── Premium-Masterclass — eigenständig, klar abgesetzt von den Challenges ── */}
      <section className="border-t border-slate-100" style={{ backgroundColor: "#F8F5F0" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="mb-7">
            <span
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: "#2C3E2D" }}
            >
              Premium-Masterclass
            </span>
            <h2
              className="mt-1.5 text-2xl sm:text-3xl font-bold"
              style={{ color: "#0f172a" }}
            >
              Ein ganzes Programm — kein 21-Tage-Sprint
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-xl">
              Eine eigene Liga: vertont, interaktiv und in der Tiefe — separat von unseren
              Challenges.
            </p>
          </div>

          <Link
            href="/kurse/chronischer-kreuzschmerz"
            className="group grid lg:grid-cols-2 overflow-hidden rounded-3xl border bg-white transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/5"
            style={{ borderColor: "#e7e1d6" }}
          >
            {/* Text */}
            <div className="order-2 lg:order-1 p-8 sm:p-10 flex flex-col justify-center">
              <p
                className="text-xs font-medium uppercase tracking-[0.28em]"
                style={{ color: "#2C3E2D" }}
              >
                Masterclass
              </p>
              <h3
                className="mt-3 text-3xl sm:text-4xl leading-tight"
                style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#0f172a" }}
              >
                Chronischer Kreuzschmerz
              </h3>
              <p
                className="mt-3 text-sm uppercase tracking-[0.18em]"
                style={{ color: "#64748b" }}
              >
                Verstehen · Handeln · Bleiben · Wiederkommen
              </p>
              <p className="mt-5 text-base leading-relaxed" style={{ color: "#334155" }}>
                27 vertonte Lektionen, ein interaktives Workbook und ein Bonus-Übungskartendeck
                — dein strukturierter Weg im Umgang mit chronischem Kreuzschmerz, in deinem
                Tempo.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span
                  className="text-2xl font-bold"
                  style={{ fontFamily: "var(--font-display)", color: "#0f172a" }}
                >
                  399 €
                </span>
                <span className="text-base line-through" style={{ color: "#94a3b8" }}>
                  499 €
                </span>
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ backgroundColor: "rgba(201,183,156,0.22)", color: "#2C3E2D" }}
                >
                  Launch-Aktion
                </span>
              </div>
              <span
                className="mt-7 inline-flex items-center gap-2 self-start rounded-xl px-5 h-12 font-semibold text-white"
                style={{ backgroundColor: "#2C3E2D" }}
              >
                Zur Masterclass
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
            {/* Bild */}
            <div className="order-1 lg:order-2 relative min-h-[240px] lg:min-h-[440px]">
              <Image
                src="/images/masterclass/chronischer-kreuzschmerz/ugc/01.jpg"
                alt="Masterclass Chronischer Kreuzschmerz — Karten, Workbook und App"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 32rem, 100vw"
              />
            </div>
          </Link>
        </div>
      </section>

      {/* ── So funktioniert — 3 Schritte ──────────────────────────────────── */}
      <section className="bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="mb-9">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-[0.2em]">
              So funktioniert
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5">
              In drei Schritten zur Routine
            </h2>
            <p className="text-slate-500 mt-2 text-sm sm:text-base max-w-xl">
              Eine Challenge ist kein klassischer Kurs — es ist eine 21-Tage-
              Begleitung. So läuft's:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className={cn(
                  "relative rounded-2xl bg-slate-50 border border-slate-200 p-6 animate-fade-in-up",
                  DELAY[i]
                )}
              >
                <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  {i + 1}
                </div>
                <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Unsere Challenges — Produkt-Grid ──────────────────────────────── */}
      <section className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="mb-9 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-[0.2em]">
                Unsere Challenges
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5">
                21-Tage-Programme für deine Anliegen
              </h2>
              <p className="text-slate-500 mt-2 text-sm sm:text-base max-w-xl">
                Vier geführte Challenges — einmal kaufen, lebenslang behalten.
              </p>
            </div>
            <Link
              href="/kurse/alle"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors shrink-0"
            >
              Alle ansehen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <HighlightChallenges mode="website" limit={4} />
        </div>
      </section>

      {/* ── Neu bei Praxis OS — Karten-Decks ──────────────────────────────── */}
      <section className="bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <Link
            href="/decks"
            className="group relative block overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 sm:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/10"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-10 right-10 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="absolute -bottom-12 left-8 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
            </div>
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-[0.2em]">
                  <Layers className="h-4 w-4" />
                  Neu bei Praxis OS
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2.5 leading-snug">
                  Bewegungskarten — kurze Bewegungsimpulse für deinen Alltag
                </h2>
                <p className="text-slate-300 mt-2.5 leading-relaxed">
                  Digitale Bewegungskarten zu einem klaren Thema. Karte ziehen,
                  mitmachen, weiter im Tag. Einmal kaufen, lebenslang behalten.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 self-start sm:self-auto bg-emerald-500 group-hover:bg-emerald-400 text-white font-semibold rounded-xl px-5 h-12 transition-colors shadow-lg shadow-emerald-500/25 shrink-0">
                Bewegungskarten entdecken
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Nach Anliegen finden ──────────────────────────────────────────── */}
      <section className="bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="mb-9">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-[0.2em]">
              Finde deinen Weg
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5">
              Was beschäftigt dich gerade?
            </h2>
            <p className="text-slate-500 mt-2 text-sm sm:text-base max-w-xl">
              Wähle dein Anliegen — wir zeigen dir die passende Challenge.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {ANLIEGEN_CARDS.map((a, i) => (
              <Link
                key={a.slug}
                href={`/kurse/alle?anliegen=${a.slug}`}
                className={cn(
                  "group relative rounded-2xl bg-gradient-to-br border border-slate-200 p-5 sm:p-6 transition-all duration-300 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/5 hover:-translate-y-0.5 animate-fade-in-up",
                  a.tint,
                  DELAY[i % DELAY.length]
                )}
              >
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center mb-3",
                  a.accent
                )}>
                  {a.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-1.5">
                  {a.label}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {a.text}
                </p>
                <ArrowRight className="absolute bottom-5 right-5 h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
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
