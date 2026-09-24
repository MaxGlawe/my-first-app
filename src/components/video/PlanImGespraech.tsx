"use client"

/**
 * PROJ-28 — Der Plan entsteht IM Gespräch, nicht danach.
 *
 * Das ist der Moment, in dem aus einem Gespräch ein Programm wird — und der
 * Moment, in dem der Patient begreift, wofür er zahlt. Deshalb sieht er den
 * Entwurf mitwachsen, statt hinterher eine Mail zu bekommen.
 *
 * GESENDET WIRD ALS AD-HOC-ZUWEISUNG (PROJ-10), nicht als Trainingsplan mit
 * Phasen und Einheiten: Was hier entsteht, sind ein paar Übungen für die
 * nächsten Wochen, kein Bauwerk. Der grosse Builder bleibt für das, wofür er
 * gemacht ist — und der Patient bekommt seine Übungen auf demselben Weg in die
 * App, den er von allen anderen Hausaufgaben kennt.
 */

import { useEffect, useState } from "react"
import { Loader2, Check, Search, Plus, Send, Dumbbell, Eye, EyeOff, X } from "lucide-react"
import type { Wurf } from "./Schaltzentrale"

const INK = "#12160f"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const LINE = "#e3ddd1"

export interface EntwurfsUebung {
  exercise_id: string
  name: string
  saetze: number
  wiederholungen: number | null
  dauer_sekunden: number | null
  pause_sekunden: number
}

interface Uebung {
  id: string
  name: string
  media_url: string | null
  media_type: "image" | "video" | null
  muskelgruppen: string[] | null
  standard_saetze: number | null
  standard_wiederholungen: number | null
  standard_dauer_sekunden: number | null
  standard_pause_sekunden: number | null
}

/**
 * Heute in Ortszeit als YYYY-MM-DD. Nicht in UTC — sonst begänne ein abends
 * angelegter Plan erst morgen. Derselbe Fehler wie in der Einladungsmail vom
 * 24.09.2026, nur an anderer Stelle.
 */
function heute(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" })
}

function inWochen(wochen: number): string {
  return new Date(Date.now() + wochen * 7 * 24 * 3600_000).toLocaleDateString("sv-SE", {
    timeZone: "Europe/Berlin",
  })
}

const WOCHENTAGE = [
  ["mo", "Mo"],
  ["di", "Di"],
  ["mi", "Mi"],
  ["do", "Do"],
  ["fr", "Fr"],
  ["sa", "Sa"],
  ["so", "So"],
] as const

export function PlanImGespraech({
  patientId,
  gegenueber,
  entwurf,
  setEntwurf,
  onGesendet,
  gezeigt,
  onZeigen,
  onZeigenBeenden,
}: {
  patientId: string
  gegenueber: string
  entwurf: EntwurfsUebung[]
  setEntwurf: (u: EntwurfsUebung[]) => void
  /** Damit der Patient den Vermerk "liegt in deiner App" mitbekommt. */
  onGesendet: () => void
  gezeigt: Wurf | null
  onZeigen: (w: Wurf) => void
  onZeigenBeenden: () => void
}) {
  const [suche, setSuche] = useState("")
  const [treffer, setTreffer] = useState<Uebung[]>([])
  const [sucht, setSucht] = useState(false)
  const [wochen, setWochen] = useState(4)
  const [tage, setTage] = useState<string[]>(["mo", "mi", "fr"])
  const [sendet, setSendet] = useState(false)
  const [gesendet, setGesendet] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)

  // Gesucht wird erst, wenn die Finger stillstehen. Im Gespräch tippt man
  // nebenbei, und jede Taste eine Abfrage wäre Lärm auf der Leitung.
  useEffect(() => {
    const begriff = suche.trim()
    if (begriff.length < 2) {
      setTreffer([])
      return
    }
    setSucht(true)
    const t = setTimeout(() => {
      fetch(`/api/exercises?search=${encodeURIComponent(begriff)}&pageSize=12`)
        .then((r) => r.json())
        .then((d) => setTreffer((d.exercises ?? d.data ?? []) as Uebung[]))
        .catch(() => setTreffer([]))
        .finally(() => setSucht(false))
    }, 350)
    return () => clearTimeout(t)
  }, [suche])

  const hinzufuegen = (u: Uebung) => {
    if (entwurf.some((e) => e.exercise_id === u.id)) return
    setEntwurf([
      ...entwurf,
      {
        exercise_id: u.id,
        name: u.name,
        saetze: u.standard_saetze ?? 3,
        // Entweder Wiederholungen oder Dauer — eine Übung ist das eine oder
        // das andere. Fehlt beides, sind zehn Wiederholungen die ehrlichste
        // Annahme.
        wiederholungen: u.standard_wiederholungen ?? (u.standard_dauer_sekunden ? null : 10),
        dauer_sekunden: u.standard_wiederholungen ? null : u.standard_dauer_sekunden,
        pause_sekunden: u.standard_pause_sekunden ?? 30,
      },
    ])
    setGesendet(false)
  }

  const senden = async () => {
    setSendet(true)
    setFehler(null)
    try {
      const r = await fetch(`/api/patients/${patientId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_date: heute(),
          end_date: inWochen(wochen),
          active_days: tage,
          notiz: "Im Videogespräch zusammen festgelegt.",
          adhoc_exercises: entwurf.map((e) => ({
            exercise_id: e.exercise_id,
            saetze: e.saetze,
            wiederholungen: e.wiederholungen,
            dauer_sekunden: e.dauer_sekunden,
            pause_sekunden: e.pause_sekunden,
          })),
        }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error ?? "Der Plan konnte nicht gesendet werden.")
      setGesendet(true)
      onGesendet()
    } catch (e) {
      setFehler((e as Error).message)
    } finally {
      setSendet(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-3" style={{ borderColor: LINE }}>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: SAND }}
          />
          <input
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder="Übung suchen — z. B. Schulter"
            className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-[13.5px] outline-none"
            style={{ borderColor: LINE, color: INK, backgroundColor: "#fff" }}
          />
          {sucht && (
            <Loader2
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin"
              style={{ color: GREEN }}
            />
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {treffer.length > 0 && (
          <ul className="divide-y" style={{ borderColor: LINE }}>
            {treffer.map((u) => {
              const drin = entwurf.some((e) => e.exercise_id === u.id)
              const wirdGezeigt = gezeigt?.dokumentId === u.id
              return (
                <li key={u.id} className="flex items-center gap-2 px-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-medium" style={{ color: INK }}>
                      {u.name}
                    </span>
                    {u.muskelgruppen && u.muskelgruppen.length > 0 && (
                      <span className="mt-0.5 block truncate text-[11.5px] text-slate-500">
                        {u.muskelgruppen.slice(0, 3).join(" · ")}
                      </span>
                    )}
                  </span>

                  {u.media_url && (
                    <button
                      type="button"
                      onClick={() =>
                        wirdGezeigt
                          ? onZeigenBeenden()
                          : onZeigen({
                              dokumentId: u.id,
                              url: u.media_url as string,
                              titel: u.name,
                              mime: u.media_type === "image" ? "image/*" : "video/*",
                            })
                      }
                      aria-label={wirdGezeigt ? "Zeigen beenden" : "Übung zeigen"}
                      className="shrink-0 rounded-lg p-2"
                      style={{
                        backgroundColor: wirdGezeigt ? GREEN : "transparent",
                        color: wirdGezeigt ? "#fff" : GREEN,
                      }}
                    >
                      {wirdGezeigt ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => hinzufuegen(u)}
                    disabled={drin}
                    aria-label="Zum Plan hinzufügen"
                    className="shrink-0 rounded-lg p-2 disabled:opacity-35"
                    style={{ backgroundColor: "#eef2ec", color: GREEN }}
                  >
                    {drin ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {entwurf.length > 0 && (
          <div className="px-3 py-3">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: GREEN }}
            >
              Entwurf — {gegenueber} sieht ihn mitwachsen
            </p>
            <ul className="mt-2 space-y-2">
              {entwurf.map((e, i) => (
                <li
                  key={e.exercise_id}
                  className="rounded-xl border p-2.5"
                  style={{ borderColor: LINE, backgroundColor: "#fff" }}
                >
                  <div className="flex items-start gap-2">
                    <span className="min-w-0 flex-1 text-[13px] font-medium" style={{ color: INK }}>
                      {e.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEntwurf(entwurf.filter((_, j) => j !== i))}
                      aria-label="Aus dem Plan nehmen"
                      className="shrink-0 rounded-md p-1 text-slate-400 hover:text-red-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[12px] text-slate-600">
                    <label className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={e.saetze}
                        onChange={(ev) => {
                          const kopie = [...entwurf]
                          kopie[i] = { ...e, saetze: Math.max(1, Number(ev.target.value) || 1) }
                          setEntwurf(kopie)
                        }}
                        className="w-12 rounded-md border px-1.5 py-1 text-center"
                        style={{ borderColor: LINE }}
                      />
                      Sätze
                    </label>
                    {e.dauer_sekunden !== null ? (
                      <label className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          value={e.dauer_sekunden}
                          onChange={(ev) => {
                            const kopie = [...entwurf]
                            kopie[i] = {
                              ...e,
                              dauer_sekunden: Math.max(1, Number(ev.target.value) || 1),
                            }
                            setEntwurf(kopie)
                          }}
                          className="w-14 rounded-md border px-1.5 py-1 text-center"
                          style={{ borderColor: LINE }}
                        />
                        Sek. halten
                      </label>
                    ) : (
                      <label className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          max={999}
                          value={e.wiederholungen ?? 10}
                          onChange={(ev) => {
                            const kopie = [...entwurf]
                            kopie[i] = {
                              ...e,
                              wiederholungen: Math.max(1, Number(ev.target.value) || 1),
                            }
                            setEntwurf(kopie)
                          }}
                          className="w-14 rounded-md border px-1.5 py-1 text-center"
                          style={{ borderColor: LINE }}
                        />
                        Wdh.
                      </label>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {entwurf.length === 0 && treffer.length === 0 && (
          <div className="px-4 py-8 text-center">
            <Dumbbell className="mx-auto h-6 w-6" style={{ color: SAND }} />
            <p className="mt-3 text-[13.5px] leading-relaxed text-slate-600">
              Übung suchen, mit dem Auge zeigen, mit dem Plus in den Plan legen. {gegenueber} sieht
              jede Übung, die dazukommt.
            </p>
          </div>
        )}
      </div>

      {entwurf.length > 0 && (
        <div className="border-t p-3" style={{ borderColor: LINE }}>
          <div className="flex items-center gap-2 text-[12px]" style={{ color: INK }}>
            <span>Für</span>
            <select
              value={wochen}
              onChange={(e) => setWochen(Number(e.target.value))}
              className="rounded-md border px-1.5 py-1"
              style={{ borderColor: LINE }}
            >
              {[1, 2, 3, 4, 6, 8, 12].map((w) => (
                <option key={w} value={w}>
                  {w} {w === 1 ? "Woche" : "Wochen"}
                </option>
              ))}
            </select>
            <span className="text-slate-500">ab heute</span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {WOCHENTAGE.map(([wert, text]) => {
              const an = tage.includes(wert)
              return (
                <button
                  key={wert}
                  type="button"
                  onClick={() => setTage(an ? tage.filter((t) => t !== wert) : [...tage, wert])}
                  className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold"
                  style={
                    an
                      ? { backgroundColor: GREEN, color: "#fff" }
                      : { backgroundColor: "#fff", color: INK, border: `1px solid ${LINE}` }
                  }
                >
                  {text}
                </button>
              )
            })}
          </div>

          {fehler && <p className="mt-2 text-[12px] leading-relaxed text-red-700">{fehler}</p>}

          <button
            type="button"
            onClick={() => void senden()}
            disabled={sendet || tage.length === 0}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: gesendet ? "#4a6b47" : GREEN }}
          >
            {sendet ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : gesendet ? (
              <Check className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {gesendet ? "Liegt in seiner App" : `An ${gegenueber} senden`}
          </button>
          {tage.length === 0 && (
            <p className="mt-1.5 text-center text-[11.5px] text-slate-500">
              Mindestens ein Trainingstag.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Was der Patient vom Entwurf sieht
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Ein Streifen am unteren Rand, kein Vorhang: Der Plan wächst neben dem
 * Gesicht, nicht davor. Wer beim Planen das Gegenüber verdeckt, redet mit
 * einer Liste.
 */
export function EntwurfStreifen({
  uebungen,
  gesendet,
}: {
  uebungen: EntwurfsUebung[]
  gesendet: boolean
}) {
  if (uebungen.length === 0) return null
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-3">
      <div
        className="mx-auto max-h-[38vh] w-full max-w-md overflow-auto rounded-2xl p-3.5"
        style={{ backgroundColor: "rgba(248,245,240,0.96)" }}
      >
        <p
          className="text-[10.5px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: GREEN }}
        >
          {gesendet ? "In deiner App gespeichert" : "Euer Plan entsteht gerade"}
        </p>
        <ul className="mt-2 space-y-1.5">
          {uebungen.map((u) => (
            <li key={u.exercise_id} className="flex items-baseline gap-2">
              <Check className="h-3 w-3 shrink-0 translate-y-0.5" style={{ color: GREEN }} />
              <span className="text-[13px] leading-snug" style={{ color: INK }}>
                {u.name}
                <span className="text-slate-500">
                  {" · "}
                  {u.saetze}×
                  {u.dauer_sekunden ? `${u.dauer_sekunden} Sek.` : `${u.wiederholungen ?? 10}`}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
