/**
 * PROJ-20: /shop/* Layout
 *
 * Schlankes Layout für den Shop — kein Sidebar, keine klinische Navigation.
 * Enthält den Toaster für Kauf-Feedback (Fehler bei Checkout etc.).
 */

import { Toaster } from "@/components/ui/sonner"
import { CartProvider } from "@/lib/cart-context"
import { CartDrawer } from "@/components/shop/CartDrawer"

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-stone-50">
        {children}
        <CartDrawer />
        <Toaster position="bottom-center" />
      </div>
    </CartProvider>
  )
}
