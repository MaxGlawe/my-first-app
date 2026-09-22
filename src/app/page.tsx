import { Suspense } from "react"
import { Metadata } from "next"
import { StructuredData } from "@/components/landing/StructuredData"
import { LandingAnalytics } from "@/components/landing/LandingAnalytics"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { HeroSection } from "@/components/landing/HeroSection"
import { ProblemSection } from "@/components/landing/ProblemSection"
import { WendepunktSection } from "@/components/landing/WendepunktSection"
import { JourneySection } from "@/components/landing/JourneySection"
import { CtaBand } from "@/components/landing/CtaBand"
import { GarantieSection } from "@/components/landing/GarantieSection"
import { EignungSection } from "@/components/landing/EignungSection"
import { CredentialsSection } from "@/components/landing/CredentialsSection"
import { PricingSection } from "@/components/landing/PricingSection"
import { FaqSection } from "@/components/landing/FaqSection"
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
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Praxis OS — Online Physiotherapie" }],
  },
  alternates: {
    canonical: "https://wwwpraxis-os.com",
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <StructuredData />
      <Suspense fallback={null}>
        <LandingAnalytics />
      </Suspense>
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <WendepunktSection />
        <JourneySection />
        <CtaBand
          abschnitt="nach-ablauf"
          satz="Klingt das nach dem, was dir bisher gefehlt hat?"
          zusatz="Dann lass uns 30 Minuten sprechen. Die Buchung kostet nichts, und wir sagen dir ehrlich, ob wir dich aus der Ferne betreuen können."
        />
        <GarantieSection />
        <CredentialsSection />
        <CtaBand
          hell
          abschnitt="nach-therapeut"
          satz="Der schnellste Weg herauszufinden, ob das passt: miteinander reden."
          zusatz="30 Minuten per Video, ohne Verordnung, ohne Wartezeit."
        />
        <EignungSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
