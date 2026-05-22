import type { AmpelBand, BarometerDimension } from "@/lib/schmerzcheck/ampel"

/**
 * PROJ-23 / Report v2: premium horizontal Ampel barometer.
 * Track runs red (left) → amber (middle) → green (right); the marker sits at
 * the dimension's health value (higher = healthier = further right).
 * Colors match PROJ-17: gruen emerald-500, gelb amber-400, rot red-500.
 */

export const BAND_DOT: Record<AmpelBand, string> = {
  rot: "bg-red-500",
  gelb: "bg-amber-400",
  gruen: "bg-emerald-500",
}
export const BAND_CHIP: Record<AmpelBand, string> = {
  rot: "bg-red-50 text-red-700 border-red-200",
  gelb: "bg-amber-50 text-amber-700 border-amber-200",
  gruen: "bg-emerald-50 text-emerald-700 border-emerald-200",
}
export const BAND_WORD: Record<AmpelBand, string> = {
  rot: "Handeln",
  gelb: "Beobachten",
  gruen: "Stabil",
}

const TRACK_GRADIENT = "linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%)"

export function Barometer({ dim }: { dim: BarometerDimension }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[15px] font-bold text-slate-900">{dim.label}</h3>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${BAND_CHIP[dim.band]}`}
        >
          <span className={`h-2 w-2 rounded-full ${BAND_DOT[dim.band]}`} />
          {BAND_WORD[dim.band]}
        </span>
      </div>

      <div className="relative mt-4 mb-2 h-2.5">
        <div className="h-full w-full rounded-full" style={{ background: TRACK_GRADIENT }} />
        <div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_2px_6px_rgba(15,23,42,0.25)]"
          style={{ left: `${dim.value}%` }}
        >
          <span className={`block h-full w-full rounded-full ${BAND_DOT[dim.band]}`} />
        </div>
      </div>

      <div className="flex justify-between text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
        <span>Handeln</span>
        <span>Beobachten</span>
        <span>Stabil</span>
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-slate-600">{dim.sentence}</p>
    </div>
  )
}
