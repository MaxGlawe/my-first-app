"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react"
import {
  getItemByStep,
  TOTAL_ITEMS,
  estimateRemainingMinutes,
  type CheckItem,
} from "@/lib/schmerzcheck/check-items"
import type { AnswerValue } from "@/lib/schmerzcheck/scoring"
import { CheckShell } from "./CheckShell"
import { QuestionRenderer } from "./QuestionRenderer"

function hasValue(item: CheckItem, value: AnswerValue | undefined): boolean {
  if (item.type === "nrs_slider") return typeof value === "number"
  if (item.type === "multi_select") return Array.isArray(value) && value.length > 0
  return typeof value === "string" && value.length > 0
}

interface Props {
  step: number
  token: string
}

export function QuestionClient({ step, token }: Props) {
  const router = useRouter()
  const item = getItemByStep(step)
  const [value, setValue] = useState<AnswerValue | undefined>(undefined)
  const [ready, setReady] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const withT = (path: string) => `${path}?t=${encodeURIComponent(token)}`

  useEffect(() => {
    if (!token || !item) {
      router.replace("/schmerzcheck")
      return
    }
    let active = true
    fetch(`/api/check/state?t=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!active) return
        if (!res.ok) {
          router.replace("/schmerzcheck")
          return
        }
        const data = await res.json()
        if (data.status === "red_flag") {
          router.replace("/check/red-flag-stop")
          return
        }
        if (data.status === "completed") {
          router.replace(withT("/check/processing"))
          return
        }
        // Prevent skipping ahead past the first unanswered question
        const nextStep: number = data.nextStep ?? 1
        if (step > nextStep) {
          router.replace(withT(`/check/q/${nextStep}`))
          return
        }
        const saved = data.answers?.[item.id]
        if (saved !== undefined) setValue(saved)
        setReady(true)
      })
      .catch(() => active && router.replace("/schmerzcheck"))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, step])

  async function handleNext() {
    if (!item || saving) return
    if (!hasValue(item, value)) {
      setError("Bitte wähle eine Antwort, um fortzufahren.")
      return
    }
    setError(null)
    setSaving(true)
    try {
      const res = await fetch("/api/check/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: token, itemId: item.id, value }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || "Speichern fehlgeschlagen. Bitte versuche es erneut.")
        setSaving(false)
        return
      }
      if (data.redFlag) {
        router.push("/check/red-flag-stop")
        return
      }

      // Wurde bei „Wo spürst du Beschwerden?" nur EIN Bereich gewählt, ist der
      // Schwerpunkt eindeutig — der Server hat ihn schon gesetzt und meldet
      // skipNext. Die Folgefrage („Wo schränkt es dich am meisten ein?") wäre
      // dann nur eine Wiederholung und wird übersprungen.
      const naechster = data.skipNext ? step + 2 : step + 1

      if (naechster <= TOTAL_ITEMS) {
        router.push(withT(`/check/q/${naechster}`))
        return
      }
      // Last item → finalize
      const done = await fetch("/api/check/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: token }),
      })
      const doneData = await done.json().catch(() => ({}))
      if (!done.ok) {
        setError(doneData?.error || "Auswertung fehlgeschlagen. Bitte versuche es erneut.")
        setSaving(false)
        return
      }
      if (doneData.redFlag) {
        router.push("/check/red-flag-stop")
        return
      }
      router.push(withT("/check/processing"))
    } catch {
      setError("Verbindung fehlgeschlagen. Bitte prüfe deine Internetverbindung.")
      setSaving(false)
    }
  }

  if (!item) return null

  if (!ready) {
    return (
      <CheckShell step={step} totalItems={TOTAL_ITEMS}>
        <div className="flex flex-1 items-center justify-center text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </CheckShell>
    )
  }

  return (
    <CheckShell step={step} totalItems={TOTAL_ITEMS} etaMinutes={estimateRemainingMinutes(step)}>
      <QuestionRenderer item={item} value={value} onChange={(v) => { setValue(v); setError(null) }} />

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => step > 1 && router.push(withT(`/check/q/${step - 1}`))}
          disabled={step <= 1}
          className="inline-flex items-center gap-1.5 rounded-[14px] border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={saving}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-[14px] bg-gradient-to-b from-emerald-700 to-emerald-800 px-6 py-3.5 text-base font-bold text-white shadow-[0_6px_20px_rgba(6,95,70,0.25)] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {step < TOTAL_ITEMS ? "Weiter" : "Auswertung ansehen"}
          {!saving && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </CheckShell>
  )
}
