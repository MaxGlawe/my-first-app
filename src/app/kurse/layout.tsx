/**
 * PROJ-21: /kurse/* Layout — Öffentlicher Website-Shop
 *
 * Schlankes eigenes Layout: KEINE Marketing-Navbar (LandingHeader) — die Shop-
 * Seiten bringen ihren eigenen ShopHeader mit. Enthält den Toaster für
 * Checkout-Feedback.
 */

import type { Metadata } from "next"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/sonner"
import { CartProvider } from "@/lib/cart-context"
import { CartDrawer } from "@/components/shop/CartDrawer"
import { LandingAnalytics } from "@/components/landing/LandingAnalytics"

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Von Physiotherapeuten entwickelte 21-Tage-Challenges für Rücken, Schmerz, Faszien und mehr. Einmal kaufen, lebenslang behalten.",
}

export default function KurseLayout({
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
      {/* Page-View- + UTM-Tracking für alle /kurse/*-Seiten (Shop-Analytics) */}
      <Suspense fallback={null}>
        <LandingAnalytics />
      </Suspense>
    </CartProvider>
  )
}
