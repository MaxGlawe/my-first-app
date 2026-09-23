/**
 * PROJ-26: Autorenseite.
 *
 * Zweck ist nicht Eitelkeit, sondern Zurechenbarkeit: Wer Gesundheitsinhalte
 * veröffentlicht, sollte als Person greifbar sein — mit Qualifikation, Ort und
 * Verantwortungsbereich. Suchmaschinen und Sprachmodelle werten genau das aus,
 * wenn sie entscheiden, ob eine Aussage Gewicht hat.
 *
 * Deshalb steht hier alles als Fliesstext und nicht in Grafiken, und deshalb
 * wiederholt die Seite die Stammdaten wörtlich so, wie sie auf allen anderen
 * Seiten stehen.
 *
 * Noch offen: `sameAs` mit Google-Unternehmensprofil und Social Profiles. Das
 * ist die Verknüpfung, über die Suchmaschinen diese Person mit bestehenden
 * Profilen zusammenführen — die URLs müssen nachgetragen werden.
 */

import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { LandingFooter } from "@/components/landing/LandingFooter"
import { PROGRAMM, VARIANTEN, buchungsUrl } from "@/lib/programm"

// Bis Schritt 2 zeigt die Seite die Variante „Intensiv“ — der bisherige Stand.
const INTENSIV = VARIANTEN.intensiv

const SITE = "https://wwwpraxis-os.com"

const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const LINE = "#e7e1d6"
const GREEN = "#2C3E2D"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

export const metadata: Metadata = {
  title: "Max Glawe — Heilpraktiker für Physiotherapie in Wildau | Praxis OS",
  description:
    "Max Glawe ist Heilpraktiker für Physiotherapie mit Praxis in Wildau und betreut die " +
    `Patientinnen und Patienten im ${PROGRAMM.tage}-Tage-Programm von Praxis OS persönlich. ` +
    "Qualifikationen, Arbeitsweise und Kontakt.",
  alternates: { canonical: `${SITE}/max-glawe` },
  openGraph: {
    title: "Max Glawe — Heilpraktiker für Physiotherapie",
    description:
      "Heilpraktiker für Physiotherapie mit Praxis in Wildau. Betreut das 90-Tage-Programm von Praxis OS persönlich.",
    type: "profile",
    locale: "de_DE",
    url: `${SITE}/max-glawe`,
  },
}

const QUALIFIKATIONEN: { titel: string; text: string }[] = [
  {
    titel: "Erlaubnis nach dem Heilpraktikergesetz",
    text: "Staatlich geprüfte Erlaubnis zur Ausübung der Heilkunde, beschränkt auf das Gebiet der Physiotherapie. Sie erlaubt eigenständige Befunderhebung, Diagnosestellung und Behandlung im Bereich des Bewegungsapparates — ohne ärztliche Verordnung und ohne Überweisung. In der Fachsprache heißt das Direktzugang.",
  },
  {
    titel: "Kursleiter-Qualifikation bei der ZPP registriert",
    text: "Die Qualifikation als Kursleiter ist bei der Zentralen Prüfstelle Prävention nach § 20 SGB V hinterlegt. Das betrifft ausdrücklich die Qualifikation der Person, nicht das 90-Tage-Programm: Dieses ist kein zertifizierter Präventionskurs und wird von der gesetzlichen Krankenkasse nicht bezuschusst.",
  },
  {
    titel: "Praxispartner der BTU Cottbus–Senftenberg",
    text: "Die Praxis Physiotherapie Glawe ist Praxispartner der Brandenburgischen Technischen Universität Cottbus–Senftenberg und begleitet Studierende der Therapiewissenschaften in ihrer praktischen Ausbildung.",
  },
]

export default function MaxGlawePage() {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE}/#max-glawe`,
    name: "Max Glawe",
    givenName: "Max",
    familyName: "Glawe",
    jobTitle: "Heilpraktiker für Physiotherapie",
    url: `${SITE}/max-glawe`,
    image: `${SITE}/images/max-portrait.jpg`,
    description:
      "Max Glawe ist Heilpraktiker für Physiotherapie mit Praxis in Wildau (Brandenburg) und " +
      `betreut die Patientinnen und Patienten im ${PROGRAMM.tage}-Tage-Programm von Praxis OS ` +
      "persönlich.",
    worksFor: {
      "@type": "MedicalBusiness",
      "@id": `${SITE}/#praxis`,
      name: "Physiotherapie Glawe",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Karl-Marx-Straße 117",
        postalCode: "15745",
        addressLocality: "Wildau",
        addressCountry: "DE",
      },
      telephone: "+49 3375 9209877",
    },
    knowsLanguage: "de",
    knowsAbout: [
      "Physiotherapie",
      "Telerehabilitation",
      "Rückenschmerzen",
      "Trainingstherapie",
      "Prävention",
      "Betriebliche Gesundheitsförderung",
    ],
    hasCredential: QUALIFIKATIONEN.map((q) => ({
      "@type": "EducationalOccupationalCredential",
      name: q.titel,
      description: q.text,
    })),
  }

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Praxis OS", item: SITE },
      { "@type": "ListItem", position: 2, name: "Max Glawe", item: `${SITE}/max-glawe` },
    ],
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: PAPER }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <LandingHeader />

      <main className="container mx-auto max-w-4xl px-4 pb-24 pt-28 sm:pt-36">
        {/* Brotkrumen, sichtbar und damit auch für Menschen nützlich */}
        <nav aria-label="Brotkrumennavigation" className="text-[13px]" style={{ color: MUTED }}>
          <Link href="/" style={{ color: GREEN }}>
            Praxis OS
          </Link>
          <span className="mx-2">›</span>
          <span>Max Glawe</span>
        </nav>

        <div className="mt-8 grid gap-10 sm:grid-cols-[0.75fr_1.25fr] sm:gap-12">
          <div
            className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl"
            style={{ backgroundColor: "#EFEAE2" }}
          >
            <Image
              src="/images/max-portrait.jpg"
              alt="Porträt von Max Glawe, Heilpraktiker für Physiotherapie, in den Räumen der Praxis Physiotherapie Glawe in Wildau"
              fill
              priority
              sizes="(min-width: 640px) 32vw, 90vw"
              className="object-cover object-[50%_20%]"
            />
          </div>

          <div>
            <h1 className="text-4xl sm:text-5xl" style={{ ...serif, color: INK }}>
              Max Glawe
            </h1>
            <p className="mt-3 text-lg" style={{ color: MUTED }}>
              Heilpraktiker für Physiotherapie · Physiotherapie Glawe, Wildau
            </p>

            <p className="mt-7 text-[16.5px] leading-relaxed" style={{ color: BODY }}>
              Max Glawe führt die Praxis Physiotherapie Glawe in Wildau und betreut die
              Patientinnen und Patienten im {PROGRAMM.tage}-Tage-Programm von Praxis OS
              persönlich — von der ersten Videokonsultation bis zum Abschlussgespräch. Alle
              Inhalte dieser Website zu Behandlung, Ablauf und Beschwerdebildern stammen von ihm
              oder wurden von ihm geprüft.
            </p>

            <blockquote
              className="mt-7 border-l-2 pl-5 text-[16.5px] leading-relaxed"
              style={{ borderColor: GREEN, color: BODY }}
            >
              „Ich habe oft erlebt, dass Menschen nach sechs Einheiten wieder allein dastanden —
              nicht, weil zu wenig getan wurde, sondern weil die Zeit fehlte. Praxis OS ist mein
              Versuch, genau diese Lücke zu schließen: nicht mehr Behandlung auf einmal, sondern
              länger dabeibleiben."
            </blockquote>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl sm:text-3xl" style={{ ...serif, color: INK }}>
            Qualifikationen
          </h2>
          <div className="mt-6">
            {QUALIFIKATIONEN.map((q, i) => (
              <div key={q.titel} className="py-6" style={i > 0 ? { borderTop: `1px solid ${LINE}` } : undefined}>
                <h3 className="text-lg sm:text-xl" style={{ ...serif, color: INK }}>
                  {q.titel}
                </h3>
                <p className="mt-2 text-[15.5px] leading-relaxed" style={{ color: BODY }}>
                  {q.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl sm:text-3xl" style={{ ...serif, color: INK }}>
            Wie ich arbeite
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed" style={{ color: BODY }}>
            Am Anfang steht immer ein Gespräch, kein Verkauf. In der 30-minütigen
            Videokonsultation klären wir, was los ist und ob sich das Beschwerdebild überhaupt
            aus der Ferne betreuen lässt. Lässt es sich nicht, sage ich das — dann entstehen nur
            die {PROGRAMM.konsultation} € für das Gespräch und kein Programm.
          </p>
          <p className="mt-4 text-[16px] leading-relaxed" style={{ color: BODY }}>
            Passt es, schreibe ich den Plan selbst: tägliche Micro-Übungen und einen
            Trainingsplan für die Tage, die realistisch in den Alltag passen. Das tägliche
            Check-in in der App lese ich mit und passe den Plan daran an. Über die
            {" "}{PROGRAMM.tage} Tage bleibe ich derselbe Ansprechpartner — im Chat mit einer
            Antwortzusage von {PROGRAMM.chatAntwortStunden} Stunden an Werktagen und in{" "}
            {INTENSIV.calls} Video-Sitzungen, die anfangs wöchentlich stattfinden und zum Ende
            hin seltener werden.
          </p>
          <p className="mt-4 text-[16px] leading-relaxed" style={{ color: BODY }}>
            Was ich nicht verspreche, ist ein Ergebnis. Wie ein Körper auf Bewegung reagiert,
            hängt von zu vielem ab, als dass man es seriös zusagen könnte. Was ich zusagen kann,
            ist die Begleitung.
          </p>
        </section>

        <section
          className="mt-14 rounded-3xl border p-7 sm:p-9"
          style={{ borderColor: LINE, backgroundColor: "#FFFFFF" }}
        >
          <h2 className="text-xl sm:text-2xl" style={{ ...serif, color: INK }}>
            Praxis und Kontakt
          </h2>
          <address className="mt-4 not-italic text-[15.5px] leading-relaxed" style={{ color: BODY }}>
            <span className="font-semibold" style={{ color: INK }}>
              Physiotherapie Glawe
            </span>
            <br />
            Karl-Marx-Straße 117
            <br />
            15745 Wildau
            <br />
            Telefon{" "}
            <a href="tel:+4933759209877" style={{ color: GREEN }}>
              03375 9209877
            </a>
          </address>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[14.5px]">
            <a href={buchungsUrl("autorenseite")} target="_blank" rel="noopener noreferrer" style={{ color: GREEN }}>
              Konsultation buchen →
            </a>
            <Link href="/" style={{ color: GREEN }}>
              Zum {PROGRAMM.tage}-Tage-Programm →
            </Link>
            <Link href="/impressum" style={{ color: MUTED }}>
              Impressum
            </Link>
          </div>
        </section>

        <p className="mt-10 text-[13px]" style={{ color: MUTED }}>
          Zuletzt aktualisiert am 22.09.2026
        </p>
      </main>

      <LandingFooter />
    </div>
  )
}
