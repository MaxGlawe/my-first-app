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

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const LINE = "#e7e1d6"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

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
    <div className="min-h-screen" style={{ backgroundColor: PAPER }}>
      <ShopHeader mode="website" showBack backHref="/kurse" backLabel="Zum Shop" />

      <div className="max-w-md mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {status === "sent" ? (
          <div
            className="bg-white rounded-2xl border p-8 text-center shadow-sm animate-fade-in-up"
            style={{ borderColor: LINE }}
          >
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: "rgba(44,62,45,0.1)" }}
            >
              <CheckCircle2 className="h-8 w-8" style={{ color: GREEN }} />
            </div>
            <h1 className="text-xl mb-2" style={{ ...serif, color: INK }}>
              E-Mail unterwegs
            </h1>
            <p className="leading-relaxed" style={{ color: MUTED }}>
              Falls ein Konto mit dieser E-Mail-Adresse existiert, haben wir dir
              gerade einen Zugangslink geschickt. Bitte schau auch im Spam-Ordner
              nach.
            </p>
          </div>
        ) : (
          <div
            className="bg-white rounded-2xl border p-8 shadow-sm animate-fade-in-up"
            style={{ borderColor: LINE }}
          >
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center mb-5"
              style={{ backgroundColor: "rgba(44,62,45,0.1)" }}
            >
              <KeyRound className="h-6 w-6" style={{ color: GREEN }} />
            </div>
            <h1 className="text-xl mb-2" style={{ ...serif, color: INK }}>
              Zugang erneut senden
            </h1>
            <p className="text-sm leading-relaxed mb-6" style={{ color: MUTED }}>
              Du hast deine Zugangs-E-Mail nicht gefunden? Gib die E-Mail-Adresse
              ein, mit der du gekauft hast — wir schicken dir einen neuen
              Zugangslink.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                  style={{ color: GREEN }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Deine E-Mail-Adresse"
                  aria-label="E-Mail-Adresse"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border text-sm outline-none transition-all duration-200 focus:bg-white focus:ring-4 focus:ring-[#2C3E2D]/15 focus:border-[#2C3E2D]/40"
                  style={{ backgroundColor: PAPER, borderColor: LINE, color: INK }}
                />
              </div>

              {error && (
                <p className="text-sm text-rose-600 font-medium">{error}</p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full flex items-center justify-center gap-2 disabled:opacity-60 text-white font-semibold rounded-xl h-12 transition-opacity hover:opacity-90"
                style={{ backgroundColor: GREEN }}
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

      <footer className="border-t py-8" style={{ borderColor: LINE }}>
        <div className="max-w-md mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs" style={{ color: MUTED }}>
            © {new Date().getFullYear()} Praxis OS · Alle Preise inkl. MwSt.
          </p>
        </div>
      </footer>
    </div>
  )
}
