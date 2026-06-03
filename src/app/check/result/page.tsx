import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Download, ArrowRight, Clock, MessageCircle, Video, Dumbbell, Lock } from "lucide-react"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { verifyLeadToken } from "@/lib/lead-jwt"
import { loadAnswers } from "@/lib/schmerzcheck/check-store"
import { buildReportView, type SchmerzResult } from "@/lib/schmerzcheck/report"
import { VIDEO_ANALYSE_URL } from "@/lib/schmerzcheck/recommendations"
import type { AmpelBand } from "@/lib/schmerzcheck/ampel"
import { SpineDiagram } from "@/components/schmerzcheck/SpineDiagram"
import { Barometer, BAND_DOT } from "@/components/schmerzcheck/Barometer"
import { ReportCta } from "@/components/schmerzcheck/check/ReportCta"

/**
 * PROJ-23 / Report v2: /check/result?t=<token> — premium, doctor-ready report
 * with an Ampel barometer (Schmerz / Beweglichkeit / Stress). Token-gated.
 */

const MOBILITY_CARDS = [
  { n: "01", label: "Nacken-Reset" },
  { n: "02", label: "Schulter-Kreise" },
  { n: "03", label: "Brustkorb-Öffner" },
  { n: "04", label: "Rotation im Sitzen" },
  { n: "05", label: "Katze–Kuh" },
  { n: "06", label: "Beckenkippen" },
  { n: "07", label: "Hüftöffner 90/90" },
  { n: "08", label: "Glute Bridge" },
  { n: "09", label: "Beinrückseiten-Mobi" },
  { n: "10", label: "Sprunggelenk & Waden" },
  { n: "11", label: "Handgelenk-Reset" },
  { n: "12", label: "Ganzkörper-Atemfluss" },
]

const HERO_TINT: Record<AmpelBand, string> = {
  rot: "border-red-200 bg-gradient-to-br from-red-50 to-[#fbfaf6]",
  gelb: "border-amber-200 bg-gradient-to-br from-amber-50 to-[#fbfaf6]",
  gruen: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-[#fbfaf6]",
}

const STRATEGY: Record<AmpelBand, { title: string; intro: string }> = {
  gruen: {
    title: "Deine Erhaltungs-Routine",
    intro: "Du bist auf einem guten Weg. Diese drei Bausteine halten dich stabil — je 5 Minuten.",
  },
  gelb: {
    title: "Deine 7-Tage-Strategie",
    intro: "Ein klarer Plan für die nächste Woche. Drei abgestimmte Bausteine, je 5 Minuten am Tag.",
  },
  rot: {
    title: "Erste Schritte für zu Hause",
    intro: "Diese Bausteine sind ein sanfter Einstieg. Der wichtigste nächste Schritt ist aber die fachliche Einordnung weiter unten.",
  },
}

export default async function CheckResultPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams
  const leadId = verifyLeadToken(t)
  if (!leadId) redirect("/schmerzcheck")

  const supabase = createSupabaseServiceClient()
  const { data: lead } = await supabase
    .from("schmerzcheck_leads")
    .select("first_name, status, booked_at")
    .eq("id", leadId)
    .maybeSingle()

  if (!lead) redirect("/schmerzcheck")
  if (lead.status === "red_flag_routed") redirect("/check/red-flag-stop")

  const { data: result } = await supabase
    .from("schmerzcheck_results")
    .select(
      "status, region, duration_bucket, severity_score, severity_bucket, yellow_flag_score, psychosocial_risk, movement_readiness, result_category, soft_flag"
    )
    .eq("lead_id", leadId)
    .maybeSingle()

  if (!result || result.status !== "completed") {
    redirect(`/check/start?t=${encodeURIComponent(t ?? "")}`)
  }

  const answers = await loadAnswers(supabase, leadId)
  const view = buildReportView(result as SchmerzResult, lead.first_name, answers)
  const pdfHref = `/api/check/report.pdf?t=${encodeURIComponent(t ?? "")}`
  const ampel = view.ampel
  const strat = STRATEGY[ampel.overall]
  const unlocked = Boolean(lead.booked_at) // Karten voll freigeschaltet nach Buchung
  const FREE_CARDS = 2 // so viele Karten sind ohne Buchung sichtbar

  return (
    <div className="mx-auto max-w-[780px] px-5 pb-20 pt-8">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-2 pl-2 pr-[18px] text-[15px] font-semibold text-slate-900 shadow-[0_4px_12px_rgba(15,23,42,0.05)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/physio-logo.png" alt="Praxis OS" className="h-8 w-8 rounded-full object-contain" />
          <span>Praxis OS</span>
        </div>
        <a
          href={pdfHref}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-800"
        >
          <Download className="h-3.5 w-3.5" /> Als PDF
        </a>
      </div>

      <p className="[font-family:var(--font-cormorant)] text-[18px] italic text-emerald-800">
        Dein persönlicher Schmerz-Report
      </p>
      <h1 className="mt-1 text-[clamp(28px,4vw,40px)] font-extrabold leading-[1.1] tracking-[-0.02em] text-slate-900">
        Hallo {view.firstName}, hier ist deine Standortbestimmung.
      </h1>

      {/* Overall Ampel hero */}
      <div className={`mt-6 rounded-3xl border p-6 sm:p-8 ${HERO_TINT[ampel.overall]}`}>
        <div className="flex items-center gap-5">
          {/* traffic light */}
          <div className="flex shrink-0 flex-col gap-2 rounded-full bg-slate-900 p-2">
            {(["rot", "gelb", "gruen"] as AmpelBand[]).map((b) => (
              <span
                key={b}
                className={`h-4 w-4 rounded-full ${b === ampel.overall ? BAND_DOT[b] : "bg-white/15"}`}
              />
            ))}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Dein Gesamtbild</span>
            <h2 className="mt-0.5 text-[22px] font-extrabold leading-tight text-slate-900 sm:text-[26px]">
              {ampel.headline}
            </h2>
          </div>
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-700">{ampel.actionLine}</p>
      </div>

      {/* Disclaimer (top, full HWG §6.4) */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-[13px] leading-relaxed text-slate-600">
        <strong className="mb-1.5 block font-bold text-slate-900">Wichtiger Hinweis</strong>
        Dieser Report ist eine strukturierte Bewegungs-Standortbestimmung auf Basis deiner
        Antworten — er ist keine medizinische Diagnose und ersetzt keine ärztliche Untersuchung.
        Die hier gegebenen Hinweise dienen der Orientierung und Information, nicht der
        Heilbehandlung im Sinne des Heilmittelwerbegesetzes. Wenn du dir unsicher bist oder
        Beschwerden sich verschlechtern: bitte lass dich ärztlich abklären.
      </div>

      {/* Section 1 — Standortbestimmung */}
      <Section eyebrow="01 · Deine Standortbestimmung" title="Wo du gerade stehst">
        <div className="grid gap-6 sm:grid-cols-[1fr_0.8fr] sm:items-center">
          <div>
            <p className="text-[15px] leading-relaxed text-slate-700">{view.intro}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-700">{view.severityPlain}</p>
            <p className="mt-3 text-[14px] text-slate-500">
              Schwerpunkt deiner Angaben: <strong className="text-slate-700">{view.regionLabel}</strong>
            </p>
          </div>
          <SpineDiagram focusRegion={view.focusRegion || "lumbar"} />
        </div>
      </Section>

      {/* Section 2 — Barometer-Auswertung */}
      <Section eyebrow="02 · Deine Auswertung" title="Schmerz, Beweglichkeit & Stress im Barometer">
        <p className="mb-5 text-[14px] text-slate-500">
          Links „Handeln", rechts „Stabil". So siehst du auf einen Blick, wo Aufmerksamkeit
          sinnvoll ist — ideal auch, um es zu einem Arzttermin mitzunehmen.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {ampel.dimensions.map((d) => (
            <Barometer key={d.key} dim={d} />
          ))}
        </div>
      </Section>

      {/* Section 3 — Strategy / Roadmap */}
      <Section eyebrow="03 · Deine 7-Tage-Bewegungs-Roadmap" title={strat.title} id="roadmap">
        <p className="mb-5 text-[14px] text-slate-500">{strat.intro}</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {view.modules.map((m, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <Clock className="h-3 w-3" /> {m.duration}
              </div>
              <h3 className="[font-family:var(--font-cormorant)] text-[19px] font-semibold italic text-slate-900">{m.name}</h3>
              <p className="mt-1 text-[12px] font-medium uppercase tracking-wide text-slate-400">{m.technique}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{m.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Section 3b — 12 Mobility-Karten (Bonus; 2 frei, Rest nach Buchung) */}
      <Section eyebrow="Bonus · Ganzkörper-Routine" title="Deine 12 Mobility-Karten">
        <p className="mb-5 text-[14px] text-slate-500">
          {unlocked
            ? "Deine tägliche Mobility von Kopf bis Fuß — alle 12 Karten freigeschaltet. Tipp eine Karte an, um sie groß anzusehen oder zu speichern."
            : "Deine tägliche Mobility von Kopf bis Fuß. Die ersten beiden Karten sind frei — die übrigen 10 schaltest du mit deiner Video-Analyse frei."}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {MOBILITY_CARDS.map((c, i) => {
            const open = unlocked || i < FREE_CARDS
            if (open) {
              return (
                <a
                  key={c.n}
                  href={`/images/mobility-karten/karte-${c.n}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.12)]"
                >
                  <Image
                    src={`/images/mobility-karten/karte-${c.n}.png`}
                    alt={`Mobility-Karte ${c.n}: ${c.label}`}
                    width={1122}
                    height={1402}
                    className="h-auto w-full"
                  />
                </a>
              )
            }
            return (
              <div
                key={c.n}
                aria-label="Gesperrte Karte — mit Video-Analyse freischalten"
                className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]"
              >
                <Image
                  src={`/images/mobility-karten/karte-${c.n}.png`}
                  alt=""
                  aria-hidden
                  width={1122}
                  height={1402}
                  className="h-auto w-full scale-110 blur-[7px]"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-white/55 backdrop-blur-[3px]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 shadow-sm">
                    <Lock className="h-4 w-4 text-emerald-700" />
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {!unlocked && (
          <div className="mt-5 rounded-2xl border-2 border-emerald-600 bg-gradient-to-br from-emerald-50 to-[#fbfaf6] p-6 text-center">
            <div className="mb-1.5 inline-flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wide text-emerald-800">
              <Lock className="h-4 w-4" /> 10 weitere Karten gesperrt
            </div>
            <p className="mx-auto mb-4 max-w-md text-[14.5px] leading-relaxed text-slate-700">
              Deine komplette Ganzkörper-Routine wartet hinter dem Milchglas. Mit deiner{" "}
              <strong>Video-Analyse</strong> schalten sich alle 12 Karten frei — abgestimmt auf
              deinen Bereich.
            </p>
            <ReportCta
              href={VIDEO_ANALYSE_URL}
              label="Video-Analyse buchen & alle Karten freischalten"
              variant="booking"
              band={ampel.overall}
            />
            <p className="mt-3 text-[12px] text-slate-400">
              69 € Erstanalyse · anschließend Betreuung 16,99 €/Monat · monatlich kündbar
            </p>
            <p className="mt-2 text-[11px] text-slate-400">
              Nach deiner Buchung lädst du diese Seite einmal neu — dann sind alle Karten offen.
            </p>
          </div>
        )}
      </Section>

      {/* Section 4 — Empfehlung (band-aware) */}
      <Section eyebrow="04 · Deine Empfehlung" title="Dein nächster Schritt">
        <div
          className={`rounded-2xl border-2 p-6 ${
            ampel.overall === "rot"
              ? "border-red-300 bg-gradient-to-br from-red-50 to-white"
              : "border-emerald-600 bg-gradient-to-br from-emerald-50 to-[#fbfaf6]"
          }`}
        >
          <p className="text-[16px] leading-relaxed text-slate-800">{view.recommendation.text}</p>
          <div className="mt-5">
            <ReportCta
              href={view.recommendationHref}
              label={view.recommendation.ctaLabel}
              variant={view.recommendation.ctaType}
              band={ampel.overall}
            />
          </div>
          {view.recommendation.ctaType === "booking" && (
            <p className="mt-3 text-[12px] text-slate-400">
              69 € Erstanalyse · anschließend Betreuung 16,99 €/Monat · monatlich kündbar
            </p>
          )}
        </div>
      </Section>

      {/* Section 5 — Praxis OS sales block */}
      <div className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-7 text-white sm:p-10">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400">Mehr als ein Report</span>
        <h2 className="mt-2 text-[26px] font-extrabold leading-tight sm:text-[30px]">
          Praxis OS — dein Therapeut für die Hosentasche.
        </h2>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-300">
          Der Report ist dein Startpunkt. In der Praxis-OS-App geht es individuell weiter — mit
          einem echten Physiotherapeuten an deiner Seite, statt allein zu raten.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Video, t: "Video-Analyse", d: "Ein Therapeut schaut sich deine Bewegung an und ordnet sie ein." },
            { icon: Dumbbell, t: "Individuelle Pläne", d: "Trainingspläne, die zu dir passen — nicht von der Stange." },
            { icon: MessageCircle, t: "Direkter Chat", d: "Deine Fragen, direkt an deinen Therapeuten." },
          ].map((f) => (
            <div key={f.t} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <f.icon className="h-5 w-5 text-emerald-400" />
              <h3 className="mt-2 text-[15px] font-bold">{f.t}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{f.d}</p>
            </div>
          ))}
        </div>
        <Link
          href="/online-physiotherapie"
          className="mt-7 inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-r from-emerald-500 to-teal-500 px-7 py-3.5 text-base font-bold text-white shadow-xl shadow-emerald-500/20 transition hover:-translate-y-px"
        >
          Praxis OS entdecken
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Section 6 — Authority */}
      <div className="mt-10 grid items-center gap-6 rounded-3xl border border-slate-200 bg-white p-7 text-center sm:grid-cols-[120px_1fr] sm:gap-8 sm:text-left">
        <div className="relative mx-auto h-[120px] w-[120px] overflow-hidden rounded-full border border-slate-200">
          <Image
            src="/images/masterclass/chronischer-kreuzschmerz/max-portrait.jpg"
            alt="Max Glawe — Heilpraktiker für Physiotherapie"
            fill
            sizes="120px"
            className="object-cover object-top"
          />
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Hinter dem Schmerzcheck</div>
          <div className="mt-1 text-[20px] font-extrabold text-slate-900">Max Glawe</div>
          <div className="[font-family:var(--font-cormorant)] text-[16px] italic text-emerald-800">
            Heilpraktiker für Physiotherapie
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
            Der Schmerzcheck wurde in der Physiotherapie Glawe in Wildau entwickelt — auf Basis
            tausender Patientengespräche und etablierter Screening-Instrumente.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-10 text-center">
        <div className="mx-auto max-w-[640px] rounded-[14px] border border-slate-200 bg-slate-50 px-6 py-5 text-left text-[12px] leading-relaxed text-slate-500">
          Der Schmerzcheck ist ein orientierendes Screening-Instrument und ersetzt keine
          ärztliche Untersuchung oder Diagnose. Die Inhalte dienen der Information, nicht der
          Heilbehandlung im Sinne des Heilmittelwerbegesetzes.
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-5 text-[13px] text-slate-500">
          <a href={pdfHref} className="hover:text-emerald-800">Report als PDF</a>
          <Link href="/impressum" className="hover:text-emerald-800">Impressum</Link>
          <Link href="/datenschutz" className="hover:text-emerald-800">Datenschutz</Link>
        </div>
        <div className="mt-6 [font-family:var(--font-cormorant)] text-sm italic text-slate-400">
          Praxis OS · Therapeut für die Hosentasche
        </div>
      </footer>
    </div>
  )
}

function Section({
  eyebrow,
  title,
  id,
  children,
}: {
  eyebrow: string
  title: string
  id?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-6">
      <div className="mb-2 flex items-center gap-2.5">
        <span className="h-px w-7 bg-emerald-600/50" />
        <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">{eyebrow}</span>
      </div>
      <h2 className="mb-5 text-[26px] font-extrabold tracking-[-0.015em] text-slate-900 sm:text-[30px]">{title}</h2>
      {children}
    </section>
  )
}
