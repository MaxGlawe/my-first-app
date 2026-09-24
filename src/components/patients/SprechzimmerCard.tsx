"use client"

/**
 * PROJ-27 — Videotermine im Patientenprofil.
 *
 * NUR ANZEIGE. Angelegt werden Termine in der digitalen Sprechstunde — an
 * einem Ort, nicht an zweien. Der erste Entwurf hatte hier den vollen
 * Anlage-Vorgang mit „jetzt einen Raum aufmachen". Das ging an der
 * Wirklichkeit vorbei: Ein Patient hat nicht dann Zeit, wenn der Behandler
 * gerade Zeit hat. Ein Videotermin ist ein Termin.
 *
 * Was hier bleibt, ist die Frage, die man sich im Profil wirklich stellt:
 * Wann sprechen wir das nächste Mal? Und wenn es gerade so weit ist, der
 * kürzeste Weg hinein.
 *
 * Blendet sich aus, solange kein Videodienst eingerichtet ist.
 */

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, DoorOpen, CalendarPlus, AlertTriangle } from "lucide-react"
import { formatKurz, relativ, zustand } from "@/lib/video/termin"

interface Call {
  id: string
  anlass: string
  status: string
  geplant_at: string
  dauer_minuten: number
  einladung_gesendet_at: string | null
}

const ANLASS_LABEL: Record<string, string> = {
  konsultation: "Videokonsultation",
  programm_sitzung: "Programm-Sitzung",
  verschlechterung: "Zusätzliche Sitzung",
  sonstiges: "Videogespräch",
}

export function SprechzimmerCard({ patientId }: { patientId: string }) {
  const [eingerichtet, setEingerichtet] = useState<boolean | null>(null)
  const [calls, setCalls] = useState<Call[]>([])

  const laden = useCallback(() => {
    fetch(`/api/os/video-calls?patient_id=${patientId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setEingerichtet(d?.eingerichtet ?? false)
        setCalls(d?.calls ?? [])
      })
      .catch(() => setEingerichtet(false))
  }, [patientId])

  useEffect(() => laden(), [laden])

  if (eingerichtet !== true) return null

  const jetzt = Date.now()
  const kommend = calls
    .filter(
      (c) =>
        c.status !== "abgesagt" &&
        c.status !== "beendet" &&
        new Date(c.geplant_at).getTime() > jetzt - 6 * 60 * 60_000
    )
    .sort((a, b) => +new Date(a.geplant_at) - +new Date(b.geplant_at))

  const naechster = kommend[0]
  // Status mitgeben: Ein beendetes oder abgebrochenes Gespraech ist vorbei,
  // auch wenn sein Zeitfenster noch laeuft.
  const z = naechster
    ? zustand(naechster.geplant_at, naechster.dauer_minuten, new Date(), naechster.status)
    : null
  const offen = z === "offen" || z === "laeuft"

  return (
    <Card className="mb-6 border-[#e7e1d6] bg-[#F8F5F0]">
      <CardContent className="py-5">
        <div className="flex flex-wrap items-center gap-2">
          <Video className="h-4 w-4 text-[#2C3E2D]" />
          <h3 className="text-sm font-bold text-slate-900">Digitale Sprechstunde</h3>
          {offen && (
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
              {z === "laeuft" ? "läuft" : "Zugang offen"}
            </Badge>
          )}
        </div>

        {naechster ? (
          <div className="mt-3">
            <p className="text-[13.5px] text-slate-700">
              <strong>{ANLASS_LABEL[naechster.anlass] ?? "Videogespräch"}</strong> —{" "}
              {formatKurz(naechster.geplant_at)}
              <span className="text-slate-500"> · {relativ(naechster.geplant_at)}</span>
            </p>
            {!naechster.einladung_gesendet_at && (
              <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                Einladung noch nicht verschickt
              </p>
            )}
            {kommend.length > 1 && (
              <p className="mt-1 text-[12.5px] text-slate-500">
                und {kommend.length - 1} weitere Termine
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {offen && (
                <a href={`/os/sprechzimmer/${naechster.id}`}>
                  <Button size="sm" className="bg-[#2C3E2D] hover:bg-[#24321f]">
                    <DoorOpen className="mr-1.5 h-4 w-4" /> Eintreten
                  </Button>
                </a>
              )}
              <a href="/os/sprechstunde">
                <Button size="sm" variant="outline">
                  Termine verwalten
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-[13px] leading-relaxed text-slate-600">
              Kein Videotermin geplant.
            </p>
            <a href="/os/sprechstunde">
              <Button size="sm" variant="outline" className="mt-3">
                <CalendarPlus className="mr-1.5 h-4 w-4" /> Termin anlegen
              </Button>
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
