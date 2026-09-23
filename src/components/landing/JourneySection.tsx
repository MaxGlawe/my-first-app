"use client"

/**
 * PROJ-26: Die 90 Tage als Zeitachse — das Herzstück der Seite.
 *
 * Bildidee: Nicht die Pflanze erzählt die Geschichte, sondern DER STAB.
 * Tag 1 wird er gesetzt und eng gebunden, Woche für Woche werden die
 * Bindungen lockerer, am Ende liegt er neben dem Topf am Boden.
 *
 * Das ist bewusst so gewählt. Eine reine Samen-wird-Pflanze-Reihe neben
 * „Tag 0 → Tag 90" liest sich als bildliches Versprechen einer Besserung —
 * also als Vorher-Nachher-Darstellung, die wir auf dieser Seite überall
 * sonst gerade entfernt haben (§ 3 HWG). Der Stab dagegen zeigt UNSERE
 * Leistung: Wir geben Halt und nehmen ihn wieder weg. Kein Ergebnis-
 * versprechen, und trotzdem das stärkere Bild.
 *
 * Jede Zeile im Text beschreibt entsprechend eine Leistung, nicht ein
 * Ergebnis.
 */

import Image from "next/image"
import { ScrollReveal } from "./ScrollReveal"
import { PROGRAMM, VARIANTEN } from "@/lib/programm"

const INTENSIV = VARIANTEN.intensiv

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
  bild: string
  alt: string
}

const ETAPPEN: Etappe[] = [
  {
    marke: "Tag 0",
    titel: "Die Videokonsultation",
    text: "30 Minuten per Video. Wir gehen deine Beschwerden durch, schauen uns an, wo du stehst — und klären ehrlich, ob sich dein Beschwerdebild aus der Ferne betreuen lässt. Wenn nicht, sagen wir dir das, und du verlierst keine Zeit.",
    bild: "/images/journey/1-samen.webp",
    alt: "Ein Tontopf mit dunkler Erde, darauf ein einzelnes Samenkorn — noch ist nichts gepflanzt.",
  },
  {
    marke: "Tag 1",
    titel: "Dein Plan steht",
    text: "Kurze Übungen für jeden Tag, dazu ein Trainingsplan für die Tage, die du dir vorgenommen hast. Alles mit Video-Anleitung, alles auf dich zugeschnitten. Du musst nichts selbst zusammensuchen.",
    bild: "/images/journey/2-keimling.webp",
    alt: "Ein junger Keimling im Topf, daneben ein frisch gesetzter Holzstab mit einer Leinenbindung.",
  },
  {
    marke: "Woche 1 – 4",
    titel: "Die engste Phase",
    text: "Du checkst täglich kurz ein — Schmerz, Schlaf, Belastung, in unter einer Minute. Dein Therapeut liest den Verlauf mit und passt den Plan an, statt ihn stehen zu lassen. In „Intensiv“ sehen wir uns zusätzlich einmal pro Woche per Video.",
    bild: "/images/journey/3-gestuetzt.webp",
    alt: "Eine junge Pflanze, eng an einen Holzstab gebunden — der Halt liegt dicht am Stamm.",
  },
  {
    marke: "Woche 5 – 8",
    titel: "Die Leine wird länger",
    text: "Du kennst deine Übungen, du weißt, worauf du achtest. Der Chat bleibt offen, Antwort werktags innerhalb von 24 Stunden; die Video-Sitzungen in „Intensiv“ rücken auf alle zwei Wochen auseinander. Und wenn es schlechter wird, schieben wir eine zusätzliche Sitzung ein — in beiden Varianten.",
    bild: "/images/journey/4-gelockert.webp",
    alt: "Eine kräftigere Pflanze, die sich vom Stab wegneigt — nur noch eine lockere Bindung hält sie.",
  },
  {
    marke: `Tag ${PROGRAMM.tage}`,
    titel: "Der Abschluss",
    text: "Was hat getragen, was nimmst du mit, wie machst du allein weiter — in „Intensiv“ in einem Zwischen-Call und einem Abschlussgespräch, in „Begleitet“ im Chat. Danach endet die Betreuung automatisch — kein Abo, keine Verlängerung, keine Abbuchung.",
    bild: "/images/journey/5-frei.webp",
    alt: "Die Pflanze steht aufrecht ohne Stütze, der Holzstab liegt daneben auf dem Tisch.",
  },
]

export function JourneySection() {
  return (
    <section id="ablauf" className="relative py-24 sm:py-32" style={{ backgroundColor: PAPER }}>
      <div className="container mx-auto max-w-6xl px-4">
        <ScrollReveal className="mb-16 max-w-2xl sm:mb-24">
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: GREEN }}>
            Der Ablauf
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl" style={{ ...serif, color: INK }}>
            {PROGRAMM.tage} Tage, Schritt für Schritt
          </h2>
          <p className="mt-4 text-lg leading-relaxed" style={{ color: MUTED }}>
            Am Anfang eng, zum Schluss auf eigenen Beinen. Der Halt, den wir geben, nimmt mit
            Absicht ab — bis du ihn nicht mehr brauchst.
          </p>
        </ScrollReveal>

        <ol className="space-y-20 sm:space-y-28">
          {ETAPPEN.map((e, i) => {
            const bildRechts = i % 2 === 1
            return (
              <li key={e.marke}>
                <ScrollReveal>
                  <div className="grid items-center gap-8 sm:gap-14 lg:grid-cols-2">
                    {/* Bild */}
                    <div className={bildRechts ? "lg:order-last" : undefined}>
                      <div
                        className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl"
                        style={{ backgroundColor: "#EFEAE2" }}
                      >
                        <Image
                          src={e.bild}
                          alt={e.alt}
                          fill
                          loading={i === 0 ? "eager" : "lazy"}
                          sizes="(min-width: 1024px) 46vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {/* Text */}
                    <div className={bildRechts ? "lg:pr-6" : "lg:pl-6"}>
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className="h-px w-8"
                          style={{ backgroundColor: i === ETAPPEN.length - 1 ? SAND : GREEN }}
                        />
                        <span
                          className="text-[12px] font-semibold uppercase tracking-[0.18em]"
                          style={{ color: i === ETAPPEN.length - 1 ? "#8a7a62" : GREEN }}
                        >
                          {e.marke}
                        </span>
                      </div>

                      <h3
                        className="mt-4 text-2xl leading-tight sm:text-3xl lg:text-4xl"
                        style={{ ...serif, color: INK }}
                      >
                        {e.titel}
                      </h3>
                      <p
                        className="mt-4 max-w-xl text-[15.5px] leading-relaxed sm:text-base"
                        style={{ color: BODY }}
                      >
                        {e.text}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              </li>
            )
          })}
        </ol>

        <ScrollReveal>
          <p
            className="mx-auto mt-20 max-w-2xl rounded-2xl border p-5 text-center text-[14.5px] leading-relaxed sm:mt-28 sm:p-6"
            style={{ borderColor: LINE, backgroundColor: "rgba(255,255,255,0.6)", color: BODY }}
          >
            In „Intensiv“ sind {INTENSIV.calls} Video-Sitzungen fest eingeplant; fällt eine aus,
            wird sie nachgeholt. In „Begleitet“ läuft die Begleitung über den Chat. Praxis OS ist
            kein Notdienst — bei akuten Beschwerden wende dich bitte an den ärztlichen Notdienst
            oder die 112.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
