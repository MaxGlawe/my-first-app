"use client"

import { ScrollReveal } from "./ScrollReveal"
import { Check, ArrowRight, Sparkles, ShieldCheck, CreditCard, Heart, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const LINE = "#e7e1d6"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

const einzelsitzung = {
  features: [
    "Ausführliche Video-Analyse (30 Min.)",
    "Individuelle Befunderhebung & Diagnose",
    "Persönlicher Trainingsplan mit Video-Anleitungen",
    "Chat-Support bis zum nächsten Termin",
    "Digitales Fortschritts-Tracking",
  ],
}

const rehaPackages = [
  {
    name: "Mini-Reha Post-OP",
    price: "Auf Anfrage",
    duration: "6–8 Wochen",
    description:
      "Strukturierte Nachbehandlung nach Operationen — von der Wundheilung bis zur vollen Belastbarkeit.",
    features: [
      "Individuelle Reha-Phasen nach OP-Protokoll",
      "6–8 Video-Sitzungen (à 30 Min.)",
      "Täglicher Trainingsplan mit progressiver Steigerung",
      "Laufende Anpassung an deinen Heilungsverlauf",
      "Unbegrenzter Chat-Support",
      "Abschlussbefund & Übergabe an deinen Arzt",
    ],
    examples: "Kreuzband, Meniskus, Schulter-OP, Rücken-OP, Hüft-/Knie-TEP",
    featured: true,
  },
  {
    name: "Chronik-Programm",
    price: "Auf Anfrage",
    duration: "8–12 Wochen",
    description:
      "Für langjährige Beschwerden, die Struktur und Konsequenz brauchen — weil Schmerz kein Dauerzustand sein muss.",
    features: [
      "Umfassende Schmerzanalyse & Zielsetzung",
      "8–10 Video-Sitzungen (à 30 Min.)",
      "Individueller Trainingsplan mit wöchentlicher Anpassung",
      "Schmerztagebuch & Verlaufskontrolle",
      "Unbegrenzter Chat-Support",
    ],
    examples: "Chronischer Rücken, Migräne, Fibromyalgie, Arthrose, Schulter-Nacken",
    featured: false,
  },
]

export function PricingSection() {
  return (
    <section id="preise" className="relative overflow-hidden py-24 sm:py-32" style={{ backgroundColor: PAPER }}>
      <div className="container mx-auto max-w-6xl px-4">
        <ScrollReveal className="mb-16 text-center">
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: GREEN }}>
            Preise
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl" style={{ ...serif, color: INK }}>
            Transparent. Fair. Persönlich.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg" style={{ color: MUTED }}>
            Einzelsitzung oder strukturiertes Reha-Programm — du entscheidest, was zu deinem
            Anliegen passt.
          </p>
        </ScrollReveal>

        {/* === Einzelsitzung === */}
        <ScrollReveal className="mb-16">
          <div className="rounded-3xl border bg-white p-6 sm:p-10" style={{ borderColor: LINE }}>
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <span
                  className="mb-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                  style={{ backgroundColor: "rgba(44,62,45,0.08)", color: GREEN }}
                >
                  Einzelsitzung
                </span>
                <h3 className="mb-2 text-2xl sm:text-3xl" style={{ ...serif, color: INK }}>
                  Video-Analyse
                </h3>
                <p className="mb-6 max-w-lg" style={{ color: MUTED }}>
                  Ideal für akute Beschwerden, Zweitmeinungen oder wenn du erstmal kennenlernen
                  möchtest, wie Online-Physiotherapie funktioniert.
                </p>
                <ul className="space-y-2.5">
                  {einzelsitzung.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm" style={{ color: BODY }}>
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: GREEN }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-center lg:text-right">
                <div className="flex items-baseline justify-center gap-1 lg:justify-end">
                  <span className="text-5xl sm:text-6xl" style={{ ...serif, color: INK }}>
                    69€
                  </span>
                </div>
                <p className="mb-6 mt-1 text-sm" style={{ color: MUTED }}>
                  pro Analyse (30 Min.)
                </p>
                <Link href="/anfrage">
                  <Button
                    size="lg"
                    className="rounded-xl px-8 text-white hover:opacity-90"
                    style={{ backgroundColor: GREEN }}
                  >
                    Termin anfragen
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* === Reha-Programme === */}
        <ScrollReveal className="mb-10 text-center">
          <h3 className="text-xl sm:text-2xl" style={{ ...serif, color: INK }}>
            Oder: Strukturierte Reha-Programme
          </h3>
          <p className="mx-auto mt-2 max-w-xl" style={{ color: MUTED }}>
            Wenn Einzelsitzungen nicht reichen — für Situationen, die einen klaren Plan und
            engmaschige Begleitung brauchen.
          </p>
        </ScrollReveal>

        <div className="reveal-stagger mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {rehaPackages.map((pkg) => (
            <ScrollReveal key={pkg.name}>
              <div
                className="relative flex h-full flex-col rounded-3xl bg-white p-6 sm:p-8"
                style={{
                  border: pkg.featured ? `2px solid ${SAND}` : `1px solid ${LINE}`,
                  boxShadow: pkg.featured ? "0 20px 50px rgba(44,62,45,0.08)" : "none",
                }}
              >
                {pkg.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-lg"
                      style={{ backgroundColor: GREEN }}
                    >
                      <Sparkles className="h-3 w-3" />
                      Am häufigsten gebucht
                    </span>
                  </div>
                )}

                <div className={pkg.featured ? "mt-2" : ""}>
                  <h3 className="mb-1 text-xl" style={{ ...serif, color: INK }}>
                    {pkg.name}
                  </h3>
                  <p className="mb-4 text-sm" style={{ color: MUTED }}>
                    {pkg.duration}
                  </p>
                  <p className="mb-6 text-sm" style={{ color: MUTED }}>
                    {pkg.description}
                  </p>
                </div>

                <ul className="mb-6 flex-1 space-y-2.5">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm" style={{ color: BODY }}>
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: GREEN }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mb-6 rounded-xl p-4" style={{ backgroundColor: PAPER }}>
                  <p className="mb-1 text-xs" style={{ color: MUTED }}>
                    Typische Anwendungen:
                  </p>
                  <p className="text-sm font-medium" style={{ color: BODY }}>
                    {pkg.examples}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-lg" style={{ ...serif, color: INK }}>
                    {pkg.price}
                  </p>
                  <Link href="/anfrage">
                    <Button className="rounded-xl text-white hover:opacity-90" style={{ backgroundColor: GREEN }}>
                      Beratungsgespräch
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Scarcity + Risk Reversal */}
        <ScrollReveal>
          <div className="mb-12 flex flex-col items-center justify-center gap-6 text-center sm:flex-row">
            <p className="text-sm" style={{ color: MUTED }}>
              <span className="font-semibold" style={{ color: BODY }}>
                Begrenzte Plätze pro Monat
              </span>{" "}
              — damit deine Betreuung persönlich bleibt.
            </p>
            <span className="hidden h-4 w-px sm:block" style={{ backgroundColor: LINE }} />
            <p className="text-sm" style={{ color: MUTED }}>
              <span className="font-semibold" style={{ color: GREEN }}>
                Ersteinschätzung 69€
              </span>{" "}
              — danach Betreuung optional ab 16,99€/Monat.
            </p>
          </div>
        </ScrollReveal>

        {/* === Erstattungs-Block (prominent) === */}
        <ScrollReveal>
          <div
            className="rounded-3xl border p-8 sm:p-10"
            style={{ backgroundColor: "rgba(201,183,156,0.12)", borderColor: LINE }}
          >
            <div className="mb-8 text-center">
              <span
                className="mb-4 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-xs font-bold shadow-sm"
                style={{ color: GREEN, borderColor: LINE }}
              >
                <CreditCard className="h-3.5 w-3.5" />
                Erstattung
              </span>
              <h3 className="text-2xl sm:text-3xl" style={{ ...serif, color: INK }}>
                Viele Patienten zahlen weniger als gedacht
              </h3>
              <p className="mx-auto mt-3 max-w-2xl text-sm" style={{ color: MUTED }}>
                Als Heilpraktiker-Leistung ist die Behandlung in vielen Fällen erstattungsfähig —
                so kann deine Therapie deutlich günstiger werden, als du denkst.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* PKV */}
              <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: LINE }}>
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "rgba(44,62,45,0.1)" }}
                  >
                    <ShieldCheck className="h-5 w-5" style={{ color: GREEN }} />
                  </div>
                  <h4 className="font-bold" style={{ color: INK }}>
                    Privatversicherung
                  </h4>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                  Heilpraktiker-Leistungen werden von den meisten{" "}
                  <span className="font-semibold" style={{ color: BODY }}>
                    privaten Krankenversicherungen
                  </span>{" "}
                  erstattet — je nach Tarif bis zu 100%.
                </p>
              </div>

              {/* Zusatzversicherung */}
              <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: LINE }}>
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "rgba(44,62,45,0.1)" }}
                  >
                    <Heart className="h-5 w-5" style={{ color: GREEN }} />
                  </div>
                  <h4 className="font-bold" style={{ color: INK }}>
                    Zusatzversicherung
                  </h4>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                  Auch{" "}
                  <span className="font-semibold" style={{ color: BODY }}>
                    Heilpraktiker-Zusatzversicherungen
                  </span>{" "}
                  (ab ~15€/Monat) decken unsere Behandlungen ab. Ideal für gesetzlich Versicherte.
                </p>
              </div>

              {/* Selbstzahler */}
              <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: LINE }}>
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "rgba(44,62,45,0.1)" }}
                  >
                    <Wallet className="h-5 w-5" style={{ color: GREEN }} />
                  </div>
                  <h4 className="font-bold" style={{ color: INK }}>
                    Selbstzahler
                  </h4>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                  Auch ohne Versicherung{" "}
                  <span className="font-semibold" style={{ color: BODY }}>
                    transparente Festpreise
                  </span>{" "}
                  — keine versteckten Kosten. Ratenzahlung auf Anfrage möglich.
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs" style={{ color: MUTED }}>
              Gerne prüfen wir deine individuelle Erstattungssituation in der Ersteinschätzung
              (69€, einmalig).
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
