"use client"

/**
 * PROJ-26: „Das sagen wir dir zu".
 *
 * Der Kern der Positionierung: Leistungsversprechen statt Heilversprechen.
 * Jede Zeile beschreibt etwas, das WIR tun — nachprüfbar und zusagbar. Keine
 * einzige beschreibt ein Ergebnis beim Patienten. Wer hier „weniger Schmerzen"
 * ergänzen möchte, überschreitet genau die Grenze, die diese Sektion halten
 * muss (§ 3 HWG).
 *
 * Gestaltung: bewusst KEINE Häkchenliste. Acht Häkchen in zwei Spalten liest
 * niemand, und der Preisblock weiter unten benutzt dieselbe Optik — die Seite
 * würde sich wiederholen. Stattdessen ein nummeriertes Versprechen mit grossen
 * Ziffern, gegliedert in die drei Phasen davor / dazwischen / danach. Das liest
 * sich wie eine Urkunde und nicht wie eine Funktionsliste.
 *
 * Der Gegen-Absatz („was wir NICHT versprechen") bekommt dasselbe Gewicht wie
 * die Zusagen. Er ist die Pointe der Sektion, nicht das Kleingedruckte.
 */

import { ScrollReveal } from "./ScrollReveal"
import { PROGRAMM, VARIANTEN } from "@/lib/programm"

// Bis Schritt 2 zeigt die Seite die Variante „Intensiv“ — der bisherige Stand.
const INTENSIV = VARIANTEN.intensiv

const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const LINE = "#e7e1d6"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

interface Gruppe {
  phase: string
  zusagen: { titel: string; text: string }[]
}

const GRUPPEN: Gruppe[] = [
  {
    phase: "Bevor es losgeht",
    zusagen: [
      {
        titel: "Eine ehrliche Eignungsprüfung",
        text: `In der Konsultation klären wir, ob sich dein Beschwerdebild aus der Ferne betreuen lässt. Wenn nicht, sagen wir es dir — und du zahlst nur die ${PROGRAMM.konsultation} € für das Gespräch.`,
      },
      {
        titel: "Ein Plan, der zu dir gehört",
        text: "Tägliche Micro-Übungen und ein Trainingsplan für deine Trainingstage, zusammengestellt von deinem Therapeuten. Nicht von einem Algorithmus.",
      },
    ],
  },
  {
    phase: `Während der ${PROGRAMM.tage} Tage`,
    zusagen: [
      {
        titel: "Ein fester Ansprechpartner",
        text: `Derselbe Behandler über die gesamten ${PROGRAMM.tage} Tage. Kein Wechsel, kein Erklären von vorn.`,
      },
      {
        titel: "Antwort innerhalb von 24 Stunden",
        text: "Deine Nachricht im Chat wird an Werktagen innerhalb eines Arbeitstages beantwortet. Kein vages Später, keine Hotline.",
      },
      {
        titel: `${INTENSIV.calls} Video-Sitzungen, fest eingeplant`,
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
    ],
  },
  {
    phase: "Danach",
    zusagen: [
      {
        titel: "Ein klares Ende",
        text: `Nach ${PROGRAMM.tage} Tagen ist Schluss — automatisch. Kein Abonnement, keine stille Verlängerung, keine weitere Abbuchung.`,
      },
    ],
  },
]

export function GarantieSection() {
  let nummer = 0

  return (
    <section className="relative py-24 sm:py-32" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="container mx-auto max-w-4xl px-4">
        <ScrollReveal className="mb-14 max-w-2xl sm:mb-20">
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

        {GRUPPEN.map((g) => (
          <div key={g.phase} className="mb-12 sm:mb-16">
            <ScrollReveal>
              <div className="flex items-center gap-4">
                <span
                  className="shrink-0 text-[12px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: GREEN }}
                >
                  {g.phase}
                </span>
                <span aria-hidden className="h-px flex-1" style={{ backgroundColor: LINE }} />
              </div>
            </ScrollReveal>

            <ol className="mt-2">
              {g.zusagen.map((z) => {
                nummer += 1
                const nr = String(nummer).padStart(2, "0")
                return (
                  <ScrollReveal key={z.titel}>
                    <li className="flex gap-5 py-6 sm:gap-8 sm:py-7">
                      <span
                        aria-hidden
                        className="w-[2.2rem] shrink-0 pt-1 text-right text-[1.45rem] leading-none tabular-nums sm:w-[2.8rem] sm:text-[1.8rem]"
                        style={{ ...serif, color: SAND }}
                      >
                        {nr}
                      </span>
                      <div className="min-w-0">
                        <h3
                          className="text-lg leading-snug sm:text-xl"
                          style={{ ...serif, color: INK }}
                        >
                          {z.titel}
                        </h3>
                        <p
                          className="mt-1.5 max-w-xl text-[15px] leading-relaxed"
                          style={{ color: BODY }}
                        >
                          {z.text}
                        </p>
                      </div>
                    </li>
                  </ScrollReveal>
                )
              })}
            </ol>
          </div>
        ))}

        {/* Die Pointe — gleiches Gewicht wie die Zusagen, nicht Kleingedrucktes */}
        <ScrollReveal>
          <div
            className="mt-6 rounded-3xl p-7 sm:p-10"
            style={{ backgroundColor: PAPER, border: `1px solid ${LINE}` }}
          >
            <h3 className="text-xl sm:text-2xl" style={{ ...serif, color: INK }}>
              Und das sagen wir dir bewusst nicht zu
            </h3>
            <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed sm:text-base" style={{ color: BODY }}>
              Dass deine Beschwerden verschwinden. Wie ein Körper auf Bewegung reagiert, hängt von
              zu vielem ab, als dass irgendjemand das seriös zusagen könnte — und wer es trotzdem
              tut, sagt mehr über sich als über deine Aussichten.
            </p>
            <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed sm:text-base" style={{ color: BODY }}>
              Was wir zusagen können, ist die Begleitung. Und dass wir dir ehrlich sagen, wenn
              dieser Weg für dich nicht der richtige ist.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
