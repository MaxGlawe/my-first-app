import { Metadata } from "next"
import Link from "next/link"
import { Calendar, MessageCircle, ArrowRight, Clock, Check, ExternalLink } from "lucide-react"
import { IntakeForm } from "@/components/intake/IntakeForm"

export const metadata: Metadata = {
  title: "Termin buchen oder Anfrage stellen | Online Physiotherapie — Praxis OS",
  description:
    "Buchen Sie direkt Ihren Termin für die Video-Analyse oder stellen Sie eine unverbindliche Anfrage — wir melden uns innerhalb von 24 Stunden.",
}

const BOOKING_URL =
  "https://physiotherapie-glawe.de/termin-buchen.html" +
  "?service=video-sprechstunde-praxis-os" +
  "&utm_source=praxis-os-website" +
  "&utm_medium=cta" +
  "&utm_campaign=direct-booking"

export default function AnfragePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Wie möchtest du starten?
        </h1>
        <p className="text-base text-slate-500 mt-3 max-w-xl mx-auto">
          Wenn du dich entschieden hast — buche direkt einen Termin. Bist du dir noch
          unsicher, stellen wir dir gerne deine Fragen im Vorfeld.
        </p>
      </div>

      {/* Hard CTA — direct booking */}
      <div className="rounded-3xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 sm:p-8 shadow-lg shadow-emerald-500/10 mb-8">
        <div className="flex items-start gap-4 mb-5">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              Direkt buchen
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              Video-Analyse — 30 Min., 69 €
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Wähle deinen freien Termin in unserem Online-Kalender.
            </p>
          </div>
        </div>

        <ul className="space-y-2 mb-6 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Termin innerhalb von 24 Stunden möglich</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Persönlicher Therapeut über die gesamte Behandlung</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Wir sagen dir ehrlich, ob Online-Therapie für dich passt</span>
          </li>
        </ul>

        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5"
        >
          Termin auswählen
          <ExternalLink className="h-4 w-4" />
        </a>

        <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
          <ExternalLink className="h-3 w-3 shrink-0" />
          Du wirst zur Buchung auf unsere Praxis-Website
          <span className="font-mono text-slate-600">physiotherapie-glawe.de</span>
          weitergeleitet (öffnet in neuem Tab).
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 my-8">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
          oder du bist dir noch unsicher?
        </span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Soft CTA — intake form */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-start gap-4 mb-5">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
            <MessageCircle className="h-6 w-6 text-slate-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Anfrage stellen
            </p>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              Wir melden uns persönlich bei dir
            </h2>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Antwort innerhalb von 24 Stunden — kostenlos und unverbindlich
            </p>
          </div>
        </div>

        <IntakeForm />
      </div>

      {/* Subtle reassurance below */}
      <p className="text-center text-xs text-slate-400 mt-8">
        Du bist dir nicht sicher, was passt? Beide Wege führen ans Ziel — die Direkt-Buchung
        ist nur schneller.
      </p>
    </div>
  )
}
