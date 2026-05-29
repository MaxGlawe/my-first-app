import type { Metadata } from "next"
import { BgfHeroSection } from "@/components/landing/bgf/BgfHeroSection"
import { BgfProblemSection } from "@/components/landing/bgf/BgfProblemSection"
import { BgfRoiCalculator } from "@/components/landing/bgf/BgfRoiCalculator"
import { BgfTherapeutSection } from "@/components/landing/bgf/BgfTherapeutSection"
import { BgfJourneySection } from "@/components/landing/bgf/BgfJourneySection"
import { BgfTaxSection } from "@/components/landing/bgf/BgfTaxSection"
import { BgfPricingSection } from "@/components/landing/bgf/BgfPricingSection"
import { BgfCredentialsSection } from "@/components/landing/bgf/BgfCredentialsSection"
import { BgfFaqSection } from "@/components/landing/bgf/BgfFaqSection"
import { BgfCtaSection } from "@/components/landing/bgf/BgfCtaSection"

export const metadata: Metadata = {
  title: "Ihr Therapeut für Ihr Unternehmen | Praxis OS — Betriebliche Gesundheitsförderung",
  description:
    "Ein echter Physiotherapeut kümmert sich um die Gesundheit Ihrer Mitarbeitenden — begleitet durch eine smarte App. Weniger Ausfall, fittere Teams, steuerlich gefördert über zertifizierte Präventionskurse. Jetzt Kosten berechnen.",
  keywords: [
    "Betriebliche Gesundheitsförderung",
    "BGF",
    "Therapeut für Unternehmen",
    "Betriebliches Gesundheitsmanagement",
    "BGM",
    "Mitarbeitergesundheit",
    "Physiotherapie Unternehmen",
    "Rückenschmerzen Mitarbeiter",
    "Präsentismus Kosten",
    "Fehlzeiten reduzieren",
    "§3 Nr. 34 EStG",
  ],
  openGraph: {
    title: "Ihr Therapeut für Ihr Unternehmen — Praxis OS",
    description:
      "Ein echter Physiotherapeut für Ihr ganzes Team. Messbar weniger Ausfall, fittere Mitarbeitende, steuerlich gefördert.",
    type: "website",
    locale: "de_DE",
  },
}

export default function UnternehmenPage() {
  return (
    <>
      <BgfHeroSection />
      <BgfProblemSection />
      <BgfRoiCalculator />
      <BgfTherapeutSection />
      <BgfJourneySection />
      <BgfTaxSection />
      <BgfPricingSection />
      <BgfCredentialsSection />
      <BgfFaqSection />
      <BgfCtaSection />
    </>
  )
}
