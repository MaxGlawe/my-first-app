import type { Metadata } from "next"
import { BgfHeroSection } from "@/components/landing-bgf/BgfHeroSection"
import { BgfProblemSection } from "@/components/landing-bgf/BgfProblemSection"
import { BgfSolutionSection } from "@/components/landing-bgf/BgfSolutionSection"
import { BgfFeaturesSection } from "@/components/landing-bgf/BgfFeaturesSection"
import { BgfRoiSection } from "@/components/landing-bgf/BgfRoiSection"
import { BgfPricingSection } from "@/components/landing-bgf/BgfPricingSection"
import { BgfTestimonialSection } from "@/components/landing-bgf/BgfTestimonialSection"
import { BgfFaqSection } from "@/components/landing-bgf/BgfFaqSection"
import { BgfCtaSection } from "@/components/landing-bgf/BgfCtaSection"

export const metadata: Metadata = {
  title: "Betriebliche Gesundheitsförderung (BGF) | Praxis OS — Für Unternehmen",
  description:
    "Digitale betriebliche Gesundheitsförderung für Ihr Unternehmen. KI-gestützte Pausen-Fit Sessions, Ergonomie-Beratung und messbare Ergebnisse — ab 29€/Mitarbeiter/Monat.",
  keywords: [
    "Betriebliche Gesundheitsförderung",
    "BGF",
    "Betriebliches Gesundheitsmanagement",
    "BGM",
    "Mitarbeitergesundheit",
    "Pausen-Fit",
    "Ergonomie Arbeitsplatz",
    "Gesundheit am Arbeitsplatz",
    "Fehlzeiten reduzieren",
    "BGF digital",
  ],
  openGraph: {
    title: "Betriebliche Gesundheitsförderung — Praxis OS für Unternehmen",
    description: "Digitale BGF-Plattform: KI-gestützte Bewegungsprogramme, Ergonomie-Tipps und messbare ROI für Ihr Unternehmen.",
    type: "website",
    locale: "de_DE",
  },
}

export default function UnternehmenPage() {
  return (
    <>
      <BgfHeroSection />
      <BgfProblemSection />
      <BgfSolutionSection />
      <BgfFeaturesSection />
      <BgfRoiSection />
      <BgfPricingSection />
      <BgfTestimonialSection />
      <BgfFaqSection />
      <BgfCtaSection />
    </>
  )
}
