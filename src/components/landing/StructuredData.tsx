export function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["MedicalBusiness", "HealthAndBeautyBusiness"],
    name: "Physiotherapie Glawe",
    description:
      "Professionelle Online-Physiotherapie per Video. Heilpraktiker-Behandlung, individuelle Trainingspläne und persönliche Betreuung per App — deutschlandweit.",
    url: "https://wwwpraxis-os.com",
    logo: "https://wwwpraxis-os.com/images/Physio%20Logo_ausgeschnitten.png",
    priceRange: "€€",
    areaServed: {
      "@type": "Country",
      name: "Deutschland",
    },
    availableService: {
      "@type": "MedicalTherapy",
      name: "Online Physiotherapie",
      description:
        "Video-basierte Physiotherapie mit individuellem Trainingsplan, Schmerztagebuch und Chat-Support.",
      serviceType: "Physiotherapie",
    },
    medicalSpecialty: "Physiotherapy",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Behandlungsangebote",
      itemListElement: [
        {
          "@type": "Offer",
          name: "Video-Analyse",
          description: "Ausführliche Video-Analyse (30 Min.) mit Befunderhebung, Diagnose und Trainingsplan",
          price: "69",
          priceCurrency: "EUR",
        },
        {
          "@type": "Offer",
          name: "Mini-Reha Post-OP",
          description: "Strukturierte Nachbehandlung nach Operationen (6–8 Wochen). Preis auf Anfrage.",
          priceCurrency: "EUR",
        },
        {
          "@type": "Offer",
          name: "Chronik-Programm",
          description: "Für langjährige Beschwerden mit Struktur und Konsequenz (8–12 Wochen). Preis auf Anfrage.",
          priceCurrency: "EUR",
        },
      ],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
