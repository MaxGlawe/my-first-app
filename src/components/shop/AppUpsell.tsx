/**
 * PROJ-21: AppUpsell — Voll-App-Upsell für die öffentlichen Shop-Seiten.
 *
 * Erfüllt AC-7: jede öffentliche Shop-Seite weist auf die Praxis OS Voll-App hin.
 * Reine Markup-Komponente (kein "use client" nötig) — server- & client-tauglich.
 */

import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function AppUpsell() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 sm:p-8 text-white relative overflow-hidden">
      <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex-1">
          <p className="text-[11px] font-bold tracking-[0.2em] text-emerald-400 uppercase mb-2">
            Praxis OS · Voll-App
          </p>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5">
            Mehr als eine Challenge — deine persönliche Therapie-Begleitung
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Individuelle Trainingspläne, Video-Analyse durch einen Physiotherapeuten
            und direkter Chat mit deinem Therapeuten — alles in der Praxis OS App.
          </p>
        </div>
        <Link
          href="/online-physiotherapie"
          className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl px-5 h-12 transition-colors shrink-0"
        >
          Voll-App entdecken
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
