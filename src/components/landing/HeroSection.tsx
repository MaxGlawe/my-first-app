"use client"

/**
 * PROJ-26: Hero mit vollflächigem Bild.
 *
 * Vorbild ist der Aufbau grosser Tourismusseiten: Bild bis an die Kanten, Text
 * darüber, ein Knopf. Was dort funktioniert, ist aber weniger das Bild an sich
 * als die freie Fläche darin — deshalb liegt der Text hier über der ruhigen
 * Seite des Motivs und nicht über dem Gesicht.
 *
 * WENN EIN QUERFORMAT KOMMT: nur HERO_BILD austauschen und `variante` auf
 * "vollflaechig" stellen. Dann legt sich der Text über das ganze Bild statt
 * daneben. Beide Wege sind unten ausgebaut, damit der Wechsel kein Umbau wird.
 */

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { BetreuungsbogenGrafik } from "./BetreuungsbogenGrafik"
import { PROGRAMM, PROGRAMM_CALLS, buchungsUrl } from "@/lib/programm"

const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const LINE = "#e7e1d6"
const GREEN = "#2C3E2D"

const serif = { fontFamily: "var(--font-serif)", fontWeight: 600 } as const

/**
 * Das Hero-Motiv. Hochformat 800x1200 — reicht fuer die halbe Breite in
 * nativer Aufloesung, nicht fuer die ganze. Ein Querformat mit ruhiger Flaeche
 * oben (Menschen klein im Bild, Gegenlicht) wuerde die vollflaechige Variante
 * tragen.
 */
const HERO_BILD = {
  src: "/images/maxglawe.webp",
  alt: "Max Glawe, Heilpraktiker für Physiotherapie, in seinen Praxisräumen",
}

export function HeroSection() {
  return (
    <section className="relative" style={{ backgroundColor: PAPER }}>
      <div className="relative mx-auto max-w-7xl">
        <div className="relative grid lg:min-h-[86vh] lg:grid-cols-[1.05fr_0.95fr]">
          {/* ── Bild ───────────────────────────────────────────────────────
              Auf grossen Schirmen rechts ueber die volle Hoehe, auf kleinen
              als Band unter dem Text. Der Verlauf laesst es in beiden Faellen
              in den Papierton auslaufen, statt hart abzuschneiden. */}
          <div className="relative order-first h-[58vw] max-h-[420px] min-h-[280px] w-full lg:order-last lg:h-auto lg:max-h-none">
            <Image
              src={HERO_BILD.src}
              alt={HERO_BILD.alt}
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover object-[50%_18%] lg:object-[40%_22%]"
            />
            {/* Uebergang ins Papier: unten auf Mobil, links auf Desktop */}
            <div
              aria-hidden
              className="absolute inset-0 lg:hidden"
              style={{
                background: `linear-gradient(to bottom, rgba(248,245,240,0.10) 0%, rgba(248,245,240,0.05) 45%, ${PAPER} 100%)`,
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0 hidden lg:block"
              style={{
                background: `linear-gradient(to right, ${PAPER} 0%, rgba(248,245,240,0.72) 22%, rgba(248,245,240,0) 58%)`,
              }}
            />
          </div>

          {/* ── Text ─────────────────────────────────────────────────────── */}
          <div className="relative z-10 flex flex-col justify-center px-4 pb-4 pt-10 sm:px-6 lg:-mr-24 lg:py-24 lg:pl-10 lg:pr-0">
            <div
              className="animate-fade-in-up inline-flex w-fit items-center gap-2 rounded-full border px-4 py-1.5"
              style={{ borderColor: LINE, backgroundColor: "rgba(255,255,255,0.7)" }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: GREEN }} />
              <span
                className="text-[11px] font-medium uppercase tracking-[0.18em]"
                style={{ color: GREEN }}
              >
                Heilpraktiker für Physiotherapie
              </span>
            </div>

            <h1
              className="animate-fade-in-up animation-delay-150 mt-6 max-w-[15ch] text-[2.5rem] leading-[1.02] sm:text-6xl lg:text-[4.1rem]"
              style={{ ...serif, color: INK }}
            >
              Dein Physiotherapeut für die Hosentasche.
            </h1>

            <p
              className="animate-fade-in-up animation-delay-300 mt-6 max-w-lg text-lg leading-relaxed"
              style={{ color: BODY }}
            >
              {PROGRAMM.tage} Tage Betreuung per Video und App. Ein Therapeut, der deinen Plan
              schreibt, deinen Verlauf liest und ihn anpasst — bis du allein weitermachst.
            </p>

            <div className="animate-fade-in-up animation-delay-450 mt-9">
              <a href={buchungsUrl("hero")} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="group h-14 rounded-xl px-9 text-base font-semibold text-white hover:opacity-90"
                  style={{ backgroundColor: GREEN }}
                >
                  Konsultation buchen
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </a>
              <p className="mt-4 max-w-md text-[14px] leading-relaxed" style={{ color: MUTED }}>
                Im Gespräch prüfen wir ehrlich, ob wir dein Beschwerdebild aus der Ferne betreuen
                können. Wenn nicht, sagen wir es dir.
              </p>
            </div>
          </div>
        </div>

        {/* ── Betreuungsbogen als zweiter Akt ───────────────────────────────
            Bewusst unter dem Bild und nicht darin: Er will gelesen werden,
            nicht nur gesehen. */}
        <div className="relative z-10 mx-auto max-w-2xl px-4 pb-20 pt-10 sm:pb-24 lg:pt-4">
          <div className="mb-4 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.16em]">
            <span style={{ color: GREEN }}>Tag 0 · Konsultation</span>
            <span style={{ color: MUTED }}>Tag {PROGRAMM.tage} · Abschluss</span>
          </div>
          <BetreuungsbogenGrafik />
          <p className="mt-5 text-center text-[13.5px] leading-relaxed" style={{ color: MUTED }}>
            {PROGRAMM_CALLS} Video-Sitzungen, am Anfang eng getaktet, zum Ende hin seltener.
            Dazwischen täglich ein kurzes Check-in und ein Chat, der werktags innerhalb von{" "}
            {PROGRAMM.chatAntwortStunden} Stunden beantwortet wird.
          </p>
        </div>
      </div>
    </section>
  )
}
