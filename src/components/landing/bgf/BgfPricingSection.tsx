"use client"

import { motion } from "framer-motion"
import { Check, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const tiers = [
  {
    name: "Basic",
    price: "19",
    unit: "€/MA/Monat",
    description: "Ideal für den Einstieg in betriebliche Gesundheitsförderung.",
    features: [
      "Pausen-Fit (KI-Routinen)",
      "Persönliche Gesundheitsanalyse",
      "Ampel-System",
      "HR-Dashboard (Basis-KPIs)",
      "E-Mail Support",
    ],
    notIncluded: ["Therapeuten-Betreuung", "Quartals-Reports", "Abteilungs-Vergleich"],
    featured: false,
  },
  {
    name: "Pro",
    price: "39",
    unit: "€/MA/Monat",
    description: "Vollumfängliche BGF mit persönlicher Therapeuten-Betreuung und vollem Reporting.",
    features: [
      "Alles aus Basic",
      "Therapeuten-Betreuung bei Bedarf",
      "Vollständiges HR-Dashboard",
      "Quartals-Reports (PDF)",
      "Abteilungs-Vergleich",
      "Prioritäts-Support",
      "Onboarding-Workshop",
    ],
    notIncluded: [],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "59",
    unit: "€/MA/Monat",
    description: "Für große Unternehmen mit komplexen Anforderungen und dedizierten Services.",
    features: [
      "Alles aus Pro",
      "Dedizierter Account Manager",
      "Custom Integrationen (HR-System)",
      "Multi-Standort Management",
      "SLA 99.9% Verfügbarkeit",
      "DSGVO-Auftragsverarbeitungsvertrag",
    ],
    notIncluded: [],
    featured: false,
  },
]

export function BgfPricingSection() {
  return (
    <section className="py-24 sm:py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-sm font-semibold text-landing-accent uppercase tracking-widest">
            Preise
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-landing-fg tracking-tight">
            Transparent.{" "}
            <span className="text-landing-accent">Fair.</span>{" "}
            Skalierbar.
          </h2>
          <p className="mt-4 text-lg text-landing-fg-muted max-w-2xl mx-auto">
            Alle Tarife beinhalten §3 Nr. 34 EStG-Konformität und DSGVO-konformes Hosting.
          </p>
        </motion.div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              className={`relative rounded-2xl p-7 flex flex-col ${
                tier.featured
                  ? "bg-landing-fg border-2 border-landing-fg shadow-2xl"
                  : "bg-white border border-landing-border shadow-sm"
              }`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.12, duration: 0.7 }}
            >
              {tier.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-landing-accent px-5 py-2 text-xs font-bold text-white shadow-lg shadow-landing-accent/30">
                    <Sparkles className="h-3 w-3" />
                    Empfohlen
                  </span>
                </div>
              )}

              <div className={tier.featured ? "mt-3" : ""}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${tier.featured ? "text-white/60" : "text-landing-fg-subtle"}`}>
                  {tier.name}
                </p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className={`font-display text-5xl font-bold ${tier.featured ? "text-white" : "text-landing-fg"}`}>
                    {tier.price}€
                  </span>
                </div>
                <p className={`text-sm mb-4 ${tier.featured ? "text-white/50" : "text-landing-fg-subtle"}`}>
                  {tier.unit}
                </p>
                <p className={`text-sm leading-relaxed mb-6 ${tier.featured ? "text-white/70" : "text-landing-fg-muted"}`}>
                  {tier.description}
                </p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${tier.featured ? "text-landing-highlight" : "text-landing-accent"}`} />
                    <span className={tier.featured ? "text-white/80" : "text-landing-fg"}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link href="/anfrage">
                <Button
                  className={`w-full rounded-full ${
                    tier.featured
                      ? "bg-landing-accent hover:bg-landing-accent-hover text-white shadow-lg shadow-landing-accent/30"
                      : "border border-landing-border bg-white hover:bg-landing-bg text-landing-fg"
                  }`}
                >
                  Anfragen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Pilot banner */}
        <motion.div
          className="rounded-2xl bg-gradient-to-r from-landing-accent/10 via-landing-accent-light to-landing-accent-warm/10 border border-landing-accent/20 p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 bg-landing-accent text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Pilot-Programm
          </span>
          <h3 className="font-display text-2xl font-bold text-landing-fg mb-2">
            30 Tage kostenlos testen
          </h3>
          <p className="text-landing-fg-muted mb-6 max-w-lg mx-auto">
            Starten Sie mit 10–20 Mitarbeitenden, ohne Risiko und ohne Verpflichtung.
            Nach 30 Tagen entscheiden Sie.
          </p>
          <Link href="/anfrage">
            <Button
              size="lg"
              className="bg-landing-accent hover:bg-landing-accent-hover text-white rounded-full px-8 shadow-lg shadow-landing-accent/25"
            >
              Pilot-Programm anfragen
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
