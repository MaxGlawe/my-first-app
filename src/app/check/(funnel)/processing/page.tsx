import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { CheckShell } from "@/components/schmerzcheck/check/CheckShell"

/**
 * PROJ-23 / Phase 3: completion screen — the check is scored, the report is
 * ready (web + PDF + T2 email). Links straight to the personalized report.
 */
export default async function CheckProcessingPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams
  const reportHref = t ? `/check/result?t=${encodeURIComponent(t)}` : "/schmerzcheck"

  return (
    <CheckShell>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center sm:p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-emerald-50 text-emerald-800">
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
            <path
              d="M4 12.5l5 5L20 6.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="[font-family:var(--font-cormorant)] text-[30px] font-semibold italic leading-[1.15] text-slate-900">
          Geschafft — dein Report ist fertig.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-slate-600">
          Deine persönliche Standortbestimmung, deine Bewegungs-Roadmap und eine klare
          Empfehlung für deinen nächsten Schritt. Wir haben dir den Report zusätzlich per
          E-Mail geschickt.
        </p>

        <Link
          href={reportHref}
          className="mt-7 inline-flex items-center justify-center gap-2 rounded-[14px] bg-gradient-to-b from-emerald-700 to-emerald-800 px-7 py-4 text-base font-bold text-white shadow-[0_6px_20px_rgba(6,95,70,0.25)] transition hover:-translate-y-px"
        >
          Deinen Report ansehen
          <ArrowRight className="h-4 w-4" />
        </Link>

        <p className="mt-5 text-[13px] text-slate-400">
          Wenn deine Beschwerden stark sind oder sich verschlechtern, lass sie bitte zeitnah
          ärztlich abklären.
        </p>
      </div>
    </CheckShell>
  )
}
