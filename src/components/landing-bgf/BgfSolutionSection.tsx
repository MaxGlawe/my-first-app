import { ScrollReveal } from "@/components/landing/ScrollReveal"
import { Smartphone, Brain, BarChart3, Stethoscope, CheckCircle2, ArrowRight } from "lucide-react"

const steps = [
  {
    icon: Smartphone,
    number: "01",
    title: "Onboarding in 3 Minuten",
    description: "Jeder Mitarbeiter macht eine digitale Ist-Analyse — Arbeitsplatztyp, Beschwerden, Ziele. Daraus entsteht ein persönliches Profil.",
    accent: "from-indigo-500 to-violet-500",
    badge: "3 Min.",
  },
  {
    icon: Brain,
    number: "02",
    title: "KI-gestützte Tagesplanung",
    description: "Jeden Morgen: Check-In → KI generiert 2-3 personalisierte Pausen-Fit Sessions, abgestimmt auf Arbeitsplatz und aktuelle Beschwerden.",
    accent: "from-violet-500 to-purple-500",
    badge: "Automatisch",
  },
  {
    icon: BarChart3,
    number: "03",
    title: "Messbare Ergebnisse",
    description: "HR-Dashboard mit anonymisierten Auswertungen, ROI-Berechnung, Abteilungsvergleich und konkreten Handlungsempfehlungen.",
    accent: "from-emerald-500 to-teal-500",
    badge: "Echtzeit",
  },
  {
    icon: Stethoscope,
    number: "04",
    title: "Therapeut als Ansprechpartner",
    description: "Bei akuten Beschwerden: direkter Chat mit dem Therapeuten. Optional: individuelle Beratungen und Ergonomie-Checks vor Ort.",
    accent: "from-amber-500 to-orange-500",
    badge: "Persönlich",
  },
]

export function BgfSolutionSection() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-50/60 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4" />

      <div className="relative container mx-auto px-4 max-w-6xl">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3">Die Lösung</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              BGF, die <span className="text-emerald-600">wirklich funktioniert</span>
            </h2>
            <p className="mt-6 text-lg text-slate-500 leading-relaxed">
              Keine Plakate im Pausenraum. Keine einmaligen Workshops die keiner besucht.
              Sondern ein System das täglich wirkt — direkt am Arbeitsplatz.
            </p>
          </div>
        </ScrollReveal>

        {/* Steps */}
        <div className="grid md:grid-cols-2 gap-6">
          {steps.map((step, i) => (
            <ScrollReveal key={step.title}>
              <div className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                {/* Number background */}
                <span className="absolute top-4 right-4 text-6xl font-black text-slate-100/80 select-none group-hover:text-indigo-50 transition-colors">
                  {step.number}
                </span>

                <div className="relative flex gap-5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.accent} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                        {step.badge}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {/* Connector line (only between rows) */}
                {i < 2 && (
                  <div className="hidden md:block absolute -bottom-3 left-1/2 -translate-x-1/2">
                    <ArrowRight className="h-4 w-4 text-slate-200 rotate-90" />
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Differentiators */}
        <ScrollReveal>
          <div className="mt-14 bg-slate-900 rounded-3xl p-8 sm:p-10 relative overflow-hidden">
            {/* Subtle pattern */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,1) 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full" />

            <div className="relative text-center mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white">Warum Praxis OS BGF anders ist</h3>
            </div>
            <div className="relative grid sm:grid-cols-3 gap-6">
              {[
                { text: "Täglich 3×5 Minuten statt einmaligem Workshop", highlight: "Täglich" },
                { text: "KI-Personalisierung statt Einheits-Übungen", highlight: "KI" },
                { text: "Echtzeit-ROI statt jährlichem Report", highlight: "Echtzeit" },
              ].map(({ text, highlight }) => (
                <div key={text} className="flex items-start gap-3 text-left">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
