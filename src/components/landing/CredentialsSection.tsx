"use client"

/**
 * PROJ-26: Wer dich betreut.
 *
 * Zwei Aussagen der alten Fassung waren sachlich falsch und sind hier bewusst
 * anders formuliert:
 *
 *  1. „ZPP-zertifiziert" / „ZPP-Zertifizierung" — registriert ist die
 *     KURSLEITER-QUALIFIKATION von Max bei der Zentralen Prüfstelle
 *     Prävention. Weder die App noch das 90-Tage-Programm sind ein nach
 *     § 20 SGB V zertifizierter Präventionskurs. Neben einem Programmpreis
 *     gelesen, konnte die alte Formulierung den Eindruck erwecken, die
 *     Krankenkasse beteilige sich — sie tut es nicht.
 *
 *  2. „Evidenzbasierte Methoden — nur Methoden, die nachweislich wirken":
 *     eine Wirkungsaussage ohne Beleg, und genau die Sorte Satz, die auf
 *     dieser Seite nirgends mehr stehen soll.
 *
 * Stammdaten (Name, Adresse, Telefon) stehen bewusst ausgeschrieben im Text:
 * Sie müssen auf allen Seiten identisch sein und von Suchmaschinen wie von
 * Sprachmodellen als echter Text gelesen werden können.
 */

import Image from "next/image"
import { ScrollReveal } from "./ScrollReveal"
import { ExternalLink } from "lucide-react"

const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const LINE = "#e7e1d6"
const GREEN = "#2C3E2D"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

const QUALIFIKATIONEN = [
  {
    titel: "Heilpraktiker für Physiotherapie",
    text: "Staatlich geprüfte Erlaubnis nach dem Heilpraktikergesetz, beschränkt auf das Gebiet der Physiotherapie. Sie erlaubt eigenständige Befunderhebung und Behandlung — du brauchst keine ärztliche Verordnung und keine Überweisung.",
  },
  {
    titel: "Kursleiter-Qualifikation bei der ZPP registriert",
    text: "Die Qualifikation als Kursleiter ist bei der Zentralen Prüfstelle Prävention hinterlegt (§ 20 SGB V). Das 90-Tage-Programm selbst ist kein zertifizierter Präventionskurs und wird nicht von der gesetzlichen Krankenkasse bezuschusst.",
  },
  {
    titel: "Praxispartner der BTU Cottbus–Senftenberg",
    text: "Physiotherapie Glawe ist Praxispartner der Brandenburgischen Technischen Universität und begleitet dort Studierende der Therapiewissenschaften in ihrer praktischen Ausbildung.",
  },
]

export function CredentialsSection() {
  return (
    <section id="wer-betreut-dich" className="relative py-24 sm:py-32" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          {/* Porträt */}
          <ScrollReveal>
            <div
              className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl lg:sticky lg:top-24"
              style={{ backgroundColor: PAPER }}
            >
              <Image
                src="/images/maxglawe.webp"
                alt="Max Glawe, Heilpraktiker für Physiotherapie, in den Räumen der Praxis Physiotherapie Glawe in Wildau"
                fill
                loading="lazy"
                sizes="(min-width: 1024px) 32vw, 90vw"
                className="object-cover object-top"
              />
            </div>
          </ScrollReveal>

          {/* Text */}
          <div>
            <ScrollReveal>
              <span className="text-sm font-medium uppercase tracking-wider" style={{ color: GREEN }}>
                Wer dich betreut
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl" style={{ ...serif, color: INK }}>
                Max Glawe
              </h2>
              <p className="mt-2 text-lg" style={{ color: MUTED }}>
                Heilpraktiker für Physiotherapie · Physiotherapie Glawe, Wildau
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <blockquote
                className="mt-8 border-l-2 pl-5 text-[17px] leading-relaxed sm:text-lg"
                style={{ borderColor: GREEN, color: BODY }}
              >
                „Ich habe oft erlebt, dass Menschen nach sechs Einheiten wieder allein dastanden —
                nicht, weil zu wenig getan wurde, sondern weil die Zeit fehlte. Praxis OS ist mein
                Versuch, genau diese Lücke zu schließen: nicht mehr Behandlung auf einmal, sondern
                länger dabeibleiben."
              </blockquote>
            </ScrollReveal>

            <div className="mt-10">
              {QUALIFIKATIONEN.map((q, i) => (
                <ScrollReveal key={q.titel}>
                  <div
                    className="py-6"
                    style={i > 0 ? { borderTop: `1px solid ${LINE}` } : undefined}
                  >
                    <h3 className="text-lg leading-snug sm:text-xl" style={{ ...serif, color: INK }}>
                      {q.titel}
                    </h3>
                    <p className="mt-2 max-w-2xl text-[15px] leading-relaxed" style={{ color: BODY }}>
                      {q.text}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* BTU-Logo + Stammdaten */}
            <ScrollReveal>
              <div
                className="mt-6 flex flex-wrap items-center justify-between gap-6 rounded-2xl border p-5 sm:p-6"
                style={{ borderColor: LINE, backgroundColor: PAPER }}
              >
                <a
                  href="https://www.b-tu.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 transition-opacity hover:opacity-80"
                >
                  <Image
                    src="/images/BTU.png"
                    alt="Logo der Brandenburgischen Technischen Universität Cottbus–Senftenberg"
                    width={110}
                    height={49}
                    loading="lazy"
                    className="h-auto w-[92px]"
                  />
                  <ExternalLink className="h-3.5 w-3.5" style={{ color: MUTED }} aria-hidden />
                </a>

                <address className="not-italic text-[13.5px] leading-relaxed" style={{ color: MUTED }}>
                  <span className="font-semibold" style={{ color: INK }}>
                    Physiotherapie Glawe
                  </span>
                  <br />
                  Karl-Marx-Straße 117, 15745 Wildau
                  <br />
                  Telefon{" "}
                  <a href="tel:+4933759209877" style={{ color: GREEN }}>
                    03375 9209877
                  </a>
                </address>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
