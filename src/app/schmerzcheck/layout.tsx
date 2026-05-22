import type { Metadata } from "next"
import { Cormorant_Garamond } from "next/font/google"

/**
 * PROJ-23: Schmerzcheck funnel layout.
 * Loads the Cormorant Garamond italic accent font (scoped to this route tree)
 * and applies the warm "paper" background. noindex — this is a paid-ad landing
 * page and must not compete with the practice's SEO.
 */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["500", "600"],
  variable: "--font-cormorant",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Dein 5-Minuten-Schmerzcheck — Praxis OS",
  description:
    "Die strukturierte Bewegungs-Standortbestimmung. In 5 Minuten weißt du, wo du stehst. Klinisch fundiert, von Therapeuten entwickelt.",
  robots: { index: false, follow: false },
}

export default function SchmerzcheckLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${cormorant.variable} sc-paper-bg min-h-screen text-[#0f172a]`}>
      {children}
    </div>
  )
}
