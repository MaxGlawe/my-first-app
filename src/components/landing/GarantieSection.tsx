"use client"

/**
 * PROJ-26: „Das garantieren wir dir".
 *
 * Der Kern der Positionierung: Leistungsversprechen statt Heilversprechen.
 * Jede Zeile hier beschreibt etwas, das WIR tun — nachprüfbar, zusagbar,
 * einklagbar. Keine einzige beschreibt ein Ergebnis beim Patienten.
 *
 * Wer hier „weniger Schmerzen" oder „mehr Beweglichkeit" ergänzen möchte:
 * Das ist genau die Grenze, die diese Sektion nicht überschreiten darf
 * (§ 3 HWG). Der Nutzen entsteht daraus, dass die Zusagen konkret sind —
 * nicht daraus, dass sie groß klingen.
 */

import { ScrollReveal } from "./ScrollReveal"
import { Check } from "lucide-react"
import { PROGRAMM, PROGRAMM_CALLS } from "@/lib/programm"

const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const LINE = "#e7e1d6"
const GREEN = "#2C3E2D"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

const ZUSAGEN: { titel: string; text: string }[] = [
  {
    titel: "Eine ehrliche Eignungsprüfung",
    text: `In der Konsultation klären wir, ob sich dein Beschwerdebild aus der Ferne betreuen lässt. Wenn nicht, sagen wir es dir — und du zahlst nur die ${PROGRAMM.konsultation} € für das Gespräch.`,
  },
  {
    titel: "Ein Plan, der zu dir gehört",
    text: "Tägliche Micro-Übungen und ein Trainingsplan für deine Trainingstage — zusammengestellt von deinem Therapeuten, nicht von einem Algorithmus.",
  },
  {
    titel: "Ein fester Ansprechpartner",
    text: "Derselbe Behandler über die gesamten 90 Tage. Kein Wechsel, kein Erklären von vorn.",
  },
  {
    titel: "Antwort innerhalb von 24 Stunden",
    text: "Deine Nachricht im Chat wird an Werktagen innerhalb eines Arbeitstages beantwortet. Kein vages Später, keine Hotline.",
  },
  {
    titel: `${PROGRAMM_CALLS} Video-Sitzungen, fest eingeplant`,
    text: "Wöchentlich, dann vierzehntägig, zum Schluss Zwischen- und Abschlussgespräch. Fällt eine aus, wird sie nachgeholt.",
  },
  {
    titel: "Anpassung statt Zettel",
    text: "Dein tägliches Check-in landet beim Therapeuten. Läuft etwas anders als gedacht, ändert sich der Plan — nicht erst beim nächsten Termin.",
  },
  {
    titel: "Eine zusätzliche Sitzung, wenn es schlechter wird",
    text: "Melde dich, und wir schieben einen Termin ein. Rückmeldung spätestens am nächsten Werktag.",
  },
  {
    titel: "Ein klares Ende",
    text: "Nach 90 Tagen ist Schluss — automatisch. Kein Abonnement, keine stille Verlängerung, keine weitere Abbuchung.",
  },
]

export function GarantieSection() {
  return (
    <section className="relative py-24 sm:py-32" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="container mx-auto max-w-5xl px-4">
        <ScrollReveal className="mb-12 max-w-2xl sm:mb-16">
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: GREEN }}>
            Unser Versprechen
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl" style={{ ...serif, color: INK }}>
            Das sagen wir dir zu
          </h2>
          <p className="mt-4 text-lg leading-relaxed" style={{ color: MUTED }}>
            Wir versprechen dir kein Ergebnis — das wäre unseriös, und niemand kann es halten.
            Wir versprechen dir, was wir tun. Daran kannst du uns messen.
          </p>
        </ScrollReveal>

        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {ZUSAGEN.map((z) => (
            <ScrollReveal key={z.titel}>
              <div className="flex gap-3.5">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: "rgba(44,62,45,0.1)" }}
                >
                  <Check className="h-3.5 w-3.5" style={{ color: GREEN }} />
                </span>
                <div>
                  <h3 className="text-base font-semibold" style={{ color: INK }}>
                    {z.titel}
                  </h3>
                  <p className="mt-1 text-[15px] leading-relaxed" style={{ color: BODY }}>
                    {z.text}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <p
            className="mt-14 rounded-2xl border p-5 text-[14px] leading-relaxed sm:p-6"
            style={{ borderColor: LINE, color: MUTED }}
          >
            Was wir bewusst nicht versprechen: dass deine Beschwerden verschwinden. Wie ein Körper
            auf Bewegung reagiert, hängt von zu vielem ab, als dass irgendjemand das seriös zusagen
            könnte. Was wir zusagen können, ist die Begleitung — und dass wir dir ehrlich sagen,
            wenn dieser Weg für dich nicht der richtige ist.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
