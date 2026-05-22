import Link from "next/link"

/** PROJ-23 / Phase 4: unsubscribe confirmation. */
export default function AbgemeldetPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[560px] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
        <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
          <path d="M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="text-[clamp(24px,4vw,34px)] font-extrabold leading-tight tracking-[-0.02em] text-slate-900">
        Du bist abgemeldet.
      </h1>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-slate-600">
        Wir senden dir keine weiteren Mails aus dem Schmerzcheck mehr. Dein bereits erstellter
        Report bleibt für dich erreichbar. Alles Gute für dich!
      </p>
      <Link
        href="/schmerzcheck"
        className="mt-8 inline-block rounded-[14px] border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"
      >
        Zur Übersicht
      </Link>
    </div>
  )
}
