"use client"

/**
 * PROJ-26: Preis.
 *
 * Ein Angebot, ein Betrag. Alle Zahlen kommen aus lib/programm.ts — dieselbe
 * Quelle, aus der Vertrag, Checkout und Rechnung lesen. Ein Preis, der auf der
 * Website anders steht als im Vertrag, wäre der teuerste Fehler dieser Seite.
 *
 * Zur Erstattung steht bewusst nur, was haltbar ist: Ob eine private
 * Versicherung zahlt, entscheidet allein der Tarif des Patienten.
 */

import { ScrollReveal } from "./ScrollReveal"
import { Button } from "@/components/ui/button"
import { Check, ArrowRight } from "lucide-react"
import { PROGRAMM, PROGRAMM_LEISTUNGEN, buchungsUrl, formatEuro } from "@/lib/programm"

const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const LINE = "#e7e1d6"
const GREEN = "#2C3E2D"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

export function PricingSection() {
  const enthalten = PROGRAMM_LEISTUNGEN.filter((l) => l.preis === 0)

  return (
    <section id="preis" className="relative py-24 sm:py-32" style={{ backgroundColor: PAPER }}>
      <div className="container mx-auto max-w-4xl px-4">
        <ScrollReveal className="mb-12 text-center">
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: GREEN }}>
            Preis
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl" style={{ ...serif, color: INK }}>
            Ein Betrag. Keine Überraschungen.
          </h2>
        </ScrollReveal>

        <ScrollReveal>
          <div className="overflow-hidden rounded-3xl border bg-white" style={{ borderColor: LINE }}>
            <div className="border-b p-7 text-center sm:p-10" style={{ borderColor: LINE }}>
              <p className="text-sm font-medium uppercase tracking-wider" style={{ color: GREEN }}>
                {PROGRAMM.tage}-Tage-Programm
              </p>
              <div className="mt-3 flex items-baseline justify-center gap-2">
                <span className="text-5xl sm:text-6xl" style={{ ...serif, color: INK }}>
                  {formatEuro(PROGRAMM.gesamtpreis)}
                </span>
              </div>
              <p className="mt-2 text-[15px]" style={{ color: MUTED }}>
                einmalig · Videokonsultation inbegriffen · Ratenzahlung über Klarna möglich
              </p>

              <a
                href={buchungsUrl("preis")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-block"
              >
                <Button
                  size="lg"
                  className="group px-8 py-6 text-base font-bold"
                  style={{ backgroundColor: GREEN }}
                >
                  Konsultation buchen
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </a>
              <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed" style={{ color: MUTED }}>
                Die Buchung selbst kostet nichts. Abgerechnet wird erst nach dem Gespräch — das
                Programm, oder {formatEuro(PROGRAMM.konsultation)} für die Konsultation, wenn du
                dich dagegen entscheidest.
              </p>
            </div>

            <div className="p-7 sm:p-10">
              <h3 className="text-lg" style={{ ...serif, color: INK }}>
                Darin enthalten
              </h3>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {enthalten.map((l) => (
                  <li
                    key={l.beschreibung}
                    className="flex items-start gap-3 text-[15px] leading-relaxed"
                    style={{ color: BODY }}
                  >
                    <Check className="mt-1 h-4 w-4 shrink-0" style={{ color: GREEN }} />
                    <span>{l.beschreibung}</span>
                  </li>
                ))}
              </ul>

              <div
                className="mt-8 grid gap-4 border-t pt-7 text-[14px] leading-relaxed sm:grid-cols-2"
                style={{ borderColor: LINE, color: MUTED }}
              >
                <p>
                  <strong style={{ color: INK }}>Kein Abonnement.</strong> Die Betreuung endet nach{" "}
                  {PROGRAMM.tage} Tagen automatisch. Es wird nichts verlängert und nichts weiter
                  abgebucht.
                </p>
                <p>
                  <strong style={{ color: INK }}>Rechnung vom Heilpraktiker.</strong> Heilkundliche
                  Leistung, umsatzsteuerfrei nach § 4 Nr. 14a UStG. Je nach Tarif teilweise
                  erstattungsfähig — einen Kostenvoranschlag bekommst du vorab.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
