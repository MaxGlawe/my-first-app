import { ScrollReveal } from "@/components/landing/ScrollReveal"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    quote: "Seit wir Praxis OS BGF nutzen, sind unsere Fehltage um 22% gesunken. Die Mitarbeiter lieben die Pausen-Fit Sessions — besonders die Morgen-Aktivierung.",
    name: "Thomas K.",
    role: "Geschäftsführer",
    company: "Maschinenbau (85 MA)",
    stars: 5,
    highlight: "22% weniger Fehltage",
  },
  {
    quote: "Das HR-Dashboard ist Gold wert. Endlich sehe ich auf einen Blick, wie es meinem Team geht — anonymisiert und DSGVO-konform. Der ROI-Rechner hat unseren Vorstand überzeugt.",
    name: "Sandra M.",
    role: "HR-Leiterin",
    company: "IT-Dienstleister (120 MA)",
    stars: 5,
    highlight: "Vorstand überzeugt",
  },
  {
    quote: "Unsere Mitarbeiter in der Produktion hatten massive Rückenprobleme. Nach 3 Monaten BGF: Schmerzlevel von 6.2 auf 3.8 gesunken. Das spricht für sich.",
    name: "Michael B.",
    role: "Betriebsleiter",
    company: "Logistik (200 MA)",
    stars: 5,
    highlight: "Schmerz -39%",
  },
]

export function BgfTestimonialSection() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-amber-50/60 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/2" />

      <div className="relative container mx-auto px-4 max-w-6xl">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">Stimmen aus der Praxis</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              Das sagen <span className="text-amber-600">unsere Kunden</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <ScrollReveal key={t.name}>
              <div className="group bg-white rounded-2xl p-6 h-full border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative">
                {/* Highlight badge */}
                <div className="absolute -top-3 left-6">
                  <span className="inline-block bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md">
                    {t.highlight}
                  </span>
                </div>

                <Quote className="h-8 w-8 text-slate-100 mt-2 mb-4" />
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-auto pt-4 border-t border-slate-50">
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                  <p className="text-xs text-slate-400">{t.company}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
