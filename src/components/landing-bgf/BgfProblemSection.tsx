import { ScrollReveal } from "@/components/landing/ScrollReveal"
import { AlertTriangle, TrendingUp, Clock, Euro } from "lucide-react"

const problems = [
  {
    icon: Euro,
    stat: "337.500 €",
    title: "Verlust durch Krankheit",
    description: "Ein Unternehmen mit 50 Mitarbeitern verliert jährlich über 300.000 € durch krankheitsbedingte Fehltage.",
    color: "from-red-500 to-rose-500",
    accent: "text-red-400",
    bgColor: "bg-red-500/5",
    borderColor: "border-red-500/10",
  },
  {
    icon: Clock,
    stat: "15,1 Tage",
    title: "Fehltage pro Mitarbeiter",
    description: "Der deutsche Durchschnitt liegt bei über 15 Fehltagen pro Jahr — Tendenz steigend seit 2019.",
    color: "from-amber-500 to-orange-500",
    accent: "text-amber-400",
    bgColor: "bg-amber-500/5",
    borderColor: "border-amber-500/10",
  },
  {
    icon: TrendingUp,
    stat: "+28%",
    title: "Mehr Rückenbeschwerden",
    description: "Durch Homeoffice und Digitalisierung nehmen muskuloskelettale Beschwerden drastisch zu.",
    color: "from-violet-500 to-purple-500",
    accent: "text-violet-400",
    bgColor: "bg-violet-500/5",
    borderColor: "border-violet-500/10",
  },
  {
    icon: AlertTriangle,
    stat: "67%",
    title: "Fühlen sich gestresst",
    description: "Zwei Drittel der Beschäftigten berichten von regelmäßigem Stress am Arbeitsplatz (TK-Studie 2024).",
    color: "from-blue-500 to-indigo-500",
    accent: "text-blue-400",
    bgColor: "bg-blue-500/5",
    borderColor: "border-blue-500/10",
  },
]

export function BgfProblemSection() {
  return (
    <section className="py-20 sm:py-28 bg-white relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-50/50 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3" />

      <div className="relative container mx-auto px-4 max-w-6xl">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-3">Das Problem</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              Krankheit kostet Ihr Unternehmen{" "}
              <span className="text-red-500">ein Vermögen</span>
            </h2>
            <p className="mt-6 text-lg text-slate-500 leading-relaxed">
              Jeder Fehltag kostet durchschnittlich 300 € — und die Zahlen steigen jedes Jahr.
              Die Frage ist nicht ob, sondern wie viel Sie verlieren.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {problems.map((p) => (
            <ScrollReveal key={p.title}>
              <div className={`${p.bgColor} rounded-2xl p-6 h-full border ${p.borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-5 shadow-lg`}>
                  <p.icon className="h-5 w-5 text-white" />
                </div>
                <p className={`text-3xl sm:text-4xl font-black text-slate-900 mb-1.5 tracking-tight`}>{p.stat}</p>
                <p className="text-sm font-bold text-slate-700 mb-2">{p.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
