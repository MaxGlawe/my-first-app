import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "./ScrollReveal"

export function CtaSection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
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
            <br />
            Kostenlos.
          </h2>

          <p className="mt-6 text-lg text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            Ihre erste Anfrage ist unverbindlich. Wir melden uns innerhalb von
            24 Stunden persönlich bei Ihnen und besprechen die nächsten Schritte.
          </p>

          <div className="mt-10">
            <Link href="/anfrage">
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50 text-base px-10 h-14 rounded-full font-semibold shadow-xl shadow-emerald-800/20 transition-all hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Kostenlos anfragen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <p className="mt-5 text-sm text-emerald-200/70">
            2 Minuten — Ihr erster Schritt zur Besserung
          </p>

          <p className="mt-3 text-xs text-emerald-200/50">
            Privatleistung — keine Verordnung nötig. Kosten besprechen wir transparent im Erstgespräch.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
