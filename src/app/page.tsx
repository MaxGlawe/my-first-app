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
  // PROJ-26: Auf das 90-Tage-Programm ausgerichtet. Vorher stand hier das
  // abgeloeste Angebot (Video-Analyse, Abo) — Title und Description sind das,
  // was in der Trefferliste steht, und wirkten laenger nach als der Fliesstext.
  title: "90 Tage Physiotherapie per Video | Praxis OS — Physiotherapie Glawe",
  description:
    "Physiotherapeutische Fernbetreuung über 90 Tage: Videokonsultation mit ehrlicher " +
    "Eignungsprüfung, persönlicher Trainingsplan, tägliches Check-in und acht Video-Sitzungen. " +
    "Heilpraktiker für Physiotherapie — ohne ärztliche Verordnung, ohne Wartezeit.",
  keywords: [
    "Online Physiotherapie",
    "Physiotherapie per Video",
    "Heilpraktiker Physiotherapie",
    "Rückenschmerzen online behandeln",
    "Physiotherapie ohne Verordnung",
    "Telerehabilitation",
    "Physiotherapie ohne Wartezeit",
    "Physiotherapie Wildau",
    "digitale Physiotherapie",
    "Trainingsplan Physiotherapie",
  ],
  openGraph: {
    title: "90 Tage Physiotherapie per Video | Praxis OS",
    description:
      "Ein Therapeut, ein Plan, täglicher Kontakt — 90 Tage begleitet, Schritt für Schritt in " +
      "die Selbstständigkeit. Am Anfang steht eine Videokonsultation mit ehrlicher Eignungsprüfung.",
    type: "website",
    locale: "de_DE",
    url: "https://wwwpraxis-os.com",
    siteName: "Praxis OS",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Praxis OS — 90 Tage physiotherapeutische Fernbetreuung",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "90 Tage Physiotherapie per Video | Praxis OS",
    description:
      "Videokonsultation mit ehrlicher Eignungsprüfung, persönlicher Plan, täglicher Kontakt. " +
      "Kein Abo — die Betreuung endet nach 90 Tagen automatisch.",
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
          zusatz="Dann lass uns 30 Minuten sprechen — für 69 €, abgerechnet nach dem Gespräch. Startest du danach das Programm, ist die Konsultation darin enthalten."
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
