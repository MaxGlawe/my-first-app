import { Suspense } from "react"
import Link from "next/link"
import { LeadForm } from "@/components/schmerzcheck/LeadForm"
import { MetaPixel } from "@/components/schmerzcheck/MetaPixel"
import { HeroVisual } from "@/components/schmerzcheck/HeroVisual"
import { SpineShowcase } from "@/components/schmerzcheck/SpineShowcase"
import {
  ReportStackVisual,
  DayPlanVisual,
  KnowledgeCardsVisual,
} from "@/components/schmerzcheck/StackVisuals"
import { LandingAnalytics } from "@/components/landing/LandingAnalytics"

/**
 * PROJ-23: /schmerzcheck — paid-traffic landing page (Phase 1).
 * Visual ground truth: schmerzcheck-landing.html. Copy verbatim from spec §4.4.
 * Single objective: lead capture (Vorname + E-Mail). noindex (see layout).
 */

const BrandMark = ({ className = "" }: { className?: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src="/images/physio-logo.png"
    alt="Praxis OS"
    className={`rounded-full object-contain ${className}`}
  />
)

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-[18px] py-1.5 text-[13px] font-semibold tracking-[0.02em] text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
    <span className="text-[10px] text-emerald-700">❮</span>
    {children}
    <span className="text-[10px] text-emerald-700">❯</span>
  </div>
)

const CtaButton = ({ sub }: { sub: string }) => (
  <Link
    href="#start"
    className="mt-8 inline-block rounded-[14px] bg-gradient-to-b from-emerald-700 to-emerald-800 px-9 py-[18px] text-base font-bold text-white shadow-[0_6px_20px_rgba(6,95,70,0.20)] transition hover:-translate-y-px hover:shadow-[0_10px_28px_rgba(6,95,70,0.28)]"
  >
    Schmerzcheck jetzt starten
    <span className="mt-0.5 block text-xs font-normal tracking-[0.02em] opacity-90">{sub}</span>
  </Link>
)

const CheckIcon = () => (
  <span className="mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
      <path
        d="M2 6.5l2.5 2.5L10 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
)

const STACK_CARDS = [
  {
    tag: "Inkludiert",
    title: "Dein persönlicher Schmerz-Report",
    desc: "Strukturiertes PDF mit deiner Standortbestimmung. Indikation, Belastungsmuster und konkrete nächste Schritte — verständlich erklärt.",
    visual: <ReportStackVisual />,
  },
  {
    tag: "Inkludiert",
    title: "Deine 7-Tage-Bewegungs-Roadmap",
    desc: "Drei abgestimmte Bewegungs-Bausteine für deinen Alltag. 5 Minuten pro Tag — als sanfter Einstieg, nicht als Trainingsplan.",
    visual: <DayPlanVisual />,
  },
  {
    tag: "Bonus",
    title: "Die 12 Bewegungs-Wissenskarten",
    desc: "Was die Forschung wirklich über Schmerz, Bewegung und den Körper weiß — verdichtet auf 12 verständliche Karten zum Mitnehmen.",
    visual: <KnowledgeCardsVisual />,
  },
]

const CREDENTIALS = [
  "Heilpraktikerlizenz (sektoral)",
  "INDIBA® zertifiziert",
  "Praxisinhaber seit 2019",
]

export default function SchmerzcheckLandingPage() {
  return (
    <>
      <MetaPixel />
      <Suspense fallback={null}>
        <LandingAnalytics />
      </Suspense>

      {/* ── Top brand ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1200px] px-6 pb-2 pt-7 text-center">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-2 pl-2 pr-[18px] font-semibold text-slate-900 shadow-[0_4px_12px_rgba(15,23,42,0.05)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/physio-logo.png" alt="Praxis OS" className="h-8 w-8 rounded-full object-contain" />
          <span>Praxis OS</span>
        </div>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-6 pb-14 pt-4">
        <div className="sc-rise pt-7 text-center">
          <Eyebrow>Klinisch fundiert · von Therapeuten entwickelt</Eyebrow>
          <h1 className="mt-7 text-[clamp(36px,5.4vw,64px)] font-extrabold leading-[1.05] tracking-[-0.025em] text-slate-900">
            Verstehe, was dein Körper dir sagt:
            <span className="mt-1 block [font-family:var(--font-cormorant)] text-[0.92em] font-medium italic tracking-[-0.01em] text-emerald-800">
              Dein persönlicher Schmerz-Report 2026
            </span>
          </h1>
          <p className="mt-3.5 text-[clamp(20px,2.6vw,30px)] font-bold tracking-[-0.015em] text-slate-900">
            In 5 Minuten weißt du, wo du stehst.
          </p>
          <p className="mx-auto mt-[22px] max-w-[620px] text-base leading-[1.6] text-slate-600">
            Die{" "}
            <strong className="font-semibold text-slate-900">
              strukturierte Bewegungs-Standortbestimmung
            </strong>{" "}
            für Menschen, die ihren Körper endlich besser verstehen wollen.
            Wissenschaftlich basiert. Ohne Wartezimmer. Ohne Therapeutenwechsel.
            Ohne Vermutungen.
          </p>
        </div>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div className="order-2 lg:order-1">
            <HeroVisual />
          </div>
          <div id="start" className="order-1 scroll-mt-6 lg:order-2">
            <LeadForm />
          </div>
        </div>
      </section>

      {/* ── Benefits panel ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-6 py-12 sm:py-20">
        <div className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_1px_3px_rgba(15,23,42,0.03),0_8px_24px_rgba(15,23,42,0.04)] sm:p-12">
          <BrandMark className="absolute left-8 top-7 hidden h-10 w-10 text-xl sm:inline-flex" />
          <div className="mt-7 grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div>
              <Eyebrow>Nutze das Zeitfenster, das Praxis OS dir bietet</Eyebrow>
              <h2 className="mt-4 text-[clamp(28px,3.8vw,44px)] font-extrabold leading-[1.1] tracking-[-0.02em] text-slate-900">
                Nach diesem Check…
                <span className="mt-1.5 block [font-family:var(--font-cormorant)] text-[0.78em] font-medium italic text-emerald-800">
                  …weißt du, was dein Körper dir wirklich sagt.
                </span>
              </h2>
              <ul className="mt-7">
                {[
                  ["Wo deine Bewegung Aufmerksamkeit braucht", "— wissenschaftlich eingeordnet, nicht geraten."],
                  ["Ob du selbst in Bewegung kommen kannst", "— oder ärztliche Abklärung sinnvoller ist."],
                  ["Welche nächsten Schritte zu deinem Alltag passen", "— konkret, individuell, machbar."],
                ].map(([strong, rest], i, arr) => (
                  <li
                    key={strong}
                    className={`flex gap-3.5 py-3.5 text-base leading-[1.5] text-slate-700 ${
                      i < arr.length - 1 ? "border-b border-slate-100" : ""
                    }`}
                  >
                    <CheckIcon />
                    <span>
                      <strong className="font-bold text-slate-900">{strong}</strong> {rest}
                    </span>
                  </li>
                ))}
              </ul>
              <CtaButton sub="Sofort starten · kostenlos" />
            </div>
            <SpineShowcase />
          </div>
        </div>
      </section>

      {/* ── Triple stack + Authority ──────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-6 pb-12 sm:pb-20">
        <div className="relative rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_1px_3px_rgba(15,23,42,0.03),0_8px_24px_rgba(15,23,42,0.04)] sm:p-12">
          <BrandMark className="absolute left-8 top-7 hidden h-10 w-10 text-xl sm:inline-flex" />
          <h2 className="text-[clamp(28px,3.8vw,44px)] font-extrabold leading-[1.1] tracking-[-0.02em] text-slate-900">
            Alles, was deine Bewegungs-
            <span className="mt-1.5 block [font-family:var(--font-cormorant)] text-[0.78em] font-medium italic text-emerald-800">
              Standortbestimmung braucht.
            </span>
          </h2>

          <div className="mt-12 grid gap-6 text-left lg:grid-cols-3">
            {STACK_CARDS.map((card) => (
              <div
                key={card.title}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#fbfaf6] p-7 text-center sm:p-8"
              >
                <div className="mx-auto mb-4 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3.5 py-[5px] text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-800">
                  <span className="text-[8px] text-emerald-700">❮</span>
                  {card.tag}
                  <span className="text-[8px] text-emerald-700">❯</span>
                </div>
                <h3 className="mb-3.5 [font-family:var(--font-cormorant)] text-[26px] font-semibold italic leading-[1.15] text-slate-900">
                  {card.title}
                </h3>
                <p className="mb-[26px] text-sm leading-[1.55] text-slate-600">{card.desc}</p>
                <div className="mt-auto flex h-[230px] items-center justify-center pt-3">
                  {card.visual}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <CtaButton sub="Sofort starten · kostenlos · ohne Anmeldung" />
          </div>
        </div>

        {/* Authority */}
        <div className="mt-10 grid items-center gap-10 rounded-3xl border border-slate-200 bg-white p-9 text-center sm:grid-cols-[200px_1fr] sm:gap-12 sm:p-14 sm:text-left">
          <div className="mx-auto flex h-[200px] w-[200px] items-center justify-center rounded-full border border-slate-200 bg-gradient-to-br from-emerald-100 to-[#fbfaf6] [font-family:var(--font-cormorant)] text-[64px] font-medium italic text-emerald-800">
            M
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              Hinter dem Schmerzcheck
            </div>
            <div className="mt-2.5 text-[28px] font-extrabold tracking-[-0.02em] text-slate-900">
              Max Glawe
            </div>
            <div className="mt-1.5 [font-family:var(--font-cormorant)] text-xl font-medium italic text-emerald-800">
              Heilpraktiker für Physiotherapie
            </div>
            <p className="mt-4 max-w-[540px] text-[15px] leading-[1.7] text-slate-600">
              Der Schmerzcheck wurde in der Physiotherapie Glawe in Wildau entwickelt — auf
              Basis tausender Patientengespräche und etablierter Screening-Instrumente. Keine
              Wellness-Floskeln. Keine Verkaufstricks. Ein strukturiertes Werkzeug, das dir
              hilft, deinen Körper besser einzuordnen.
            </p>
            <div className="mt-[22px] flex flex-wrap justify-center gap-6 text-xs text-slate-500 sm:justify-start">
              {CREDENTIALS.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 font-semibold">
                  <span className="text-[8px] text-emerald-700">◆</span>
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="pb-10 pt-4 text-center">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mx-auto mb-7 max-w-[760px] rounded-[14px] border border-slate-200 bg-slate-50 px-8 py-6 text-left text-[13px] leading-[1.6] text-slate-600">
            <strong className="mb-1.5 block font-bold text-slate-900">Wichtiger Hinweis</strong>
            Der Schmerzcheck ist ein orientierendes Screening-Instrument und ersetzt keine
            ärztliche Untersuchung oder Diagnose. Bei akuten, sehr starken oder plötzlich
            auftretenden Beschwerden, bei Taubheits- oder Lähmungserscheinungen, ungewolltem
            Gewichtsverlust oder Fieber bitte umgehend einen Arzt aufsuchen. Die Inhalte dienen
            der Information und nicht der Heilbehandlung im Sinne des Heilmittelwerbegesetzes.
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-[13px] text-slate-500">
            <Link href="/impressum" className="hover:text-emerald-800">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-emerald-800">Datenschutz</Link>
            <Link href="/agb" className="hover:text-emerald-800">AGB</Link>
            <Link href="/anfrage" className="hover:text-emerald-800">Kontakt</Link>
          </div>
          <div className="mt-8 [font-family:var(--font-cormorant)] text-sm italic text-slate-400">
            Praxis OS · Therapeut für die Hosentasche
          </div>
        </div>
      </footer>
    </>
  )
}
