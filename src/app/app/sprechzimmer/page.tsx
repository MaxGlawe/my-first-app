"use client"

/**
 * PROJ-27 — Sprechzimmer, Patientenseite.
 *
 * Diese Seite hat genau eine Aufgabe: Wer hier landet, soll ohne Nachdenken
 * im Gespräch ankommen. Deshalb kein Kalender, keine Liste, keine Historie —
 * entweder es wartet jemand, oder es wartet niemand.
 *
 * Der Weg hierher führt über die Push-Nachricht „Dein Behandler wartet" oder
 * über die Karte auf dem Dashboard.
 */

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Sprechzimmer } from "@/components/video/Sprechzimmer"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"

const INK = "#12160f"
const GREEN = "#2C3E2D"
const serif = { fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 600 } as const

interface Aktiv {
  id: string
  titel: string
  behandler: string
}

export default function PatientSprechzimmerPage() {
  const [aktiv, setAktiv] = useState<Aktiv | null>(null)
  const [laedt, setLaedt] = useState(true)

  const laden = useCallback(() => {
    fetch("/api/me/video-call")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setAktiv(d?.aktiv ?? null))
      .catch(() => setAktiv(null))
      .finally(() => setLaedt(false))
  }, [])

  useEffect(() => {
    laden()
    // Der Patient öffnet die Seite oft, bevor der Behandler eröffnet hat.
    // Ein ruhiger Takt erspart ihm das Neuladen von Hand — und ist billiger
    // als eine zweite Realtime-Verbindung nur für diesen einen Zustand.
    const takt = setInterval(laden, 15_000)
    return () => clearInterval(takt)
  }, [laden])

  if (laedt) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: GREEN }} />
      </div>
    )
  }

  if (!aktiv) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <h1 className="text-2xl" style={{ ...serif, color: INK }}>
          Gerade kein Gespräch
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-slate-600">
          Sobald dein Behandler das Sprechzimmer öffnet, bekommst du eine
          Benachrichtigung — und diese Seite zeigt dir den Weg hinein.
        </p>
        <Link href="/app/dashboard" className="mt-7">
          <Button variant="outline" className="rounded-xl">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Zurück zur Übersicht
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <Sprechzimmer
      callId={aktiv.id}
      anlassText={aktiv.titel}
      gegenueber={aktiv.behandler}
      zurueckHref="/app/dashboard"
    />
  )
}
