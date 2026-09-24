"use client"

/**
 * PROJ-28 — „So sieht es bei dir aus."
 *
 * Der Behandler nach der ersten Demo: „Er sieht nicht die Übung, die ich
 * reingetan habe, sondern nur, dass er heute ein Training hat. Es müsste die
 * Übung zu sehen sein und wie sie aussieht, wenn er das Training startet."
 *
 * Der erste Entwurf zeigte die Übersichtskarte der App — vier Namen und eine
 * Minutenzahl. Das ist die Ankündigung eines Trainings, nicht das Training.
 * Wer etwas verkauft, das man tun soll, muss das TUN zeigen: die Übung, wie
 * sie aussieht, mit Bild.
 *
 * Deshalb zeigt die Vorschau jetzt den ÜBUNGSSCHIRM — was er sieht, wenn er
 * auf „Training starten" tippt. Der Behandler blättert durch, der Patient
 * blättert mit; oben bleibt die Karte als kleiner Streifen, damit klar ist,
 * wo das hier in der App liegt.
 *
 * DIE VORSCHAU BLEIBT EHRLICH. Farben, Aufbau und die Rechnung für die Dauer
 * stammen aus components/app/HeuteKarte.tsx. Eine hübschere Vorschau als die
 * Wirklichkeit wäre ein Versprechen, das die App am nächsten Morgen bricht.
 */

import { Dumbbell, Clock, ArrowRight, CheckCircle2, ImageOff } from "lucide-react"
import type { EntwurfsUebung } from "./PlanImGespraech"

const INK = "#12160f"
const GREEN = "#2C3E2D"

export interface HandyDaten {
  uebungen: EntwurfsUebung[]
  tage: string[]
  wochen: number
  gesendet: boolean
  /** Welche Übung gerade grossformatig zu sehen ist. */
  aktiv?: number
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

function vorgabe(u: EntwurfsUebung): string {
  return u.dauer_sekunden ? `${u.dauer_sekunden} Sek. halten` : `${u.wiederholungen ?? 10} Wdh.`
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
  const index = Math.min(Math.max(daten.aktiv ?? 0, 0), Math.max(anzahl - 1, 0))
  const uebung = daten.uebungen[index]

  return (
    <div
      className={`mx-auto w-full ${klein ? "max-w-[210px]" : "max-w-[300px]"}`}
      aria-label="Vorschau der Patienten-App"
    >
      {/* Gehäuse. Kein Spielzeug-Rahmen mit Knöpfen und Kamera — nur so viel,
          dass klar ist: Das hier ist dein Telefon, nicht meine Tabelle. */}
      <div
        className="overflow-hidden rounded-[2rem] p-2 shadow-2xl"
        style={{ backgroundColor: "#0f120d" }}
      >
        <div className="overflow-hidden rounded-[1.6rem] bg-white">
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

          {/* Kopfstreifen: wo in der App bin ich hier? */}
          <div className="mx-3 mt-1 flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 px-3 py-2">
            <Dumbbell className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="text-[10.5px] font-semibold text-white">
              {anzahl} Übung{anzahl !== 1 ? "en" : ""}
            </span>
            <span className="flex items-center gap-1 text-[10.5px] text-white/80">
              <Clock className="h-3 w-3" />
              ca. {dauer} Min.
            </span>
          </div>

          {/* DER ÜBUNGSSCHIRM — das, was er beim Training sieht. */}
          {uebung ? (
            <div className="px-3 pb-3 pt-2.5">
              <div className="flex items-baseline justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Übung {index + 1} von {anzahl}
                </p>
                <p className="text-[10px] text-slate-400">
                  {daten.tage.map((t) => TAG_TEXT[t]).join(" · ")}
                </p>
              </div>

              <div className="mt-1.5 overflow-hidden rounded-2xl bg-slate-100">
                {uebung.media_url ? (
                  uebung.media_type === "video" ? (
                    <video
                      src={uebung.media_url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="aspect-[4/3] w-full bg-black object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={uebung.media_url}
                      alt={uebung.name}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  )
                ) : (
                  <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 text-slate-400">
                    <ImageOff className="h-5 w-5" />
                    <span className="text-[9.5px]">Ohne Bild hinterlegt</span>
                  </div>
                )}
              </div>

              <p className="mt-2 text-[13px] font-bold leading-tight" style={{ color: INK }}>
                {uebung.name}
              </p>
              <p className="mt-0.5 text-[11.5px]" style={{ color: GREEN }}>
                {uebung.saetze} Sätze × {vorgabe(uebung)}
                <span className="text-slate-400"> · {uebung.pause_sekunden} Sek. Pause</span>
              </p>

              {/* Fortschrittspunkte wie im Trainingsablauf. */}
              <div className="mt-2.5 flex items-center justify-center gap-1">
                {daten.uebungen.map((u, i) => (
                  <span
                    key={u.exercise_id}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: i === index ? 16 : 6,
                      backgroundColor: i === index ? GREEN : "#cbd5e1",
                    }}
                  />
                ))}
              </div>

              <div className="mt-2.5 flex h-9 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-[12px] font-semibold text-white">
                {index === 0 ? "Training starten" : "Weiter"}
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-[11.5px] text-slate-400">
              Noch keine Übung im Plan.
            </div>
          )}
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
