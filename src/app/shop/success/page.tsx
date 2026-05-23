"use client"

/**
 * PROJ-20: /shop/success — Kaufbestätigung
 *
 * Wird nach erfolgreichem Stripe-Checkout aufgerufen:
 *   /shop/success?session_id=...
 *
 * Zeigt:
 * - Bestätigungsanimation
 * - "Kauf erfolgreich" Nachricht
 * - Hinweis: Zugang wird aktiviert (Webhook verarbeitet)
 * - CTA → Meine Kurse
 *
 * Kein API-Call hier nötig — der Stripe-Webhook (serverseitig) hat das
 * Entitlement bereits oder wird es in Kürze anlegen. Der User ruft
 * einfach /app/kurse auf.
 */

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, ArrowRight, BookOpen, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShopHeader } from "@/components/shop/ShopHeader"
import { useCart } from "@/lib/cart-context"

// ── Utility ───────────────────────────────────────────────────────────────────

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ")
}

// ── Steps config ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    label: "Zahlung bestätigt",
    delay: 300,
  },
  {
    icon: <Sparkles className="h-5 w-5 text-amber-500" />,
    label: "Challenge wird freigeschaltet",
    delay: 900,
  },
  {
    icon: <BookOpen className="h-5 w-5 text-blue-600" />,
    label: "Bereit zum Starten",
    delay: 1500,
  },
]

// ── Inner component (needs useSearchParams) ───────────────────────────────────

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [visibleSteps, setVisibleSteps] = useState(0)
  const { clear } = useCart()

  // Warenkorb nach erfolgreichem Kauf leeren
  useEffect(() => {
    clear()
  }, [clear])

  // Animate steps in
  useEffect(() => {
    STEPS.forEach((step, i) => {
      setTimeout(() => {
        setVisibleSteps((v) => Math.max(v, i + 1))
      }, step.delay)
    })
  }, [])

  return (
    <div className="max-w-lg mx-auto px-4 py-20 sm:py-32 text-center space-y-10">

      {/* Success icon with pulse */}
      <div className="relative inline-flex items-center justify-center">
        <div className="absolute w-24 h-24 bg-emerald-100 rounded-full animate-ping opacity-25" />
        <div className="relative w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center shadow-sm">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
      </div>

      {/* Headline */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-stone-900">
          Vielen Dank für deinen Kauf!
        </h1>
        <p className="text-stone-500 text-lg leading-relaxed max-w-sm mx-auto">
          Deine Challenge wird sofort freigeschaltet. Gehe jetzt zu{" "}
          <em>Meine Challenges</em> und starte direkt.
        </p>
      </div>

      {/* Animated steps */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 text-left shadow-sm">
        {STEPS.map((step, i) => (
          <div
            key={step.label}
            className={cn(
              "flex items-center gap-3 transition-all duration-500",
              i < visibleSteps
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-3"
            )}
          >
            <div className="w-8 h-8 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-center shrink-0">
              {step.icon}
            </div>
            <span className="text-sm text-stone-700 font-medium">{step.label}</span>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col gap-3">
        <Button
          asChild
          className="bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl h-12 text-base"
        >
          <Link href="/app/kurse">
            Meine Challenges öffnen
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="text-stone-500 hover:text-stone-800"
        >
          <Link href="/shop">Weitere Challenges entdecken</Link>
        </Button>
      </div>

      {/* Debug info in dev */}
      {process.env.NODE_ENV === "development" && sessionId && (
        <p className="text-xs text-stone-300 font-mono">
          session_id: {sessionId}
        </p>
      )}
    </div>
  )
}

// ── Page (wraps in Suspense for useSearchParams) ──────────────────────────────

export default function ShopSuccessPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <ShopHeader showBack backHref="/shop" backLabel="Zum Shop" />
      <Suspense fallback={
        <div className="flex items-center justify-center py-40">
          <div className="w-10 h-10 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
