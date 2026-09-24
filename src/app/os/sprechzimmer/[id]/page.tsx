"use client"

/**
 * PROJ-27 — Sprechzimmer, Therapeutenseite.
 *
 * Das Gespräch kam zuerst, die Schaltzentrale danach — ein Sprechzimmer mit
 * schöner Seitenleiste und wackeligem Bild wäre die falsche Reihenfolge
 * gewesen. Seit PROJ-28 steht beides: Akte und Notiz liegen als Schublade im
 * Raum, damit der Behandler ihn zum Arbeiten nicht verlassen muss.
 */

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Sprechzimmer } from "@/components/video/Sprechzimmer"
import { Loader2, AlertTriangle } from "lucide-react"

const INK = "#12160f"
const GREEN = "#2C3E2D"
const serif = { fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 600 } as const

interface Daten {
  titel: string
  patient: string
  patientId: string
  gastUrl?: string
}

export default function TherapeutSprechzimmerPage() {
  const params = useParams<{ id: string }>()
  const callId = params?.id
  const [daten, setDaten] = useState<Daten | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [laedt, setLaedt] = useState(true)

  const laden = useCallback(() => {
    if (!callId) return
    fetch(`/api/os/video-calls/${callId}`)
      .then(async (r) => {
        const j = await r.json()
        if (!r.ok) throw new Error(j.error ?? `Serverantwort ${r.status}`)
        return j
      })
      .then((d) =>
        setDaten({
          titel: d.titel,
          patient: d.patient,
          patientId: d.patient_id,
          gastUrl: d.gast_url,
        })
      )
      .catch((e: Error) => setFehler(e.message))
      .finally(() => setLaedt(false))
  }, [callId])

  useEffect(() => laden(), [laden])

  if (laedt) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: GREEN }} />
      </div>
    )
  }

  if (fehler || !daten) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <AlertTriangle className="h-6 w-6 text-red-600" />
        <h1 className="mt-3 text-xl" style={{ ...serif, color: INK }}>
          Gespräch nicht verfügbar
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{fehler}</p>
      </div>
    )
  }

  return (
    <Sprechzimmer
      callId={callId!}
      anlassText={daten.titel}
      gegenueber={daten.patient}
      patientId={daten.patientId}
      zurueckHref="/os/sprechstunde"
      gastUrl={daten.gastUrl}
      qrUrl={`/api/os/video-calls/${callId}/qr`}
    />
  )
}
