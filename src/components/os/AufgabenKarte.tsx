"use client"

/**
 * PROJ-29 — Der Arbeitsvorrat auf dem Dashboard.
 *
 * „Sonst sind bei viel Nutzung meine Mails voll. Einfach ins CRM, dann hab
 * ich's an einem Fleck und kann es mit jedem Endgerät bearbeiten."
 *
 * Deshalb: offene Aufgaben mit einem Weg dorthin, wo man sie erledigt, und
 * einem Haken zum Abschliessen. Ist nichts offen, verschwindet die Karte —
 * wie der Ampel-Banner. Ein Kästchen, das jeden Tag „alles erledigt" sagt,
 * kostet Platz, um nichts zu sagen.
 */

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  Check,
  FileText,
  NotebookPen,
  Info,
  Loader2,
  ChevronRight,
  ListChecks,
} from "lucide-react"

interface Aufgabe {
  id: string
  typ: "rechnung_freigeben" | "bericht_faellig" | "hinweis"
  titel: string
  beschreibung: string | null
  link: string | null
  created_at: string
}

const SYMBOL = {
  rechnung_freigeben: FileText,
  bericht_faellig: NotebookPen,
  hinweis: Info,
} as const

function wann(iso: string): string {
  const tage = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (tage <= 0) return "heute"
  if (tage === 1) return "gestern"
  return `vor ${tage} Tagen`
}

export function AufgabenKarte() {
  const [aufgaben, setAufgaben] = useState<Aufgabe[] | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const laden = useCallback(() => {
    fetch("/api/os/aufgaben")
      .then((r) => (r.ok ? r.json() : { aufgaben: [] }))
      .then((d) => setAufgaben(d.aufgaben ?? []))
      .catch(() => setAufgaben([]))
  }, [])

  useEffect(() => {
    laden()
  }, [laden])

  async function erledigen(id: string) {
    setBusy(id)
    // Sofort aus der Liste nehmen: Ein Haken soll sich wie ein Haken
    // anfuehlen, nicht wie ein Ladevorgang.
    setAufgaben((a) => (a ?? []).filter((x) => x.id !== id))
    try {
      const res = await fetch("/api/os/aufgaben", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "erledigt" }),
      })
      // Hat es nicht geklappt, holt das Neuladen die Aufgabe zurueck — eine
      // still verschwundene Aufgabe waere schlimmer als ein Ruckler.
      if (!res.ok) laden()
    } catch {
      laden()
    } finally {
      setBusy(null)
    }
  }

  if (!aufgaben || aufgaben.length === 0) return null

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
          <ListChecks className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-slate-800">Zu erledigen</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {aufgaben.length} {aufgaben.length === 1 ? "offene Aufgabe" : "offene Aufgaben"}
          </p>
        </div>
      </div>

      <ul className="divide-y divide-slate-100">
        {aufgaben.map((a) => {
          const Symbol = SYMBOL[a.typ] ?? Info
          return (
            <li key={a.id} className="flex items-start gap-3 px-5 py-3.5">
              <Symbol className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 leading-snug">{a.titel}</p>
                {a.beschreibung && (
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{a.beschreibung}</p>
                )}
                <p className="text-[11px] text-slate-400 mt-1">{wann(a.created_at)}</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {a.link && (
                  <Link
                    href={a.link}
                    className="flex items-center gap-0.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    Öffnen
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => erledigen(a.id)}
                  disabled={busy === a.id}
                  aria-label={`„${a.titel}" als erledigt abhaken`}
                  title="Als erledigt abhaken"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 transition-colors p-1.5 text-white"
                >
                  {busy === a.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
