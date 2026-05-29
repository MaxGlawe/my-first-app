import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "./ScrollReveal"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"

export function CtaSection() {
  return (
    <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden" style={{ backgroundColor: PAPER }}>
      <div className="relative container mx-auto px-4 max-w-4xl">
        <ScrollReveal>
          <div
            className="overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12 sm:py-16"
            style={{ backgroundColor: GREEN }}
          >
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: PAPER }}
            >
              Starte jetzt.
            </h2>

            <p className="mt-6 text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "rgba(248,245,240,0.8)" }}>
              Ersteinschätzung in 30 Minuten per Video — wir analysieren deine
              Situation und zeigen dir den besten Weg zur Besserung.
            </p>

            <div className="mt-10">
              <Link href="/anfrage">
                <Button
                  size="lg"
                  className="text-base px-6 sm:px-10 h-14 rounded-full font-semibold transition-all hover:-translate-y-0.5 hover:opacity-90"
                  style={{ backgroundColor: PAPER, color: GREEN }}
                >
                  Ersteinschätzung buchen — 69€
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            <p className="mt-5 text-sm" style={{ color: SAND }}>
              Persönlicher Therapeut — keine Verordnung nötig
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
