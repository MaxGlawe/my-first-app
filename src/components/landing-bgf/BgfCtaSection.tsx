import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Phone } from "lucide-react"
import { ScrollReveal } from "@/components/landing/ScrollReveal"

export function BgfCtaSection() {
  return (
    <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-emerald-500" />

      {/* Pattern */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,1) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute top-0 right-0 h-[400px] w-[400px] bg-white/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-0 h-[300px] w-[300px] bg-white/5 blur-[100px] rounded-full" />

      <div className="relative container mx-auto px-4 max-w-4xl text-center">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            Investieren Sie in die Gesundheit
            <br />
            Ihrer Mitarbeiter.
          </h2>

          <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Kostenlose Erstberatung — wir analysieren Ihre Situation,
            zeigen Ihnen den ROI und richten alles ein. In einer Woche sind Ihre Mitarbeiter aktiv.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/anfrage">
              <Button
                size="lg"
                className="bg-white text-indigo-700 hover:bg-indigo-50 text-base px-10 h-14 rounded-full font-semibold shadow-xl shadow-indigo-800/20 transition-all hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Kostenlose Erstberatung
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="tel:+4917612345678">
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 h-14 rounded-full border-white/30 text-white hover:bg-white/10 hover:border-white/50 bg-transparent font-semibold"
              >
                <Phone className="mr-2 h-4 w-4" />
                Direkt anrufen
              </Button>
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4" /> DSGVO-konform
            </span>
            <span>§3 Nr. 34 EStG — steuerlich begünstigt*</span>
            <span>Keine Verordnung nötig</span>
          </div>

          <p className="mt-4 text-xs text-white/40">
            *Steuerliche Begünstigung an Voraussetzungen geknüpft. Klärung mit Ihrem Steuerberater empfohlen.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
