/**
 * PROJ-21: /kurse/erfolg — Success-Seite nach erfolgreichem Gast-Kauf
 *
 * Stripe leitet nach der Zahlung hierher (success_url). Reine Bestätigungsseite:
 * Der eigentliche Account + das Entitlement werden vom Stripe-Webhook angelegt,
 * die Zugangs-E-Mail verschickt /api/buyer-accounts.
 */

import Link from "next/link"
import { ShopHeader } from "@/components/shop/ShopHeader"
import { ClearCartOnMount } from "@/components/shop/ClearCartOnMount"
import { CheckCircle2, Mail, ArrowRight } from "lucide-react"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const LINE = "#e7e1d6"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

export default function KurseErfolgPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: PAPER }}>
      <ClearCartOnMount />
      <ShopHeader mode="website" />

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div
          className="bg-white rounded-2xl border p-8 sm:p-10 text-center shadow-sm animate-fade-in-up"
          style={{ borderColor: LINE }}
        >
          {/* Häkchen */}
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: "rgba(44,62,45,0.1)" }}
          >
            <CheckCircle2 className="h-8 w-8" style={{ color: GREEN }} />
          </div>

          <h1 className="text-2xl mb-2" style={{ ...serif, color: INK }}>
            Kauf erfolgreich
          </h1>
          <p className="leading-relaxed mb-6" style={{ color: MUTED }}>
            Vielen Dank! Deine Zahlung ist eingegangen — deine Challenge gehört dir,
            lebenslang.
          </p>

          {/* Zugangs-Hinweis */}
          <div
            className="flex items-start gap-3 rounded-xl px-4 py-4 text-left mb-6"
            style={{ backgroundColor: "rgba(44,62,45,0.05)" }}
          >
            <Mail className="h-5 w-5 mt-0.5 shrink-0" style={{ color: GREEN }} />
            <div>
              <p className="text-sm font-semibold mb-0.5" style={{ color: INK }}>
                Dein Zugang kommt per E-Mail
              </p>
              <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                Wir haben dir gerade eine E-Mail mit deinem Login geschickt.
                Bitte schau auch im Spam-Ordner nach — manchmal landet sie dort.
              </p>
            </div>
          </div>

          {/* CTAs */}
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center gap-2 text-white font-semibold rounded-xl h-12 transition-opacity hover:opacity-90"
            style={{ backgroundColor: GREEN }}
          >
            Zum Login
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-sm mt-4" style={{ color: MUTED }}>
            Keine E-Mail erhalten?{" "}
            <Link
              href="/kurse/zugang"
              className="font-semibold underline underline-offset-2 hover:opacity-80"
              style={{ color: GREEN }}
            >
              Zugang erneut senden
            </Link>
          </p>
        </div>
      </div>

      <footer className="border-t py-8" style={{ borderColor: LINE }}>
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs" style={{ color: MUTED }}>
            © {new Date().getFullYear()} Praxis OS · Alle Preise inkl. MwSt.
          </p>
        </div>
      </footer>
    </div>
  )
}
