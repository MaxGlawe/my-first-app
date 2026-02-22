import { ScrollReveal } from "./ScrollReveal"

export function ManifestoSection() {
  return (
    <section className="bg-landing-bg-warm">
      <div className="container mx-auto px-4 py-32 lg:py-40 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left — pull quote */}
          <ScrollReveal className="lg:col-span-5">
            <p className="text-display-lg font-light text-landing-fg leading-tight">
              Wir glauben, dass gute Therapie kein Wartezimmer braucht.
            </p>
          </ScrollReveal>

          {/* Right — body text */}
          <ScrollReveal className="lg:col-span-6 lg:col-start-7" delay={150}>
            <div className="space-y-6">
              <p className="text-base text-landing-fg-muted leading-[1.8]">
                Physiotherapie sollte nicht an einen Ort gebunden sein. Nicht an
                starre Termine. Nicht an unpersönliche Praxen mit
                20-Minuten-Takt.
              </p>
              <p className="text-base text-landing-fg-muted leading-[1.8]">
                Wir sind ein Team aus Physiotherapeuten und Heilpraktikern, das
                Behandlung neu denkt: persönlich, evidenzbasiert, digital. Ihre
                Therapie gehört in Ihren Alltag — nicht umgekehrt.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <hr className="border-t border-landing-border" />
    </section>
  )
}
