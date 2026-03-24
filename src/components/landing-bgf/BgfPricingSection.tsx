import Link from "next/link"
import { ScrollReveal } from "@/components/landing/ScrollReveal"
import { Button } from "@/components/ui/button"
import { Check, ArrowRight, Star, Sparkles } from "lucide-react"

const tiers = [
  {
    name: "Basic",
    price: "29",
    description: "Digitale Pausen-Fit Sessions für Ihren Einstieg in die BGF",
    features: [
      "KI-generierte Pausen-Fit Sessions",
      "Täglicher Gesundheits-Check-In",
      "Ergonomie-Tipps & Bildschirm-Pausen",
      "Hydration-Tracker",
      "Wochen-Übersicht & Streak-System",
    ],
    notIncluded: ["Ist-Analyse & Risiko-Scoring", "HR-Dashboard", "Therapeuten-Chat"],
    featured: false,
    gradient: "",
    badge: null,
  },
  {
    name: "Professional",
    price: "39",
    description: "Vollständige BGF-Plattform mit Analyse, Dashboard und Chat",
    features: [
      "Alles aus Basic, plus:",
      "Ist-Analyse & Risiko-Scoring",
      "HR-Dashboard mit anonymisierten Reports",
      "Persönlicher Therapeuten-Chat",
      "Ziel-Tracking mit Fortschrittsmessung",
      "Team-Puls (anonyme Team-Statistik)",
      "ROI-Rechner & Handlungsempfehlungen",
    ],
    notIncluded: ["Quartals-Reports", "Dedizierter Therapeut"],
    featured: true,
    gradient: "bg-gradient-to-b from-indigo-500 via-violet-500 to-purple-600",
    badge: "Beliebteste Wahl",
  },
  {
    name: "Enterprise",
    price: "59",
    description: "Premium BGF mit dediziertem Therapeuten und individuellen Reports",
    features: [
      "Alles aus Professional, plus:",
      "Quartals-Reports mit Handlungsempfehlungen",
      "Dedizierter Therapeut als fester Ansprechpartner",
      "Zugang zu Sonderkonditionen für Einzelleistungen",
      "Prioritäts-Support",
    ],
    notIncluded: [],
    featured: false,
    gradient: "",
    badge: null,
  },
]

export function BgfPricingSection() {
  return (
    <section id="preise" className="py-20 sm:py-28 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />

      <div className="relative container mx-auto px-4 max-w-6xl">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3">Preise</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              Transparent. Fair. <span className="text-emerald-600">Planbar.</span>
            </h2>
            <p className="mt-6 text-lg text-slate-500">
              Alle Preise netto pro Mitarbeiter/Monat. Bis zu 600 €/MA/Jahr steuerlich begünstigt nach §3 Nr. 34 EStG möglich.*
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {tiers.map((tier) => (
            <ScrollReveal key={tier.name}>
              <div className={`rounded-3xl p-[2px] h-full ${
                tier.featured
                  ? tier.gradient + " shadow-2xl shadow-indigo-500/15"
                  : "bg-slate-200"
              }`}>
                <div className="bg-white rounded-[22px] p-6 h-full flex flex-col">
                  {tier.badge && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <Star className="h-4 w-4 fill-indigo-500 text-indigo-500" />
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{tier.badge}</span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mt-3 mb-2">
                    <span className="text-4xl font-black text-slate-900 tabular-nums">{tier.price}€</span>
                    <span className="text-sm text-slate-400">/MA/Monat</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-6">{tier.description}</p>

                  <div className="space-y-3 flex-1">
                    {tier.features.map((f) => (
                      <div key={f} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{f}</span>
                      </div>
                    ))}
                    {tier.notIncluded.map((f) => (
                      <div key={f} className="flex items-start gap-2.5 opacity-35">
                        <Check className="h-4 w-4 text-slate-300 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-400 line-through">{f}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/anfrage" className="mt-8 block">
                    <Button
                      className={`w-full h-12 rounded-xl font-semibold transition-all hover:-translate-y-0.5 ${
                        tier.featured
                          ? "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-lg shadow-indigo-500/20"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      Erstberatung vereinbaren
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Pilot banner */}
        <ScrollReveal>
          <div className="mt-12 bg-gradient-to-r from-indigo-500/10 via-violet-500/5 to-emerald-500/10 rounded-2xl border border-indigo-200/50 p-8 text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4 shadow-md">
              <Sparkles className="h-3.5 w-3.5" />
              Pilot-Programm
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              Unverbindlich kennenlernen
            </h3>
            <p className="text-slate-500 mb-6 max-w-lg mx-auto">
              Starten Sie mit 10–20 Mitarbeitenden. Kostenlose Erstberatung, ROI-Prognose und
              Einrichtung — ohne Verpflichtung.
            </p>
            <Link href="/anfrage">
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-full px-8 shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
              >
                Pilot-Programm anfragen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-center text-sm text-slate-400 mt-8">
            Mindestlaufzeit 12 Monate. Verträge werden digital geschlossen.
            Individuelle Enterprise-Konditionen ab 100 Mitarbeitern möglich.
            <br />
            <span className="text-slate-500">*Steuerliche Begünstigung nach §3 Nr. 34 EStG ist an Voraussetzungen geknüpft. Sprechen Sie mit Ihrem Steuerberater.</span>
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
