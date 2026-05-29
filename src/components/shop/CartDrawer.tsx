"use client"

/**
 * Warenkorb-Drawer (Slide-over von rechts).
 *
 * - Listet alle Artikel (Bild, Titel, Preis, Entfernen-Button).
 * - Gesamtsumme + "Zur Kasse".
 * - Leerzustand.
 * - Checkout kennt den Login-Status (Supabase-Browser-Session):
 *     eingeloggt → POST /api/shop/checkout  { slugs }
 *     Gast       → Name+E-Mail-Formular → POST /api/shop/public-checkout
 *                  { slugs, firstName, lastName, email }
 *
 * Stil wie der restliche Shop (Masterclass-Format): warmes Papier, Tinte,
 * Anthrazit-Grün, Sand · ruhig, klar, premium, du-Form, deutsch.
 */

import { useEffect, useState, type FormEvent } from "react"
import { ShoppingBag, X, Trash2, Loader2, ArrowRight, ShieldCheck, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart-context"
import { useConversionTracker } from "@/hooks/use-conversion-tracker"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const MUTED = "#64748b"
const LINE = "#e7e1d6"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function CartDrawer() {
  const { items, count, total, remove, isOpen, close } = useCart()
  const { trackConversion } = useConversionTracker()

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  // Gast-Felder
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  // Login-Status beim Öffnen ermitteln (Supabase-Browser-Session)
  useEffect(() => {
    if (!isOpen) return
    let active = true
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setIsLoggedIn(!!data.session)
      })
      .catch(() => {
        if (active) setIsLoggedIn(false)
      })
    return () => {
      active = false
    }
  }, [isOpen])

  // Body-Scroll-Lock + ESC bei offenem Drawer
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      document.removeEventListener("keydown", onKey)
    }
  }, [isOpen, close])

  // Beim Schließen das Gast-Formular zurücksetzen
  useEffect(() => {
    if (!isOpen) setShowGuestForm(false)
  }, [isOpen])

  const slugs = items.map((i) => i.slug)

  // ── Checkout für eingeloggte Nutzer ──────────────────────────────────────
  const startMemberCheckout = async () => {
    if (slugs.length === 0) return
    setIsCheckingOut(true)
    try {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs }),
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
  }

  // ── Checkout für Gäste ───────────────────────────────────────────────────
  const startGuestCheckout = async (e: FormEvent) => {
    e.preventDefault()
    if (slugs.length === 0) return
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Bitte gib deinen Vor- und Nachnamen ein.")
      return
    }
    if (!EMAIL_RE.test(email)) {
      toast.error("Bitte gib eine gültige E-Mail-Adresse ein.")
      return
    }
    setIsCheckingOut(true)
    try {
      const res = await fetch("/api/shop/public-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slugs,
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
  }

  // "Zur Kasse" — Verzweigung nach Login-Status
  const handleCheckoutClick = () => {
    if (slugs.length > 0) trackConversion("shop_checkout_start", { slugs })
    if (isLoggedIn) {
      void startMemberCheckout()
    } else {
      setShowGuestForm(true)
    }
  }

  return (
    <div
      className={cn("fixed inset-0 z-[60]", !isOpen && "pointer-events-none")}
      aria-hidden={!isOpen}
    >
      {/* Overlay */}
      <button
        type="button"
        onClick={close}
        aria-label="Warenkorb schließen"
        className={cn(
          "absolute inset-0 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        style={{ backgroundColor: "rgba(15,23,42,0.40)" }}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-label="Warenkorb"
        className={cn(
          "absolute right-0 top-0 bottom-0 w-[90%] max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Kopf */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: LINE }}
        >
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5" style={{ color: GREEN }} />
            <h2
              className="text-base"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
            >
              Warenkorb
              {count > 0 && (
                <span className="ml-2 text-sm font-medium" style={{ color: MUTED }}>
                  {count} {count === 1 ? "Artikel" : "Artikel"}
                </span>
              )}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Schließen"
            className="h-9 w-9 flex items-center justify-center rounded-full transition-colors hover:bg-black/[0.04]"
            style={{ color: MUTED }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Inhalt */}
        {count === 0 ? (
          // ── Leerzustand ────────────────────────────────────────────────
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: PAPER }}
            >
              <ShoppingBag className="h-7 w-7" style={{ color: SAND }} />
            </div>
            <div>
              <p
                className="text-base"
                style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
              >
                Dein Warenkorb ist leer
              </p>
              <p className="text-sm mt-1 max-w-xs" style={{ color: MUTED }}>
                Füge Challenges hinzu und kaufe mehrere auf einmal.
              </p>
            </div>
            <Button
              onClick={close}
              variant="outline"
              className="rounded-xl mt-1 hover:bg-black/[0.03]"
              style={{ borderColor: SAND, color: GREEN, backgroundColor: "transparent" }}
            >
              Weiter stöbern
            </Button>
          </div>
        ) : (
          <>
            {/* Artikel-Liste */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {items.map((item) => (
                <div
                  key={item.slug}
                  className="flex items-center gap-3 p-2.5 rounded-2xl border bg-white"
                  style={{ borderColor: LINE }}
                >
                  <div
                    className="h-16 w-16 rounded-xl overflow-hidden shrink-0"
                    style={{ backgroundColor: PAPER }}
                  >
                    {item.hero_bild ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.hero_bild}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: SAND }}
                      >
                        <span
                          className="text-xl select-none"
                          style={{
                            fontFamily: "var(--font-serif)",
                            fontWeight: 600,
                            color: "rgba(255,255,255,0.92)",
                          }}
                        >
                          {item.titel.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm leading-snug line-clamp-2"
                      style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
                    >
                      {item.titel}
                    </p>
                    <p className="text-sm font-bold mt-1" style={{ color: INK }}>
                      {item.preis.toLocaleString("de-DE", { minimumFractionDigits: 0 })} €
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.slug)}
                    aria-label={`${item.titel} entfernen`}
                    className="h-9 w-9 flex items-center justify-center rounded-full transition-colors shrink-0 hover:text-rose-600 hover:bg-rose-50"
                    style={{ color: MUTED }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Fuß: Summe + Checkout */}
            <div
              className="border-t p-5 space-y-4 shrink-0 bg-white"
              style={{ borderColor: LINE }}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium" style={{ color: MUTED }}>
                  Gesamt
                </span>
                <span
                  className="text-2xl"
                  style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
                >
                  {total.toLocaleString("de-DE", { minimumFractionDigits: 0 })} €
                </span>
              </div>
              <p className="text-xs -mt-2" style={{ color: MUTED }}>
                Einmalig · Lebenslanger Zugriff · inkl. MwSt.
              </p>

              {showGuestForm ? (
                // ── Gast-Formular ──────────────────────────────────────────
                <form onSubmit={startGuestCheckout} className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Vorname"
                      aria-label="Vorname"
                      className="h-11 px-4 rounded-xl border text-sm outline-none transition-all duration-200 focus:bg-white focus:ring-4 focus:ring-[#2C3E2D]/15 focus:border-[#2C3E2D]/40"
                      style={{ backgroundColor: PAPER, borderColor: LINE, color: INK }}
                    />
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Nachname"
                      aria-label="Nachname"
                      className="h-11 px-4 rounded-xl border text-sm outline-none transition-all duration-200 focus:bg-white focus:ring-4 focus:ring-[#2C3E2D]/15 focus:border-[#2C3E2D]/40"
                      style={{ backgroundColor: PAPER, borderColor: LINE, color: INK }}
                    />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Deine E-Mail-Adresse"
                    aria-label="E-Mail-Adresse"
                    className="w-full h-11 px-4 rounded-xl border text-sm outline-none transition-all duration-200 focus:bg-white focus:ring-4 focus:ring-[#2C3E2D]/15 focus:border-[#2C3E2D]/40"
                    style={{ backgroundColor: PAPER, borderColor: LINE, color: INK }}
                  />
                  <div
                    className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                    style={{ backgroundColor: "rgba(44,62,45,0.05)" }}
                  >
                    <Mail className="h-4 w-4 mt-0.5 shrink-0" style={{ color: GREEN }} />
                    <p className="text-xs leading-relaxed" style={{ color: INK }}>
                      Nach dem Kauf bekommst du deinen Zugang per E-Mail — kein
                      Account-Anlegen vorher nötig.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={isCheckingOut}
                    className="w-full text-white font-semibold rounded-xl h-12 text-base hover:opacity-90"
                    style={{ backgroundColor: GREEN }}
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Wird vorbereitet…
                      </>
                    ) : (
                      <>
                        Jetzt kaufen
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowGuestForm(false)}
                    className="w-full text-xs transition-colors pt-1 hover:opacity-80"
                    style={{ color: MUTED }}
                  >
                    Zurück zum Warenkorb
                  </button>
                </form>
              ) : (
                // ── Standard-Checkout-Button ───────────────────────────────
                <>
                  <Button
                    onClick={handleCheckoutClick}
                    disabled={isCheckingOut || isLoggedIn === null}
                    className="w-full text-white font-semibold rounded-xl h-12 text-base hover:opacity-90"
                    style={{ backgroundColor: GREEN }}
                  >
                    {isCheckingOut || isLoggedIn === null ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isCheckingOut ? "Wird vorbereitet…" : "Wird geladen…"}
                      </>
                    ) : (
                      <>
                        Zur Kasse
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                  <div
                    className="flex items-center justify-center gap-2 text-xs"
                    style={{ color: MUTED }}
                  >
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>Sichere Zahlung via Stripe</span>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
