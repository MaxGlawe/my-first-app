import { Metadata } from "next"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { HeroSection } from "@/components/landing/HeroSection"
import { DeviceShowcase } from "@/components/landing/DeviceShowcase"
import { UniqueSection } from "@/components/landing/UniqueSection"
import { FeaturesShowcase } from "@/components/landing/FeaturesShowcase"
import { TechnologySection } from "@/components/landing/TechnologySection"
import { ProcessSection } from "@/components/landing/ProcessSection"
import { ComparisonSection } from "@/components/landing/ComparisonSection"
import { QuoteSection } from "@/components/landing/QuoteSection"
import { TrustSection } from "@/components/landing/TrustSection"
import { CtaSection } from "@/components/landing/CtaSection"
import { LandingFooter } from "@/components/landing/LandingFooter"

export const metadata: Metadata = {
  title: "Online Physiotherapie | Praxis OS — Physiotherapie Glawe",
  description:
    "Professionelle Physiotherapie online. Heilpraktiker-Behandlung per Video, individuelle Trainingspläne und persönliche Betreuung per App.",
  openGraph: {
    title: "Online Physiotherapie | Praxis OS",
    description:
      "Professionelle Physiotherapie online. Starten Sie jetzt mit Ihrer persönlichen Behandlung.",
    type: "website",
    locale: "de_DE",
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <DeviceShowcase />
        <UniqueSection />
        <FeaturesShowcase />
        <TechnologySection />
        <ProcessSection />
        <ComparisonSection />
        <QuoteSection />
        <TrustSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
