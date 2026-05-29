/**
 * /karten/* Layout — Accountloser Karten-Zugang (Bewegungskarten).
 *
 * Eigenständiges, schlankes Layout: kein ShopHeader, keine Marketing-Navbar,
 * kein Warenkorb. Die Seiten sind token-spezifisch (?t=…) und werden NICHT
 * indexiert (robots: noindex).
 */

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Deine Bewegungskarten",
  robots: { index: false, follow: false },
}

export default function KartenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen" style={{ backgroundColor: "#F8F5F0" }}>{children}</div>
}
