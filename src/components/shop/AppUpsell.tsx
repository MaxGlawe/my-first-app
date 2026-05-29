/**
 * PROJ-21: AppUpsell — Voll-App-Upsell für die öffentlichen Shop-Seiten.
 *
 * Erfüllt AC-7: jede öffentliche Shop-Seite weist auf die Praxis OS Voll-App hin.
 * Reine Markup-Komponente (kein "use client" nötig) — server- & client-tauglich.
 */

import Link from "next/link"
import { ArrowRight } from "lucide-react"

// Premium-Markenwelt (Masterclass-Format)
const INK = "#0f172a"
const BODY = "#334155"
const GREEN = "#2C3E2D"
const LINE = "#e7e1d6"

export function AppUpsell() {
  return (
    <div
      className="rounded-2xl bg-white border p-6 sm:p-8 relative overflow-hidden"
      style={{ borderColor: LINE }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(201,183,156,0.28) 0%, transparent 70%)" }}
      />
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex-1">
          <p
            className="text-[11px] font-bold tracking-[0.2em] uppercase mb-2"
            style={{ color: GREEN }}
          >
            Praxis OS · Voll-App
          </p>
          <h3 className="text-lg sm:text-xl font-bold mb-1.5" style={{ color: INK }}>
            Mehr als eine Challenge — deine persönliche Therapie-Begleitung
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: BODY }}>
            Individuelle Trainingspläne, Video-Analyse durch einen Physiotherapeuten
            und direkter Chat mit deinem Therapeuten — alles in der Praxis OS App.
          </p>
        </div>
        <Link
          href="/online-physiotherapie"
          className="inline-flex items-center justify-center gap-2 text-white font-semibold rounded-xl px-5 h-12 transition-opacity hover:opacity-90 shrink-0"
          style={{ backgroundColor: GREEN }}
        >
          Voll-App entdecken
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
