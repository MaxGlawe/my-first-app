/**
 * PROJ-26: Strukturierte Daten der Startseite.
 *
 * Die alte Fassung warb hier noch mit dem abgeloesten Angebot — Video-Analyse
 * fuer 69 €, Mini-Reha, Chronik-Programm. Strukturierte Daten sind das, was
 * Suchmaschinen und Sprachmodelle als Fakten uebernehmen; ein veralteter Preis
 * darin wirkt laenger nach als einer im Fliesstext.
 *
 * Drei Bloecke, bewusst getrennt statt in einen gequetscht:
 *   1. MedicalBusiness — die Praxis mit Name, Adresse, Telefon (NAP)
 *   2. Person          — Max Glawe mit Qualifikation und Zugehoerigkeit
 *   3. Service + Offer — das 90-Tage-Programm mit Preis
 *
 * Die FAQPage steht bewusst NICHT hier, sondern in FaqSection: dort wird sie
 * aus denselben Texten erzeugt, die auch sichtbar sind, und kann deshalb nicht
 * von ihnen abweichen.
 *
 * `sameAs` steht am PRAXIS-Block (siehe PRAXIS_PROFILE unten), nicht bei der
 * Person: Google-Unternehmensprofil und Instagram laufen unter
 * „Physiotherapie Glawe" und gehoeren damit der Praxis.
 */

import { PROGRAMM, PROGRAMM_CALLS } from "@/lib/programm"

const SITE = "https://wwwpraxis-os.com"

const PRAXIS = {
  name: "Physiotherapie Glawe",
  strasse: "Karl-Marx-Straße 117",
  plz: "15745",
  ort: "Wildau",
  telefon: "+49 3375 9209877",
  land: "DE",
} as const

/**
 * Profile der PRAXIS — Google-Unternehmensprofil, Instagram und Ähnliches.
 *
 * Bewusst hier und nicht beim Person-Block: `sameAs` verknüpft eine Entität mit
 * ihren EIGENEN Profilen. Ein Konto, das „Physiotherapie Glawe" heisst, gehört
 * der Praxis, nicht Max als Person. Falsch zugeordnet erschwert es die
 * Zuordnung, statt sie zu stützen.
 *
 * Bitte nur nachweislich eigene URLs eintragen — ein sameAs auf ein fremdes
 * Profil ist schlechter als gar keines.
 */
const PRAXIS_PROFILE: string[] = [
  // "https://www.instagram.com/...",
  // "https://maps.app.goo.gl/...",   // aus dem Google-Unternehmensprofil: „Profil teilen"
]

export function StructuredData() {
  const praxis = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": `${SITE}/#praxis`,
    name: PRAXIS.name,
    description:
      `Physiotherapeutische Fernbetreuung als ${PROGRAMM.tage}-Tage-Programm: Videokonsultation mit ` +
      "Eignungsprüfung, persönlicher Trainingsplan, tägliches Check-in in der App, Chat mit dem " +
      "Behandler und gestaffelte Video-Sitzungen. Behandlung durch einen Heilpraktiker für " +
      "Physiotherapie — ohne ärztliche Verordnung.",
    url: SITE,
    logo: `${SITE}/images/physio-logo.png`,
    image: `${SITE}/images/max-portrait.jpg`,
    telephone: PRAXIS.telefon,
    priceRange: "€€",
    medicalSpecialty: "Physiotherapy",
    address: {
      "@type": "PostalAddress",
      streetAddress: PRAXIS.strasse,
      postalCode: PRAXIS.plz,
      addressLocality: PRAXIS.ort,
      addressCountry: PRAXIS.land,
    },
    areaServed: { "@type": "Country", name: "Deutschland" },
    availableLanguage: "de",
    // Erst ausgeben, wenn wirklich Profile hinterlegt sind — ein leeres
    // sameAs ist kein neutraler Platzhalter, sondern eine leere Behauptung.
    ...(PRAXIS_PROFILE.length > 0 ? { sameAs: PRAXIS_PROFILE } : {}),
  }

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE}/#max-glawe`,
    name: "Max Glawe",
    jobTitle: "Heilpraktiker für Physiotherapie",
    description:
      "Max Glawe ist Heilpraktiker für Physiotherapie mit Praxis in Wildau und betreut die " +
      `Patientinnen und Patienten im ${PROGRAMM.tage}-Tage-Programm von Praxis OS persönlich.`,
    image: `${SITE}/images/max-portrait.jpg`,
    url: `${SITE}/max-glawe`,
    worksFor: { "@id": `${SITE}/#praxis` },
    knowsAbout: [
      "Physiotherapie",
      "Telerehabilitation",
      "Rückenschmerzen",
      "Trainingstherapie",
      "Prävention",
    ],
    hasCredential: [
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "license",
        name: "Erlaubnis nach dem Heilpraktikergesetz, beschränkt auf das Gebiet der Physiotherapie",
      },
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "certification",
        name: "Bei der Zentralen Prüfstelle Prävention registrierte Kursleiter-Qualifikation (§ 20 SGB V)",
      },
    ],
  }

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE}/#programm`,
    name: `Praxis OS — ${PROGRAMM.tage}-Tage-Programm`,
    serviceType: "Physiotherapeutische Fernbetreuung",
    description:
      `Das ${PROGRAMM.tage}-Tage-Programm beginnt mit einer 30-minütigen Videokonsultation, in der ` +
      "geprüft wird, ob sich das Beschwerdebild aus der Ferne betreuen lässt. Danach erhalten " +
      "Patientinnen und Patienten einen persönlichen Plan aus täglichen Micro-Übungen und einem " +
      "Trainingsplan, checken täglich kurz in der App ein und haben durchgehend denselben " +
      `Behandler im Chat. Enthalten sind ${PROGRAMM_CALLS} Video-Sitzungen, anfangs wöchentlich, ` +
      `zum Ende hin seltener. Nach ${PROGRAMM.tage} Tagen endet die Betreuung automatisch; ein ` +
      "Abonnement entsteht nicht.",
    provider: { "@id": `${SITE}/#praxis` },
    areaServed: { "@type": "Country", name: "Deutschland" },
    termsOfService: `${SITE}/agb`,
    offers: {
      "@type": "Offer",
      name: `${PROGRAMM.tage}-Tage-Programm inklusive Videokonsultation`,
      price: String(PROGRAMM.gesamtpreis),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `${SITE}/#preis`,
      description:
        `Einmalzahlung von ${PROGRAMM.gesamtpreis} €. Die vorausgegangene Videokonsultation ist ` +
        `enthalten. Wird das Programm nach dem Gespräch nicht begonnen, fallen nur ` +
        `${PROGRAMM.konsultation} € für die Konsultation an. Heilkundliche Leistung, ` +
        "umsatzsteuerfrei nach § 4 Nr. 14a UStG.",
    },
  }

  return (
    <>
      {[praxis, person, service].map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  )
}
