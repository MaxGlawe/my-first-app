import { ScrollReveal } from "./ScrollReveal"

export function TeamSection() {
  return (
    <section className="bg-landing-bg-warm">
      <div className="container mx-auto px-4 py-32 lg:py-40 max-w-6xl">
        <div className="max-w-3xl">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.2em] text-landing-fg-subtle mb-8">
              Das Team
            </p>

            <h2 className="text-display-lg text-landing-fg">
              <span className="font-light">Physiotherapie</span>
              <br />
              <span className="font-semibold">Glawe</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <p className="mt-8 text-base text-landing-fg-muted leading-[1.8] max-w-xl">
              Hinter Praxis OS steht ein eingespieltes Team aus
              Physiotherapeuten, Heilpraktikern und Präventionstrainern. Wir
              kombinieren jahrelange klinische Erfahrung mit moderner
              Technologie — damit Sie die beste Betreuung bekommen, egal wo Sie
              sind. Staatlich geprüfte Heilpraktiker-Zulassung nach dem
              Heilpraktikergesetz: Wir dürfen eigenständig diagnostizieren und
              behandeln.
            </p>

            <p className="mt-8 text-xs uppercase tracking-[0.15em] text-landing-fg-subtle">
              Heilpraktiker-Zulassung / Evidenzbasierte Methoden / Fortlaufende
              Fortbildung
            </p>
          </ScrollReveal>
        </div>
      </div>

      <hr className="border-t border-landing-border" />
    </section>
  )
}
