"use client"

/**
 * PROJ-26: Für wen das Programm passt — und wann zuerst ein Arzt ranmuss.
 *
 * Die erste Fassung hatte zwei gleich grosse Spalten: „Das spricht dafür" und
 * „Dann bist du woanders besser aufgehoben". Dadurch las sich die Sektion wie
 * eine ausgeglichene Pro-und-Contra-Liste — gefühlt sprach mehr dagegen als
 * dafür.
 *
 * Der Fehler war die Rahmung, nicht die Anzahl. Die rechte Spalte ist kein
 * Gegenargument, sondern ein Sicherheitshinweis: medizinische Warnzeichen, bei
 * denen zuerst eine Ärztin oder ein Arzt gefragt ist. Das hat mit der Qualität
 * des Angebots nichts zu tun.
 *
 * Deshalb jetzt asymmetrisch: links die ausführliche, den Leser ansprechende
 * Seite; rechts ein ruhiger, schmalerer Hinweisblock, der heisst, was er ist.
 * Er bleibt trotzdem stehen — wer offen sagt, wen er wegschickt, wird beim Ja
 * geglaubt. Er soll nur nicht wie ein Einwand wirken.
 */

import { ScrollReveal } from "./ScrollReveal"
import { Check, Stethoscope } from "lucide-react"

const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const LINE = "#e7e1d6"
const GREEN = "#2C3E2D"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

const PASST = [
  "Deine Beschwerden bestehen schon länger oder kommen immer wieder",
  "Es geht um Rücken, Nacken, Schulter, Hüfte oder Knie",
  "Du hattest schon Physiotherapie — und willst diesmal wirklich dranbleiben",
  "Du bist bereit, dir täglich ein paar Minuten zu nehmen",
  "Du willst verstehen, warum du was tust, statt einen Zettel abzuarbeiten",
  "Dir ist wichtig, dass derselbe Mensch dich über Wochen begleitet",
  "Anfahrten und Wartezeiten passen nicht in deinen Alltag",
  "Ein Arzt hat abgeklärt, dass nichts Ernsthaftes dahintersteckt",
]

const ZUERST_ZUM_ARZT = [
  "Frische Verletzungen, Brüche oder eine Operation vor Kurzem",
  "Starke Schmerzen, die plötzlich und ohne erkennbaren Anlass begannen",
  "Taubheitsgefühl im Sattelbereich oder Probleme beim Wasserlassen",
  "Gewichtsverlust, Fieber oder Nachtschweiß zusammen mit den Beschwerden",
]

export function EignungSection() {
  return (
    <section className="relative py-24 sm:py-32" style={{ backgroundColor: PAPER }}>
      <div className="container mx-auto max-w-6xl px-4">
        <ScrollReveal className="mb-12 max-w-2xl sm:mb-16">
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: GREEN }}>
            Ehrlich gesagt
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl" style={{ ...serif, color: INK }}>
            Passt das zu dir?
          </h2>
          <p className="mt-4 text-lg leading-relaxed" style={{ color: MUTED }}>
            Fernbetreuung ist nicht für jedes Beschwerdebild das Richtige. Genau deshalb steht am
            Anfang die Konsultation — und nicht der Kauf.
          </p>
        </ScrollReveal>

        <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr] lg:gap-10">
          {/* Die Hauptaussage */}
          <ScrollReveal>
            <div className="h-full rounded-3xl bg-white p-7 sm:p-10" style={{ border: `1px solid ${LINE}` }}>
              <h3 className="text-2xl sm:text-3xl" style={{ ...serif, color: GREEN }}>
                Dann bist du hier richtig
              </h3>
              <ul className="mt-7 space-y-4">
                {PASST.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-3.5 text-[16px] leading-relaxed sm:text-[17px]"
                    style={{ color: INK }}
                  >
                    <Check className="mt-1.5 h-4 w-4 shrink-0" strokeWidth={2.5} style={{ color: GREEN }} />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          {/* Der Sicherheitshinweis — bewusst ruhiger und schmaler */}
          <ScrollReveal>
            <div
              className="h-full rounded-3xl p-6 sm:p-8"
              style={{ border: `1px solid ${LINE}`, backgroundColor: "rgba(255,255,255,0.55)" }}
            >
              <div className="flex items-center gap-2.5">
                <Stethoscope className="h-4 w-4 shrink-0" strokeWidth={1.5} style={{ color: MUTED }} aria-hidden />
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: MUTED }}>
                  Bitte zuerst ärztlich abklären
                </h3>
              </div>

              <p className="mt-4 text-[14.5px] leading-relaxed" style={{ color: BODY }}>
                Unabhängig davon, wer dich behandelt: Bei diesen Anzeichen gehört zuerst eine
                Ärztin oder ein Arzt dazu.
              </p>

              <ul className="mt-5 space-y-3">
                {ZUERST_ZUM_ARZT.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-3 text-[14.5px] leading-relaxed"
                    style={{ color: BODY }}
                  >
                    <span
                      aria-hidden
                      className="mt-[9px] h-1 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: MUTED }}
                    />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-[13px] leading-relaxed" style={{ color: MUTED }}>
                In der Konsultation gehen wir diese Punkte ohnehin gemeinsam durch. Bei akuten
                Notfällen wende dich bitte an den ärztlichen Notdienst oder die 112.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
