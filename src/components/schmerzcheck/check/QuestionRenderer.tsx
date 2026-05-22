"use client"

import type { CheckItem } from "@/lib/schmerzcheck/check-items"
import type { AnswerValue } from "@/lib/schmerzcheck/scoring"

interface Props {
  item: CheckItem
  value: AnswerValue | undefined
  onChange: (value: AnswerValue) => void
}

const optionBase =
  "w-full rounded-xl border px-4 py-3.5 text-left text-[15px] transition-colors"
const optionIdle = "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
const optionActive = "border-emerald-700 bg-emerald-50 text-emerald-900 font-semibold"

export function QuestionRenderer({ item, value, onChange }: Props) {
  const isSingle = item.type === "single_select" || item.type === "likert_4"
  const selectedMulti = Array.isArray(value) ? value : []

  function toggleMulti(optValue: string, exclusive?: boolean) {
    const options = item.options ?? []
    if (exclusive) {
      onChange([optValue])
      return
    }
    // selecting a normal option clears any exclusive option
    const exclusiveValues = options.filter((o) => o.exclusive).map((o) => o.value)
    let next = selectedMulti.filter((v) => !exclusiveValues.includes(v))
    next = next.includes(optValue) ? next.filter((v) => v !== optValue) : [...next, optValue]
    onChange(next)
  }

  return (
    <div>
      <h1 className="[font-family:var(--font-cormorant)] text-[26px] font-semibold italic leading-[1.2] text-slate-900 sm:text-[30px]">
        {item.text}
      </h1>
      {item.helperText && (
        <p className="mt-3 text-[14px] leading-relaxed text-slate-500">{item.helperText}</p>
      )}

      <div className="mt-6">
        {/* Single-choice (select / likert) */}
        {isSingle && (
          <div className="flex flex-col gap-2.5">
            {item.options?.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className={`${optionBase} ${value === opt.value ? optionActive : optionIdle}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Multi-choice */}
        {item.type === "multi_select" && (
          <div className="flex flex-col gap-2.5">
            {item.options?.map((opt) => {
              const checked = selectedMulti.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleMulti(opt.value, opt.exclusive)}
                  className={`${optionBase} flex items-center gap-3 ${checked ? optionActive : optionIdle}`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border ${
                      checked ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-300 bg-white"
                    }`}
                  >
                    {checked && (
                      <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
                        <path d="M2 6.5l2.5 2.5L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span>{opt.label}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* NRS 0–10 */}
        {item.type === "nrs_slider" && (
          <div>
            <div className="grid grid-cols-11 gap-1.5">
              {Array.from({ length: 11 }, (_, n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChange(n)}
                  className={`flex h-11 items-center justify-center rounded-lg border text-[15px] font-semibold transition-colors ${
                    value === n
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[12px] text-slate-400">
              {item.labels?.map((l) => (
                <span key={l.value}>{l.label}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
