import { Metadata } from "next"
import { StructuredData } from "@/components/landing/StructuredData"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { HeroSection } from "@/components/landing/HeroSection"
import { DeviceShowcase } from "@/components/landing/DeviceShowcase"
import { UniqueSection } from "@/components/landing/UniqueSection"
import { FeaturesShowcase } from "@/components/landing/FeaturesShowcase"
import { TechnologySection } from "@/components/landing/TechnologySection"
import { ProcessSection } from "@/components/landing/ProcessSection"
import { EvidenceSection } from "@/components/landing/EvidenceSection"
import { ComparisonSection } from "@/components/landing/ComparisonSection"
import { CredentialsSection } from "@/components/landing/CredentialsSection"
import { ResultsSection } from "@/components/landing/ResultsSection"
import { QuoteSection } from "@/components/landing/QuoteSection"
import { PricingSection } from "@/components/landing/PricingSection"
import { FaqSection } from "@/components/landing/FaqSection"
import { TrustSection } from "@/components/landing/TrustSection"
import { CtaSection } from "@/components/landing/CtaSection"
import { LandingFooter } from "@/components/landing/LandingFooter"

export const metadata: Metadata = {
  title: "Online Physiotherapie | Praxis OS — Physiotherapie Glawe",
  description:
    "Professionelle Physiotherapie online. Heilpraktiker-Behandlung per Video, individuelle Trainingspläne und persönliche Betreuung per App — deutschlandweit ohne Wartezeit.",
  keywords: [
    "Online Physiotherapie",
    "Physiotherapie online",
    "Video Physiotherapie",
    "Physiotherapie per Video",
    "Heilpraktiker Physiotherapie",
    "Online Physiotherapie Deutschland",
    "Physiotherapie ohne Wartezeit",
    "Physiotherapie App",
    "Trainingsplan Physiotherapie",
    "Schmerztherapie online",
    "Rückenschmerzen Physiotherapie",
    "Physiotherapie von zuhause",
  ],
  openGraph: {
    title: "Online Physiotherapie — Behandlung per Video | Praxis OS",
    description:
      "Professionelle Physiotherapie per Video. Heilpraktiker-Behandlung, individuelle Trainingspläne und persönliche Betreuung per App — deutschlandweit.",
    type: "website",
    locale: "de_DE",
  },
  alternates: {
    canonical: "https://wwwpraxis-os.com",
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <StructuredData />
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <DeviceShowcase />
        <UniqueSection />
        <FeaturesShowcase />
        <TechnologySection />
        <ProcessSection />
        <EvidenceSection />
        <ComparisonSection />
        <CredentialsSection />
        <ResultsSection />
        <QuoteSection />
        <PricingSection />
        <FaqSection />
        <TrustSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
