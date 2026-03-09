"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CreditCard, Shield, Loader2, CheckCircle2, Clock, Gift } from "lucide-react"
import { useSearchParams } from "next/navigation"

const CACHE_KEY = "praxis-os-payment-method-ok"
const CACHE_TTL = 1000 * 60 * 30 // 30 min

interface BillingStatus {
  has_subscription: boolean
  has_payment_method: boolean
  subscription_status?: string
  plan_type?: string
  price_amount?: number
  trial_end?: string
  extra_free_months?: number
  promo_code?: string
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function PaymentSetupGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "needs_setup" | "ok">("loading")
  const [billing, setBilling] = useState<BillingStatus | null>(null)
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
      .then((data: BillingStatus) => {
        setBilling(data)
        if (!data.has_subscription) {
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

  const trialDays = billing?.trial_end ? daysUntil(billing.trial_end) : null
  const planLabel = billing?.plan_type === "yearly" ? "Jahresmitgliedschaft" : "Monatlich"

  // Blocking setup screen
  return (
    <div className="fixed inset-0 z-[99] bg-white flex flex-col overflow-y-auto">
      <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto text-center py-10">
        {/* Icon */}
        <div className="h-20 w-20 rounded-3xl bg-emerald-50 flex items-center justify-center mb-6">
          <CreditCard className="h-10 w-10 text-emerald-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Noch ein Schritt!
        </h1>

        <p className="text-base text-slate-600 leading-relaxed mb-6">
          Hinterlege deine Bankverbindung, damit es nach der Testphase nahtlos weitergeht.
          <span className="font-semibold text-emerald-600"> Es wird jetzt nichts abgebucht.</span>
        </p>

        {/* Subscription details card */}
        {billing && (
          <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Dein Abo</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Plan</span>
                <span className="font-medium text-slate-800">{planLabel}</span>
              </div>
              {billing.price_amount && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Preis ab 2. Monat</span>
                  <span className="font-medium text-slate-800">
                    {formatCurrency(billing.price_amount)} / {billing.plan_type === "yearly" ? "Jahr" : "Monat"}
                  </span>
                </div>
              )}
              {billing.trial_end && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Testphase bis
                  </span>
                  <span className="font-medium text-emerald-600">
                    {formatDate(billing.trial_end)} ({trialDays} Tage)
                  </span>
                </div>
              )}
              {billing.extra_free_months != null && billing.extra_free_months > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Gift className="h-3.5 w-3.5" /> Bonus
                  </span>
                  <span className="font-medium text-emerald-600">
                    +{billing.extra_free_months} Gratis-{billing.extra_free_months === 1 ? "Monat" : "Monate"}
                  </span>
                </div>
              )}
              {billing.promo_code && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Gift className="h-3.5 w-3.5" /> Promo-Code
                  </span>
                  <span className="font-medium text-emerald-600">{billing.promo_code}</span>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Erster Monat kostenfrei — jederzeit kündbar
              </p>
            </div>
          </div>
        )}

        {/* Trust signals */}
        <div className="flex items-center gap-4 text-xs text-slate-400 mb-6">
          <span className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5" /> SSL-verschlüsselt
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> SEPA-Lastschrift
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
          Zahlungsmethode hinterlegen
        </Button>

        <p className="text-center text-xs text-slate-400 mt-3">
          Du wirst zu unserem sicheren Zahlungspartner Stripe weitergeleitet.
        </p>
      </div>
    </div>
  )
}
