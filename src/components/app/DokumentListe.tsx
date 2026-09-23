"use client"

/**
 * PROJ-27 — Liste der Dokumente einer Akte.
 *
 * Beide Seiten benutzen sie, die Rechte unterscheiden sich:
 *
 *   — Die Praxis darf entfernen und eine gemeldete Korrektur abhaken.
 *   — Der Patient darf melden, dass etwas nicht stimmt, aber nichts löschen.
 *     Was in der Akte liegt, unterliegt der Dokumentationspflicht des
 *     Behandlers. Diese Grenze steht auch serverseitig — hier wird sie nur
 *     sichtbar gemacht, damit niemand gegen eine unsichtbare Wand läuft.
 *
 * Geöffnet wird über einen signierten Link, der nach fünf Minuten verfällt.
 * Deshalb wird er erst beim Klick geholt und nicht vorrätig in die Liste
 * gelegt: Eine Liste mit zwanzig gültigen Links auf Gesundheitsdokumente
 * wäre ein Schlüsselbund im Browserverlauf.
 */

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  FileText, ImageIcon, Loader2, Trash2, AlertTriangle, ExternalLink, Flag, Check,
} from "lucide-react"
import { kategorieLabel, formatBytes } from "@/lib/dokumente"

export interface Dokument {
  id: string
  kategorie: string
  titel: string
  notiz: string | null
  mime_type: string
  groesse_bytes: number
  quelle: "praxis" | "patient"
  created_at: string
  korrektur_gemeldet_at: string | null
  korrektur_grund: string | null
}

function datum(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function DokumentListe({
  dokumente,
  istPraxis,
  onAenderung,
  leerText,
}: {
  dokumente: Dokument[]
  istPraxis: boolean
  onAenderung: () => void
  leerText: string
}) {
  const [busy, setBusy] = useState<string | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [meldeFuer, setMeldeFuer] = useState<string | null>(null)
  const [grund, setGrund] = useState("")

  async function oeffnen(id: string) {
    setBusy(id)
    setFehler(null)
    try {
      const res = await fetch(`/api/documents/${id}`)
      const json = await res.json()
      if (!res.ok) {
        setFehler(json.error ?? "Das Dokument konnte nicht geöffnet werden.")
        return
      }
      window.open(json.url, "_blank", "noopener,noreferrer")
    } catch {
      setFehler("Keine Verbindung. Bitte noch einmal versuchen.")
    } finally {
      setBusy(null)
    }
  }

  async function entfernen(id: string, titel: string) {
    if (!confirm(`„${titel}" wirklich aus der Akte entfernen?`)) return
    setBusy(id)
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const j = await res.json()
        setFehler(j.error ?? "Konnte nicht entfernt werden.")
        return
      }
      onAenderung()
    } finally {
      setBusy(null)
    }
  }

  async function melden(id: string) {
    setBusy(id)
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grund: grund.trim() }),
      })
      if (!res.ok) {
        const j = await res.json()
        setFehler(j.error ?? "Konnte nicht gemeldet werden.")
        return
      }
      setMeldeFuer(null)
      setGrund("")
      onAenderung()
    } finally {
      setBusy(null)
    }
  }

  async function abhaken(id: string) {
    setBusy(id)
    try {
      await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grund: "erledigt" }),
      })
      onAenderung()
    } finally {
      setBusy(null)
    }
  }

  if (dokumente.length === 0) {
    return <p className="py-6 text-center text-[13.5px] text-slate-500">{leerText}</p>
  }

  return (
    <div>
      {fehler && (
        <p className="mb-3 flex items-start gap-1.5 text-[13px] text-red-600">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {fehler}
        </p>
      )}

      <ul className="space-y-2">
        {dokumente.map((d) => {
          const bild = d.mime_type.startsWith("image/")
          const gemeldet = Boolean(d.korrektur_gemeldet_at)
          return (
            <li
              key={d.id}
              className={`rounded-xl border p-3 ${
                gemeldet ? "border-amber-300 bg-amber-50/60" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  {bild ? (
                    <ImageIcon className="h-4 w-4 text-slate-500" />
                  ) : (
                    <FileText className="h-4 w-4 text-slate-500" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-slate-900">{d.titel}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-slate-500">
                    <Badge variant="secondary" className="text-[11px]">
                      {kategorieLabel(d.kategorie)}
                    </Badge>
                    <span>{datum(d.created_at)}</span>
                    <span>{formatBytes(d.groesse_bytes)}</span>
                    {d.quelle === "patient" && <span>vom Patienten</span>}
                  </div>
                  {d.notiz && (
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">{d.notiz}</p>
                  )}
                  {gemeldet && (
                    <p className="mt-2 text-[12.5px] leading-relaxed text-amber-900">
                      <strong>Als fehlerhaft gemeldet.</strong>
                      {d.korrektur_grund ? ` „${d.korrektur_grund}"` : ""}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <Button size="sm" variant="outline" onClick={() => oeffnen(d.id)} disabled={busy === d.id}>
                  {busy === d.id ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Öffnen
                </Button>

                {istPraxis ? (
                  <>
                    {gemeldet && (
                      <Button size="sm" variant="ghost" onClick={() => abhaken(d.id)} disabled={busy === d.id}>
                        <Check className="mr-1.5 h-3.5 w-3.5" /> Meldung erledigt
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => entfernen(d.id, d.titel)}
                      disabled={busy === d.id}
                      className="text-red-700 hover:bg-red-50 hover:text-red-800"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Entfernen
                    </Button>
                  </>
                ) : (
                  !gemeldet && (
                    <Button size="sm" variant="ghost" onClick={() => setMeldeFuer(d.id)}>
                      <Flag className="mr-1.5 h-3.5 w-3.5" /> Stimmt etwas nicht?
                    </Button>
                  )
                )}
              </div>

              {meldeFuer === d.id && (
                <div className="mt-3 border-t border-slate-200 pt-3">
                  <p className="text-[12.5px] leading-relaxed text-slate-600">
                    Sag uns kurz, was nicht stimmt. Wir sehen es uns an und kümmern uns darum —
                    entfernen kannst du es aus deiner Akte nicht selbst.
                  </p>
                  <Textarea
                    value={grund}
                    onChange={(e) => setGrund(e.target.value)}
                    rows={2}
                    maxLength={1000}
                    placeholder="Das ist der falsche Befund, er gehört nicht zu mir."
                    className="mt-2"
                  />
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" onClick={() => melden(d.id)} disabled={busy === d.id}>
                      Melden
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setMeldeFuer(null)}>
                      Abbrechen
                    </Button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Lädt die Dokumente einer Akte. Gemeinsam genutzt von beiden Seiten. */
export function useDokumente(patientId?: string) {
  const [dokumente, setDokumente] = useState<Dokument[]>([])
  const [laedt, setLaedt] = useState(true)
  const [fehler, setFehler] = useState<string | null>(null)

  const laden = useCallback(() => {
    const url = patientId ? `/api/documents?patient_id=${patientId}` : "/api/documents"
    fetch(url)
      .then(async (r) => {
        const j = await r.json()
        if (!r.ok) throw new Error(j.error ?? `Serverantwort ${r.status}`)
        return j
      })
      .then((d) => {
        setDokumente(d.dokumente ?? [])
        setFehler(null)
      })
      .catch((e: Error) => setFehler(e.message))
      .finally(() => setLaedt(false))
  }, [patientId])

  useEffect(() => laden(), [laden])

  return { dokumente, laedt, fehler, laden }
}
