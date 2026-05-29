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

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const LINE = "#e7e1d6"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

export const metadata: Metadata = {
  title: "21-Tage-Challenges — von Physiotherapeuten entwickelt",
  description:
    "Geführte 21-Tage-Challenges für Rücken, Schmerz, Faszien und mehr. Von Physiotherapeuten entwickelt — einmal kaufen, lebenslang behalten, Zugang sofort nach dem Kauf.",
  alternates: { canonical: "/kurse" },
}

// ── Trust signals ─────────────────────────────────────────────────────────────

const TRUST_SIGNALS = [
  { icon: <ShieldCheck className="h-4 w-4" style={{ color: GREEN }} />, label: "Physiotherapeutisch entwickelt" },
  { icon: <InfinityIcon className="h-4 w-4" style={{ color: GREEN }} />, label: "Lebenslanger Zugriff" },
  { icon: <Zap className="h-4 w-4" style={{ color: GREEN }} />, label: "Zugang sofort nach dem Kauf" },
]

// ── So funktioniert — 3 Schritte ─────────────────────────────────────────────

const STEPS = [
  {
    icon: <Target className="h-6 w-6" style={{ color: GREEN }} />,
    title: "Wähle deine Challenge",
    text: "Vier Themen, ein klares Ziel. Such dir aus, was dein Körper jetzt braucht — Rücken, Schmerz, Faszien oder Hydration.",
  },
  {
    icon: <Activity className="h-6 w-6" style={{ color: GREEN }} />,
    title: "21 Tage, dein Tempo",
    text: "Eine tägliche Einheit — 15 bis 20 Minuten. Eingebettet in deinen Alltag, ohne Studio, ohne starre Termine.",
  },
  {
    icon: <Trophy className="h-6 w-6" style={{ color: GREEN }} />,
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
  },
  {
    slug: "schmerz",
    label: "Schmerz",
    text: "Verstehen statt verdrängen — Strategien aus der Physio.",
    icon: <HeartPulse className="h-6 w-6" />,
  },
  {
    slug: "faszien",
    label: "Faszien",
    text: "Mehr Beweglichkeit durch tieferes Bindegewebe.",
    icon: <Layers className="h-6 w-6" />,
  },
  {
    slug: "wohlbefinden",
    label: "Wohlbefinden",
    text: "Routine, die Energie zurückbringt — sanft & nachhaltig.",
    icon: <Leaf className="h-6 w-6" />,
  },
]

const DELAY = ["", "animation-delay-150", "animation-delay-300"]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PublicKurseLandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: PAPER }}>
      <ShopHeader mode="website" />

      {/* ── Hero — hell, zweispaltig (Bild oben auf Mobile, rechts auf Desktop) ── */}
      <section className="relative overflow-hidden" style={{ backgroundColor: PAPER }}>
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-12 right-8 h-72 w-72 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(201,183,156,0.28) 0%, transparent 70%)" }}
          />
          <div
            className="absolute bottom-0 -left-12 h-64 w-64 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(201,183,156,0.18) 0%, transparent 70%)" }}
          />
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
                <span
                  className="text-xs font-semibold uppercase tracking-[0.2em]"
                  style={{ color: GREEN }}
                >
                  Praxis OS · Shop
                </span>
              </div>

              <h1
                className="text-4xl sm:text-5xl leading-[1.1] mb-5"
                style={{ ...serif, color: INK }}
              >
                Dein Körper. Geleitet.{" "}
                <span style={{ color: GREEN }}>Verstanden</span>.
              </h1>

              <p className="text-lg leading-relaxed mb-8" style={{ color: BODY }}>
                Praxis OS — von Physiotherapeuten entwickelte Inhalte für
                Rücken, Schmerz und Bewegung. Einmal kaufen, lebenslang
                behalten.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-8">
                <Link
                  href="/kurse/alle"
                  className="inline-flex items-center gap-2 text-white font-semibold rounded-xl px-5 h-12 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: GREEN }}
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
                      "flex items-center gap-2 border rounded-full px-3.5 py-2 animate-fade-in-up",
                      DELAY[i]
                    )}
                    style={{ backgroundColor: "rgba(255,255,255,0.6)", borderColor: LINE }}
                  >
                    {s.icon}
                    <span className="text-sm font-medium" style={{ color: BODY }}>{s.label}</span>
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
      <section className="border-t" style={{ backgroundColor: PAPER, borderColor: LINE }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="mb-7">
            <span
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: GREEN }}
            >
              Premium-Masterclass
            </span>
            <h2
              className="mt-1.5 text-2xl sm:text-3xl"
              style={{ ...serif, color: INK }}
            >
              Ein ganzes Programm — kein 21-Tage-Sprint
            </h2>
            <p className="mt-2 text-sm sm:text-base max-w-xl" style={{ color: MUTED }}>
              Eine eigene Liga: vertont, interaktiv und in der Tiefe — separat von unseren
              Challenges.
            </p>
          </div>

          <Link
            href="/kurse/chronischer-kreuzschmerz"
            className="group grid lg:grid-cols-2 overflow-hidden rounded-3xl border bg-white transition-all duration-300 hover:shadow-2xl"
            style={{ borderColor: LINE }}
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
                <span className="text-base line-through" style={{ color: MUTED }}>
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
      <section className="bg-white border-t" style={{ borderColor: LINE }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="mb-9">
            <span
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: GREEN }}
            >
              So funktioniert
            </span>
            <h2 className="text-2xl sm:text-3xl mt-1.5" style={{ ...serif, color: INK }}>
              In drei Schritten zur Routine
            </h2>
            <p className="mt-2 text-sm sm:text-base max-w-xl" style={{ color: MUTED }}>
              Eine Challenge ist kein klassischer Kurs — es ist eine 21-Tage-
              Begleitung. So läuft's:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className={cn(
                  "relative rounded-2xl border p-6 animate-fade-in-up",
                  DELAY[i]
                )}
                style={{ backgroundColor: PAPER, borderColor: LINE }}
              >
                <div
                  className="absolute -top-3 -left-3 h-8 w-8 rounded-full text-white text-sm font-bold flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: GREEN }}
                >
                  {i + 1}
                </div>
                <div
                  className="h-12 w-12 rounded-xl bg-white border flex items-center justify-center mb-4"
                  style={{ borderColor: LINE }}
                >
                  {step.icon}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: INK }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Unsere Challenges — Produkt-Grid ──────────────────────────────── */}
      <section className="border-t" style={{ backgroundColor: PAPER, borderColor: LINE }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="mb-9 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <span
                className="text-xs font-semibold uppercase tracking-[0.2em]"
                style={{ color: GREEN }}
              >
                Unsere Challenges
              </span>
              <h2 className="text-2xl sm:text-3xl mt-1.5" style={{ ...serif, color: INK }}>
                21-Tage-Programme für deine Anliegen
              </h2>
              <p className="mt-2 text-sm sm:text-base max-w-xl" style={{ color: MUTED }}>
                Vier geführte Challenges — einmal kaufen, lebenslang behalten.
              </p>
            </div>
            <Link
              href="/kurse/alle"
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-80 shrink-0"
              style={{ color: GREEN }}
            >
              Alle ansehen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <HighlightChallenges mode="website" limit={4} />
        </div>
      </section>

      {/* ── Neu bei Praxis OS — Karten-Decks ──────────────────────────────── */}
      <section className="bg-white border-t" style={{ borderColor: LINE }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <Link
            href="/decks"
            className="group relative block overflow-hidden rounded-3xl p-8 sm:p-10 transition-all duration-300 hover:shadow-2xl"
            style={{ backgroundColor: GREEN }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute -top-10 right-10 h-56 w-56 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(201,183,156,0.18) 0%, transparent 70%)" }}
              />
              <div
                className="absolute -bottom-12 left-8 h-48 w-48 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(201,183,156,0.12) 0%, transparent 70%)" }}
              />
            </div>
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div className="max-w-xl">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em]"
                  style={{ color: SAND }}
                >
                  <Layers className="h-4 w-4" />
                  Neu bei Praxis OS
                </span>
                <h2
                  className="text-2xl sm:text-3xl mt-2.5 leading-snug"
                  style={{ ...serif, color: PAPER }}
                >
                  Bewegungskarten — kurze Bewegungsimpulse für deinen Alltag
                </h2>
                <p className="mt-2.5 leading-relaxed" style={{ color: "rgba(248,245,240,0.8)" }}>
                  Digitale Bewegungskarten zu einem klaren Thema. Karte ziehen,
                  mitmachen, weiter im Tag. Einmal kaufen, lebenslang behalten.
                </p>
              </div>
              <span
                className="inline-flex items-center gap-2 self-start sm:self-auto font-semibold rounded-xl px-5 h-12 transition-opacity group-hover:opacity-90 shrink-0"
                style={{ backgroundColor: PAPER, color: GREEN }}
              >
                Bewegungskarten entdecken
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Nach Anliegen finden ──────────────────────────────────────────── */}
      <section className="bg-white border-t" style={{ borderColor: LINE }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="mb-9">
            <span
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: GREEN }}
            >
              Finde deinen Weg
            </span>
            <h2 className="text-2xl sm:text-3xl mt-1.5" style={{ ...serif, color: INK }}>
              Was beschäftigt dich gerade?
            </h2>
            <p className="mt-2 text-sm sm:text-base max-w-xl" style={{ color: MUTED }}>
              Wähle dein Anliegen — wir zeigen dir die passende Challenge.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {ANLIEGEN_CARDS.map((a, i) => (
              <Link
                key={a.slug}
                href={`/kurse/alle?anliegen=${a.slug}`}
                className={cn(
                  "group relative rounded-2xl border p-5 sm:p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-fade-in-up",
                  DELAY[i % DELAY.length]
                )}
                style={{ backgroundColor: PAPER, borderColor: LINE }}
              >
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: "rgba(44,62,45,0.1)", color: GREEN }}
                >
                  {a.icon}
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-1.5" style={{ color: INK }}>
                  {a.label}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: BODY }}>
                  {a.text}
                </p>
                <ArrowRight
                  className="absolute bottom-5 right-5 h-4 w-4 group-hover:translate-x-0.5 transition-all"
                  style={{ color: GREEN }}
                />
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
      <footer className="border-t py-8" style={{ borderColor: LINE }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs" style={{ color: MUTED }}>
            © {new Date().getFullYear()} Praxis OS · Alle Preise inkl. MwSt. ·
            Lebenslanger Zugriff nach Einmalkauf
          </p>
        </div>
      </footer>
    </div>
  )
}
