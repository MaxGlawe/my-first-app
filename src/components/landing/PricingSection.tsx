"use client"

/**
 * PROJ-26: Preis.
 *
 * Bewusst schlank. Die erste Fassung wiederholte die Leistungen ein drittes
 * Mal als Häkchenliste — nach dem nummerierten Versprechen und der Journey.
 * Wer bis hierher gescrollt hat, weiss, was drin ist; er will nur noch die
 * Zahl und die Bedingungen. Eine dritte Aufzählung liest niemand, sie macht
 * die Seite nur länger und den Preis kleiner.
 *
 * Alle Zahlen kommen aus lib/programm.ts — dieselbe Quelle, aus der Vertrag,
 * Checkout und Rechnung lesen. Ein Preis, der auf der Website anders steht
 * als im Vertrag, waere der teuerste Fehler dieser Seite.
 *
 * Zur Erstattung steht nur, was haltbar ist: Ob eine private Versicherung
 * zahlt, entscheidet allein der Tarif des Patienten.
 */

import { ScrollReveal } from "./ScrollReveal"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { PROGRAMM, VARIANTEN, buchungsUrl, formatEuro } from "@/lib/programm"

// Bis Schritt 2 zeigt die Seite die Variante „Intensiv“ — der bisherige Stand.
const INTENSIV = VARIANTEN.intensiv

const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const LINE = "#e7e1d6"
const GREEN = "#2C3E2D"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

export function PricingSection() {
  return (
    <section id="preis" className="relative py-24 sm:py-32" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="container mx-auto max-w-3xl px-4 text-center">
        <ScrollReveal>
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: GREEN }}>
            Preis
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl" style={{ ...serif, color: INK }}>
            Ein Betrag. Keine Überraschungen.
          </h2>
        </ScrollReveal>

        <ScrollReveal>
          <div className="mt-12">
            <span
              className="block text-[4.5rem] leading-none sm:text-[6rem]"
              style={{ ...serif, color: INK }}
            >
              {formatEuro(INTENSIV.preis)}
            </span>
            <p className="mt-4 text-[17px]" style={{ color: MUTED }}>
              einmalig für {PROGRAMM.tage} Tage Betreuung · Videokonsultation inbegriffen
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <p className="mx-auto mt-8 max-w-xl text-[16px] leading-relaxed" style={{ color: BODY }}>
            Enthalten ist alles, was oben steht: dein persönlicher Plan, das tägliche Check-in,
            der Chat mit deinem Behandler und alle {INTENSIV.calls} Video-Sitzungen.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="mt-10">
            <a href={buchungsUrl("preis")} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="group h-14 rounded-xl px-9 text-base font-semibold text-white hover:opacity-90"
                style={{ backgroundColor: GREEN }}
              >
                Konsultation buchen
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </a>
            <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed" style={{ color: MUTED }}>
              Bei der Buchung wird noch nichts abgebucht. Abgerechnet wird nach dem Gespräch:{" "}
              {formatEuro(INTENSIV.preis)} für das Programm — oder{" "}
              {formatEuro(PROGRAMM.konsultation)} für die Konsultation allein, wenn du dich
              dagegen entscheidest.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div
            className="mt-14 grid gap-6 border-t pt-10 text-left text-[14px] leading-relaxed sm:grid-cols-3 sm:gap-8"
            style={{ borderColor: LINE, color: MUTED }}
          >
            <p>
              <strong className="block" style={{ color: INK }}>
                Kein Abonnement
              </strong>
              Die Betreuung endet nach {PROGRAMM.tage} Tagen automatisch. Keine Verlängerung,
              keine weitere Abbuchung.
            </p>
            <p>
              <strong className="block" style={{ color: INK }}>
                Rechnung vom Heilpraktiker
              </strong>
              Heilkundliche Leistung, umsatzsteuerfrei nach § 4 Nr. 14a UStG. Je nach Tarif
              teilweise erstattungsfähig — Kostenvoranschlag vorab.
            </p>
            <p>
              <strong className="block" style={{ color: INK }}>
                Zahlung
              </strong>
              Per Karte oder Klarna. Ratenzahlung über Klarna ist möglich; ob sie angeboten wird,
              entscheidet Klarna.
            </p>
          </div>
        </ScrollReveal>
      </div>

      {/* Dünner Abschluss zur nächsten Sektion */}
      <div aria-hidden className="mt-24 h-px w-full sm:mt-32" style={{ backgroundColor: PAPER }} />
    </section>
  )
}
