"use client"

import { ScrollReveal } from "@/components/landing/ScrollReveal"
import { MessageCircle } from "lucide-react"

const faqs = [
  {
    q: "Ist die BGF-Investition steuerlich begünstigt?",
    a: "Unter bestimmten Voraussetzungen ja. Nach §3 Nr. 34 EStG können Arbeitgeber bis zu 600 € pro Mitarbeiter pro Jahr steuerfrei für qualifizierte Gesundheitsmaßnahmen aufwenden. Die Voraussetzungen müssen im Einzelfall geprüft werden — wir unterstützen Sie dabei und empfehlen die Abstimmung mit Ihrem Steuerberater.",
  },
  {
    q: "Wie lange dauert die Einrichtung?",
    a: "Die Plattform ist sofort einsatzbereit. Mitarbeiter-Onboarding (Ist-Analyse) dauert 3 Minuten. Innerhalb einer Woche können alle Mitarbeiter aktiv sein.",
  },
  {
    q: "Sind die Gesundheitsdaten meiner Mitarbeiter sicher?",
    a: "Absolut. Alle Daten werden auf EU-Servern gespeichert (DSGVO-konform). HR sieht ausschließlich anonymisierte, aggregierte Auswertungen. Individuelle Gesundheitsdaten sind für Sie als Arbeitgeber zu keinem Zeitpunkt einsehbar.",
  },
  {
    q: "Müssen alle Mitarbeiter mitmachen?",
    a: "Nein, die Teilnahme ist freiwillig. Erfahrungsgemäß erreichen wir innerhalb von 4 Wochen eine Teilnahmequote von 50-70%, wenn das Programm aktiv kommuniziert wird.",
  },
  {
    q: "Was unterscheidet Praxis OS von anderen BGF-Anbietern?",
    a: "Drei Dinge: (1) KI-Personalisierung — jeder Mitarbeiter bekommt individuelle Sessions basierend auf seinem Profil. (2) Tägliche Micro-Interventionen statt einmalige Workshops. (3) Echtzeit-ROI im HR-Dashboard statt Jahresberichte.",
  },
  {
    q: "Kann ich die Plattform vorher testen?",
    a: "Ja — in einer kostenlosen Erstberatung zeigen wir Ihnen die Plattform live und erstellen eine unverbindliche ROI-Prognose für Ihr Unternehmen.",
  },
  {
    q: "Was passiert bei akuten Beschwerden eines Mitarbeiters?",
    a: "Der Mitarbeiter kann direkt über den integrierten Chat seinen Therapeuten kontaktieren. Optional können individuelle Beratungen und Ergonomie-Checks gebucht werden (gem. §2a, separat abgerechnet).",
  },
  {
    q: "Wie lange ist die Mindestvertragslaufzeit?",
    a: "12 Monate. Danach verlängert sich der Vertrag um jeweils 12 Monate mit 3 Monaten Kündigungsfrist. Der angebrochene Startmonat ist kostenfrei.",
  },
]

export function BgfFaqSection() {
  return (
    <section className="py-20 sm:py-28 bg-slate-50 relative overflow-hidden">
      {/* Background */}
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50/40 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/3" />

      <div className="relative container mx-auto px-4 max-w-3xl">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 mb-4 border border-slate-200">
              <MessageCircle className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-500 font-medium">FAQ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Häufige Fragen
            </h2>
          </div>
        </ScrollReveal>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <ScrollReveal key={faq.q}>
              <details className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="text-sm font-semibold text-slate-900 pr-4">{faq.q}</span>
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 group-open:bg-indigo-100 transition-colors">
                    <span className="text-slate-400 group-open:text-indigo-500 group-open:rotate-45 transition-all text-lg leading-none">+</span>
                  </span>
                </summary>
                <div className="px-5 pb-5 -mt-1">
                  <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                </div>
              </details>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
