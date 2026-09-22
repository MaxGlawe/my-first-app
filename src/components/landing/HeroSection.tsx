"use client"

/**
 * PROJ-26: Hero.
 *
 * Eine Aussage, ein Knopf. Kein zweiter CTA, der die Entscheidung verwässert,
 * und kein Umweg über ein Kontaktformular — der Knopf führt direkt in den
 * Buchungskalender.
 *
 * Statt der alten Handy-Mockups trägt der Betreuungsbogen das Bild: die echte
 * Taktung der 90 Tage, vorne dicht, hinten offen. Das ist das Angebot in einem
 * Blick und braucht kein Fotomaterial.
 *
 * Unter dem Knopf steht bewusst der Satz zur Eignungsprüfung. Er nimmt Druck
 * aus der Entscheidung und ist zugleich das stärkste Vertrauenssignal der
 * Seite: Wer sagt, dass er auch Nein sagt, wird beim Ja geglaubt.
 */

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

export function HeroSection() {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: PAPER }}>
      {/* Sand-Aura, sehr zurückhaltend — sie soll Tiefe geben, nicht auffallen */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(201,183,156,0.30) 0%, transparent 68%)" }}
      />

      <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-28 text-center sm:pb-24 sm:pt-36">
        <div
          className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
          style={{ borderColor: LINE, backgroundColor: "rgba(255,255,255,0.65)" }}
        >
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: GREEN }} />
          <span className="text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: GREEN }}>
            Heilpraktiker für Physiotherapie
          </span>
        </div>

        <h1
          className="animate-fade-in-up animation-delay-150 mx-auto mt-8 max-w-3xl text-[2.6rem] leading-[1.03] sm:text-6xl lg:text-7xl"
          style={{ ...serif, color: INK }}
        >
          Dein Physiotherapeut
          <br />
          für die Hosentasche.
        </h1>

        <p
          className="animate-fade-in-up animation-delay-300 mx-auto mt-7 max-w-xl text-lg leading-relaxed sm:text-xl"
          style={{ color: BODY }}
        >
          {PROGRAMM.tage} Tage Betreuung per Video und App. Ein Therapeut, der deinen Plan
          schreibt, deinen Verlauf liest und dich anpasst — bis du allein weitermachst.
        </p>

        <div className="animate-fade-in-up animation-delay-450 mt-10">
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
          <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed" style={{ color: MUTED }}>
            Im Gespräch prüfen wir ehrlich, ob wir dein Beschwerdebild aus der Ferne betreuen
            können. Wenn nicht, sagen wir es dir.
          </p>
        </div>

        {/* Der Betreuungsbogen als eigentliches Bild des Heros */}
        <div className="animate-fade-in-up animation-delay-600 mx-auto mt-16 max-w-2xl sm:mt-20">
          <div className="mb-4 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.16em]">
            <span style={{ color: GREEN }}>Tag 0 · Konsultation</span>
            <span style={{ color: MUTED }}>Tag {PROGRAMM.tage} · Abschluss</span>
          </div>
          <BetreuungsbogenGrafik />
          <p className="mt-5 text-[13.5px] leading-relaxed" style={{ color: MUTED }}>
            {PROGRAMM_CALLS} Video-Sitzungen, am Anfang eng getaktet, zum Ende hin seltener.
            Dazwischen täglich ein kurzes Check-in und ein Chat, der werktags innerhalb von{" "}
            {PROGRAMM.chatAntwortStunden} Stunden beantwortet wird.
          </p>
        </div>
      </div>
    </section>
  )
}
