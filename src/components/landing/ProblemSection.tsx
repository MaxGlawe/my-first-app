"use client"

/**
 * PROJ-26: Das Problem — und in einem Satz, was wir dagegen setzen.
 *
 * Ton: keine andere Praxis abwerten. Das Problem ist strukturell (Wartezeiten,
 * getaktete Termine, sechs Einheiten pro Verordnung), nicht die Schuld der
 * Kolleginnen und Kollegen, die darin arbeiten. Wer hier über andere herzieht,
 * verliert genau die Leute, die vorher schon irgendwo in Behandlung waren —
 * also fast alle.
 *
 * Zur Gestaltung: statt vier gleicher Kästchen ein vertikaler Rhythmus aus
 * vier Aussagen. Die Symbole sind dünn, klein und einfarbig und stehen NEBEN
 * der Aussage, nicht darüber in einem Kreis — Kästchen mit bunten Icons sind
 * das Erkennungszeichen jeder Baukasten-Seite. Hier soll das Auge die Sätze
 * lesen und das Symbol nur nebenbei mitnehmen.
 */

import { ScrollReveal } from "./ScrollReveal"
import { Hourglass, FileMinus, Timer, MapPinOff, type LucideIcon } from "lucide-react"
import { PROGRAMM } from "@/lib/programm"

const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const LINE = "#e7e1d6"
const GREEN = "#2C3E2D"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

const PUNKTE: { icon: LucideIcon; titel: string; text: string }[] = [
  {
    icon: Hourglass,
    titel: "Wochen warten auf einen Termin",
    text: "Bis es losgeht, hat sich die Schonhaltung längst eingeschliffen.",
  },
  {
    icon: FileMinus,
    titel: "Sechs Einheiten, dann ist die Verordnung leer",
    text: "Gerade wenn es anfängt zu greifen, ist Schluss — und der nächste Termin beim Arzt steht an.",
  },
  {
    icon: Timer,
    titel: "Zwanzig Minuten, dann der nächste",
    text: "Für Fragen zwischendurch ist im Takt einer vollen Praxis kaum Platz.",
  },
  {
    icon: MapPinOff,
    titel: "Zuhause allein mit dem Übungszettel",
    text: "Mache ich das richtig? Ist der Schmerz normal? Genau da hört die Betreuung meist auf.",
  },
]

export function ProblemSection() {
  return (
    <section className="relative py-24 sm:py-32" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="container mx-auto max-w-5xl px-4">
        <ScrollReveal className="max-w-2xl">
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: GREEN }}>
            Warum es oft nicht reicht
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl" style={{ ...serif, color: INK }}>
            Nicht zu wenig Können.
            <br />
            Zu wenig Zeit.
          </h2>
          <p className="mt-4 text-lg leading-relaxed" style={{ color: MUTED }}>
            In den Praxen arbeiten gute Leute. Das System, in dem sie arbeiten, gibt nur wenig her
            — und das merkt man vor allem dann, wenn Beschwerden länger bleiben.
          </p>
        </ScrollReveal>

        <div className="mt-14 sm:mt-20">
          {PUNKTE.map((p, i) => (
            <ScrollReveal key={p.titel}>
              <div
                className="flex items-start gap-5 py-7 sm:gap-7 sm:py-9"
                style={i > 0 ? { borderTop: `1px solid ${LINE}` } : undefined}
              >
                <p.icon
                  className="mt-1 h-6 w-6 shrink-0 sm:h-7 sm:w-7"
                  strokeWidth={1.25}
                  style={{ color: GREEN }}
                  aria-hidden
                />
                <div className="min-w-0">
                  <h3 className="text-xl leading-snug sm:text-2xl" style={{ ...serif, color: INK }}>
                    {p.titel}
                  </h3>
                  <p className="mt-2 max-w-xl text-[15px] leading-relaxed sm:text-base" style={{ color: BODY }}>
                    {p.text}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Das Angebot in einem Satz — bewusst als eigener, ruhiger Block. */}
        <ScrollReveal className="mt-16 text-center sm:mt-24">
          <p
            className="mx-auto max-w-3xl text-2xl leading-[1.35] sm:text-3xl lg:text-4xl"
            style={{ ...serif, color: INK }}
          >
            Praxis OS ist ein {PROGRAMM.tage}-Tage-Programm:
            <span style={{ color: GREEN }}> ein Therapeut, ein Plan, täglicher Kontakt</span> — und
            eine App, die das Ganze zusammenhält.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
