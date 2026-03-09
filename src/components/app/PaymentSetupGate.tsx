"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CreditCard, Shield, Loader2, CheckCircle2 } from "lucide-react"
import { useSearchParams } from "next/navigation"

const CACHE_KEY = "praxis-os-payment-method-ok"
const CACHE_TTL = 1000 * 60 * 30 // 30 min

export function PaymentSetupGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "needs_setup" | "ok">("loading")
  const [redirecting, setRedirecting] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    // If just returned from successful Stripe setup, clear cache & re-check
    if (searchParams?.get("payment_setup") === "success") {
      localStorage.removeItem(CACHE_KEY)
    }

    // Check cache first
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { ok, ts } = JSON.parse(cached)
      if (ok && Date.now() - ts < CACHE_TTL) {
        setStatus("ok")
        return
      }
    }

    // Fetch billing status
    fetch("/api/me/billing/status")
      .then((res) => res.json())
      .then((data) => {
        if (!data.has_subscription) {
          // No subscription = no billing needed (free user or not set up yet)
          localStorage.setItem(CACHE_KEY, JSON.stringify({ ok: true, ts: Date.now() }))
          setStatus("ok")
        } else if (data.has_payment_method) {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ ok: true, ts: Date.now() }))
          setStatus("ok")
        } else {
          localStorage.removeItem(CACHE_KEY)
          setStatus("needs_setup")
        }
      })
      .catch(() => {
        // On error, don't block the user
        setStatus("ok")
      })
  }, [searchParams])

  async function handleSetup() {
    setRedirecting(true)
    try {
      const res = await fetch("/api/me/billing/setup-checkout", { method: "POST" })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error ?? "Fehler beim Öffnen der Zahlungseinrichtung.")
        setRedirecting(false)
      }
    } catch {
      alert("Verbindungsfehler. Bitte erneut versuchen.")
      setRedirecting(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (status === "ok") {
    return <>{children}</>
  }

  // Blocking setup screen
  return (
    <div className="fixed inset-0 z-[99] bg-white flex flex-col">
      <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto text-center">
        {/* Icon */}
        <div className="h-24 w-24 rounded-3xl bg-emerald-50 flex items-center justify-center mb-8">
          <CreditCard className="h-12 w-12 text-emerald-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-3">
          Zahlungsmethode einrichten
        </h1>

        <p className="text-base text-slate-600 leading-relaxed mb-2">
          Bevor du loslegen kannst, hinterlege bitte deine Bankverbindung.
          Dein <span className="font-semibold text-emerald-600">erster Monat bleibt kostenfrei</span> —
          es wird jetzt nichts abgebucht.
        </p>

        <p className="text-sm text-slate-400 mb-8">
          Du kannst deine Zahlungsmethode jederzeit unter &quot;Meine Mitgliedschaft&quot; ändern.
        </p>

        {/* Trust signals */}
        <div className="flex items-center gap-4 text-xs text-slate-400 mb-10">
          <span className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5" /> SSL-verschlüsselt
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> SEPA-Lastschrift
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Jederzeit kündbar
          </span>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-10 max-w-md mx-auto w-full">
        <Button
          onClick={handleSetup}
          disabled={redirecting}
          className="w-full h-14 text-base font-semibold rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 transition-opacity"
        >
          {redirecting ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <CreditCard className="mr-2 h-5 w-5" />
          )}
          IBAN hinterlegen
        </Button>

        <p className="text-center text-xs text-slate-400 mt-3">
          Du wirst zu unserem sicheren Zahlungspartner Stripe weitergeleitet.
        </p>
      </div>
    </div>
  )
}
