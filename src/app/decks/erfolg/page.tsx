/**
 * /decks/erfolg — Danke-Seite nach einem Bewegungskarten-Kauf (accountlos).
 *
 * Bewegungskarten brauchen KEIN Konto: Nach dem Kauf bekommt der Käufer eine
 * E-Mail mit seinem persönlichen Karten-Link. Diese Seite bestätigt das und
 * verweist auf das Postfach — kein „anmelden"/„Zugang"-Wording.
 */

import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2, Mail, ShieldAlert, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Danke für deinen Kauf",
  robots: { index: false, follow: false },
}

export default function DeckErfolgPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center animate-fade-in-up">
          {/* Häkchen */}
          <div className="relative mx-auto mb-6 w-20 h-20">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-500" strokeWidth={1.75} />
            </div>
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">
            Kauf erfolgreich
          </p>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Deine Bewegungskarten sind unterwegs
          </h1>
          <p className="text-slate-500 leading-relaxed mb-6">
            Vielen Dank für deinen Kauf! Wir haben dir gerade eine E-Mail mit deinem
            persönlichen <strong className="text-slate-700">Karten-Link</strong> geschickt
            — <strong className="text-slate-700">ganz ohne Konto</strong>. Einfach öffnen
            und loslegen.
          </p>

          {/* Postfach-Hinweis */}
          <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3.5 text-left mb-4">
            <Mail className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-sm text-emerald-900 leading-relaxed">
              Schau in dein E-Mail-Postfach. Falls nichts ankommt, wirf einen Blick in den
              <strong> Werbung-</strong> oder <strong>Spam-Ordner</strong>. Der Link bleibt
              dauerhaft gültig — am besten als Lesezeichen speichern.
            </p>
          </div>

          {/* Sicherheits-Kurzhinweis */}
          <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3.5 text-left mb-7">
            <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800 leading-relaxed">
              Bewege dich nur im geparkten Auto, ruhig und im angenehmen Bereich — die
              Sicherheitskarte liegt deinem Deck bei.
            </p>
          </div>

          <Link
            href="/decks"
            className="inline-flex items-center justify-center gap-1.5 h-12 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-[15px] shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.98] transition-all duration-200"
          >
            Weitere Bewegungskarten ansehen
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} Praxis OS · Physiotherapie Glawe
        </p>
      </div>
    </div>
  )
}
