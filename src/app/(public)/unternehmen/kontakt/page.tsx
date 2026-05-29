import type { Metadata } from "next"
import Link from "next/link"
import { BgfContactForm } from "@/components/landing/bgf/BgfContactForm"
import {
  ArrowLeft,
  Mail,
  Clock,
  Shield,
  Stethoscope,
  CheckCircle2,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Kontakt für Unternehmen | Praxis OS — Betriebliche Gesundheitsförderung",
  description:
    "Sprechen Sie mit uns über betriebliche Gesundheitsförderung für Ihr Team. Stellen Sie Ihre Fragen und nennen Sie uns Ihr präferiertes Modell — wir melden uns innerhalb von 24 Stunden.",
  robots: { index: true, follow: true },
}

const NEXT_STEPS = [
  { title: "Wir melden uns in 24 Stunden", desc: "Persönlich, in der Regel direkt von Max Glawe." },
  { title: "Kostenloses Erstgespräch", desc: "Wir verstehen Ihr Team, Ihre Ziele und Ihren Bedarf." },
  { title: "Individuelles Angebot oder Pilot", desc: "Transparente Empfehlung — ohne Verpflichtung." },
]

const TRUST = [
  { icon: Clock, label: "Antwort in 24 Stunden" },
  { icon: Shield, label: "DSGVO-konform" },
  { icon: Stethoscope, label: "Echte Therapeuten" },
]

export default async function UnternehmenKontaktPage({
  searchParams,
}: {
  searchParams: Promise<{ modell?: string }>
}) {
  const { modell } = await searchParams

  return (
    <div className="min-h-screen bg-landing-bg">
      <div className="container mx-auto px-4 py-12 sm:py-16 max-w-6xl">
        {/* Back link */}
        <Link
          href="/unternehmen"
          className="inline-flex items-center gap-1.5 text-sm text-landing-fg-muted hover:text-landing-accent transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Unternehmen-Übersicht
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-14 items-start">
          {/* ── Left: Reassurance ──────────────────────── */}
          <div className="lg:sticky lg:top-24">
            <span className="text-sm font-semibold text-landing-accent uppercase tracking-widest">
              Kontakt für Unternehmen
            </span>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-landing-fg tracking-tight leading-tight">
              Sprechen wir über die Gesundheit Ihres Teams
            </h1>
            <p className="mt-4 text-lg text-landing-fg-muted leading-relaxed">
              Erzählen Sie uns kurz von Ihrem Unternehmen und Ihren Fragen. Wir
              melden uns persönlich — kostenlos und unverbindlich.
            </p>

            {/* Next steps */}
            <div className="mt-8 space-y-5">
              {NEXT_STEPS.map((step, i) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-landing-accent/10 flex items-center justify-center text-sm font-bold text-landing-accent font-display">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-landing-fg">{step.title}</p>
                    <p className="text-sm text-landing-fg-muted">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Direct contact */}
            <div className="mt-8 rounded-2xl border border-landing-border bg-white p-5">
              <p className="text-xs font-semibold text-landing-fg-subtle uppercase tracking-wider mb-3">
                Lieber direkt?
              </p>
              <a
                href="mailto:physiotherapieglawe@gmx.de"
                className="flex items-center gap-3 text-landing-fg hover:text-landing-accent transition-colors"
              >
                <span className="w-9 h-9 rounded-xl bg-landing-accent/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-landing-accent" />
                </span>
                <span className="text-sm font-medium">physiotherapieglawe@gmx.de</span>
              </a>
            </div>

            {/* Trust */}
            <div className="mt-6 flex flex-wrap gap-4">
              {TRUST.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-landing-fg-muted">
                  <Icon className="h-4 w-4 text-landing-accent" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Form ────────────────────────────── */}
          <div className="rounded-3xl border border-landing-border bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-1 text-landing-accent">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Kostenlos & unverbindlich
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold text-landing-fg mb-6">
              Ihre Anfrage
            </h2>
            <BgfContactForm defaultModell={modell ?? ""} />
          </div>
        </div>
      </div>
    </div>
  )
}
