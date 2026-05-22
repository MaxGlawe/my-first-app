/**
 * PROJ-23 / Phase 2: shared wrapper for check screens — brand pill + optional
 * progress bar ("Frage X von 15 · noch ca. Y Min."). Presentational only.
 */
interface CheckShellProps {
  step?: number
  totalItems?: number
  etaMinutes?: number
  children: React.ReactNode
}

export function CheckShell({ step, totalItems, etaMinutes, children }: CheckShellProps) {
  const showProgress = typeof step === "number" && typeof totalItems === "number"
  const pct = showProgress ? Math.round((step! / totalItems!) * 100) : 0

  return (
    <div className="mx-auto flex min-h-screen max-w-[640px] flex-col px-5 pb-16 pt-8">
      {/* Brand pill */}
      <div className="mb-7 flex justify-center">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-2 pl-2 pr-[18px] text-[15px] font-semibold text-slate-900 shadow-[0_4px_12px_rgba(15,23,42,0.05)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/physio-logo.png" alt="Praxis OS" className="h-8 w-8 rounded-full object-contain" />
          <span>Praxis OS</span>
        </div>
      </div>

      {showProgress && (
        <div className="mb-7">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-700 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 text-[13px] font-medium text-slate-400">
            Frage {step} von {totalItems}
            {typeof etaMinutes === "number" ? ` · noch ca. ${etaMinutes} Min.` : ""}
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  )
}
