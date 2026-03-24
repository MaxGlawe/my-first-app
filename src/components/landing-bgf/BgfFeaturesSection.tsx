import { ScrollReveal } from "@/components/landing/ScrollReveal"
import {
  Activity, Droplets, Wind, Eye, Target, Users,
  BarChart3, MessageCircle, Shield, Sparkles,
} from "lucide-react"

const featureRows = [
  {
    label: "Für Mitarbeiter",
    features: [
      { icon: Sparkles, title: "KI Pausen-Fit", description: "Personalisierte 5-Min Sessions — automatisch generiert basierend auf Arbeitsplatz und Beschwerden", accent: "bg-indigo-500" },
      { icon: Activity, title: "Täglicher Check-In", description: "30-Sekunden Gesundheits-Check erstellt den persönlichen Tagesplan", accent: "bg-violet-500" },
      { icon: Wind, title: "Atem-Pause", description: "Geführte 1-Minuten Atemübung für stressige Momente — freiwillig, jederzeit verfügbar", accent: "bg-teal-500" },
      { icon: Eye, title: "Bildschirm-Pause", description: "20-20-20 Timer für Augenentlastung mit sanfter Erinnerung", accent: "bg-sky-500" },
      { icon: Droplets, title: "Hydration-Tracker", description: "Motiviert zur regelmäßigen Flüssigkeitsaufnahme im Arbeitsalltag", accent: "bg-cyan-500" },
    ],
  },
  {
    label: "Für HR & Geschäftsführung",
    features: [
      { icon: Target, title: "Ziel-Tracking", description: "Mitarbeiter sehen echten Fortschritt — Schmerz, Stress, Schlaf im Vergleich zum Start", accent: "bg-emerald-500" },
      { icon: Users, title: "Team-Puls", description: "Anonyme Team-Statistik: 'Dein Team war diese Woche 78% aktiv'", accent: "bg-green-500" },
      { icon: BarChart3, title: "HR-Dashboard", description: "Anonymisierte Auswertungen, ROI-Rechner und Abteilungsvergleich", accent: "bg-amber-500" },
      { icon: MessageCircle, title: "Therapeuten-Chat", description: "Bei akuten Beschwerden: direkter Draht zum betreuenden Therapeuten", accent: "bg-orange-500" },
      { icon: Shield, title: "DSGVO-konform", description: "EU-Server, keine individuellen Daten für HR, Mindestgruppengröße", accent: "bg-slate-600" },
    ],
  },
]

export function BgfFeaturesSection() {
  return (
    <section className="py-20 sm:py-28 bg-white relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-indigo-50/60 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-violet-50/50 rounded-full blur-[100px] translate-x-1/3" />

      <div className="relative container mx-auto px-4 max-w-6xl">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">Funktionen</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              Alles was Ihre Mitarbeiter{" "}
              <span className="text-indigo-600">gesund hält</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Von der Micro-Pause bis zum Quartals-Report — eine Plattform für alle.
            </p>
          </div>
        </ScrollReveal>

        {featureRows.map((row) => (
          <div key={row.label} className="mb-10 last:mb-0">
            <ScrollReveal>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 pl-1">{row.label}</p>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {row.features.map((f) => (
                <ScrollReveal key={f.title}>
                  <div className="group bg-slate-50/80 rounded-2xl p-5 h-full hover:bg-white hover:shadow-xl border border-transparent hover:border-slate-100 transition-all duration-300 hover:-translate-y-1">
                    <div className={`w-9 h-9 rounded-xl ${f.accent} flex items-center justify-center mb-3 shadow-sm group-hover:shadow-md transition-shadow`}>
                      <f.icon className="h-4.5 w-4.5 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1.5">{f.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{f.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
