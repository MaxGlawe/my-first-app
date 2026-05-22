import Link from "next/link"

/**
 * PROJ-23: Double-Opt-in confirmation landing.
 * Where the T1 email's confirm link lands in Phase 1. Once the Schmerzcheck
 * itself ships (Phase 2), the confirm route will redirect to /check/start instead.
 */
export default function SchmerzcheckBestaetigtPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[640px] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-emerald-50 text-emerald-800">
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

      <h1 className="text-[clamp(28px,4vw,40px)] font-extrabold leading-[1.1] tracking-[-0.02em] text-slate-900">
        Bestätigt — danke dir.
        <span className="mt-2 block [font-family:var(--font-cormorant)] text-[0.7em] font-medium italic text-emerald-800">
          Dein Schmerzcheck ist in Kürze für dich bereit.
        </span>
      </h1>

      <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-slate-600">
        Wir geben dir gerade den letzten Schliff für deinen 5-Minuten-Schmerzcheck. Sobald
        er startklar ist, bekommst du von uns eine kurze E-Mail — du musst nichts weiter tun.
      </p>

      <p className="mt-3 text-sm text-slate-400">
        In der Zwischenzeit: Wenn deine Beschwerden stark sind oder plötzlich auftreten, lass
        sie bitte zeitnah ärztlich abklären.
      </p>

      <Link
        href="/schmerzcheck"
        className="mt-9 inline-block rounded-[14px] border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"
      >
        Zurück zur Übersicht
      </Link>
    </div>
  )
}
