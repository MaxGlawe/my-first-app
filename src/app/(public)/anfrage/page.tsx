import { Metadata } from "next"
import { Calendar, MessageCircle, Clock, Check, ExternalLink } from "lucide-react"
import { IntakeForm } from "@/components/intake/IntakeForm"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const LINE = "#e7e1d6"

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
    <div className="min-h-screen" style={{ backgroundColor: PAPER }}>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-10">
          <h1
            className="text-3xl sm:text-4xl tracking-tight"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
          >
            Wie möchtest du starten?
          </h1>
          <p className="text-base mt-3 max-w-xl mx-auto" style={{ color: MUTED }}>
            Wenn du dich entschieden hast — buche direkt einen Termin. Bist du dir noch
            unsicher, stellen wir dir gerne deine Fragen im Vorfeld.
          </p>
        </div>

        {/* Hard CTA — direct booking */}
        <div
          className="rounded-3xl border-2 bg-white p-6 sm:p-8 shadow-lg mb-8"
          style={{ borderColor: SAND, boxShadow: "0 20px 50px rgba(44,62,45,0.08)" }}
        >
          <div className="flex items-start gap-4 mb-5">
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: GREEN }}
            >
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: GREEN }}>
                Direkt buchen
              </p>
              <h2
                className="text-xl sm:text-2xl leading-tight"
                style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
              >
                Video-Analyse — 30 Min., 69 €
              </h2>
              <p className="text-sm mt-1" style={{ color: MUTED }}>
                Wähle deinen freien Termin in unserem Online-Kalender.
              </p>
            </div>
          </div>

          <ul className="space-y-2 mb-6 text-sm" style={{ color: BODY }}>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 shrink-0 mt-0.5" style={{ color: GREEN }} />
              <span>Termin innerhalb von 24 Stunden möglich</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 shrink-0 mt-0.5" style={{ color: GREEN }} />
              <span>Persönlicher Therapeut über die gesamte Behandlung</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 shrink-0 mt-0.5" style={{ color: GREEN }} />
              <span>Wir sagen dir ehrlich, ob Online-Therapie für dich passt</span>
            </li>
          </ul>

          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-3.5 text-white font-semibold rounded-xl transition-all hover:opacity-90"
            style={{ backgroundColor: GREEN }}
          >
            Termin auswählen
            <ExternalLink className="h-4 w-4" />
          </a>

          <p className="text-xs mt-3 flex items-center gap-1.5" style={{ color: MUTED }}>
            <ExternalLink className="h-3 w-3 shrink-0" />
            Du wirst zur Buchung auf unsere Praxis-Website
            <span className="font-mono" style={{ color: BODY }}>physiotherapie-glawe.de</span>
            weitergeleitet (öffnet in neuem Tab).
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-8">
          <div className="flex-1 h-px" style={{ backgroundColor: LINE }} />
          <span className="text-xs uppercase tracking-wider font-medium" style={{ color: MUTED }}>
            oder du bist dir noch unsicher?
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: LINE }} />
        </div>

        {/* Soft CTA — intake form */}
        <div className="rounded-3xl border bg-white p-6 sm:p-8 shadow-sm" style={{ borderColor: LINE }}>
          <div className="flex items-start gap-4 mb-5">
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "rgba(44,62,45,0.1)" }}
            >
              <MessageCircle className="h-6 w-6" style={{ color: GREEN }} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: GREEN }}>
                Anfrage stellen
              </p>
              <h2
                className="text-xl leading-tight"
                style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
              >
                Wir melden uns persönlich bei dir
              </h2>
              <p className="text-sm mt-1 flex items-center gap-1.5" style={{ color: MUTED }}>
                <Clock className="h-3.5 w-3.5" />
                Antwort innerhalb von 24 Stunden — kostenlos und unverbindlich
              </p>
            </div>
          </div>

          <IntakeForm />
        </div>

        {/* Subtle reassurance below */}
        <p className="text-center text-xs mt-8" style={{ color: MUTED }}>
          Du bist dir nicht sicher, was passt? Beide Wege führen ans Ziel — die Direkt-Buchung
          ist nur schneller.
        </p>
      </div>
    </div>
  )
}
