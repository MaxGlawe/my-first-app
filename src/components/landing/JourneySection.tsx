"use client"

/**
 * PROJ-26: Die 90 Tage als Zeitachse.
 *
 * Das ist die Sektion, die das Angebot erklärt. Wer bis hierher scrollt, will
 * wissen: Was passiert konkret, wann, und wie oft sehe ich jemanden? Deshalb
 * echte Zeitpunkte statt Schlagworte — und am Ende das Ausschleichen, weil das
 * der eigentliche Punkt ist: eng begleitet, Schritt für Schritt allein weiter.
 *
 * Bewusst ohne Ergebnisversprechen. Jede Zeile beschreibt eine Leistung, die
 * wir erbringen, nicht ein Ergebnis, das eintritt.
 */

import Image from "next/image"
import { ScrollReveal } from "./ScrollReveal"
import { PROGRAMM, PROGRAMM_CALLS } from "@/lib/programm"

const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const LINE = "#e7e1d6"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

interface Etappe {
  marke: string
  titel: string
  text: string
  /** Screenshot aus der App, sofern vorhanden. */
  bild?: { src: string; alt: string }
}

const ETAPPEN: Etappe[] = [
  {
    marke: "Tag 0",
    titel: "Die Videokonsultation",
    text:
      "30 Minuten, per Video. Wir gehen deine Beschwerden durch, schauen uns an, wo du stehst — und klären ehrlich, ob sich dein Beschwerdebild aus der Ferne betreuen lässt. Wenn nicht, sagen wir dir das und du verlierst keine Zeit.",
  },
  {
    marke: "Tag 1",
    titel: "Dein Plan steht in der App",
    text:
      "Kurze Übungen für jeden Tag, dazu ein Trainingsplan für die Tage, die du dir vorgenommen hast. Alles mit Video-Anleitung, alles auf dich zugeschnitten. Du musst nichts selbst zusammensuchen.",
    bild: { src: "/images/app/training.png", alt: "Trainingsplan mit Übungen in der Praxis-OS-App" },
  },
  {
    marke: "Woche 1 bis 4",
    titel: "Wöchentlich im Gespräch",
    text:
      "Einmal pro Woche sehen wir uns per Video. Dazwischen checkst du täglich kurz ein — Schmerz, Schlaf, Belastung, in unter einer Minute. Dein Therapeut sieht den Verlauf mit und passt den Plan an, statt ihn stehen zu lassen.",
    bild: { src: "/images/app/dashboard.png", alt: "Tägliches Check-in im Dashboard der Praxis-OS-App" },
  },
  {
    marke: "Woche 5 bis 8",
    titel: "Die Leine wird länger",
    text:
      "Jetzt alle zwei Wochen. Du kennst deine Übungen, du weißt, worauf du achtest. Der Chat bleibt offen — Antwort werktags innerhalb von 24 Stunden. Und wenn es schlechter wird, schieben wir eine zusätzliche Sitzung ein.",
  },
  {
    marke: `Tag ${PROGRAMM.tage}`,
    titel: "Das Abschlussgespräch",
    text:
      "Ein Zwischen-Call und zum Schluss das Abschlussgespräch: Was hat getragen, was nimmst du mit, wie machst du allein weiter. Danach endet die Betreuung automatisch — kein Abo, keine Verlängerung, keine Abbuchung.",
  },
]

export function JourneySection() {
  return (
    <section id="ablauf" className="relative py-24 sm:py-32" style={{ backgroundColor: PAPER }}>
      <div className="container mx-auto max-w-4xl px-4">
        <ScrollReveal className="mb-14 sm:mb-20">
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: GREEN }}>
            Der Ablauf
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl" style={{ ...serif, color: INK }}>
            {PROGRAMM.tage} Tage, Schritt für Schritt
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed" style={{ color: MUTED }}>
            Am Anfang eng, zum Schluss auf eigenen Beinen. Was in diesen Wochen passiert, steht
            hier — ohne Kleingedrucktes.
          </p>
        </ScrollReveal>

        <ol className="relative">
          {/* Durchgehende Linie der Zeitachse, auf Mobilgeräten links */}
          <span
            aria-hidden
            className="absolute left-[7px] top-2 bottom-2 w-px sm:left-[calc(9rem+7px)]"
            style={{ backgroundColor: LINE }}
          />

          {ETAPPEN.map((e, i) => (
            <li key={e.marke} className="relative">
              <ScrollReveal>
                <div className="flex gap-5 pb-12 sm:gap-8 sm:pb-16">
                  {/* Zeitmarke */}
                  <div className="hidden w-36 shrink-0 pt-0.5 text-right sm:block">
                    <span className="text-sm font-semibold tracking-wide" style={{ color: GREEN }}>
                      {e.marke}
                    </span>
                  </div>

                  {/* Punkt auf der Linie */}
                  <span
                    aria-hidden
                    className="relative z-10 mt-1.5 h-[15px] w-[15px] shrink-0 rounded-full border-[3px] bg-white"
                    style={{ borderColor: i === ETAPPEN.length - 1 ? SAND : GREEN }}
                  />

                  <div className="min-w-0 flex-1">
                    <span
                      className="mb-1 block text-xs font-semibold uppercase tracking-wider sm:hidden"
                      style={{ color: GREEN }}
                    >
                      {e.marke}
                    </span>
                    <h3 className="text-xl sm:text-2xl" style={{ ...serif, color: INK }}>
                      {e.titel}
                    </h3>
                    <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed sm:text-base" style={{ color: BODY }}>
                      {e.text}
                    </p>

                    {e.bild && (
                      <div
                        className="mt-5 inline-block overflow-hidden rounded-2xl border bg-white p-2"
                        style={{ borderColor: LINE }}
                      >
                        <Image
                          src={e.bild.src}
                          alt={e.bild.alt}
                          width={260}
                          height={520}
                          loading="lazy"
                          className="h-auto w-[180px] rounded-xl sm:w-[220px]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            </li>
          ))}
        </ol>

        <ScrollReveal>
          <p
            className="rounded-2xl border p-5 text-[15px] leading-relaxed sm:p-6"
            style={{ borderColor: LINE, backgroundColor: "rgba(44,62,45,0.04)", color: BODY }}
          >
            Insgesamt {PROGRAMM_CALLS} Video-Sitzungen, fest eingeplant. Fällt eine aus, wird sie
            nachgeholt. Praxis OS ist kein Notdienst — bei akuten Beschwerden wende dich bitte an
            den ärztlichen Notdienst oder die 112.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
