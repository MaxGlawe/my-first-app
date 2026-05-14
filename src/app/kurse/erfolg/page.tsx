/**
 * PROJ-21: /kurse/erfolg — Success-Seite nach erfolgreichem Gast-Kauf
 *
 * Stripe leitet nach der Zahlung hierher (success_url). Reine Bestätigungsseite:
 * Der eigentliche Account + das Entitlement werden vom Stripe-Webhook angelegt,
 * die Zugangs-E-Mail verschickt /api/buyer-accounts.
 */

import Link from "next/link"
import { ShopHeader } from "@/components/shop/ShopHeader"
import { CheckCircle2, Mail, ArrowRight } from "lucide-react"

export default function KurseErfolgPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <ShopHeader mode="website" />

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center shadow-sm animate-fade-in-up">
          {/* Häkchen */}
          <div className="h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Kauf erfolgreich
          </h1>
          <p className="text-slate-500 leading-relaxed mb-6">
            Vielen Dank! Deine Zahlung ist eingegangen — dein Kurs gehört dir,
            lebenslang.
          </p>

          {/* Zugangs-Hinweis */}
          <div className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-4 text-left mb-6">
            <Mail className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-900 mb-0.5">
                Dein Zugang kommt per E-Mail
              </p>
              <p className="text-sm text-emerald-800 leading-relaxed">
                Wir haben dir gerade eine E-Mail mit deinem Login geschickt.
                Bitte schau auch im Spam-Ordner nach — manchmal landet sie dort.
              </p>
            </div>
          </div>

          {/* CTAs */}
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl h-12 transition-colors"
          >
            Zum Login
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-sm text-slate-400 mt-4">
            Keine E-Mail erhalten?{" "}
            <Link
              href="/kurse/zugang"
              className="text-emerald-600 font-semibold hover:text-emerald-700 underline underline-offset-2"
            >
              Zugang erneut senden
            </Link>
          </p>
        </div>
      </div>

      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Praxis OS · Alle Preise inkl. MwSt.
          </p>
        </div>
      </footer>
    </div>
  )
}
