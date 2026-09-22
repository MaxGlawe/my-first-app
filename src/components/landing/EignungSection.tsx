"use client"

/**
 * PROJ-26: Für wen es passt — und für wen nicht.
 *
 * Die „Passt nicht"-Spalte ist kein Haftungsausschluss im Kleingedruckten,
 * sondern das stärkste Vertrauenssignal der Seite: Wer offen sagt, wen er
 * wegschickt, wird bei den anderen glaubwürdiger.
 *
 * Fachlich ist sie zugleich das vorgelagerte Red-Flag-Screening — dieselben
 * Kriterien, die auch im Schmerzcheck zum Stopp führen. Deshalb bewusst
 * konkret statt vage: „Taubheit im Sattelbereich" hilft jemandem, der es
 * gerade hat. „Bei bestimmten Warnzeichen" hilft niemandem.
 */

import { ScrollReveal } from "./ScrollReveal"
import { Check, X } from "lucide-react"

const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const LINE = "#e7e1d6"
const GREEN = "#2C3E2D"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

const PASST = [
  "Beschwerden, die länger bestehen oder immer wiederkommen",
  "Rücken, Nacken, Schulter, Hüfte, Knie",
  "Du hattest schon Physiotherapie und willst diesmal dranbleiben",
  "Du kannst dir täglich ein paar Minuten nehmen",
  "Du hast ein Smartphone und etwas Platz zum Bewegen",
  "Ein Arzt hat abgeklärt, dass nichts Ernsthaftes dahintersteckt",
]

const PASST_NICHT = [
  "Frische Verletzungen, Brüche oder eine kürzliche Operation",
  "Starke Schmerzen, die plötzlich und ohne erkennbaren Anlass begonnen haben",
  "Taubheitsgefühl im Sattelbereich oder Probleme beim Wasserlassen",
  "Ungewollter Gewichtsverlust, Fieber oder Nachtschweiß zusammen mit den Beschwerden",
  "Beschwerden, die eine Untersuchung mit den Händen vor Ort brauchen",
  "Du suchst eine einmalige Behandlung statt einer Begleitung über Wochen",
]

export function EignungSection() {
  return (
    <section className="relative py-24 sm:py-32" style={{ backgroundColor: PAPER }}>
      <div className="container mx-auto max-w-5xl px-4">
        <ScrollReveal className="mb-12 max-w-2xl sm:mb-16">
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: GREEN }}>
            Ehrlich gesagt
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl" style={{ ...serif, color: INK }}>
            Passt das zu dir?
          </h2>
          <p className="mt-4 text-lg leading-relaxed" style={{ color: MUTED }}>
            Fernbetreuung ist nicht für jeden und nicht für jedes Beschwerdebild das Richtige.
            Genau deshalb steht am Anfang die Konsultation — und nicht der Kauf.
          </p>
        </ScrollReveal>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
          <ScrollReveal>
            <div className="h-full rounded-3xl border bg-white p-6 sm:p-8" style={{ borderColor: LINE }}>
              <h3 className="text-xl" style={{ ...serif, color: GREEN }}>
                Das spricht dafür
              </h3>
              <ul className="mt-5 space-y-3">
                {PASST.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-[15px] leading-relaxed" style={{ color: BODY }}>
                    <Check className="mt-1 h-4 w-4 shrink-0" style={{ color: GREEN }} />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="h-full rounded-3xl border bg-white p-6 sm:p-8" style={{ borderColor: LINE }}>
              <h3 className="text-xl" style={{ ...serif, color: INK }}>
                Dann bist du woanders besser aufgehoben
              </h3>
              <ul className="mt-5 space-y-3">
                {PASST_NICHT.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-[15px] leading-relaxed" style={{ color: BODY }}>
                    <X className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[13px] leading-relaxed" style={{ color: MUTED }}>
                Trifft eines davon zu, wende dich bitte zuerst an eine Ärztin oder einen Arzt. Bei
                akuten Notfällen an den ärztlichen Notdienst oder die 112.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
