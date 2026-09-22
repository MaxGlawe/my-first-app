"use client"

/**
 * PROJ-26: Schmales Zwischenband mit Handlungsaufforderung.
 *
 * Zwischen Hero, Preis und Abschluss lagen sechs Abschnitte ohne jede
 * Möglichkeit zu handeln — wer nach der Journey überzeugt war, musste erst
 * durch vier weitere Sektionen scrollen, um einen Knopf zu finden.
 *
 * Bewusst KEIN weiterer grosser Block: Ein voller CTA-Abschnitt nach jeder
 * Sektion zerschlägt die Ruhe, von der diese Seite lebt. Dieses Band ist
 * schmal, einzeilig und setzt sich nur leicht vom Umfeld ab — es liest sich
 * als Pause, nicht als Verkaufsunterbrechung.
 *
 * Jede Platzierung bekommt ein eigenes `abschnitt` und landet damit als
 * utm_content in der Statistik. Nach ein paar Wochen ist messbar, welche
 * Stelle die Buchungen bringt — und ob ein Band ueberhaupt etwas beitraegt.
 */

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { buchungsUrl } from "@/lib/programm"

const PAPER = "#F8F5F0"
const INK = "#0f172a"
const MUTED = "#64748b"
const LINE = "#e7e1d6"
const GREEN = "#2C3E2D"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

export interface CtaBandProps {
  /** Eine Zeile, die zur Stelle im Lesefluss passt. */
  satz: string
  /** Kleiner Zusatz darunter, optional. */
  zusatz?: string
  /** Landet als utm_content im Buchungslink. */
  abschnitt: string
  /** Hintergrund an die angrenzende Sektion angleichen. */
  hell?: boolean
}

export function CtaBand({ satz, zusatz, abschnitt, hell = false }: CtaBandProps) {
  return (
    <section
      className="relative"
      style={{ backgroundColor: hell ? "#FFFFFF" : PAPER }}
      aria-label="Termin buchen"
    >
      <div className="container mx-auto max-w-5xl px-4">
        <div
          className="flex flex-col items-start gap-6 border-y py-10 sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:py-12"
          style={{ borderColor: LINE }}
        >
          <div className="max-w-xl">
            <p className="text-xl leading-snug sm:text-2xl" style={{ ...serif, color: INK }}>
              {satz}
            </p>
            {zusatz && (
              <p className="mt-2 text-[14.5px] leading-relaxed" style={{ color: MUTED }}>
                {zusatz}
              </p>
            )}
          </div>

          <a
            href={buchungsUrl(abschnitt)}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button
              size="lg"
              className="group h-12 rounded-xl px-7 text-[15px] font-semibold text-white hover:opacity-90"
              style={{ backgroundColor: GREEN }}
            >
              Konsultation buchen
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  )
}
