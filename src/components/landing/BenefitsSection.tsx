import { ScrollReveal } from "./ScrollReveal"

const benefits = [
  {
    title: "Keine Anfahrt, kein Wartezimmer",
    description:
      "Therapie bequem von zu Hause. Starten Sie mit einem Klick. Trainieren Sie, wann es Ihnen passt — Ihre Übungen sind immer verfügbar.",
  },
  {
    title: "Experten-Betreuung, keine Algorithmen",
    description:
      "Behandlung durch Therapeuten mit Heilpraktiker-Zulassung. Jede Übung individuell zusammengestellt. Keine Standard-Programme, keine KI-generierten Pläne.",
  },
  {
    title: "Ihr Therapeut, eine Nachricht entfernt",
    description:
      "Direkter Chat, persönliches Feedback, echte Gespräche. Sie sind kein Ticket — Sie sind ein Mensch mit einer Geschichte.",
  },
  {
    title: "Wissenschaftlich fundiert",
    description:
      "Evidenzbasierte Methoden, keine Trends. Ihre Fortschritte werden messbar und sichtbar — für Sie und Ihren Therapeuten.",
  },
]

export function BenefitsSection() {
  return (
    <section id="vorteile" className="bg-white">
      <div className="container mx-auto px-4 py-32 lg:py-40 max-w-6xl">
        <ScrollReveal>
          <h2 className="text-display-sm font-semibold text-landing-fg">
            Warum Praxis OS
          </h2>
        </ScrollReveal>

        <hr className="border-t border-landing-border mt-8 mb-0" />

        {benefits.map((benefit) => (
          <ScrollReveal key={benefit.title}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 py-10 lg:py-12 border-b border-landing-border">
              <h3 className="lg:col-span-5 text-display-sm font-semibold text-landing-fg leading-tight">
                {benefit.title}
              </h3>
              <p className="lg:col-span-6 lg:col-start-7 text-base text-landing-fg-muted leading-[1.8]">
                {benefit.description}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <hr className="border-t border-landing-border" />
    </section>
  )
}
