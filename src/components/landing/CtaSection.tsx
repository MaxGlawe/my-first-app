import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "./ScrollReveal"

export function CtaSection() {
  return (
    <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500" />

      {/* Decorative patterns */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,1) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute top-0 right-0 h-[400px] w-[400px] bg-white/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-0 h-[300px] w-[300px] bg-teal-400/10 blur-[100px] rounded-full" />

      <div className="relative container mx-auto px-4 max-w-4xl text-center">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            Starten Sie jetzt.
          </h2>

          <p className="mt-6 text-lg text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            Ersteinschätzung in 20 Minuten per Video — wir analysieren Ihre
            Situation und zeigen Ihnen den besten Weg zur Besserung.
          </p>

          <div className="mt-10">
            <Link href="/anfrage">
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50 text-base px-6 sm:px-10 h-14 rounded-full font-semibold shadow-xl shadow-emerald-800/20 transition-all hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Ersteinschätzung buchen — 29€
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <p className="mt-5 text-sm text-emerald-200/70">
            Wird auf Ihre Behandlung angerechnet — keine Verordnung nötig
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
