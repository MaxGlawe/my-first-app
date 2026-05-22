/**
 * PROJ-23: Hero visual — CSS-only phone mockup (Schmerzcheck question) layered
 * over a paper report. Purely decorative; mirrors schmerzcheck-landing.html.
 */
export function HeroVisual() {
  return (
    <div className="relative flex h-[440px] items-center justify-center sm:h-[520px]">
      {/* soft radial glow */}
      <div
        className="pointer-events-none absolute inset-[6%_8%] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(6,95,70,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Paper report (behind) */}
      <div className="absolute bottom-[16%] left-[6%] z-[1] h-[300px] w-[220px] -rotate-[7deg] rounded-lg bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_20px_40px_rgba(15,23,42,0.12),0_30px_80px_rgba(6,95,70,0.08)] sm:h-[320px] sm:w-[250px]">
        <div className="absolute left-0 right-0 top-0 h-1.5 rounded-t-lg bg-emerald-800" />
        <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-700">
          Schmerz-Report
        </div>
        <div className="mb-[18px] mt-2 [font-family:var(--font-cormorant)] text-[22px] font-semibold italic leading-[1.15] text-slate-900">
          Deine persönliche Bewegungs-Standortbestimmung
        </div>
        <div className="mb-2.5 h-1.5 w-[95%] rounded bg-slate-200" />
        <div className="mb-2.5 h-1.5 w-[82%] rounded bg-emerald-100" />
        <div className="mb-2.5 h-1.5 w-[60%] rounded bg-slate-200" />
        <div className="mb-2.5 h-1.5 w-[95%] rounded bg-slate-200" />
        <div className="relative mt-[22px] h-2 overflow-hidden rounded bg-slate-100">
          <div className="absolute inset-y-0 left-0 w-[54%] rounded bg-gradient-to-r from-emerald-600 to-emerald-700" />
        </div>
        <div className="mt-[18px] text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Praxis OS · Auswertung
        </div>
      </div>

      {/* Phone (front) */}
      <div className="relative z-[3] h-[440px] w-[220px] translate-x-8 rotate-[4deg] rounded-[36px] bg-[#0f172a] p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.1),0_24px_50px_rgba(15,23,42,0.20),0_40px_90px_rgba(6,95,70,0.10)] sm:h-[480px] sm:w-[240px] sm:translate-x-10">
        <div className="absolute left-1/2 top-3 z-[5] h-5 w-20 -translate-x-1/2 rounded-b-[14px] bg-[#0f172a]" />
        <div className="flex h-full flex-col overflow-hidden rounded-[28px] bg-white">
          <div className="flex flex-1 flex-col px-[18px] pb-4 pt-11">
            <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              Frage 5 von 12
            </div>
            <div className="mb-4 [font-family:var(--font-cormorant)] text-[19px] font-semibold italic leading-[1.2] text-slate-900">
              Wie würdest du deine Beschwerden seit den letzten 4 Wochen einordnen?
            </div>
            <div className="flex flex-col gap-2">
              {[
                { label: "Eher gleichbleibend", active: false },
                { label: "Stärker geworden ✓", active: true },
                { label: "Wechselhaft", active: false },
                { label: "Besser geworden", active: false },
              ].map((o) => (
                <div
                  key={o.label}
                  className={
                    o.active
                      ? "rounded-[10px] border border-emerald-700 bg-emerald-50 px-3 py-[9px] text-[11px] font-semibold text-emerald-800"
                      : "rounded-[10px] border border-slate-200 bg-white px-3 py-[9px] text-[11px] text-slate-700"
                  }
                >
                  {o.label}
                </div>
              ))}
            </div>
            <div className="mt-auto pt-4">
              <div className="h-1 overflow-hidden rounded-sm bg-slate-100">
                <div className="h-full w-[38%] rounded-sm bg-emerald-700" />
              </div>
              <div className="mt-1.5 text-[9px] font-semibold tracking-[0.05em] text-slate-400">
                38 % — noch ca. 3 Min.
              </div>
              <div className="mt-3 rounded-[10px] bg-emerald-800 py-[11px] text-center text-[11px] font-semibold text-white">
                Weiter
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
