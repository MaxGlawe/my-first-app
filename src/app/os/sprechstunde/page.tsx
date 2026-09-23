"use client"

/**
 * PROJ-27 — Digitale Sprechstunde.
 *
 * Der eine Ort, an dem Videotermine entstehen und liegen.
 *
 * Der erste Entwurf hatte nur einen Knopf im Patientenprofil: „jetzt einen
 * Raum aufmachen". Das ging an der Wirklichkeit vorbei — ein Patient hat
 * nicht dann Zeit, wenn der Behandler gerade Zeit hat. Ein Videotermin ist
 * ein Termin: mit Datum, mit Einladung, mit Erinnerung.
 *
 * Aufbau nach dem, was zuerst gebraucht wird: Was steht HEUTE an, dann der
 * Rest. Wer morgens hier landet, soll nicht erst suchen müssen.
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Video, Plus, AlertTriangle, DoorOpen, QrCode, Copy, Check, Mail, X, Loader2, CalendarDays,
} from "lucide-react"
import { TerminAnlegen } from "@/components/sprechstunde/TerminAnlegen"
import { formatKurz, formatUhrzeit, relativ, zustand } from "@/lib/video/termin"

const GREEN = "#2C3E2D"
const INK = "#12160f"
const serif = { fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 600 } as const

interface Termin {
  id: string
  patient_id: string
  anlass: string
  status: string
  geplant_at: string
  dauer_minuten: number
  hinweis: string | null
  einladung_gesendet_at: string | null
  gast_url: string
  patients: { vorname: string | null; nachname: string | null; email: string | null } | null
}

const ANLASS_LABEL: Record<string, string> = {
  konsultation: "Videokonsultation",
  programm_sitzung: "Programm-Sitzung",
  verschlechterung: "Zusätzliche Sitzung",
  sonstiges: "Videogespräch",
}

function istHeute(iso: string): boolean {
  const d = new Date(iso)
  const h = new Date()
  return d.toDateString() === h.toDateString()
}

export default function SprechstundePage() {
  const [termine, setTermine] = useState<Termin[]>([])
  const [eingerichtet, setEingerichtet] = useState<boolean | null>(null)
  const [laedt, setLaedt] = useState(true)
  const [fehler, setFehler] = useState<string | null>(null)
  const [formOffen, setFormOffen] = useState(false)
  const [qrFuer, setQrFuer] = useState<string | null>(null)
  const [kopiert, setKopiert] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const laden = useCallback(() => {
    fetch("/api/os/video-calls")
      .then(async (r) => {
        const j = await r.json()
        if (!r.ok) throw new Error(j.error ?? `Serverantwort ${r.status}`)
        return j
      })
      .then((d) => {
        setEingerichtet(d.eingerichtet)
        setTermine(d.termine ?? [])
        setFehler(null)
      })
      .catch((e: Error) => setFehler(e.message))
      .finally(() => setLaedt(false))
  }, [])

  useEffect(() => {
    laden()
    // Der Zustand eines Termins ändert sich mit der Uhr, nicht durch eine
    // Aktion. Ohne diesen Takt stünde um 13:58 noch „wartet", obwohl der
    // Zugang längst offen ist.
    const takt = setInterval(laden, 60_000)
    return () => clearInterval(takt)
  }, [laden])

  const { heute, spaeter } = useMemo(() => {
    const aktiv = termine.filter((t) => t.status !== "abgesagt")
    return {
      heute: aktiv.filter((t) => istHeute(t.geplant_at)),
      spaeter: aktiv.filter((t) => !istHeute(t.geplant_at)),
    }
  }, [termine])

  async function kopieren(url: string, id: string) {
    try {
      await navigator.clipboard.writeText(url)
      setKopiert(id)
      setTimeout(() => setKopiert(null), 2000)
    } catch {
      setFehler("Kopieren nicht möglich — bitte den Link manuell markieren.")
    }
  }

  async function einladungErneut(id: string) {
    setBusy(id)
    try {
      const res = await fetch("/api/os/video-calls", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, aktion: "einladung" }),
      })
      const j = await res.json()
      if (!res.ok) setFehler(j.error ?? "Die Einladung konnte nicht verschickt werden.")
      else laden()
    } finally {
      setBusy(null)
    }
  }

  async function absagen(id: string, name: string) {
    if (!confirm(`Termin mit ${name} wirklich absagen? Der Patient wird benachrichtigt.`)) return
    setBusy(id)
    try {
      const res = await fetch("/api/os/video-calls", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, aktion: "absagen" }),
      })
      const j = await res.json()
      if (!res.ok) setFehler(j.error ?? "Konnte nicht abgesagt werden.")
      else laden()
    } finally {
      setBusy(null)
    }
  }

  function Zeile({ t }: { t: Termin }) {
    const name = [t.patients?.vorname, t.patients?.nachname].filter(Boolean).join(" ") || "Patient"
    const z = zustand(t.geplant_at, t.dauer_minuten)
    const offen = z === "offen" || z === "laeuft"

    return (
      <li
        className={`rounded-xl border p-4 ${
          offen ? "border-[#2C3E2D] bg-[#F8F5F0]" : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[15px] font-semibold text-slate-900">{name}</span>
              <Badge variant="secondary" className="text-[11px]">
                {ANLASS_LABEL[t.anlass] ?? "Videogespräch"}
              </Badge>
              {offen && (
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                  {z === "laeuft" ? "läuft" : "Zugang offen"}
                </Badge>
              )}
              {z === "vorbei" && (
                <Badge variant="outline" className="text-[11px]">
                  vorbei
                </Badge>
              )}
            </div>
            <p className="mt-1 text-[13.5px] text-slate-600">
              {formatKurz(t.geplant_at)} · {t.dauer_minuten} Min. ·{" "}
              <span className={offen ? "font-medium text-[#2C3E2D]" : ""}>
                {relativ(t.geplant_at)}
              </span>
            </p>
            {!t.einladung_gesendet_at && (
              <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                Einladung noch nicht verschickt
              </p>
            )}
            {t.hinweis && (
              <p className="mt-1 text-[12.5px] text-slate-500">Vorbereiten: {t.hinweis}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {offen && (
              <a href={`/os/sprechzimmer/${t.id}`}>
                <Button size="sm" className="bg-[#2C3E2D] hover:bg-[#24321f]">
                  <DoorOpen className="mr-1.5 h-4 w-4" /> Eintreten
                </Button>
              </a>
            )}
            <Button size="sm" variant="outline" onClick={() => setQrFuer(qrFuer === t.id ? null : t.id)}>
              <QrCode className="mr-1.5 h-4 w-4" /> QR
            </Button>
            <Button size="sm" variant="outline" onClick={() => kopieren(t.gast_url, t.id)}>
              {kopiert === t.id ? (
                <Check className="mr-1.5 h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="mr-1.5 h-4 w-4" />
              )}
              Link
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => einladungErneut(t.id)}
              disabled={busy === t.id}
            >
              {busy === t.id ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-1.5 h-4 w-4" />
              )}
              {t.einladung_gesendet_at ? "Erneut senden" : "Einladen"}
            </Button>
            {z !== "vorbei" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => absagen(t.id, name)}
                disabled={busy === t.id}
                className="text-red-700 hover:bg-red-50 hover:text-red-800"
              >
                <X className="mr-1.5 h-4 w-4" /> Absagen
              </Button>
            )}
          </div>
        </div>

        {qrFuer === t.id && (
          <div className="mt-3 rounded-xl border border-[#e7e1d6] bg-white p-4">
            <p className="break-all font-mono text-[11.5px] text-slate-600">{t.gast_url}</p>
            <div className="mt-3 flex justify-center">
              {/* Erzeugt im Browser über einen kostenlosen Dienst? Nein —
                  der QR kommt vom eigenen Server, damit keine Patientendaten
                  bei Dritten landen. */}
              <img
                src={`/api/os/video-calls/${t.id}/qr`}
                alt={`QR-Code für den Termin mit ${name}`}
                className="h-52 w-52"
              />
            </div>
            <p className="mt-2 text-center text-[12px] text-slate-500">
              Im Gespräch Bildschirm teilen und scannen lassen — oder den Link schicken.
            </p>
          </div>
        )}
      </li>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl" style={{ ...serif, color: INK }}>
            Digitale Sprechstunde
          </h1>
          <p className="mt-1.5 text-[14.5px] text-slate-600">
            Videotermine anlegen, einladen und führen.
          </p>
        </div>
        {eingerichtet && (
          <Button onClick={() => setFormOffen((v) => !v)} className="bg-[#2C3E2D] hover:bg-[#24321f]">
            {formOffen ? (
              <>
                <X className="mr-1.5 h-4 w-4" /> Schliessen
              </>
            ) : (
              <>
                <Plus className="mr-1.5 h-4 w-4" /> Termin anlegen
              </>
            )}
          </Button>
        )}
      </div>

      {eingerichtet === false && (
        <Alert className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Der Videodienst ist auf diesem Server nicht eingerichtet. Ohne Zugangsdaten lassen
            sich keine Termine anlegen.
          </AlertDescription>
        </Alert>
      )}

      {fehler && (
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{fehler}</AlertDescription>
        </Alert>
      )}

      {formOffen && (
        <Card className="mt-6 border-[#e7e1d6] bg-[#F8F5F0]">
          <CardContent className="py-5">
            <TerminAnlegen
              onFertig={() => {
                setFormOffen(false)
                laden()
              }}
            />
          </CardContent>
        </Card>
      )}

      {laedt ? (
        <div className="mt-8 space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : (
        <>
          <section className="mt-8">
            <h2 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-slate-500">
              <CalendarDays className="h-3.5 w-3.5" /> Heute
            </h2>
            {heute.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-slate-200 p-6 text-center text-[13.5px] text-slate-500">
                Heute steht kein Videotermin an.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {heute.map((t) => (
                  <Zeile key={t.id} t={t} />
                ))}
              </ul>
            )}
          </section>

          {spaeter.length > 0 && (
            <section className="mt-8">
              <h2 className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                Demnächst
              </h2>
              <ul className="mt-3 space-y-3">
                {spaeter.map((t) => (
                  <Zeile key={t.id} t={t} />
                ))}
              </ul>
            </section>
          )}

          {!laedt && termine.length === 0 && eingerichtet && (
            <div className="mt-10 rounded-2xl border border-dashed border-slate-200 p-10 text-center">
              <Video className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-[15px] font-medium text-slate-700">Noch keine Videotermine</p>
              <p className="mx-auto mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-slate-500">
                Leg einen Termin an — der Patient bekommt eine Einladung mit Kalendereintrag und
                seinem Zugang. Öffnen tut sich der fünf Minuten vor Beginn.
              </p>
              <Button
                onClick={() => setFormOffen(true)}
                className="mt-5 bg-[#2C3E2D] hover:bg-[#24321f]"
              >
                <Plus className="mr-1.5 h-4 w-4" /> Ersten Termin anlegen
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
