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
 *   1. Der Trichter        — wie viele kommen bis wohin
 *   2. Die Leseleiter      — an welchem Abschnitt es bricht
 *   3. Lesetiefe & Zeit    — war er überhaupt da
 *   4. Die Absprungseite   — wo endet der Besuch
 *   5. Quelle/Kampagne/Anzeige — wer schickt Besucher, die bleiben
 *   6. Gerät und Browser   — konnte er die Seite überhaupt benutzen
 *
 * Prozentzahlen stehen immer neben der absoluten Zahl. „2 %" bei 442
 * Besuchern heisst neun Menschen; wer nur den Prozentwert sieht, trifft
 * Entscheidungen über eine Stichprobe, die keine ist.
 */

import { useCallback, useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertTriangle,
  TrendingDown,
  LogOut,
  Radio,
  BookOpen,
  Timer,
  ListOrdered,
  Smartphone,
  CalendarCheck,
  ShieldQuestion,
} from "lucide-react"

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
interface Zeile {
  name: string
  sitzungen: number
  geblieben: number
  preis: number
  klicks: number
  bleiberate: number
  klickrate: number
}
interface Sprosse {
  id: string
  titel: string
  erreicht: number
  anteil: number
  haltequote: number | null
}
interface Leiter {
  schluessel: string
  titel: string
  pfad: string
  sitzungen: number
  klicks: number
  sprossen: Sprosse[]
  gemessen: boolean
}
interface BannerZeile {
  name: string
  gezeigt: number
  akzeptiert: number
  abgelehnt: number
  ohne_auswahl: number
  zustimmungsrate: number
}
interface Daten {
  zeitraum: { tage: number; seit: string; frei: boolean; tests_sichtbar: boolean }
  verworfene_sitzungen: number
  banner: { gezeigt: number; akzeptiert: number; abgelehnt: number; ohne_auswahl: number }
  banner_nach_seite: BannerZeile[]
  banner_nach_anzeige: BannerZeile[]
  buchungen_nach_anzeige: { anzeige: string; anzahl: number }[]
  gesamt: number
  intern_ausgeschlossen: number
  trichter: Stufe[]
  leitern: Leiter[]
  absprung: Absprung[]
  einstieg: Einstieg[]
  quellen: Zeile[]
  kampagnen: Zeile[]
  anzeigen: Zeile[]
  geraete: Zeile[]
  browser: Zeile[]
  in_app_sitzungen: number
  lesetiefe: { marke: number; anzahl: number }[] | null
  aktivzeit: { marke: number; anzahl: number }[] | null
  buchungen_nach_quelle: { quelle: string; anzahl: number }[]
  buchungen_nach_cta: { cta: string; anzahl: number }[]
  buchungen_ohne_herkunft: number
  seitenProSitzung: { eine: number; zweiBisVier: number; fuenfPlus: number }
}

const ZEITRAEUME = [7, 30, 90]

/**
 * Was unter einer Stufe wirklich gezaehlt wird — Satz fuer Satz im
 * Dashboard sichtbar.
 *
 * Anlass (13.10.2026): Nach einer Korrektur sanken 30-Tage-Werte, obwohl
 * sie nur steigen koennen. Der Grund war eine Zaehlung je SITZUNG statt je
 * Klick — richtig, aber nicht erkennbar. Eine Kennzahl, deren Definition
 * man nicht ablesen kann, ist keine Kennzahl, sondern eine Behauptung.
 */
const ZAEHLREGEL: Record<string, string> = {
  Besucher: "Je Sitzung einmal. Eine Sitzung endet, wenn der Browser-Tab geschlossen wird.",
  Geblieben: "Je Sitzung einmal, auch bei mehrfachem Scrollen.",
  "Preis gesehen":
    "Je Sitzung einmal — nicht je Aufruf des Preisabschnitts. Wer dreimal hoch- und runterscrollt, zählt einmal.",
  "Buchung angeklickt":
    "Je Sitzung einmal — nicht je Klick. Wer zweimal auf „buchen“ tippt, zählt einmal.",
  "Termin gebucht": "Termine aus dem Buchungskalender, nicht aus der Website-Messung.",
}

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

function Karte({
  titel,
  hinweis,
  symbol,
  children,
}: {
  titel: string
  hinweis?: string
  symbol?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-5">
      <div className="mb-1 flex items-center gap-2">
        {symbol}
        <h4 className="text-sm font-semibold text-slate-800">{titel}</h4>
      </div>
      {hinweis && <p className="mb-3 text-[11px] leading-relaxed text-slate-400">{hinweis}</p>}
      {children}
    </div>
  )
}

/** Eine Aufschlüsselung — dieselbe Tabelle für Quelle, Kampagne, Anzeige, Gerät. */
function Aufschluesselung({ zeilen, spalte }: { zeilen: Zeile[]; spalte: string }) {
  if (zeilen.length === 0) {
    return <p className="text-xs text-slate-400">Keine Angaben im Zeitraum.</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-[11px] text-slate-400">
            <th className="pb-2 font-medium">{spalte}</th>
            <th className="pb-2 text-right font-medium">Sitzungen</th>
            <th className="pb-2 text-right font-medium">geblieben</th>
            <th className="pb-2 text-right font-medium">Preis gesehen</th>
            <th className="pb-2 text-right font-medium">Buchung geklickt</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {zeilen.map((q) => (
            <tr key={q.name}>
              <td className="max-w-[12rem] truncate py-2 font-medium text-slate-700">{q.name}</td>
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
              <td className="py-2 text-right tabular-nums text-slate-600">{q.preis}</td>
              <td className="py-2 text-right tabular-nums">
                <span className="text-slate-600">{q.klicks}</span>{" "}
                <span className="text-slate-400">({q.klickrate} %)</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Verteilung über Schwellen — „mindestens X" als Treppe. */
function Treppe({
  werte,
  gesamt,
  beschriftung,
  farbe,
}: {
  werte: { marke: number; anzahl: number }[]
  gesamt: number
  beschriftung: (marke: number) => string
  farbe: string
}) {
  return (
    <div className="space-y-2.5">
      {werte.map((l) => (
        <div key={l.marke}>
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-slate-600">{beschriftung(l.marke)}</span>
            <span className="tabular-nums text-slate-500">
              <strong className="text-slate-800">{l.anzahl}</strong> ·{" "}
              {gesamt > 0 ? Math.round((l.anzahl / gesamt) * 100) : 0} %
            </span>
          </div>
          <div className="mt-1">
            <Balken anteil={gesamt > 0 ? (l.anzahl / gesamt) * 100 : 0} farbe={farbe} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TrichterPanel() {
  const [tage, setTage] = useState(30)
  /** Freier Startzeitpunkt; leer = „letzte N Tage". */
  const [von, setVon] = useState("")
  const [testsZeigen, setTestsZeigen] = useState(false)
  const [daten, setDaten] = useState<Daten | null>(null)
  const [laedt, setLaedt] = useState(true)
  const [fehler, setFehler] = useState<string | null>(null)

  const laden = useCallback(() => {
    setLaedt(true)
    setFehler(null)
    const abfrage = new URLSearchParams()
    if (von) abfrage.set("von", new Date(von).toISOString())
    else abfrage.set("tage", String(tage))
    if (testsZeigen) abfrage.set("tests", "ein")
    fetch(`/api/analytics/trichter?${abfrage.toString()}`)
      .then(async (r) => {
        const j = await r.json()
        if (!r.ok) throw new Error(j.error ?? "Konnte nicht geladen werden.")
        return j as Daten
      })
      .then(setDaten)
      .catch((e) => setFehler(e.message))
      .finally(() => setLaedt(false))
  }, [tage, von, testsZeigen])

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
            {daten.gesamt} Sitzungen{" "}
            {daten.zeitraum?.frei
              ? `seit ${new Date(daten.zeitraum.seit).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}`
              : `in den letzten ${tage} Tagen`}
            {daten.intern_ausgeschlossen > 0 && (
              <span className="text-slate-400">
                {" "}
                · {daten.intern_ausgeschlossen} eigene {daten.zeitraum?.tests_sichtbar ? "mitgezählt" : "ausgeschlossen"}
              </span>
            )}
            {daten.verworfene_sitzungen > 0 && (
              <span
                className="text-amber-600"
                title="Ereignisse ohne zugehörigen Seitenaufruf. Sie lassen sich keiner Sitzung zuordnen und fallen aus jeder Quote heraus."
              >
                {" "}
                · {daten.verworfene_sitzungen} ohne Seitenaufruf verworfen
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-0.5">
            {ZEITRAEUME.map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => {
                  setVon("")
                  setTage(z)
                }}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  !von && tage === z ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {z} Tage
              </button>
            ))}
          </div>
          {/* Freier Startzeitpunkt — fuer „ab dem Moment, in dem die
              Anzeige umgestellt wurde". Ein Tagesraster wuerde den halben
              Tag davor mitzaehlen. */}
          <label className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500">
            ab
            <input
              type="datetime-local"
              value={von}
              onChange={(e) => setVon(e.target.value)}
              className="bg-transparent text-xs text-slate-800 outline-none"
            />
            {von && (
              <button
                type="button"
                onClick={() => setVon("")}
                className="text-slate-400 hover:text-slate-700"
                aria-label="Startzeitpunkt zuruecksetzen"
              >
                ×
              </button>
            )}
          </label>
          <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500">
            <input
              type="checkbox"
              checked={testsZeigen}
              onChange={(e) => setTestsZeigen(e.target.checked)}
              className="h-3.5 w-3.5"
            />
            eigene Tests mitzählen
          </label>
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
                {/* Was genau gezaehlt wird. Ohne diesen Satz haelt man eine
                    Stufe fuer eine Klickzahl und wundert sich, warum sie
                    nach einer Korrektur faellt. */}
                <p className="mt-0.5 text-[11px] italic text-slate-400">{ZAEHLREGEL[s.stufe] ?? ""}</p>
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

      {/* ── Einwilligungsbanner ─────────────────────────────────── */}
      <Karte
        titel="Entscheidung am Einwilligungsbanner"
        hinweis="Je Sitzung einmal. „Ohne Auswahl“ heisst: Das Banner wurde gezeigt, aber weder angenommen noch abgelehnt — für diese Besucher lädt kein Pixel, und bei Meta tauchen sie nie auf. Sitzungen, die schon früher entschieden hatten, bekommen kein Banner und stehen hier nicht."
        symbol={<ShieldQuestion className="h-4 w-4 text-slate-400" />}
      >
        {daten.banner?.gezeigt > 0 ? (
          <>
            <div className="mb-4 grid grid-cols-3 gap-3">
              {[
                ["Akzeptiert", daten.banner.akzeptiert, "#10b981"],
                ["Abgelehnt", daten.banner.abgelehnt, "#64748b"],
                ["Ohne Auswahl", daten.banner.ohne_auswahl, "#f59e0b"],
              ].map(([titel, wert, farbe]) => (
                <div key={titel as string}>
                  <p className="text-[11px] text-slate-500">{titel as string}</p>
                  <p className="text-xl font-bold tabular-nums text-slate-900">{wert as number}</p>
                  <p className="text-[11px] tabular-nums text-slate-400">
                    {daten.banner.gezeigt > 0
                      ? Math.round(((wert as number) / daten.banner.gezeigt) * 100)
                      : 0}{" "}
                    % von {daten.banner.gezeigt}
                  </p>
                  <div className="mt-1">
                    <Balken
                      anteil={
                        daten.banner.gezeigt > 0 ? ((wert as number) / daten.banner.gezeigt) * 100 : 0
                      }
                      farbe={farbe as string}
                    />
                  </div>
                </div>
              ))}
            </div>
            {[
              ["Nach Einstiegsseite", daten.banner_nach_seite],
              ["Nach Anzeige (utm_content)", daten.banner_nach_anzeige],
            ].map(([titel, zeilen]) =>
              (zeilen as BannerZeile[])?.length ? (
                <div key={titel as string} className="mt-3 border-t border-slate-100 pt-2">
                  <p className="mb-1.5 text-[11px] text-slate-400">{titel as string}</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-[11px] text-slate-400">
                          <th className="pb-1 font-medium" />
                          <th className="pb-1 text-right font-medium">gezeigt</th>
                          <th className="pb-1 text-right font-medium">akzeptiert</th>
                          <th className="pb-1 text-right font-medium">abgelehnt</th>
                          <th className="pb-1 text-right font-medium">ohne Auswahl</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(zeilen as BannerZeile[]).map((b) => (
                          <tr key={b.name}>
                            <td className="max-w-[12rem] truncate py-1.5 font-medium text-slate-700">
                              {b.name}
                            </td>
                            <td className="py-1.5 text-right tabular-nums text-slate-600">{b.gezeigt}</td>
                            <td className="py-1.5 text-right tabular-nums">
                              <span className="text-slate-600">{b.akzeptiert}</span>{" "}
                              <span className="text-emerald-600">({b.zustimmungsrate} %)</span>
                            </td>
                            <td className="py-1.5 text-right tabular-nums text-slate-600">{b.abgelehnt}</td>
                            <td className="py-1.5 text-right tabular-nums text-amber-600">
                              {b.ohne_auswahl}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null
            )}
          </>
        ) : (
          <p className="text-xs leading-relaxed text-slate-500">
            Noch keine Banner-Entscheidung gemessen. Die Messung läuft seit dem 13.10.2026 — Werte
            entstehen ab dem ersten Besucher, der danach zum ersten Mal auf die Seite kommt.
          </p>
        )}
      </Karte>

      {/* ── Leseleitern, eine je Seite ──────────────────────────── */}
      {daten.leitern.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4">
          <p className="text-xs leading-relaxed text-slate-500">
            <strong className="text-slate-700">Abschnitte werden noch gesammelt.</strong> Sobald
            die ersten Besucher gescrollt haben, steht hier, an welchem Abschnitt das Lesen
            aufhört — getrennt für die Startseite und jede Anzeigenseite.
          </p>
        </div>
      ) : (
        daten.leitern.map((l) => (
          <Karte
            key={l.schluessel}
            titel={`An welchem Abschnitt es bricht · ${l.titel}`}
            hinweis={`${l.sitzungen} Sitzungen sind auf ${l.pfad} eingestiegen, ${l.klicks} haben den Buchungsknopf geklickt. Abschnitte in Leserichtung; „noch dabei“ heisst: wie viele von denen, die den vorigen Abschnitt sahen, auch hier ankamen. Der niedrigste Wert ist die Baustelle.`}
            symbol={<ListOrdered className="h-4 w-4 text-slate-400" />}
          >
            {l.gemessen ? (
              <div className="space-y-2.5">
                {l.sprossen.map((a) => (
                  <div key={a.id}>
                    <div className="flex items-baseline justify-between gap-3 text-xs">
                      <span className="text-slate-700">{a.titel}</span>
                      <span className="whitespace-nowrap tabular-nums text-slate-500">
                        <strong className="text-slate-800">{a.erreicht}</strong> · {a.anteil} %
                        {a.haltequote !== null && (
                          <span
                            className={
                              a.haltequote < 60
                                ? " text-red-500"
                                : a.haltequote < 85
                                  ? " text-amber-500"
                                  : " text-emerald-600"
                            }
                          >
                            {" "}
                            · {a.haltequote} % noch dabei
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="mt-1">
                      <Balken anteil={a.anteil} farbe="#2C3E2D" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs leading-relaxed text-slate-500">
                Für diese Seite liegt noch keine einzige Abschnitts-Meldung vor. Das heisst nicht,
                dass niemand gelesen hat — die Messung läuft erst seit kurzem.
              </p>
            )}
          </Karte>
        ))
      )}

      {/* ── Lesetiefe und aktive Zeit ───────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        {daten.lesetiefe ? (
          <Karte
            titel="Wie weit gelesen wird"
            hinweis="Anteil der Seite, der durchs Fenster gelaufen ist. 100 % heisst: unten angekommen."
            symbol={<BookOpen className="h-4 w-4 text-slate-400" />}
          >
            <Treppe
              werte={daten.lesetiefe}
              gesamt={daten.gesamt}
              beschriftung={(m) => `mindestens ${m} % der Seite`}
              farbe="#64748b"
            />
          </Karte>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4">
            <p className="text-xs leading-relaxed text-slate-500">
              <strong className="text-slate-700">Lesetiefe wird noch gesammelt.</strong> Der
              Unterschied zwischen „sofort weg“ und „bis zum Preis gelesen“.
            </p>
          </div>
        )}

        {daten.aktivzeit ? (
          <Karte
            titel="Wie lange wirklich da"
            hinweis="Nur Zeit mit sichtbarem Tab und Aktivität in den letzten 30 Sekunden. Ein über Nacht offener Tab zählt nicht."
            symbol={<Timer className="h-4 w-4 text-slate-400" />}
          >
            <Treppe
              werte={daten.aktivzeit}
              gesamt={daten.gesamt}
              beschriftung={(m) =>
                m >= 60 ? `mindestens ${m / 60} Minuten` : `mindestens ${m} Sekunden`
              }
              farbe="#0ea5e9"
            />
          </Karte>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4">
            <p className="text-xs leading-relaxed text-slate-500">
              <strong className="text-slate-700">Aktive Zeit wird noch gesammelt.</strong> Sie
              ersetzt die alte Verweildauer, deren längster Wert ein über Nacht offener Tab war
              (23,6 Stunden).
            </p>
          </div>
        )}
      </div>

      {/* ── Absprungseiten ──────────────────────────────────────── */}
      <Karte
        titel="Wo der Besuch endet"
        hinweis="Letzte Seite der Sitzung. Rechtliche Seiten sind ausgenommen — dort endet ein Besuch zu Recht."
        symbol={<LogOut className="h-4 w-4 text-slate-400" />}
      >
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
      </Karte>

      {/* ── Quelle, Kampagne, Anzeige ───────────────────────────── */}
      <Karte
        titel="Welche Quelle bringt wen"
        hinweis="Nicht wie viele kommen, sondern wie viele bleiben. Das ist die Zahl, die über Werbebudget entscheidet."
        symbol={<Radio className="h-4 w-4 text-slate-400" />}
      >
        <Aufschluesselung zeilen={daten.quellen} spalte="Quelle" />
      </Karte>

      {(daten.kampagnen.length > 0 || daten.anzeigen.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {daten.kampagnen.length > 0 && (
            <Karte titel="Nach Kampagne" hinweis="utm_campaign">
              <Aufschluesselung zeilen={daten.kampagnen} spalte="Kampagne" />
            </Karte>
          )}
          {daten.anzeigen.length > 0 && (
            <Karte
              titel="Nach Anzeige"
              hinweis="utm_content — bei Meta die einzelne Anzeige. Hier entscheidet sich, welche abgeschaltet wird."
            >
              <Aufschluesselung zeilen={daten.anzeigen} spalte="Anzeige" />
            </Karte>
          )}
        </div>
      )}

      {/* ── Buchungen nach Herkunft ─────────────────────────────── */}
      <Karte
        titel="Buchungen nach Herkunft"
        hinweis="Aus dem Buchungskalender, nicht aus der Website-Messung — gebucht wird auf einer fremden Domäne. Termine ohne Angabe stammen aus der Zeit, bevor das Buchungstool die Herkunft mitsendete."
        symbol={<CalendarCheck className="h-4 w-4 text-slate-400" />}
      >
        {daten.buchungen_nach_quelle.length === 0 && daten.buchungen_ohne_herkunft === 0 ? (
          <p className="text-xs text-slate-400">Keine Videotermine im Zeitraum.</p>
        ) : (
          <div className="space-y-1.5 text-xs">
            {daten.buchungen_nach_quelle.map((b) => (
              <div key={b.quelle} className="flex items-center justify-between">
                <span className="font-medium text-slate-700">{b.quelle}</span>
                <span className="tabular-nums text-slate-600">{b.anzahl}</span>
              </div>
            ))}
            {daten.buchungen_ohne_herkunft > 0 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 text-slate-400">
                <span>ohne Angabe</span>
                <span className="tabular-nums">{daten.buchungen_ohne_herkunft}</span>
              </div>
            )}
            {/* Welche Anzeige — die Frage, nach der Budget verschoben wird. */}
            {daten.buchungen_nach_anzeige?.length > 0 && (
              <div className="mt-3 border-t border-slate-100 pt-2">
                <p className="mb-1.5 text-[11px] text-slate-400">Nach Anzeige (utm_content)</p>
                {daten.buchungen_nach_anzeige.map((b) => (
                  <div key={b.anzeige} className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">{b.anzeige}</span>
                    <span className="tabular-nums text-slate-600">{b.anzahl}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Welcher Knopf — eine andere Frage als welche Anzeige. */}
            {daten.buchungen_nach_cta?.length > 0 && (
              <div className="mt-3 border-t border-slate-100 pt-2">
                <p className="mb-1.5 text-[11px] text-slate-400">Nach geklicktem Knopf</p>
                {daten.buchungen_nach_cta.map((b) => (
                  <div key={b.cta} className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">{b.cta}</span>
                    <span className="tabular-nums text-slate-600">{b.anzahl}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Karte>

      {/* ── Gerät und Browser ───────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        <Karte titel="Gerät" symbol={<Smartphone className="h-4 w-4 text-slate-400" />}>
          <Aufschluesselung zeilen={daten.geraete} spalte="Gerät" />
        </Karte>
        <Karte
          titel="Browser"
          hinweis={
            daten.in_app_sitzungen > 0
              ? `${daten.in_app_sitzungen} Sitzungen liefen in einem App-Browser (Instagram, Facebook). Dort fehlen Teile des Speichers und Weiterleitungen brechen — wenn Anzeigen-Traffic nicht konvertiert, ist das der erste Verdacht.`
              : "App-Browser (Instagram, Facebook) stehen als eigener Eintrag — sonst verschwinden sie unter „Chrome“."
          }
        >
          <Aufschluesselung zeilen={daten.browser} spalte="Browser" />
        </Karte>
      </div>

      {/* ── Einstiegsseiten ─────────────────────────────────────── */}
      <Karte
        titel="Wo Besucher ankommen"
        hinweis="Erste Seite der Sitzung, mit dem Anteil derer, die danach nicht sofort gingen."
      >
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
      </Karte>
    </div>
  )
}
