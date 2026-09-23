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
import { Loader2, CalendarClock, AlertTriangle } from "lucide-react"
import { formatDatum, formatUhrzeit } from "@/lib/video/termin"

const PAPER = "#F8F5F0"
const INK = "#12160f"
const GREEN = "#2C3E2D"
const serif = { fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 600 } as const

interface Termin {
  zustand: "wartet" | "offen" | "vorbei" | "abgesagt"
  titel: string
  geplant_at: string
  dauer_minuten: number
  oeffnet_at: string
  hinweis: string | null
  behandler: string
}

function Rahmen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10" style={{ backgroundColor: PAPER }}>
      <div className="w-full max-w-md text-center">{children}</div>
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
          zurueckHref="/"
        />
      </div>
    )
  }

  if (termin.zustand === "vorbei" || termin.zustand === "abgesagt") {
    return (
      <Rahmen>
        <h1 className="text-2xl" style={{ ...serif, color: INK }}>
          {termin.zustand === "abgesagt" ? "Der Termin wurde abgesagt" : "Der Termin ist vorbei"}
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-slate-600">
          {termin.zustand === "abgesagt"
            ? "Deine Praxis meldet sich bei dir, um einen neuen Termin zu finden."
            : "Falls ihr euch nicht gesprochen habt, melde dich einfach bei deiner Praxis — ihr findet einen neuen Termin."}
        </p>
      </Rahmen>
    )
  }

  // ── Wartet ───────────────────────────────────────────────────────────────
  return (
    <Rahmen>
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

      <p className="mt-6 text-[12.5px] leading-relaxed text-slate-500">
        Du brauchst nichts zu installieren — ein Handy, Tablet oder Computer mit Kamera und
        Mikrofon genügt. Stell dein Gerät so auf, dass du gut zu sehen bist.
      </p>
    </Rahmen>
  )
}
