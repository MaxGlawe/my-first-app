"use client"

/**
 * PROJ-26: Abschluss.
 *
 * Vollflächiges Bild, ein Satz, ein Knopf — die Seite endet so, wie sie
 * begonnen hat, und schliesst die Klammer: Am Anfang wird der Stab gesetzt,
 * hier liegt er am Boden und die Pflanze steht allein.
 *
 * Der Schlusssatz ist bewusst eine Einladung und kein Versprechen. „Finden wir
 * heraus, ob wir dir helfen können" behauptet nichts über den Ausgang — und
 * ist trotzdem der ehrlichste Abschluss, den diese Seite haben kann.
 *
 * Kein eingebetteter Kalender: Der Kalender lebt auf physiotherapie-glawe.de.
 * Als iframe haetten wir weder Layout-Kontrolle noch verlaessliches Verhalten
 * auf Mobilgeraeten, und faellt er aus, waere die Startseite betroffen. Der
 * Knopf fuehrt deshalb direkt dorthin, mit UTM-Parametern.
 */

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { PROGRAMM, buchungsUrl, formatEuro } from "@/lib/programm"

const INK = "#0f172a"
const GREEN = "#2C3E2D"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

export function CtaSection() {
  return (
    <section className="relative isolate overflow-hidden">
      <Image
        src="/images/journey/abschluss.webp"
        alt="Eine junge Pflanze im Tontopf steht aufrecht ohne Stütze, der Holzstab liegt daneben auf der Fläche."
        fill
        loading="lazy"
        sizes="100vw"
        className="-z-10 object-cover object-[72%_center] sm:object-center"
      />

      {/* Verlauf, damit der Text auf jedem Bildausschnitt lesbar bleibt —
          auf Mobilgeraeten von unten, auf breiten Schirmen von links. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 sm:hidden"
        style={{
          background:
            "linear-gradient(to top, rgba(248,245,240,0.97) 0%, rgba(248,245,240,0.92) 45%, rgba(248,245,240,0.45) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 hidden sm:block"
        style={{
          background:
            "linear-gradient(to right, rgba(248,245,240,0.96) 0%, rgba(248,245,240,0.85) 38%, rgba(248,245,240,0.15) 68%, rgba(248,245,240,0) 100%)",
        }}
      />

      <div className="container mx-auto max-w-6xl px-4">
        <div className="max-w-xl py-28 sm:py-40 lg:py-48">
          <h2
            className="text-[2.1rem] leading-[1.12] sm:text-5xl lg:text-[3.4rem]"
            style={{ ...serif, color: INK }}
          >
            Irgendwann ist der Stab
            <br />
            nicht mehr nötig.
          </h2>

          <p className="mt-6 max-w-md text-lg leading-relaxed" style={{ color: "#334155" }}>
            {PROGRAMM.tage} Tage, ein Therapeut, ein Plan. Am Anfang eng begleitet, am Ende
            ohne uns.
          </p>

          <div className="mt-9">
            <a href={buchungsUrl("abschluss")} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="group h-14 rounded-xl px-9 text-base font-semibold text-white hover:opacity-90"
                style={{ backgroundColor: GREEN }}
              >
                Konsultation buchen
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </a>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed" style={{ color: "#64748b" }}>
              30 Minuten per Video für {formatEuro(PROGRAMM.konsultation)}, abgerechnet nach dem
              Gespräch. Startest du danach das Programm, ist die Konsultation darin enthalten.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
