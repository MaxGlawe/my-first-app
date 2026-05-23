"use client"

/**
 * PROJ-24: DeckBuyActions — Kauf-Aktionen für die Deck-Detailseite.
 *
 * Kleine Client-Insel innerhalb der Server-Component-Detailseite. Übernimmt:
 *   - "In den Warenkorb" (useCart: add slug + Drawer öffnen / entfernen)
 *   - "Jetzt kaufen":
 *       · eingeloggt  → /api/shop/checkout (Stripe-Session)
 *       · Gast        → kompaktes E-Mail-Formular → /api/shop/public-checkout
 *
 * Analog zum bestehenden Verhalten in /shop/[slug] und /kurse/[slug] — bewusst
 * konsistent, das Cart/Checkout-Backend wird NICHT verändert.
 *
 * Besitz wird serverseitig in page.tsx geprüft; besitzt der Nutzer das Deck,
 * rendert die Seite diese Komponente gar nicht erst (zeigt stattdessen den
 * Besitz-Hinweis). Diese Komponente ist also immer der "kaufbar"-Fall.
 */

import { useEffect, useState, useCallback, type FormEvent } from "react"
import {
  Loader2,
  ShoppingBag,
  CheckCircle2,
  ShieldCheck,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart-context"
import { useConversionTracker } from "@/hooks/use-conversion-tracker"
import { toast } from "sonner"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface DeckBuyActionsProps {
  slug: string
  titel: string
  preis: number
  waehrung: string
  heroBild: string | null
  /** true → eingeloggt (Stripe-Checkout ohne E-Mail-Formular) */
  eingeloggt: boolean
}

export function DeckBuyActions({
  slug,
  titel,
  preis,
  waehrung,
  heroBild,
  eingeloggt,
}: DeckBuyActionsProps) {
  const { add: addToCart, remove: removeFromCart, has: hasInCart, open: openCart } = useCart()
  const { trackConversion } = useConversionTracker()
  const inCart = hasInCart(slug)

  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  // ── Warenkorb ────────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(() => {
    if (inCart) {
      removeFromCart(slug)
      return
    }
    addToCart({ slug, titel, preis, waehrung, hero_bild: heroBild })
    trackConversion("shop_add_to_cart", { slug })
    openCart()
  }, [inCart, removeFromCart, addToCart, openCart, trackConversion, slug, titel, preis, waehrung, heroBild])

  // ── Eingeloggter Kauf: direkte Stripe-Session ──────────────────────────────
  const handleBuyLoggedIn = useCallback(async () => {
    trackConversion("shop_checkout_start", { slugs: [slug] })
    setIsCheckingOut(true)
    try {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug: slug }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Checkout konnte nicht gestartet werden.")
        return
      }
      if (json.url) window.location.href = json.url
    } catch {
      toast.error("Netzwerkfehler. Bitte versuche es erneut.")
    } finally {
      setIsCheckingOut(false)
    }
  }, [slug, trackConversion])

  // ── Gast-Kauf: E-Mail-Formular → public-checkout ───────────────────────────
  const handleBuyGuest = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!EMAIL_RE.test(email)) {
        toast.error("Bitte gib eine gültige E-Mail-Adresse ein.")
        return
      }
      trackConversion("shop_checkout_start", { slugs: [slug] })
      setIsCheckingOut(true)
      try {
        const res = await fetch("/api/shop/public-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productSlug: slug,
            email: email.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
          }),
        })
        const json = await res.json()
        if (!res.ok) {
          toast.error(json.error ?? "Checkout konnte nicht gestartet werden.")
          return
        }
        if (json.url) window.location.href = json.url
      } catch {
        toast.error("Netzwerkfehler. Bitte versuche es erneut.")
      } finally {
        setIsCheckingOut(false)
      }
    },
    [email, firstName, lastName, slug, trackConversion]
  )

  // ── Warenkorb-Button (für beide Modi gleich) ───────────────────────────────
  const cartButton = (
    <button
      type="button"
      onClick={handleAddToCart}
      className={cn(
        "w-full h-11 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-colors",
        inCart
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "border-slate-200 text-slate-600 hover:bg-slate-50"
      )}
    >
      {inCart ? (
        <>
          <CheckCircle2 className="h-4 w-4" />
          Im Warenkorb
          <span className="text-[11px] text-emerald-600 font-normal">· entfernen</span>
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" />
          In den Warenkorb
        </>
      )}
    </button>
  )

  // ── Eingeloggt: direkter Kauf-Button ───────────────────────────────────────
  if (eingeloggt) {
    return (
      <div className="space-y-2.5">
        <Button
          onClick={handleBuyLoggedIn}
          disabled={isCheckingOut}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl h-12 text-base"
        >
          {isCheckingOut ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Wird vorbereitet…
            </>
          ) : (
            "Jetzt kaufen"
          )}
        </Button>
        {cartButton}
        <TrustNote />
      </div>
    )
  }

  // ── Gast: E-Mail-Formular + Warenkorb ──────────────────────────────────────
  return (
    <div className="space-y-2.5">
      <form onSubmit={handleBuyGuest} className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Vorname"
            aria-label="Vorname"
            className="h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
          />
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Nachname"
            aria-label="Nachname"
            className="h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Deine E-Mail-Adresse"
          aria-label="E-Mail-Adresse"
          className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
        />
        <Button
          type="submit"
          disabled={isCheckingOut}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl h-12 text-base"
        >
          {isCheckingOut ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Wird vorbereitet…
            </>
          ) : (
            "Jetzt kaufen"
          )}
        </Button>
      </form>

      {cartButton}

      {/* Hinweis: Zugang per E-Mail */}
      <div className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3.5 py-3">
        <Mail className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
        <p className="text-xs text-emerald-800 leading-relaxed">
          Nach dem Kauf bekommst du automatisch deinen Zugang per E-Mail — kein
          Account-Anlegen vorher nötig.
        </p>
      </div>

      <TrustNote />
    </div>
  )
}

// ── Produktansicht-Tracking ─────────────────────────────────────────────────────
// Eigene Client-Insel, damit der shop_product_view-Event für ALLE Besucher der
// Deck-Detailseite feuert — auch für Besitzer (die DeckBuyActions gar nicht sehen).
export function DeckViewTracker({ slug }: { slug: string }) {
  const { trackConversion } = useConversionTracker()
  useEffect(() => {
    trackConversion("shop_product_view", { slug, produkt_typ: "deck" })
  }, [slug, trackConversion])
  return null
}

// ── Trust-Zeile ───────────────────────────────────────────────────────────────

function TrustNote() {
  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <span>Sichere Zahlung via Stripe — Kreditkarte, SEPA, Sofort</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <span>Sofortiger Zugang nach Zahlungsbestätigung</span>
      </div>
    </div>
  )
}
