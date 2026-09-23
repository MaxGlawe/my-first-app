"use client"

/**
 * PROJ-27 — „Sprechzimmer öffnen" im Patientenprofil.
 *
 * Der Einstieg in jedes Gespräch. Bewusst hier und nicht in einem eigenen
 * Menüpunkt: Du stehst ohnehin beim Patienten, wenn du mit ihm sprechen
 * willst.
 *
 * Die Karte blendet sich vollständig aus, solange auf dem Server kein
 * Videodienst eingerichtet ist. Dasselbe Muster wie bei der Terminkarte —
 * lieber nichts zeigen als einen Knopf, der ins Leere führt. Sobald die
 * Zugangsdaten gesetzt sind, erscheint sie von allein.
 */

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Video, Loader2, AlertTriangle, Copy, Check, DoorOpen, PhoneOff,
} from "lucide-react"

type Anlass = "konsultation" | "programm_sitzung" | "verschlechterung" | "sonstiges"

const ANLAESSE: { id: Anlass; label: string }[] = [
  { id: "konsultation", label: "Videokonsultation" },
  { id: "programm_sitzung", label: "Programm-Sitzung" },
  { id: "verschlechterung", label: "Verschlechterung" },
  { id: "sonstiges", label: "Sonstiges" },
]

interface Call {
  id: string
  room_name: string
  anlass: Anlass
  status: string
  schliesst_at: string
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
}

export function SprechzimmerCard({ patientId }: { patientId: string }) {
  const [eingerichtet, setEingerichtet] = useState<boolean | null>(null)
  const [aktiv, setAktiv] = useState<Call | null>(null)
  const [anlass, setAnlass] = useState<Anlass>("konsultation")
  const [busy, setBusy] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)
  const [kopiert, setKopiert] = useState(false)

  const laden = useCallback(() => {
    fetch(`/api/os/video-calls?patient_id=${patientId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setEingerichtet(d?.eingerichtet ?? false)
        setAktiv(d?.aktiv ?? null)
      })
      .catch(() => setEingerichtet(false))
  }, [patientId])

  useEffect(() => laden(), [laden])

  async function eroeffnen() {
    setBusy(true)
    setFehler(null)
    try {
      const res = await fetch("/api/os/video-calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId, anlass }),
      })
      const json = await res.json()
      if (!res.ok) {
        setFehler(json.error ?? "Das Sprechzimmer konnte nicht geöffnet werden.")
        return
      }
      setAktiv(json.call)
      // Direkt hinein — der Patient sieht „kommt gleich dazu", bis du da bist.
      window.location.href = `/os/sprechzimmer/${json.call.id}`
    } catch {
      setFehler("Verbindungsfehler. Bitte erneut versuchen.")
    } finally {
      setBusy(false)
    }
  }

  async function beenden(id: string) {
    setBusy(true)
    setFehler(null)
    try {
      const res = await fetch("/api/os/video-calls", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const j = await res.json()
        setFehler(j.error ?? "Konnte nicht beendet werden.")
        return
      }
      laden()
    } catch {
      setFehler("Verbindungsfehler. Bitte erneut versuchen.")
    } finally {
      setBusy(false)
    }
  }

  async function kopieren() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/app/sprechzimmer`)
      setKopiert(true)
      setTimeout(() => setKopiert(false), 2000)
    } catch {
      setFehler("Kopieren nicht möglich — bitte den Link manuell markieren.")
    }
  }

  // Noch nichts geladen, oder kein Videodienst auf diesem Server → nichts zeigen.
  if (eingerichtet !== true) return null

  return (
    <Card className="mb-6 border-[#e7e1d6] bg-[#F8F5F0]">
      <CardContent className="py-5">
        <div className="flex flex-wrap items-center gap-2">
          <Video className="h-4 w-4 text-[#2C3E2D]" />
          <h3 className="text-sm font-bold text-slate-900">Sprechzimmer</h3>
          {aktiv && (
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
              offen bis {fmt(aktiv.schliesst_at)} Uhr
            </Badge>
          )}
        </div>

        {fehler && (
          <Alert variant="destructive" className="mt-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{fehler}</AlertDescription>
          </Alert>
        )}

        {aktiv ? (
          <div className="mt-3">
            <p className="text-[13px] leading-relaxed text-slate-600">
              Das Sprechzimmer ist offen. Der Patient wurde benachrichtigt und findet es unter
              „Sprechzimmer" in seiner App.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`/os/sprechzimmer/${aktiv.id}`}>
                <Button size="sm" className="bg-[#2C3E2D] hover:bg-[#24321f]">
                  <DoorOpen className="mr-1.5 h-4 w-4" /> Eintreten
                </Button>
              </a>
              <Button size="sm" variant="outline" onClick={kopieren}>
                {kopiert ? (
                  <Check className="mr-1.5 h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="mr-1.5 h-4 w-4" />
                )}
                {kopiert ? "Kopiert" : "Link für den Patienten"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => beenden(aktiv.id)} disabled={busy}>
                <PhoneOff className="mr-1.5 h-4 w-4" /> Beenden
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1.5">
              {ANLAESSE.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAnlass(a.id)}
                  className={`rounded-full border px-3 py-1.5 text-[12.5px] transition-colors ${
                    anlass === a.id
                      ? "border-[#2C3E2D] bg-white font-medium text-slate-900"
                      : "border-slate-200 bg-white/60 text-slate-600 hover:bg-white"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>

            <Button
              size="sm"
              onClick={eroeffnen}
              disabled={busy}
              className="mt-3 bg-[#2C3E2D] hover:bg-[#24321f]"
            >
              {busy ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Wird geöffnet…
                </>
              ) : (
                <>
                  <Video className="mr-1.5 h-4 w-4" /> Sprechzimmer öffnen
                </>
              )}
            </Button>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
              Der Patient bekommt sofort eine Benachrichtigung. Das Zutrittsfenster steht zwei
              Stunden offen und schliesst sich beim Beenden.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
