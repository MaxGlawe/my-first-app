"use client"

/**
 * /app/neuigkeiten — „Was ist neu"-Verlauf.
 *
 * Listet alle Changelog-Einträge (neueste oben). Beim Öffnen gilt die aktuelle
 * Version als gesehen (der Auto-Dialog erscheint dann nicht mehr). Erreichbar
 * über den „Alle Neuigkeiten"-Link im Dialog und aus den Einstellungen.
 */

import { useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, Sparkles } from "lucide-react"
import {
  CHANGELOG,
  formatChangelogDate,
  type ChangelogBadge,
} from "@/lib/changelog"
import { markChangelogSeen } from "@/components/app/WhatsNewDialog"

function badgeClasses(badge: ChangelogBadge): string {
  return badge === "Neu"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-blue-100 text-blue-700"
}

export default function NeuigkeitenPage() {
  useEffect(() => {
    markChangelogSeen()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Kopf */}
      <header className="bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 text-white px-5 pt-6 pb-8">
        <Link
          href="/app/dashboard"
          className="inline-flex items-center gap-1 text-sm text-emerald-50/90 hover:text-white transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Zurück
        </Link>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white/15">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold leading-tight">Was ist neu</h1>
            <p className="text-sm text-emerald-50/90">
              Praxis OS entwickelt sich weiter
            </p>
          </div>
        </div>
      </header>

      {/* Einträge */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
        {CHANGELOG.map((entry) => (
          <section key={entry.version}>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-lg font-bold text-slate-800">{entry.headline}</h2>
              <span className="text-xs font-medium text-slate-400 shrink-0 ml-3">
                {formatChangelogDate(entry.date)}
              </span>
            </div>
            {entry.intro && (
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                {entry.intro}
              </p>
            )}

            <div className="space-y-3">
              {entry.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-white shadow-sm p-4"
                >
                  <span className="shrink-0 text-2xl leading-none mt-0.5 select-none">
                    {item.emoji}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-800 text-[15px]">
                        {item.title}
                      </h3>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${badgeClasses(
                            item.badge
                          )}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed mt-0.5">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <p className="text-center text-xs text-slate-400 pt-2">
          Weitere Verbesserungen folgen — bleib dran. 💚
        </p>
      </div>
    </div>
  )
}
