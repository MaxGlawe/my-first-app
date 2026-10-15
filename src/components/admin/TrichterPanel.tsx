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
  MoveRight,
  ClipboardCheck,
  ClipboardCopy,
  Download,
} from "lucide-react"
// Die Zaehlregeln stehen in der Bibliothek, nicht hier: Ansicht und
// Textbericht muessen denselben Satz zeigen. Zwei Fassungen wuerden
// auseinanderlaufen — und dann widerspricht der Export dem Bildschirm.
import { ZAEHLREGEL } from "@/lib/analytics-bericht"

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
  umstellung_kennenlernen: string
  verworfene_sitzungen: number
  banner: { gezeigt: number; akzeptiert: number; abgelehnt: number; ohne_auswahl: number }
  nach_klick: {
    klicks: number
    verlassen: number
    geblieben: number
    unbekannt: number
    median_ms: number | null
    schnell: number
  }
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
  /** Zustand des Berichts-Knopfs: „kopiert" verschwindet nach zwei Sekunden. */
  const [bericht, setBericht] = useState<"ruht" | "holt" | "kopiert" | "fehler">("ruht")
  /**
   * Der Bericht im Klartext — nur dann gesetzt, wenn das Kopieren NICHT
   * geklappt hat.
   *
   * `navigator.clipboard` braucht HTTPS und eine Erlaubnis; in manchen
   * Browsern bricht es ohne Vorwarnung ab. Dann waere ein „Konnte nicht
   * kopiert werden" ein Rueckschritt gegenueber dem Screenshot. Deshalb
   * erscheint der Text stattdessen in einem Feld, aus dem man ihn selbst
   * herausholt.
   */
  const [berichtText, setBerichtText] = useState<string | null>(null)

  /** Der gewaehlte Zeitraum als Abfrage — Ansicht und Bericht teilen sie. */
  const abfrage = useCallback(() => {
    const p = new URLSearchParams()
    if (von) p.set("von", new Date(von).toISOString())
    else p.set("tage", String(tage))
    if (testsZeigen) p.set("tests", "ein")
    return p
  }, [tage, von, testsZeigen])

  const laden = useCallback(() => {
    setLaedt(true)
    setFehler(null)
    fetch(`/api/analytics/trichter?${abfrage().toString()}`)
      .then(async (r) => {
        const j = await r.json()
        if (!r.ok) throw new Error(j.error ?? "Konnte nicht geladen werden.")
        return j as Daten
      })
      .then(setDaten)
      .catch((e) => setFehler(e.message))
      .finally(() => setLaedt(false))
  }, [abfrage])

  useEffect(() => laden(), [laden])

  /** Bericht holen — und in die Zwischenablage legen. */
  const berichtKopieren = useCallback(async () => {
    setBericht("holt")
    setBerichtText(null)
    try {
      const p = abfrage()
      p.set("format", "text")
      const r = await fetch(`/api/analytics/trichter?${p.toString()}`)
      if (!r.ok) throw new Error("Bericht konnte nicht erstellt werden.")
      const text = await r.text()
      try {
        await navigator.clipboard.writeText(text)
        setBericht("kopiert")
        setTimeout(() => setBericht("ruht"), 2500)
      } catch {
        // Zwischenablage verweigert (kein HTTPS, keine Erlaubnis, In-App-
        // Browser): Dann den Text zeigen, nicht den Fehler.
        setBerichtText(text)
        setBericht("ruht")
      }
    } catch {
      setBericht("fehler")
      setTimeout(() => setBericht("ruht"), 3000)
    }
  }, [abfrage])

  /** Bericht als .md-Datei — zum Anhängen statt Einfügen. */
  const berichtLaden = useCallback(() => {
    const p = abfrage()
    p.set("format", "text")
    // Ueber einen echten Seitenaufruf, nicht ueber einen Blob: Die Antwort
    // traegt schon `Content-Disposition` mit Dateinamen, und der Aufruf
    // nimmt die Anmelde-Cookies mit.
    window.location.href = `/api/analytics/trichter?${p.toString()}`
  }, [abfrage])

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
            {(() => {
              // Liegt der Schnitt im gewaehlten Zeitraum? Dann muss er
              // sichtbar sein: Davor kostete der Einstieg 69 €, danach
              // nichts. Klickraten ueber diesen Schnitt hinweg zu
              // vergleichen, waere ein Vergleich zweier Angebote.
              const u = new Date(daten.umstellung_kennenlernen)
              if (!daten.zeitraum || new Date(daten.zeitraum.seit) > u) return null
              return (
                <span className="text-slate-700">
                  {" · "}
                  <span title="Vorher: Konsultation für 69 €. Danach: kostenloses Kennenlernen, 20 Min.">
                    Angebotswechsel am{" "}
                    {u.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}{" "}
                    im Zeitraum
                  </span>
                </span>
              )
            })()}
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
          {/* Die Auswertung zum Mitnehmen — mit Zaehlregeln und Grenzen im
              Text, damit die Zahlen auch ausserhalb dieses Bildschirms
              lesbar bleiben. Enthaelt nur Summen, keine Personendaten. */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-0.5">
            <button
              type="button"
              onClick={berichtKopieren}
              disabled={bericht === "holt"}
              title="Gesamte Auswertung als Text in die Zwischenablage — zum Einfügen in einen Claude-Chat"
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                bericht === "kopiert"
                  ? "bg-emerald-600 text-white"
                  : bericht === "fehler"
                    ? "bg-red-50 text-red-600"
                    : "text-slate-600 hover:bg-slate-900 hover:text-white"
              }`}
            >
              {bericht === "kopiert" ? (
                <ClipboardCheck className="h-3.5 w-3.5" />
              ) : (
                <ClipboardCopy className="h-3.5 w-3.5" />
              )}
              {bericht === "holt"
                ? "wird erstellt …"
                : bericht === "kopiert"
                  ? "kopiert"
                  : bericht === "fehler"
                    ? "fehlgeschlagen"
                    : "Bericht kopieren"}
            </button>
            <button
              type="button"
              onClick={berichtLaden}
              title="Dieselbe Auswertung als Markdown-Datei herunterladen"
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <Download className="h-3.5 w-3.5" />
              .md
            </button>
          </div>
        </div>
      </div>

      {/* Nur sichtbar, wenn die Zwischenablage nicht wollte. */}
      {berichtText && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs text-amber-800">
              Dieser Browser hat die Zwischenablage abgelehnt. Text markieren und mit Strg&nbsp;+&nbsp;C
              kopieren:
            </p>
            <button
              type="button"
              onClick={() => setBerichtText(null)}
              className="text-xs text-amber-700 underline hover:text-amber-900"
            >
              schliessen
            </button>
          </div>
          <textarea
            readOnly
            value={berichtText}
            onFocus={(e) => e.currentTarget.select()}
            className="h-48 w-full rounded-lg border border-amber-200 bg-white p-3 font-mono text-[11px] leading-relaxed text-slate-700"
          />
        </div>
      )}

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

      {/* ── Nach dem Buchungsklick ──────────────────────────────── */}
      {daten.nach_klick?.klicks > 0 && (
        <Karte
          titel="Kommt der Besucher nach dem Klick auch an?"
          hinweis="Gemessen wird, ob die Landingpage nach dem Klick verlassen wird. Unter 1,5 Sekunden heisst: Die Weiterleitung zur Buchungsseite hat gegriffen. „Geblieben“ heisst: Nach drei Sekunden war er noch hier — der Knopf hat ihn nicht weitergebracht."
          symbol={<MoveRight className="h-4 w-4 text-slate-400" />}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Klicks", daten.nach_klick.klicks, "#64748b"],
              ["weitergegangen", daten.nach_klick.verlassen, "#10b981"],
              ["geblieben", daten.nach_klick.geblieben, "#ef4444"],
              ["unklar", daten.nach_klick.unbekannt, "#cbd5e1"],
            ].map(([titel, wert, farbe]) => (
              <div key={titel as string}>
                <p className="text-[11px] text-slate-500">{titel as string}</p>
                <p className="text-xl font-bold tabular-nums text-slate-900">{wert as number}</p>
                <div className="mt-1">
                  <Balken
                    anteil={
                      daten.nach_klick.klicks > 0
                        ? ((wert as number) / daten.nach_klick.klicks) * 100
                        : 0
                    }
                    farbe={farbe as string}
                  />
                </div>
              </div>
            ))}
          </div>
          {daten.nach_klick.median_ms !== null && (
            <p className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
              Median bis zum Verlassen: <strong className="text-slate-700">{daten.nach_klick.median_ms} ms</strong>
              {" · "}
              {daten.nach_klick.schnell} von {daten.nach_klick.verlassen} unter 1,5 Sekunden
            </p>
          )}
          {daten.nach_klick.unbekannt > 0 && (
            <p className="mt-1 text-[11px] text-slate-400">
              „Unklar“ sind Klicks aus der Zeit vor dem 14.10.2026 — damals wurde noch nicht
              gemessen, was danach passierte.
            </p>
          )}
        </Karte>
      )}

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
