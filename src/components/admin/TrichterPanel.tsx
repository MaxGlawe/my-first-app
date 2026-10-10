"use client"

/**
 * „Wo geht der Besucher verloren?"
 *
 * Die bisherige Statistik zeigte Zahlen nebeneinander: Besucher, Aufrufe,
 * Top-Seiten, Quellen. Jede für sich richtig — zusammen ergaben sie keinen
 * Weg. Man konnte nicht ablesen, ob jemand nach drei Sekunden absprang oder
 * bis zum Preis las und sich dann anders entschied.
 *
 * Diese Ansicht beantwortet genau eine Frage, und zwar in dieser Reihenfolge:
 *
 *   1. Der Trichter      — wie viele kommen bis wohin
 *   2. Die Absprungseite — wo endet der Besuch
 *   3. Die Quelle        — wer schickt Besucher, die bleiben
 *
 * Prozentzahlen stehen immer neben der absoluten Zahl. „2 %" bei 442
 * Besuchern heisst neun Menschen; wer nur den Prozentwert sieht, trifft
 * Entscheidungen über eine Stichprobe, die keine ist.
 */

import { useCallback, useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, TrendingDown, LogOut, Radio, BookOpen } from "lucide-react"

interface Stufe {
  stufe: string
  anzahl: number
  anteil: number
  hinweis: string
}
interface Absprung {
  pfad: string
  enden: number
  aufrufe: number
  rate: number
}
interface Einstieg {
  pfad: string
  sitzungen: number
  geblieben: number
  klicks: number
  bleiberate: number
}
interface Quelle {
  quelle: string
  sitzungen: number
  geblieben: number
  klicks: number
  bleiberate: number
  klickrate: number
}
interface Daten {
  gesamt: number
  trichter: Stufe[]
  absprung: Absprung[]
  einstieg: Einstieg[]
  quellen: Quelle[]
  lesetiefe: { marke: number; anzahl: number }[] | null
  seitenProSitzung: { eine: number; zweiBisVier: number; fuenfPlus: number }
}

const ZEITRAEUME = [7, 30, 90]

function Balken({ anteil, farbe }: { anteil: number; farbe: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.max(anteil, anteil > 0 ? 1.5 : 0)}%`, backgroundColor: farbe }}
      />
    </div>
  )
}

export function TrichterPanel() {
  const [tage, setTage] = useState(30)
  const [daten, setDaten] = useState<Daten | null>(null)
  const [laedt, setLaedt] = useState(true)
  const [fehler, setFehler] = useState<string | null>(null)

  const laden = useCallback(() => {
    setLaedt(true)
    setFehler(null)
    fetch(`/api/analytics/trichter?tage=${tage}`)
      .then(async (r) => {
        const j = await r.json()
        if (!r.ok) throw new Error(j.error ?? "Konnte nicht geladen werden.")
        return j as Daten
      })
      .then(setDaten)
      .catch((e) => setFehler(e.message))
      .finally(() => setLaedt(false))
  }, [tage])

  useEffect(() => laden(), [laden])

  if (laedt) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    )
  }

  if (fehler) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{fehler}</AlertDescription>
      </Alert>
    )
  }
  if (!daten) return null

  const t = daten.trichter

  return (
    <div className="space-y-6">
      {/* ── Zeitraum ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Wo der Besucher verloren geht</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {daten.gesamt} Sitzungen in den letzten {tage} Tagen
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-0.5">
          {ZEITRAEUME.map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => setTage(z)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                tage === z ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {z} Tage
            </button>
          ))}
        </div>
      </div>

      {/* ── Der Trichter ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-5">
        <div className="space-y-4">
          {t.map((s, i) => {
            const vorher = i > 0 ? t[i - 1] : null
            const verlust = vorher && vorher.anzahl > 0 ? vorher.anzahl - s.anzahl : 0
            const verlustAnteil =
              vorher && vorher.anzahl > 0 ? Math.round((verlust / vorher.anzahl) * 100) : 0
            return (
              <div key={s.stufe}>
                {vorher && verlust > 0 && (
                  <div className="mb-2 flex items-center gap-1.5 pl-1 text-[11px] text-red-500">
                    <TrendingDown className="h-3 w-3" />
                    <span>
                      −{verlust} ({verlustAnteil} %) verloren
                    </span>
                  </div>
                )}
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-slate-800">{s.stufe}</span>
                  <span className="whitespace-nowrap text-sm tabular-nums text-slate-500">
                    <span className="text-base font-bold text-slate-900">{s.anzahl}</span>
                    {" · "}
                    {s.anteil} %
                  </span>
                </div>
                <div className="mt-1.5">
                  <Balken anteil={s.anteil} farbe={i === t.length - 1 ? "#2C3E2D" : "#10b981"} />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">{s.hinweis}</p>
              </div>
            )
          })}
        </div>

        <p className="mt-5 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-500">
          Von {daten.gesamt} Sitzungen sahen{" "}
          <strong className="text-slate-700">{daten.seitenProSitzung.eine}</strong> genau eine
          Seite, {daten.seitenProSitzung.zweiBisVier} zwei bis vier,{" "}
          {daten.seitenProSitzung.fuenfPlus} fünf oder mehr.
        </p>
      </div>

      {/* ── Lesetiefe ───────────────────────────────────────────── */}
      {daten.lesetiefe ? (
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-400" />
            <h4 className="text-sm font-semibold text-slate-800">Wie weit gelesen wird</h4>
          </div>
          <div className="space-y-2.5">
            {daten.lesetiefe
              .filter((l) => l.marke > 0)
              .map((l) => (
                <div key={l.marke}>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-600">mindestens {l.marke} % der Seite</span>
                    <span className="tabular-nums text-slate-500">
                      <strong className="text-slate-800">{l.anzahl}</strong> ·{" "}
                      {daten.gesamt > 0 ? Math.round((l.anzahl / daten.gesamt) * 100) : 0} %
                    </span>
                  </div>
                  <div className="mt-1">
                    <Balken
                      anteil={daten.gesamt > 0 ? (l.anzahl / daten.gesamt) * 100 : 0}
                      farbe="#64748b"
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4">
          <p className="text-xs leading-relaxed text-slate-500">
            <strong className="text-slate-700">Lesetiefe wird noch gesammelt.</strong> Die Messung
            läuft seit diesem Update. Sobald die ersten Besucher gescrollt haben, steht hier, wie
            weit sie kommen — der Unterschied zwischen „sofort weg“ und „bis zum Preis gelesen“.
          </p>
        </div>
      )}

      {/* ── Absprungseiten ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-5">
        <div className="mb-1 flex items-center gap-2">
          <LogOut className="h-4 w-4 text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-800">Wo der Besuch endet</h4>
        </div>
        <p className="mb-3 text-[11px] text-slate-400">
          Letzte Seite der Sitzung. Rechtliche Seiten sind ausgenommen — dort endet ein Besuch
          zu Recht.
        </p>
        <div className="space-y-2">
          {daten.absprung.map((a) => (
            <div key={a.pfad} className="flex items-center gap-3">
              <span className="w-0 flex-1 truncate font-mono text-xs text-slate-700">{a.pfad}</span>
              <span className="whitespace-nowrap text-xs tabular-nums text-slate-500">
                {a.enden} von {a.aufrufe}
              </span>
              <span
                className={`w-12 whitespace-nowrap text-right text-xs font-semibold tabular-nums ${
                  a.rate >= 70 ? "text-red-500" : a.rate >= 40 ? "text-amber-500" : "text-slate-400"
                }`}
              >
                {a.rate} %
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quellen ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-5">
        <div className="mb-1 flex items-center gap-2">
          <Radio className="h-4 w-4 text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-800">Welche Quelle bringt wen</h4>
        </div>
        <p className="mb-3 text-[11px] text-slate-400">
          Nicht wie viele kommen, sondern wie viele bleiben. Das ist die Zahl, die über
          Werbebudget entscheidet.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[11px] text-slate-400">
                <th className="pb-2 font-medium">Quelle</th>
                <th className="pb-2 text-right font-medium">Sitzungen</th>
                <th className="pb-2 text-right font-medium">geblieben</th>
                <th className="pb-2 text-right font-medium">Buchung geklickt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {daten.quellen.map((q) => (
                <tr key={q.quelle}>
                  <td className="py-2 font-medium text-slate-700">{q.quelle}</td>
                  <td className="py-2 text-right tabular-nums text-slate-600">{q.sitzungen}</td>
                  <td className="py-2 text-right tabular-nums">
                    <span className="text-slate-600">{q.geblieben}</span>{" "}
                    <span
                      className={
                        q.bleiberate < 10
                          ? "text-red-500"
                          : q.bleiberate < 25
                            ? "text-amber-500"
                            : "text-emerald-600"
                      }
                    >
                      ({q.bleiberate} %)
                    </span>
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    <span className="text-slate-600">{q.klicks}</span>{" "}
                    <span className="text-slate-400">({q.klickrate} %)</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Einstiegsseiten ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-5">
        <h4 className="mb-1 text-sm font-semibold text-slate-800">Wo Besucher ankommen</h4>
        <p className="mb-3 text-[11px] text-slate-400">
          Erste Seite der Sitzung, mit dem Anteil derer, die danach nicht sofort gingen.
        </p>
        <div className="space-y-2">
          {daten.einstieg.map((e) => (
            <div key={e.pfad} className="flex items-center gap-3">
              <span className="w-0 flex-1 truncate font-mono text-xs text-slate-700">{e.pfad}</span>
              <span className="whitespace-nowrap text-xs tabular-nums text-slate-500">
                {e.sitzungen} Sitzungen
              </span>
              <span
                className={`w-20 whitespace-nowrap text-right text-xs font-semibold tabular-nums ${
                  e.bleiberate < 10
                    ? "text-red-500"
                    : e.bleiberate < 25
                      ? "text-amber-500"
                      : "text-emerald-600"
                }`}
              >
                {e.bleiberate} % blieb
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
