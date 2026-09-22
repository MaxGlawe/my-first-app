"use client"

/**
 * PROJ-26: Das Problem — und in einem Satz, was wir dagegen setzen.
 *
 * Wichtig im Ton: keine andere Praxis abwerten. Das Problem ist strukturell
 * (Wartezeiten, getaktete Termine, sechs Einheiten pro Verordnung), nicht die
 * Schuld der Kolleginnen und Kollegen, die darin arbeiten. Wer hier über
 * andere herzieht, verliert genau die Leute, die vorher schon irgendwo in
 * Behandlung waren — also fast alle.
 */

import { ScrollReveal } from "./ScrollReveal"
import { PROGRAMM } from "@/lib/programm"

const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const LINE = "#e7e1d6"
const GREEN = "#2C3E2D"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

const PUNKTE = [
  {
    titel: "Wochen warten auf einen Termin",
    text: "Bis es losgeht, hat sich die Schonhaltung längst eingeschliffen.",
  },
  {
    titel: "Sechs Einheiten, dann ist die Verordnung leer",
    text: "Gerade wenn es anfängt zu greifen, ist Schluss — und der nächste Termin beim Arzt steht an.",
  },
  {
    titel: "Zwanzig Minuten, dann der nächste",
    text: "Für Fragen zwischendurch ist im Takt einer vollen Praxis kaum Platz.",
  },
  {
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
            Nicht zu wenig Können.<br />Zu wenig Zeit.
          </h2>
          <p className="mt-4 text-lg leading-relaxed" style={{ color: MUTED }}>
            In den Praxen arbeiten gute Leute. Das System, in dem sie arbeiten, gibt nur wenig her
            — und das merkt man vor allem dann, wenn Beschwerden länger bleiben.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border sm:grid-cols-2" style={{ borderColor: LINE, backgroundColor: LINE }}>
          {PUNKTE.map((p) => (
            <ScrollReveal key={p.titel} className="bg-white p-6 sm:p-8">
              <h3 className="text-lg" style={{ ...serif, color: INK }}>
                {p.titel}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed" style={{ color: BODY }}>
                {p.text}
              </p>
            </ScrollReveal>
          ))}
        </div>

        {/* Das Angebot in einem Satz — bewusst als eigener, ruhiger Block. */}
        <ScrollReveal className="mt-16 text-center sm:mt-20">
          <p
            className="mx-auto max-w-3xl text-2xl leading-[1.35] sm:text-3xl lg:text-4xl"
            style={{ ...serif, color: INK }}
          >
            Praxis OS ist ein {PROGRAMM.tage}-Tage-Programm:
            <span style={{ color: GREEN }}> ein Therapeut, ein Plan, täglicher Kontakt</span> —
            und eine App, die das Ganze zusammenhält.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
