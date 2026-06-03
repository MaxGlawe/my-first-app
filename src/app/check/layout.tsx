import type { Metadata } from "next"
import { Cormorant_Garamond } from "next/font/google"
import { MetaPixel } from "@/components/schmerzcheck/MetaPixel"

/**
 * PROJ-23 / Phase 2: Schmerzcheck assessment layout.
 * Same visual language as the landing page (Cormorant accent + paper bg),
 * noindex (token-gated funnel surface).
 */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["500", "600"],
  variable: "--font-cormorant",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Dein Schmerzcheck — Praxis OS",
  description: "Deine strukturierte Bewegungs-Standortbestimmung in 5 Minuten.",
  robots: { index: false, follow: false },
}

export default function CheckLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${cormorant.variable} sc-paper-bg min-h-screen text-[#0f172a]`}>
      <MetaPixel />
      {children}
    </div>
  )
}
