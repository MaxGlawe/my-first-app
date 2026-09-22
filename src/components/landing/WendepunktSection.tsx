"use client"

/**
 * PROJ-26: Der Wendepunkt der Seite.
 *
 * Bis hierher ging es um das Problem. Ab hier um das Angebot. Diese Sektion
 * ist der Scharnierpunkt — und sie muss als solcher auch AUSSEHEN, sonst liest
 * sich die Seite als eine lange Fläche durch. Deshalb der einzige dunkle Block
 * der Startseite: Das Auge registriert den Wechsel, bevor es den ersten Satz
 * gelesen hat.
 *
 * Zwei Ebenen, mit Absicht getrennt:
 *
 *  1. Die Wendung. Ein Satz über den Leser, nicht über das Produkt. Er darf
 *     kein Ergebnis versprechen (HWG) — „jemand, der dranbleibt" ist eine
 *     Aussage über UNS, nicht über den Verlauf der Beschwerden.
 *
 *  2. Die Definition. Ein in sich geschlossener Absatz, der ohne den Rest der
 *     Seite verständlich ist: was, für wen, wie lange, von wem. Das ist der
 *     Absatz, den Sprachmodelle zitieren, wenn jemand nach Praxis OS fragt —
 *     deshalb steht er als echter Text und nicht in einer Grafik.
 */

import { ScrollReveal } from "./ScrollReveal"
import { PROGRAMM, PROGRAMM_CALLS } from "@/lib/programm"

const PAPER = "#F8F5F0"
const SAND = "#C9B79C"
const GREEN = "#2C3E2D"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

export function WendepunktSection() {
  return (
    <section
      id="was-ist-praxis-os"
      className="relative overflow-hidden py-24 sm:py-32"
      style={{ backgroundColor: GREEN }}
    >
      {/* Sehr zurückhaltende Aufhellung, damit die Fläche nicht tot wirkt */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(201,183,156,0.16) 0%, transparent 70%)" }}
      />

      <div className="container relative mx-auto max-w-3xl px-4 text-center">
        <ScrollReveal>
          <p
            className="text-[1.9rem] leading-[1.25] sm:text-[2.6rem] lg:text-[3.1rem]"
            style={{ ...serif, color: PAPER }}
          >
            Was fehlt, ist selten die bessere Übung.
            <span className="mt-2 block" style={{ color: SAND }}>
              Es ist jemand, der über Wochen dranbleibt.
            </span>
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <span
            aria-hidden
            className="mx-auto mt-12 block h-px w-16"
            style={{ backgroundColor: "rgba(201,183,156,0.45)" }}
          />
        </ScrollReveal>

        <ScrollReveal>
          <h2
            className="mt-12 text-sm font-medium uppercase tracking-[0.18em]"
            style={{ color: SAND }}
          >
            Was ist das {PROGRAMM.tage}-Tage-Programm?
          </h2>
          <p
            className="mx-auto mt-5 max-w-2xl text-[16px] leading-[1.75] sm:text-[17px]"
            style={{ color: "rgba(248,245,240,0.82)" }}
          >
            Praxis OS ist ein {PROGRAMM.tage}-Tage-Programm für physiotherapeutische
            Fernbetreuung. Am Anfang steht eine 30-minütige Videokonsultation, in der geprüft
            wird, ob sich das Beschwerdebild aus der Ferne betreuen lässt. Danach erhältst du
            einen persönlichen Plan aus täglichen Micro-Übungen und einem Trainingsplan für
            festgelegte Trainingstage, checkst täglich kurz in der App ein und hast über die
            gesamte Zeit denselben Behandler — im Chat erreichbar, mit {PROGRAMM_CALLS}{" "}
            Video-Sitzungen, die anfangs wöchentlich stattfinden und zum Ende hin seltener
            werden. Behandelt wird von Max Glawe, Heilpraktiker für Physiotherapie, mit Praxis in
            Wildau. Die Betreuung endet nach {PROGRAMM.tage} Tagen automatisch; ein Abonnement
            entsteht nicht.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
