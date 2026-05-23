/**
 * PROJ-24: /decks/* Layout — Öffentliche Karten-Deck-Seiten (Website-Shop).
 *
 * Eigenes schlankes Layout analog zu /kurse: KEINE Marketing-Navbar — die
 * Deck-Seiten bringen ihren eigenen ShopHeader mit. Stellt den Warenkorb-
 * Context + Drawer und den Toaster für Checkout-Feedback bereit (der
 * CartProvider aus /kurse umspannt /decks NICHT, daher hier eigener Provider).
 */

import type { Metadata } from "next"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/sonner"
import { CartProvider } from "@/lib/cart-context"
import { CartDrawer } from "@/components/shop/CartDrawer"
import { LandingAnalytics } from "@/components/landing/LandingAnalytics"

export const metadata: Metadata = {
  title: "Bewegungskarten",
  description:
    "Digitale Bewegungskarten von Praxis OS — kurze Bewegungsimpulse für deinen Alltag. Einmal kaufen, lebenslang behalten.",
}

export default function DecksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-slate-50">
        {children}
        <CartDrawer />
        <Toaster position="bottom-center" />
      </div>
      {/* Page-View- + UTM-Tracking für alle /decks/*-Seiten (Shop-Analytics) */}
      <Suspense fallback={null}>
        <LandingAnalytics />
      </Suspense>
    </CartProvider>
  )
}
