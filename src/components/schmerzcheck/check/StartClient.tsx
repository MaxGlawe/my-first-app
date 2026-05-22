"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowRight, ShieldCheck } from "lucide-react"
import { CheckShell } from "./CheckShell"

/** PROJ-23 / Phase 2: Schmerzcheck intro / start screen. */
export function StartClient({ token }: { token: string }) {
  const router = useRouter()
  const [state, setState] = useState<"loading" | "ready" | "invalid">("loading")
  const [nextStep, setNextStep] = useState(1)
  const [resuming, setResuming] = useState(false)

  useEffect(() => {
    if (!token) {
      setState("invalid")
      return
    }
    let active = true
    fetch(`/api/check/state?t=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!active) return
        if (!res.ok) {
          setState("invalid")
          return
        }
        const data = await res.json()
        if (data.status === "red_flag") {
          router.replace("/check/red-flag-stop")
          return
        }
        if (data.status === "completed") {
          router.replace(`/check/processing?t=${encodeURIComponent(token)}`)
          return
        }
        setNextStep(data.nextStep ?? 1)
        setResuming((data.answeredCount ?? 0) > 0)
        setState("ready")
      })
      .catch(() => active && setState("invalid"))
    return () => {
      active = false
    }
  }, [token, router])

  if (state === "loading") {
    return (
      <CheckShell>
        <div className="flex flex-1 items-center justify-center text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </CheckShell>
    )
  }

  if (state === "invalid") {
    return (
      <CheckShell>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="[font-family:var(--font-cormorant)] text-[26px] font-semibold italic text-slate-900">
            Dieser Link ist nicht mehr gültig.
          </h1>
          <p className="mt-3 text-[15px] text-slate-600">
            Bitte fordere deinen Schmerzcheck erneut an.
          </p>
          <a
            href="/schmerzcheck"
            className="mt-6 inline-block rounded-[14px] bg-gradient-to-b from-emerald-700 to-emerald-800 px-7 py-3.5 text-sm font-bold text-white"
          >
            Zum Schmerzcheck
          </a>
        </div>
      </CheckShell>
    )
  }

  return (
    <CheckShell>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
          Dein 5-Minuten-Schmerzcheck
        </span>
        <h1 className="mt-2 [font-family:var(--font-cormorant)] text-[30px] font-semibold italic leading-[1.15] text-slate-900">
          Lass uns einordnen, wo du gerade stehst.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
          15 klar gestellte Fragen, ehrlich auswertbar. Es gibt keine richtigen oder
          falschen Antworten — antworte einfach so, wie es für dich stimmt.
        </p>

        <ul className="mt-6 flex flex-col gap-2.5 text-[15px] text-slate-700">
          {["4–6 Minuten Zeit", "Eine Frage pro Schritt", "Dein Fortschritt wird automatisch gespeichert"].map(
            (t) => (
              <li key={t} className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700" />
                {t}
              </li>
            )
          )}
        </ul>

        <div className="mt-7 rounded-xl bg-slate-50 px-4 py-3 text-[13px] leading-relaxed text-slate-500">
          Hinweis: Der Schmerzcheck ist ein orientierendes <strong>Screening</strong> — keine
          ärztliche Diagnose. Bei akuten oder sehr starken Beschwerden wende dich bitte direkt
          an einen Arzt.
        </div>

        <button
          onClick={() => router.push(`/check/q/${nextStep}?t=${encodeURIComponent(token)}`)}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-b from-emerald-700 to-emerald-800 px-6 py-4 text-base font-bold text-white shadow-[0_6px_20px_rgba(6,95,70,0.25)] transition hover:-translate-y-px"
        >
          {resuming ? "Weitermachen" : "Los geht's"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </CheckShell>
  )
}
