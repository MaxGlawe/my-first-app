"use client"

/**
 * PROJ-27 — Sprechzimmer über den Gast-Link.
 *
 * ÖFFENTLICH, ohne Anmeldung. Der Weg, auf dem der Patient hineinkommt — bei
 * der Videokonsultation hat er noch gar kein Praxis-OS-Konto, er bekommt es
 * erst beim Kauf danach.
 *
 * Vier Zustände, und jeder einzelne sagt, was jetzt gilt:
 *
 *   WARTET   — der Termin ist noch nicht dran. Datum, Uhrzeit und ein
 *              laufender Countdown. Wer am Vorabend klickt, soll keine
 *              Fehlermeldung sehen; die erzeugt genau den Anruf, den die
 *              Einladung ersparen sollte.
 *   OFFEN    — hinein, über den Warteraum.
 *   VORBEI   — ruhig erklärt, mit dem Hinweis, sich zu melden.
 *   ABGESAGT — ebenso.
 */

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Sprechzimmer } from "@/components/video/Sprechzimmer"
import { Loader2, CalendarClock, AlertTriangle, ShieldCheck } from "lucide-react"
import { formatDatum, formatUhrzeit } from "@/lib/video/termin"

const PAPER = "#F8F5F0"
const INK = "#12160f"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const serif = { fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 600 } as const

interface Praxis {
  name: string
  telefon: string | null
}

interface Termin {
  zustand: "wartet" | "offen" | "vorbei" | "abgesagt"
  praxis?: Praxis
  titel: string
  geplant_at: string
  dauer_minuten: number
  oeffnet_at: string
  hinweis: string | null
  behandler: string
}

/**
 * Der Absender. Steht in JEDEM Zustand ganz oben — auch über „Zugang nicht
 * gültig", denn genau dann braucht jemand die Gewissheit, bei wem er
 * eigentlich gelandet ist.
 *
 * Bewusst gesetzt statt als Bilddatei: Die Marke ist Serife auf Papierton.
 * Ein Schriftzug bleibt auf jedem Bildschirm scharf, muss nirgends gepflegt
 * werden und kann nicht als kaputtes Bild enden — ausgerechnet auf der Seite,
 * die Vertrauen herstellen soll.
 */
function Marke({ name }: { name?: string }) {
  return (
    <div className="mb-7">
      <p className="text-[19px] leading-none" style={{ ...serif, color: INK }}>
        {name ?? "Physiotherapie Glawe"}
      </p>
      <p
        className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: GREEN }}
      >
        Digitales Sprechzimmer
      </p>
      <div className="mx-auto mt-4 h-px w-10" style={{ backgroundColor: SAND }} />
    </div>
  )
}

/**
 * Was jeder still fragt, bevor er auf ein Videogespräch über den eigenen
 * Körper klickt. Die Antworten stehen hier, bevor sie jemand stellen muss —
 * und sie stimmen: Es ist kein Egress installiert, es wird nichts
 * aufgezeichnet.
 */
function Zusicherungen({ gegenueber }: { gegenueber: string }) {
  const punkte = [
    "Das Gespräch wird nicht aufgezeichnet.",
    `Im Raum sind nur du und ${gegenueber}.`,
    "Nichts zu installieren — dieser Link genügt.",
  ]
  return (
    <ul className="mt-6 space-y-2.5 text-left">
      {punkte.map((p) => (
        <li key={p} className="flex items-start gap-2.5">
          <ShieldCheck className="mt-[3px] h-[15px] w-[15px] shrink-0" style={{ color: GREEN }} />
          <span className="text-[13.5px] leading-relaxed text-slate-600">{p}</span>
        </li>
      ))}
    </ul>
  )
}

/** Der Ausweg, wenn doch etwas klemmt. */
function Rueckfall({ praxis }: { praxis?: Praxis }) {
  if (!praxis?.telefon) return null
  return (
    <p className="mt-7 text-[12.5px] leading-relaxed text-slate-500">
      Klemmt etwas? Ruf uns an:{" "}
      <a href={`tel:${praxis.telefon.replace(/\s/g, "")}`} className="font-semibold underline" style={{ color: GREEN }}>
        {praxis.telefon}
      </a>
    </p>
  )
}

function Rahmen({ children, praxis }: { children: React.ReactNode; praxis?: Praxis }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10" style={{ backgroundColor: PAPER }}>
      <div className="w-full max-w-md text-center">
        <Marke name={praxis?.name} />
        {children}
      </div>
    </div>
  )
}

function countdown(bis: string, jetzt: Date): string {
  const ms = new Date(bis).getTime() - jetzt.getTime()
  if (ms <= 0) return "gleich"
  const min = Math.floor(ms / 60_000)
  if (min < 60) return `noch ${min} Minute${min === 1 ? "" : "n"}`
  const std = Math.floor(min / 60)
  if (std < 24) return `noch ${std} Stunde${std === 1 ? "" : "n"}`
  const tage = Math.floor(std / 24)
  return `noch ${tage} Tag${tage === 1 ? "" : "e"}`
}

export default function GastSprechzimmerPage() {
  const params = useParams<{ token: string }>()
  const token = params?.token

  const [termin, setTermin] = useState<Termin | null>(null)
  const [laedt, setLaedt] = useState(true)
  const [fehler, setFehler] = useState<string | null>(null)
  const [jetzt, setJetzt] = useState(() => new Date())

  const laden = useCallback(() => {
    if (!token) return
    fetch(`/api/video/gast?token=${token}`)
      .then(async (r) => {
        const j = await r.json()
        if (!r.ok) throw new Error(j.error ?? "Dieser Zugang ist nicht gültig.")
        return j
      })
      .then((d) => {
        setTermin(d)
        setFehler(null)
      })
      .catch((e: Error) => setFehler(e.message))
      .finally(() => setLaedt(false))
  }, [token])

  useEffect(() => {
    laden()
    // Sekundentakt für den Countdown, und alle halbe Minute neu fragen:
    // Der Zustand wechselt durch die Uhr, nicht durch eine Aktion.
    const tick = setInterval(() => setJetzt(new Date()), 1000)
    const neu = setInterval(laden, 30_000)
    return () => {
      clearInterval(tick)
      clearInterval(neu)
    }
  }, [laden])

  if (laedt) {
    return (
      <Rahmen>
        <Loader2 className="mx-auto h-6 w-6 animate-spin" style={{ color: GREEN }} />
      </Rahmen>
    )
  }

  if (fehler || !termin) {
    return (
      <Rahmen>
        <AlertTriangle className="mx-auto h-7 w-7 text-red-600" />
        <h1 className="mt-4 text-2xl" style={{ ...serif, color: INK }}>
          Zugang nicht gültig
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-slate-600">
          {fehler ?? "Dieser Link gehört zu keinem Termin."} Bitte melde dich bei deiner Praxis,
          dann bekommst du einen neuen.
        </p>
      </Rahmen>
    )
  }

  if (termin.zustand === "offen") {
    return (
      <div style={{ backgroundColor: PAPER, minHeight: "100vh" }}>
        <Sprechzimmer
          gastToken={token!}
          anlassText={termin.titel}
          gegenueber={termin.behandler}
          praxisName={termin.praxis?.name}
          zurueckHref="/"
        />
      </div>
    )
  }

  if (termin.zustand === "vorbei" || termin.zustand === "abgesagt") {
    return (
      <Rahmen praxis={termin.praxis}>
        <h1 className="text-2xl" style={{ ...serif, color: INK }}>
          {termin.zustand === "abgesagt" ? "Der Termin wurde abgesagt" : "Der Termin ist vorbei"}
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-slate-600">
          {termin.zustand === "abgesagt"
            ? "Deine Praxis meldet sich bei dir, um einen neuen Termin zu finden."
            : "Falls ihr euch nicht gesprochen habt, melde dich einfach bei deiner Praxis — ihr findet einen neuen Termin."}
        </p>
        <Rueckfall praxis={termin.praxis} />
      </Rahmen>
    )
  }

  // ── Wartet ───────────────────────────────────────────────────────────────
  return (
    <Rahmen praxis={termin.praxis}>
      <CalendarClock className="mx-auto h-7 w-7" style={{ color: GREEN }} />
      <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.16em]" style={{ color: GREEN }}>
        {termin.titel}
      </p>
      <h1 className="mt-2 text-2xl sm:text-3xl" style={{ ...serif, color: INK }}>
        Dein Termin steht
      </h1>

      <div className="mt-6 rounded-2xl border border-[#e3ddd1] bg-white p-5">
        <p className="text-[17px] font-semibold" style={{ color: INK }}>
          {formatDatum(termin.geplant_at)}
        </p>
        <p className="mt-1 text-[22px]" style={{ ...serif, color: GREEN }}>
          {formatUhrzeit(termin.geplant_at)} Uhr
        </p>
        <p className="mt-2 text-[13.5px] text-slate-500">
          mit {termin.behandler} · etwa {termin.dauer_minuten} Minuten
        </p>
      </div>

      <p className="mt-5 text-[15px] font-medium" style={{ color: INK }}>
        {countdown(termin.oeffnet_at, jetzt)}
      </p>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">
        Der Zugang öffnet sich fünf Minuten vor Beginn — diese Seite wechselt dann von allein.
        Du kannst sie einfach offen lassen.
      </p>

      {termin.hinweis && (
        <div className="mt-5 rounded-xl border border-[#e3ddd1] bg-white p-4 text-left">
          <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: GREEN }}>
            Bitte vorbereiten
          </p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-slate-700">{termin.hinweis}</p>
        </div>
      )}

      <Zusicherungen gegenueber={termin.behandler} />

      <p className="mt-6 text-[12.5px] leading-relaxed text-slate-500">
        Ein Handy, Tablet oder Computer mit Kamera und Mikrofon genügt. Stell dein Gerät so
        auf, dass du gut zu sehen bist.
      </p>

      <Rueckfall praxis={termin.praxis} />
    </Rahmen>
  )
}
