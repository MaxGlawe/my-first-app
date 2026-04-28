"use client"

import { ScrollReveal } from "./ScrollReveal"
import { Check, ArrowRight, Sparkles, ShieldCheck, CreditCard, Heart, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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
    duration: "6\u20138 Wochen",
    description:
      "Strukturierte Nachbehandlung nach Operationen \u2014 von der Wundheilung bis zur vollen Belastbarkeit.",
    features: [
      "Individuelle Reha-Phasen nach OP-Protokoll",
      "6\u20138 Video-Sitzungen (\u00e0 30 Min.)",
      "T\u00e4glicher Trainingsplan mit progressiver Steigerung",
      "Laufende Anpassung an Heilungsverlauf",
      "Unbegrenzter Chat-Support",
      "Abschlussbefund & \u00dcbergabe an Arzt",
    ],
    examples: "Kreuzband, Meniskus, Schulter-OP, R\u00fccken-OP, H\u00fcft-/Knie-TEP",
    featured: true,
  },
  {
    name: "Chronik-Programm",
    price: "Auf Anfrage",
    duration: "8\u201312 Wochen",
    description:
      "F\u00fcr langj\u00e4hrige Beschwerden, die Struktur und Konsequenz brauchen \u2014 weil Schmerz kein Dauerzustand sein muss.",
    features: [
      "Umfassende Schmerzanalyse & Zielsetzung",
      "8\u201310 Video-Sitzungen (\u00e0 30 Min.)",
      "Individueller Trainingsplan mit w\u00f6chentlicher Anpassung",
      "Schmerztagebuch & Verlaufskontrolle",
      "Unbegrenzter Chat-Support",
    ],
    examples: "Chronischer R\u00fccken, Migr\u00e4ne, Fibromyalgie, Arthrose, Schulter-Nacken",
    featured: false,
  },
]

export function PricingSection() {
  return (
    <section
      id="preise"
      className="py-24 sm:py-32 bg-white relative overflow-hidden"
    >
      {/* Smart line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="smart-line h-12" />
        <div className="smart-line-dot animate-dot-pulse" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <ScrollReveal className="text-center mb-16">
          <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider">
            Preise
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Transparent.{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Fair.
            </span>{" "}
            Persönlich.
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            Einzelsitzung oder strukturiertes Reha-Programm — Sie entscheiden,
            was zu Ihrem Anliegen passt.
          </p>
        </ScrollReveal>

        {/* === Einzelsitzung === */}
        <ScrollReveal className="mb-16">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 mb-4">
                  Einzelsitzung
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                  Video-Analyse
                </h3>
                <p className="text-slate-500 mb-6 max-w-lg">
                  Ideal für akute Beschwerden, Zweitmeinungen oder wenn Sie
                  erstmal kennenlernen möchten, wie Online-Physiotherapie
                  funktioniert.
                </p>
                <ul className="space-y-2.5">
                  {einzelsitzung.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 text-sm text-slate-700"
                    >
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-center lg:text-right">
                <div className="flex items-baseline gap-1 justify-center lg:justify-end">
                  <span className="text-5xl sm:text-6xl font-bold text-slate-900 tracking-tight">
                    69€
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1 mb-6">
                  pro Analyse (30 Min.)
                </p>
                <Link href="/anfrage">
                  <Button
                    size="lg"
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8"
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
        <ScrollReveal className="text-center mb-10">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            Oder: Strukturierte Reha-Programme
          </h3>
          <p className="text-slate-500 mt-2 max-w-xl mx-auto">
            Wenn Einzelsitzungen nicht reichen — für Situationen, die einen
            klaren Plan und engmaschige Begleitung brauchen.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12 reveal-stagger">
          {rehaPackages.map((pkg) => (
            <ScrollReveal key={pkg.name}>
              <div
                className={`relative rounded-3xl p-6 sm:p-8 h-full flex flex-col ${
                  pkg.featured
                    ? "border-2 border-emerald-500 bg-white shadow-2xl shadow-emerald-500/10"
                    : "border border-slate-200 bg-white"
                }`}
              >
                {pkg.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25">
                      <Sparkles className="h-3 w-3" />
                      Am häufigsten gebucht
                    </span>
                  </div>
                )}

                <div className={pkg.featured ? "mt-2" : ""}>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">
                    {pkg.duration}
                  </p>
                  <p className="text-sm text-slate-500 mb-6">
                    {pkg.description}
                  </p>
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {pkg.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 text-sm text-slate-700"
                    >
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="rounded-xl bg-slate-50 p-4 mb-6">
                  <p className="text-xs text-slate-400 mb-1">
                    Typische Anwendungen:
                  </p>
                  <p className="text-sm text-slate-600 font-medium">
                    {pkg.examples}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-slate-900">
                    {pkg.price}
                  </p>
                  <Link href="/anfrage">
                    <Button
                      className={`rounded-full ${
                        pkg.featured
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center mb-12">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-700">
                Begrenzte Plätze pro Monat
              </span>{" "}
              — damit Ihre Betreuung persönlich bleibt.
            </p>
            <span className="hidden sm:block h-4 w-px bg-slate-200" />
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-emerald-600">
                Ersteinschätzung 69€
              </span>{" "}
              — danach Betreuung optional ab 16,99€/Monat.
            </p>
          </div>
        </ScrollReveal>

        {/* === Erstattungs-Block === */}
        <ScrollReveal>
          <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-8 sm:p-10">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-emerald-700 shadow-sm border border-emerald-100 mb-4">
                <CreditCard className="h-3.5 w-3.5" />
                Erstattung
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Viele Patienten zahlen{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  weniger als gedacht
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* PKV */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-slate-900">
                    Privatversicherung
                  </h4>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Heilpraktiker-Leistungen werden von den meisten{" "}
                  <span className="font-semibold text-slate-700">
                    privaten Krankenversicherungen
                  </span>{" "}
                  erstattet — je nach Tarif bis zu 100%.
                </p>
              </div>

              {/* Zusatzversicherung */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-slate-900">
                    Zusatzversicherung
                  </h4>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Auch{" "}
                  <span className="font-semibold text-slate-700">
                    Heilpraktiker-Zusatzversicherungen
                  </span>{" "}
                  (ab ~15€/Monat) decken unsere Behandlungen ab. Ideal für
                  gesetzlich Versicherte.
                </p>
              </div>

              {/* Selbstzahler */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-slate-900">
                    Selbstzahler
                  </h4>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Auch ohne Versicherung{" "}
                  <span className="font-semibold text-slate-700">
                    transparente Festpreise
                  </span>{" "}
                  — keine versteckten Kosten. Ratenzahlung auf Anfrage möglich.
                </p>
              </div>

            </div>

            <p className="text-center text-xs text-slate-400 mt-6">
              Gerne prüfen wir Ihre individuelle Erstattungssituation in der
              Ersteinschätzung (69€, einmalig).
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
