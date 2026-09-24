"use client"

/**
 * PROJ-28 — „So sieht es bei dir aus."
 *
 * Der Behandler nach dem ersten Plan im Gespräch: „Ich wollte das Feature so
 * haben, dass ich es dem Klienten im Call geben kann, dass er dann das Handy
 * sieht und ich ihm schon vorab zeigen kann, was er bekommt."
 *
 * Der Punkt dahinter ist ein verkäuferischer und ein therapeutischer zugleich.
 * Eine Liste mit vier Übungsnamen ist eine Ankündigung. Ein Handy, auf dem
 * „Heute trainieren — 4 Übungen, ca. 12 Minuten" steht, ist ein Versprechen,
 * das man anfassen kann. Der Patient muss sich nicht vorstellen, was er kauft;
 * er sieht es, bevor er zustimmt.
 *
 * DIE VORSCHAU IST EHRLICH. Sie ist der Karte aus der Patienten-App
 * nachgebaut (components/app/HeuteKarte.tsx) — dieselbe Farbe, dieselbe
 * Aufteilung, dieselbe Rechnung für die Dauer. Eine hübschere Vorschau als die
 * Wirklichkeit wäre ein Versprechen, das die App am nächsten Morgen bricht.
 */

import { Dumbbell, Clock, ArrowRight, CheckCircle2 } from "lucide-react"
import type { EntwurfsUebung } from "./PlanImGespraech"

const INK = "#12160f"
const GREEN = "#2C3E2D"

export interface HandyDaten {
  uebungen: EntwurfsUebung[]
  tage: string[]
  wochen: number
  gesendet: boolean
}

const TAG_TEXT: Record<string, string> = {
  mo: "Mo",
  di: "Di",
  mi: "Mi",
  do: "Do",
  fr: "Fr",
  sa: "Sa",
  so: "So",
}

/**
 * Dieselbe Rechnung wie in der App: Sätze mal Haltedauer (oder 30 Sekunden,
 * wenn es Wiederholungen sind) plus Pausen. Wer hier schöner rechnet als die
 * App, belügt den Patienten um genau die Minuten, die ihn abschrecken.
 */
function dauerMinuten(uebungen: EntwurfsUebung[]): number {
  const summe = uebungen.reduce((gesamt, u) => {
    const satzZeit = u.saetze * (u.dauer_sekunden ?? 30)
    const pausenZeit = u.saetze * u.pause_sekunden
    return gesamt + Math.round((satzZeit + pausenZeit) / 60)
  }, 0)
  return summe || uebungen.length * 3
}

export function HandyVorschau({
  daten,
  klein = false,
}: {
  daten: HandyDaten
  /** In der Schublade des Behandlers zeigt sie sich verkleinert. */
  klein?: boolean
}) {
  const anzahl = daten.uebungen.length
  const dauer = dauerMinuten(daten.uebungen)

  return (
    <div
      className={`mx-auto w-full ${klein ? "max-w-[220px]" : "max-w-[300px]"}`}
      aria-label="Vorschau der Patienten-App"
    >
      {/* Gehäuse. Kein Spielzeug-Rahmen mit Knöpfen und Kamera — nur so viel,
          dass klar ist: Das hier ist dein Telefon, nicht meine Tabelle. */}
      <div
        className="overflow-hidden rounded-[2rem] p-2 shadow-2xl"
        style={{ backgroundColor: "#0f120d" }}
      >
        <div className="overflow-hidden rounded-[1.6rem] bg-white">
          {/* Kopfzeile des Telefons */}
          <div className="flex items-center justify-between px-4 pb-1 pt-2.5">
            <span className="text-[10px] font-semibold" style={{ color: INK }}>
              {new Date().toLocaleTimeString("de-DE", {
                timeZone: "Europe/Berlin",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="flex gap-0.5" aria-hidden>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            </span>
          </div>

          <div className="px-3.5 pb-4 pt-1">
            <p className="text-[11px] font-medium text-slate-400">Praxis OS</p>

            {/* Die Karte aus der App — Farbe und Aufbau übernommen. */}
            <div className="mt-2 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 shadow-lg">
              <div className="p-3.5">
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20">
                    <Dumbbell className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[9.5px] font-medium uppercase tracking-wide text-white/70">
                      Heute trainieren
                    </p>
                    <p className="text-[13px] font-bold leading-tight text-white">Training</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-white/80">
                  <span className="flex items-center gap-1">
                    <Dumbbell className="h-3 w-3" />
                    {anzahl} Übung{anzahl !== 1 ? "en" : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ca. {dauer} Min.
                  </span>
                </div>
              </div>
              <div className="px-3.5 pb-3.5">
                <div className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-white text-[12px] font-semibold text-emerald-700">
                  Training starten
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            {/* Die Übungen darunter, so wie er sie durchgeht. */}
            <ul className="mt-3 space-y-1.5">
              {daten.uebungen.map((u, i) => (
                <li
                  key={u.exercise_id}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-2"
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: GREEN }}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11.5px] font-medium" style={{ color: INK }}>
                      {u.name}
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      {u.saetze} ×{" "}
                      {u.dauer_sekunden ? `${u.dauer_sekunden} Sek. halten` : `${u.wiederholungen ?? 10} Wdh.`}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            {/* Wann. Das ist die Frage, die direkt nach „was" kommt. */}
            <div className="mt-3 flex items-center justify-center gap-1">
              {(["mo", "di", "mi", "do", "fr", "sa", "so"] as const).map((t) => {
                const an = daten.tage.includes(t)
                return (
                  <span
                    key={t}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold"
                    style={
                      an
                        ? { backgroundColor: GREEN, color: "#fff" }
                        : { backgroundColor: "#f1f5f9", color: "#94a3b8" }
                    }
                  >
                    {TAG_TEXT[t]}
                  </span>
                )
              })}
            </div>
            <p className="mt-1.5 text-center text-[9.5px] text-slate-400">
              {daten.wochen} {daten.wochen === 1 ? "Woche" : "Wochen"} lang
            </p>
          </div>
        </div>
      </div>

      {!klein && (
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[13px] text-white/80">
          {daten.gesendet ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Das liegt jetzt in deiner App.
            </>
          ) : (
            "So sieht es gleich in deiner App aus."
          )}
        </p>
      )}
    </div>
  )
}

/** Formatfüllend beim Patienten, mit dunklem Grund wie beim gezeigten Dokument. */
export function HandyGezeigt({
  daten,
  gegenueber,
}: {
  daten: HandyDaten
  gegenueber: string
}) {
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-auto p-5"
      style={{ backgroundColor: "#12150f" }}
    >
      <p className="mb-4 text-center text-[13px] text-white/70">
        {gegenueber} zeigt dir dein Training
      </p>
      <HandyVorschau daten={daten} />
    </div>
  )
}
