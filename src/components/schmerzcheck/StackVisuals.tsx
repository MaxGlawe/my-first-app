/**
 * PROJ-23: Decorative CSS-only mockups for the triple-stack section
 * (Report / 7-Tage-Roadmap / Wissenskarten). Mirrors schmerzcheck-landing.html.
 */

export function ReportStackVisual() {
  return (
    <div className="relative h-[218px] w-[178px]">
      <div className="absolute inset-0 -rotate-[7deg] -translate-x-[13px] translate-y-[5px] rounded-[5px] border border-slate-200 bg-[#fbfaf6] shadow-[0_8px_22px_rgba(15,23,42,0.10)]" />
      <div className="absolute inset-0 rotate-[5deg] translate-x-[11px] translate-y-[2px] rounded-[5px] border border-slate-200 bg-[#fbfaf6] shadow-[0_8px_22px_rgba(15,23,42,0.10)]" />
      <div className="absolute inset-0 z-[2] flex flex-col rounded-[5px] border border-slate-200 bg-white px-3.5 pb-3 pt-4 text-left shadow-[0_8px_22px_rgba(15,23,42,0.10)]">
        <div className="absolute left-0 right-0 top-0 h-1 rounded-t-[4px] bg-emerald-800" />
        <div className="text-[7px] font-bold uppercase tracking-[0.2em] text-emerald-700">
          Schmerz-Report
        </div>
        <div className="mb-[9px] mt-[3px] [font-family:var(--font-cormorant)] text-[13px] font-semibold italic leading-[1.15] text-slate-900">
          Deine persönliche Standortbestimmung
        </div>
        <div className="my-1 text-[7px] font-bold uppercase tracking-[0.14em] text-slate-500">
          01 · Bewegungsmuster
        </div>
        <div className="flex flex-col gap-[3px]">
          <div className="h-[2.5px] w-full rounded bg-slate-200" />
          <div className="h-[2.5px] w-3/4 rounded bg-emerald-100" />
          <div className="h-[2.5px] w-1/2 rounded bg-slate-200" />
        </div>
        <div className="my-1 text-[7px] font-bold uppercase tracking-[0.14em] text-slate-500">
          02 · Belastungsmuster
        </div>
        <div className="relative mt-1 h-[5px] overflow-hidden rounded bg-slate-100">
          <div className="absolute inset-y-0 left-0 w-[62%] rounded bg-gradient-to-r from-emerald-600 to-emerald-800" />
        </div>
        <div className="mb-1 mt-1.5 text-[7px] font-bold uppercase tracking-[0.14em] text-slate-500">
          03 · Empfehlung
        </div>
        <div className="flex flex-col gap-[3px]">
          <div className="h-[2.5px] w-full rounded bg-slate-200" />
          <div className="h-[2.5px] w-1/2 rounded bg-emerald-100" />
        </div>
        <div className="mt-auto flex items-baseline justify-between border-t border-slate-100 pt-2 text-[6px] font-bold uppercase tracking-[0.16em] text-slate-400">
          <span>Praxis OS</span>
          <span className="[font-family:var(--font-cormorant)] text-[13px] font-semibold not-italic tracking-normal text-emerald-800">
            03
          </span>
        </div>
      </div>
    </div>
  )
}

export function DayPlanVisual() {
  const rows = [
    { day: 1, done: true },
    { day: 2, done: true },
    { day: 3, done: false },
  ]
  return (
    <div className="flex w-4/5 flex-col gap-2.5">
      {rows.map((r) => (
        <div
          key={r.day}
          className="flex items-center gap-3 rounded-[10px] border border-slate-200 bg-white px-3.5 py-2.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800">
            {r.day}
          </div>
          <div className="flex-1">
            <div className={`mb-1 h-[5px] rounded bg-slate-200 ${r.day === 2 ? "w-[70%]" : "w-full"}`} />
            <div className="h-[5px] w-1/2 rounded bg-emerald-100" />
          </div>
          {r.done ? (
            <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-emerald-700 text-[10px] text-white">
              ✓
            </div>
          ) : (
            <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] text-slate-400">
              ·
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function KnowledgeCardsVisual() {
  return (
    <div className="grid w-4/5 grid-cols-3 gap-2">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={`relative flex aspect-[2/3] flex-col justify-between rounded-lg bg-emerald-800 p-2 text-white shadow-[0_6px_16px_rgba(6,95,70,0.18)] ${
            n === 2 ? "-translate-y-2" : ""
          }`}
        >
          <div className="text-[7px] font-bold uppercase tracking-[0.18em] text-white/70">
            Karte 0{n}
          </div>
          <div className="[font-family:var(--font-cormorant)] text-[26px] font-medium italic leading-none text-emerald-100">
            0{n}
          </div>
          <div className="text-center text-[7px] font-bold uppercase tracking-[0.16em] text-white/60">
            Praxis OS
          </div>
        </div>
      ))}
    </div>
  )
}
