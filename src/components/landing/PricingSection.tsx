"use client"

/**
 * PROJ-26: Die Angebotssektion — seit 23.09.2026 mit zwei Varianten.
 *
 * Aufbau bewusst so und nicht als zwei vollstaendige Leistungslisten
 * nebeneinander: Der Unterschied zwischen den Varianten ist EIN Punkt — die
 * festen Video-Sitzungen. Zwei Spalten, die zu neunzig Prozent dasselbe
 * aufzaehlen, zwingen den Leser, sie Zeile fuer Zeile zu vergleichen, und
 * verstecken genau die eine Zeile, auf die es ankommt.
 *
 * Deshalb: In jeder Karte steht nur, was sie UNTERSCHEIDET. Was beide
 * enthalten, steht einmal darunter, mit gleichem Gewicht fuer beide. Das ist
 * ehrlicher — die guenstigere Variante wirkt dadurch nicht kastriert — und es
 * macht die Entscheidung in einem Blick moeglich.
 *
 * Die Entscheidungshilfe darunter empfiehlt bewusst nicht pauschal die
 * teurere. Wer eine Empfehlung liest, die immer zum hoeheren Preis fuehrt,
 * glaubt ihr beim naechsten Mal nicht mehr.
 *
 * Alle Zahlen kommen aus lib/programm.ts — dieselbe Quelle, aus der Vertrag,
 * Checkout und Rechnung lesen. Ein Preis, der auf der Website anders steht als
 * im Vertrag, waere der teuerste Fehler dieser Seite.
 */

import { ScrollReveal } from "./ScrollReveal"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check } from "lucide-react"
import {
  PROGRAMM,
  VARIANTEN,
  VARIANTEN_REIHENFOLGE,
  buchungsUrl,
  formatEuro,
  type ProgrammVariante,
} from "@/lib/programm"

const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const LINE = "#e7e1d6"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

/** Was BEIDE Varianten enthalten — einmal genannt, nicht zweimal. */
const GEMEINSAM: string[] = [
  "Videokonsultation zu Beginn, 30 Minuten, mit ehrlicher Eignungsprüfung",
  "Persönlicher Plan: tägliche Micro-Übungen und Trainingsplan für deine Trainingstage",
  "Tägliches Kurz-Check-in, das dein Therapeut mitliest",
  `Chat mit deinem Behandler — Antwort an Werktagen innerhalb von ${PROGRAMM.chatAntwortStunden} Stunden`,
  "Laufende Anpassung des Plans, statt ihn stehen zu lassen",
  "Eine zusätzliche Video-Sitzung, wenn es schlechter wird",
  "Zugang zur Praxis-App ohne gesonderte Kosten",
  `Klares Ende nach ${PROGRAMM.tage} Tagen — kein Abonnement`,
]

/** Der eine Unterschied, pro Variante in einem Satz. */
const UNTERSCHIED: Record<ProgrammVariante, { zeile: string; detail: string }> = {
  begleitet: {
    zeile: "Keine festen Video-Sitzungen",
    detail:
      "Außer der Konsultation zu Beginn ist kein Videotermin vereinbart. Die Begleitung läuft über den Chat und deinen Verlauf in der App.",
  },
  intensiv: {
    zeile: `${VARIANTEN.intensiv.calls} Video-Sitzungen, fest eingeplant`,
    detail:
      "Woche 1 bis 4 wöchentlich, Woche 5 bis 8 vierzehntägig, zum Schluss eine Zwischensitzung und das Abschlussgespräch. Fällt eine aus, wird sie nachgeholt.",
  },
}

export function PricingSection() {
  return (
    <section id="preis" className="relative py-24 sm:py-32" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="container mx-auto max-w-5xl px-4">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: GREEN }}>
            Das Angebot
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl" style={{ ...serif, color: INK }}>
            Zwei Wege durch die {PROGRAMM.tage} Tage
          </h2>
          <p className="mt-4 text-lg leading-relaxed" style={{ color: MUTED }}>
            Beide enthalten dieselbe Betreuung. Der Unterschied ist, wie oft wir uns per Video
            sehen.
          </p>
        </ScrollReveal>

        {/* Die beiden Karten */}
        <div className="mt-14 grid gap-6 sm:mt-16 lg:grid-cols-2 lg:gap-8">
          {VARIANTEN_REIHENFOLGE.map((id) => {
            const v = VARIANTEN[id]
            const u = UNTERSCHIED[id]
            const hell = !v.hervorgehoben

            return (
              <ScrollReveal key={v.id}>
                <div
                  className="relative flex h-full flex-col rounded-3xl p-7 sm:p-9"
                  style={
                    hell
                      ? { backgroundColor: PAPER, border: `1px solid ${LINE}` }
                      : { backgroundColor: GREEN, border: `1px solid ${GREEN}` }
                  }
                >
                  {v.label && (
                    <span
                      className="absolute -top-3 left-7 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] sm:left-9"
                      style={{ backgroundColor: SAND, color: "#3a2f1e" }}
                    >
                      {v.label}
                    </span>
                  )}

                  <h3
                    className="text-2xl sm:text-3xl"
                    style={{ ...serif, color: hell ? INK : PAPER }}
                  >
                    {v.name}
                  </h3>
                  <p
                    className="mt-1 text-[15px]"
                    style={{ color: hell ? MUTED : "rgba(248,245,240,0.72)" }}
                  >
                    {v.untertitel}
                  </p>

                  <div className="mt-7 flex items-baseline gap-2">
                    <span
                      className="text-[3.2rem] leading-none sm:text-[3.8rem]"
                      style={{ ...serif, color: hell ? INK : PAPER }}
                    >
                      {formatEuro(v.preis)}
                    </span>
                    <span
                      className="text-[14px]"
                      style={{ color: hell ? MUTED : "rgba(248,245,240,0.66)" }}
                    >
                      einmalig
                    </span>
                  </div>
                  <p
                    className="mt-2 text-[14px]"
                    style={{ color: hell ? MUTED : "rgba(248,245,240,0.66)" }}
                  >
                    für {PROGRAMM.tage} Tage Betreuung · Konsultation inbegriffen
                  </p>

                  {/* Der eine Unterschied */}
                  <div
                    className="mt-7 border-t pt-6"
                    style={{ borderColor: hell ? LINE : "rgba(248,245,240,0.16)" }}
                  >
                    <p
                      className="text-[15.5px] font-semibold leading-snug"
                      style={{ color: hell ? INK : PAPER }}
                    >
                      {u.zeile}
                    </p>
                    <p
                      className="mt-2 text-[14.5px] leading-relaxed"
                      style={{ color: hell ? BODY : "rgba(248,245,240,0.78)" }}
                    >
                      {u.detail}
                    </p>
                  </div>

                  <div className="mt-8 flex-1" />

                  <a
                    href={buchungsUrl("preis", v.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      size="lg"
                      className="group h-14 w-full rounded-xl text-base font-semibold hover:opacity-90"
                      style={
                        hell
                          ? { backgroundColor: GREEN, color: "#FFFFFF" }
                          : { backgroundColor: PAPER, color: GREEN }
                      }
                    >
                      Konsultation buchen
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </a>
                  <p
                    className="mt-3 text-center text-[13px] leading-relaxed"
                    style={{ color: hell ? MUTED : "rgba(248,245,240,0.6)" }}
                  >
                    Bei der Buchung wird noch nichts abgebucht.
                  </p>
                </div>
              </ScrollReveal>
            )
          })}
        </div>

        {/* Was in beiden steckt — einmal, mit gleichem Gewicht */}
        <ScrollReveal>
          <div
            className="mt-10 rounded-3xl border p-7 sm:mt-12 sm:p-9"
            style={{ borderColor: LINE, backgroundColor: "#FFFFFF" }}
          >
            <h3 className="text-xl sm:text-2xl" style={{ ...serif, color: INK }}>
              In beiden enthalten
            </h3>
            <ul className="mt-6 grid gap-x-10 gap-y-3.5 sm:grid-cols-2">
              {GEMEINSAM.map((g) => (
                <li key={g} className="flex gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GREEN }} />
                  <span className="text-[15px] leading-relaxed" style={{ color: BODY }}>
                    {g}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>

        {/* Entscheidungshilfe */}
        <ScrollReveal>
          <div className="mx-auto mt-12 max-w-2xl text-center sm:mt-14">
            <h3 className="text-xl sm:text-2xl" style={{ ...serif, color: INK }}>
              Welche passt zu dir?
            </h3>
            <p className="mt-4 text-[16px] leading-[1.75]" style={{ color: BODY }}>
              Wenn du weißt, dass du feste Termine brauchst, um dranzubleiben, nimm{" "}
              <strong style={{ color: INK }}>{VARIANTEN.intensiv.name}</strong>. Wenn du deinen Weg
              lieber eigenständig gehst und es dir reicht, deinen Therapeuten im Chat zu haben, ist{" "}
              <strong style={{ color: INK }}>{VARIANTEN.begleitet.name}</strong> die richtige Wahl —
              die Betreuung dahinter ist dieselbe.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed" style={{ color: MUTED }}>
              Du musst dich jetzt nicht festlegen. Wir entscheiden das gemeinsam am Ende der
              Konsultation, wenn wir wissen, worum es bei dir geht.
            </p>
          </div>
        </ScrollReveal>

        {/* Bedingungen */}
        <ScrollReveal>
          <div
            className="mt-14 grid gap-6 border-t pt-10 text-left text-[14px] leading-relaxed sm:mt-16 sm:grid-cols-3 sm:gap-8"
            style={{ borderColor: LINE, color: MUTED }}
          >
            <p>
              <strong className="block" style={{ color: INK }}>
                Abgerechnet wird nach dem Gespräch
              </strong>
              {formatEuro(VARIANTEN.begleitet.preis)} oder {formatEuro(VARIANTEN.intensiv.preis)}{" "}
              für das Programm — oder {formatEuro(PROGRAMM.konsultation)} für die Konsultation
              allein, wenn du dich dagegen entscheidest.
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
              Per Karte oder Klarna. Ratenzahlung über Klarna ist möglich; ob sie angeboten wird und
              in welchen Raten, entscheidet Klarna.
            </p>
          </div>
        </ScrollReveal>
      </div>

      {/* Dünner Abschluss zur nächsten Sektion */}
      <div aria-hidden className="mt-24 h-px w-full sm:mt-32" style={{ backgroundColor: PAPER }} />
    </section>
  )
}
