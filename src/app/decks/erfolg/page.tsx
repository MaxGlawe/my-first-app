/**
 * /decks/erfolg — Danke-Seite nach einem Bewegungskarten-Kauf (accountlos).
 *
 * Bewegungskarten brauchen KEIN Konto: Nach dem Kauf bekommt der Käufer eine
 * E-Mail mit seinem persönlichen Karten-Link. Diese Seite bestätigt das und
 * verweist auf das Postfach — kein „anmelden"/„Zugang"-Wording.
 *
 * Premium-Markenwelt (Paper/Ink/Green/Sand, Serif-Headlines).
 */

import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2, Mail, ShieldAlert, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Danke für deinen Kauf",
  robots: { index: false, follow: false },
}

// ── Premium-Markenwelt (Masterclass-Format) ──────────────────────────────────

const INK = "#0f172a"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const LINE = "#e7e1d6"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

export default function DeckErfolgPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div
          className="bg-white rounded-3xl shadow-xl border p-8 text-center animate-fade-in-up"
          style={{ borderColor: LINE }}
        >
          {/* Häkchen */}
          <div className="relative mx-auto mb-6 w-20 h-20">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(44,62,45,0.16) 0%, transparent 70%)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle2 className="h-16 w-16" style={{ color: GREEN }} strokeWidth={1.75} />
            </div>
          </div>

          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GREEN }}>
            Kauf erfolgreich
          </p>
          <h1 className="text-2xl mb-2" style={{ ...serif, color: INK }}>
            Deine Bewegungskarten sind unterwegs
          </h1>
          <p className="leading-relaxed mb-6" style={{ color: MUTED }}>
            Vielen Dank für deinen Kauf! Wir haben dir gerade eine E-Mail mit deinem
            persönlichen <strong style={{ color: INK }}>Karten-Link</strong> geschickt
            — <strong style={{ color: INK }}>ganz ohne Konto</strong>. Einfach öffnen
            und loslegen.
          </p>

          {/* Postfach-Hinweis */}
          <div
            className="flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-left mb-4"
            style={{ backgroundColor: "rgba(44,62,45,0.05)", borderColor: LINE }}
          >
            <Mail className="h-5 w-5 mt-0.5 shrink-0" style={{ color: GREEN }} />
            <p className="text-sm leading-relaxed" style={{ color: INK }}>
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
            className="inline-flex items-center justify-center gap-1.5 h-12 px-6 rounded-xl text-white font-semibold text-[15px] shadow-lg shadow-black/10 active:scale-[0.98] transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: GREEN }}
          >
            Weitere Bewegungskarten ansehen
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: MUTED }}>
          © {new Date().getFullYear()} Praxis OS · Physiotherapie Glawe
        </p>
      </div>
    </div>
  )
}
