/**
 * PROJ-21: /kurse/* Layout — Öffentlicher Website-Shop
 *
 * Schlankes eigenes Layout: KEINE Marketing-Navbar (LandingHeader) — die Shop-
 * Seiten bringen ihren eigenen ShopHeader mit. Enthält den Toaster für
 * Checkout-Feedback.
 */

import type { Metadata } from "next"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "Kurse",
  description:
    "Von Physiotherapeuten entwickelte 21-Tage-Kurse für Rücken, Schmerz, Faszien und mehr. Einmal kaufen, lebenslang behalten.",
}

export default function KurseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {children}
      <Toaster position="bottom-center" />
    </div>
  )
}
