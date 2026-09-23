"use client"

/**
 * PROJ-26 Phase 3 — Verschlechterungsmeldungen im Patientenprofil.
 *
 * Die Ampel zeigt, DASS eine Meldung offen ist. Hier wird sie abgeschlossen —
 * an der Stelle, an der der Therapeut ohnehin steht, wenn er den Patienten
 * bearbeitet.
 *
 * Die Karte erscheint nur, wenn es etwas zu zeigen gibt. Eine dauerhaft
 * sichtbare leere Karte „Keine Verschlechterungen" wäre eine Zeile Lärm in
 * einem Profil, das schon dicht ist.
 *
 * Eine überschrittene Frist wird ausdrücklich als solche benannt und nicht
 * weggeglättet. Es ist eine schriftlich zugesagte Reaktionszeit; wenn sie
 * gerissen wurde, ist das genau die Information, die der Behandler braucht.
 */

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, Check, Loader2, HeartPulse } from "lucide-react"

interface Meldung {
  id: string
  beschreibung: string | null
  gemeldet_at: string
  frist_at: string
  erledigt_at: string | null
  erledigt_notiz: string | null
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function VerschlechterungPanel({ patientId }: { patientId: string }) {
  const [meldungen, setMeldungen] = useState<Meldung[]>([])
  const [laedt, setLaedt] = useState(true)
  const [notiz, setNotiz] = useState("")
  const [busy, setBusy] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)

  const laden = useCallback(() => {
    fetch(`/api/os/verschlechterung?patient_id=${patientId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMeldungen(d?.meldungen ?? []))
      .catch(() => setMeldungen([]))
      .finally(() => setLaedt(false))
  }, [patientId])

  useEffect(() => laden(), [laden])

  async function abschliessen(id: string) {
    setBusy(true)
    setFehler(null)
    try {
      const res = await fetch("/api/os/verschlechterung", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, notiz: notiz.trim() || null }),
      })
      const json = await res.json()
      if (!res.ok) {
        setFehler(json.error ?? "Konnte nicht abgeschlossen werden.")
        return
      }
      setNotiz("")
      laden()
    } catch {
      setFehler("Verbindungsfehler. Bitte erneut versuchen.")
    } finally {
      setBusy(false)
    }
  }

  if (laedt || meldungen.length === 0) return null

  const offen = meldungen.find((m) => !m.erledigt_at)
  const erledigt = meldungen.filter((m) => m.erledigt_at).slice(0, 3)
  const ueberfaellig = offen ? new Date(offen.frist_at) < new Date() : false

  return (
    <Card
      className={`mb-6 ${
        offen ? (ueberfaellig ? "border-red-300 bg-red-50/60" : "border-amber-300 bg-amber-50/50") : ""
      }`}
    >
      <CardContent className="py-5">
        <div className="flex flex-wrap items-center gap-2">
          <HeartPulse className="h-4 w-4 text-[#2C3E2D]" />
          <h3 className="text-sm font-bold text-slate-900">Verschlechterung gemeldet</h3>
          {offen && (
            <Badge
              className={
                ueberfaellig
                  ? "bg-red-100 text-red-800 hover:bg-red-100"
                  : "bg-amber-100 text-amber-800 hover:bg-amber-100"
              }
            >
              {ueberfaellig ? "Frist überschritten" : "offen"}
            </Badge>
          )}
        </div>

        {offen ? (
          <div className="mt-3">
            <p className="text-[13px] leading-relaxed text-slate-700">
              Gemeldet am <strong>{fmt(offen.gemeldet_at)}</strong>. Zugesagte Rückmeldung bis{" "}
              <strong>{fmt(offen.frist_at)}</strong>.
            </p>
            {offen.beschreibung && (
              <p className="mt-2 rounded-lg bg-white/70 p-3 text-[13px] leading-relaxed text-slate-700">
                „{offen.beschreibung}"
              </p>
            )}
            <p className="mt-2 text-[12.5px] leading-relaxed text-slate-500">
              Vertraglich zugesagt: kurzfristig eine zusätzliche Video-Sitzung — in beiden
              Varianten ohne Zusatzkosten.
            </p>

            <Textarea
              value={notiz}
              onChange={(e) => setNotiz(e.target.value)}
              rows={2}
              maxLength={2000}
              placeholder="Was wurde veranlasst? (z. B. Termin am 26.09. vereinbart, Plan angepasst)"
              className="mt-3 bg-white"
            />

            {fehler && (
              <p className="mt-2 flex items-start gap-1.5 text-[13px] text-red-600">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {fehler}
              </p>
            )}

            <Button
              size="sm"
              onClick={() => abschliessen(offen.id)}
              disabled={busy}
              className="mt-3 bg-[#2C3E2D] hover:bg-[#24321f]"
            >
              {busy ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Wird gespeichert…
                </>
              ) : (
                <>
                  <Check className="mr-1.5 h-4 w-4" /> Erledigt — Rückmeldung erfolgt
                </>
              )}
            </Button>
          </div>
        ) : (
          <p className="mt-2 text-[13px] text-slate-600">
            Aktuell keine offene Meldung.
          </p>
        )}

        {erledigt.length > 0 && (
          <div className="mt-4 border-t pt-3">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
              Frühere Meldungen
            </p>
            <ul className="mt-2 space-y-2">
              {erledigt.map((m) => (
                <li key={m.id} className="text-[12.5px] leading-relaxed text-slate-600">
                  {fmt(m.gemeldet_at)} → erledigt {fmt(m.erledigt_at!)}
                  {new Date(m.erledigt_at!) > new Date(m.frist_at) && (
                    <span className="ml-1 text-red-600">(nach Fristablauf)</span>
                  )}
                  {m.erledigt_notiz && (
                    <span className="block text-slate-500">{m.erledigt_notiz}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
