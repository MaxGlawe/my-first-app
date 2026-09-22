"use client"

/**
 * PROJ-26: Hinweis nach Ablauf der 90-Tage-Betreuung.
 *
 * Bewusst ohne Kaufbutton. Die Erhaltungsphase wird erst verdrahtet, wenn die
 * Rechnungsart getrennt ist (Programm umsatzsteuerfrei, Erhaltung mit 19 % USt) —
 * vorher würde jede Zahlung eine falsche Heilpraktiker-Rechnung auslösen.
 */

import { useAccessState } from "@/hooks/use-access-state"
import { BookOpen } from "lucide-react"

function fmt(d: string | null): string | null {
  if (!d) return null
  return new Date(d).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function ReadOnlyBanner() {
  const { readOnly, access } = useAccessState()
  if (!readOnly) return null

  const bis = fmt(access?.endsAt ?? null)

  return (
    <div className="px-4 pt-4">
      <div className="mx-auto flex max-w-2xl items-start gap-3 rounded-2xl border border-[#e7e1d6] bg-[#F8F5F0] p-4">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2C3E2D]/10 text-[#2C3E2D]">
          <BookOpen className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-slate-900">
            {bis ? `Deine Betreuung endete am ${bis}.` : "Deine Betreuung ist beendet."}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
            Dein Verlauf bleibt dir erhalten — Pläne, Check-ins und Nachrichten kannst du weiter
            ansehen. Neue Einträge sind pausiert. Wenn du weitermachen möchtest, sprich deinen
            Therapeuten an.
          </p>
        </div>
      </div>
    </div>
  )
}
