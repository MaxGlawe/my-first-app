"use client"

/**
 * PROJ-21: /kurse/zugang — "Zugang erneut senden"
 *
 * Käufer, die ihre Zugangs-E-Mail nicht finden, geben hier ihre Adresse ein und
 * bekommen einen neuen Zugangslink. Aus Sicherheitsgründen (keine Account-
 * Enumeration) gibt der Endpunkt immer dieselbe Antwort — egal ob die E-Mail
 * im System existiert.
 */

import { useState, type FormEvent } from "react"
import { ShopHeader } from "@/components/shop/ShopHeader"
import { Mail, Loader2, CheckCircle2, KeyRound } from "lucide-react"

export default function KurseZugangPage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setError(null)
    try {
      const res = await fetch("/api/shop/resend-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? "Anfrage konnte nicht verarbeitet werden.")
        setStatus("idle")
        return
      }
      setStatus("sent")
    } catch {
      setError("Netzwerkfehler. Bitte versuche es erneut.")
      setStatus("idle")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ShopHeader mode="website" showBack backHref="/kurse" backLabel="Zum Shop" />

      <div className="max-w-md mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {status === "sent" ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm animate-fade-in-up">
            <div className="h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">E-Mail unterwegs</h1>
            <p className="text-slate-500 leading-relaxed">
              Falls ein Konto mit dieser E-Mail-Adresse existiert, haben wir dir
              gerade einen Zugangslink geschickt. Bitte schau auch im Spam-Ordner
              nach.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in-up">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-5">
              <KeyRound className="h-6 w-6 text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">
              Zugang erneut senden
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Du hast deine Zugangs-E-Mail nicht gefunden? Gib die E-Mail-Adresse
              ein, mit der du gekauft hast — wir schicken dir einen neuen
              Zugangslink.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Deine E-Mail-Adresse"
                  aria-label="E-Mail-Adresse"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              {error && (
                <p className="text-sm text-rose-600 font-medium">{error}</p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold rounded-xl h-12 transition-colors"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Wird gesendet…
                  </>
                ) : (
                  "Zugangslink senden"
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-md mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Praxis OS · Alle Preise inkl. MwSt.
          </p>
        </div>
      </footer>
    </div>
  )
}
