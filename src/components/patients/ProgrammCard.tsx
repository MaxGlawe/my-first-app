"use client"

/**
 * PROJ-26: „Programm-Angebot erstellen" im Patientenprofil.
 *
 * Der Kontrollpunkt des gesamten Modells — hier und nirgendwo sonst entsteht
 * die Möglichkeit zu zahlen. Gedacht für den Moment am Ende der
 * Videokonsultation: ein Klick, dann liegt der QR-Code auf dem geteilten
 * Bildschirm und der Patient scannt ihn direkt aus dem Gespräch heraus.
 */

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CalendarRange, QrCode, Copy, Check, Loader2, AlertTriangle, RefreshCw, ExternalLink,
} from "lucide-react"

interface Betreuung {
  active: boolean
  endsAt: string | null
  everHadGrant: boolean
  daysLeft: number
}

interface Angebot {
  id: string
  contract_number: string
  status: string
  url: string | null
  token_expires_at: string | null
  paid_at: string | null
  abgelaufen: boolean
}

interface State {
  betreuung: Betreuung
  offenes_angebot: Angebot | null
  qr_data_url: string | null
  angebote: Angebot[]
}

function fmt(d: string | null): string {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function fmtDateTime(d: string | null): string {
  if (!d) return "—"
  return new Date(d).toLocaleString("de-DE", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  })
}

export function ProgrammCard({ patientId }: { patientId: string }) {
  const [state, setState] = useState<State | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [kopiert, setKopiert] = useState(false)
  const [qrOffen, setQrOffen] = useState(false)
  const [ladeFehler, setLadeFehler] = useState<string | null>(null)
  const [konsultationBezahlt, setKonsultationBezahlt] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setLadeFehler(null)
    fetch(`/api/os/programm-angebot?patient_id=${patientId}`)
      .then(async (r) => {
        if (r.ok) return r.json()
        // Nicht still verschwinden: eine Karte, die einfach fehlt, sieht aus
        // wie ein fehlendes Feature statt wie ein Fehler.
        const j = await r.json().catch(() => ({}))
        throw new Error(j.error ?? `Serverantwort ${r.status}`)
      })
      .then((data) => setState(data))
      .catch((err: Error) => {
        setState(null)
        setLadeFehler(err.message)
      })
      .finally(() => setLoading(false))
  }, [patientId])

  useEffect(() => load(), [load])

  async function erstellen(neuAusstellen = false) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/os/programm-angebot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          neu_ausstellen: neuAusstellen,
          konsultation_angerechnet: konsultationBezahlt,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? "Angebot konnte nicht erstellt werden.")
        return
      }
      setQrOffen(true)
      load()
    } catch {
      setError("Verbindungsfehler. Bitte erneut versuchen.")
    } finally {
      setBusy(false)
    }
  }

  async function kopieren(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setKopiert(true)
      setTimeout(() => setKopiert(false), 2000)
    } catch {
      setError("Kopieren nicht möglich — bitte den Link manuell markieren.")
    }
  }

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="py-5">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-3 h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!state) {
    return (
      <Card className="mb-6 border-red-200 bg-red-50/50">
        <CardContent className="py-5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Praxis-OS-Programm</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                Der Programm-Status konnte nicht geladen werden.
                {ladeFehler && <> Grund: {ladeFehler}</>}
              </p>
              <Button size="sm" variant="outline" onClick={load} className="mt-3">
                <RefreshCw className="mr-1.5 h-4 w-4" /> Erneut versuchen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { betreuung, offenes_angebot: angebot, qr_data_url: qr } = state
  const letztesAbgelaufen = state.angebote?.find((a) => a.abgelaufen && !a.paid_at)

  return (
    <Card className="mb-6 border-[#e7e1d6] bg-[#F8F5F0]">
      <CardContent className="py-5">
        <div className="flex flex-wrap items-center gap-2">
          <CalendarRange className="h-4 w-4 text-[#2C3E2D]" />
          <h3 className="text-sm font-bold text-slate-900">Praxis-OS-Programm</h3>
          {betreuung.active && (
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
              Läuft — noch {betreuung.daysLeft} Tage
            </Badge>
          )}
          {!betreuung.active && betreuung.everHadGrant && (
            <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100">
              Beendet am {fmt(betreuung.endsAt)}
            </Badge>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mt-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Laufende Betreuung → nichts anzubieten */}
        {betreuung.active && (
          <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
            Die Betreuung läuft bis zum <strong>{fmt(betreuung.endsAt)}</strong>. Ein neues
            Angebot ist erst danach möglich.
          </p>
        )}

        {/* Offenes Angebot → Link + QR */}
        {!betreuung.active && angebot?.url && (
          <div className="mt-3">
            <p className="text-[13px] leading-relaxed text-slate-600">
              Angebot <strong>{angebot.contract_number}</strong> liegt offen — gültig bis{" "}
              {fmtDateTime(angebot.token_expires_at)}.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setQrOffen((v) => !v)}>
                <QrCode className="mr-1.5 h-4 w-4" />
                {qrOffen ? "QR ausblenden" : "QR-Code zeigen"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => kopieren(angebot.url!)}>
                {kopiert ? <Check className="mr-1.5 h-4 w-4 text-emerald-600" /> : <Copy className="mr-1.5 h-4 w-4" />}
                {kopiert ? "Kopiert" : "Link kopieren"}
              </Button>
              <a href={angebot.url} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="ghost">
                  <ExternalLink className="mr-1.5 h-4 w-4" />
                  Ansehen
                </Button>
              </a>
            </div>

            {qrOffen && qr && (
              <div className="mt-4 flex flex-col items-center rounded-2xl border border-[#e7e1d6] bg-white p-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt={`QR-Code zum Angebot ${angebot.contract_number}`} className="h-56 w-56" />
                <p className="mt-3 text-center text-[12px] leading-relaxed text-slate-500">
                  Bildschirm teilen und scannen lassen — der Patient landet direkt auf dem Angebot.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Kein offenes Angebot */}
        {!betreuung.active && !angebot?.url && (
          <div className="mt-3">
            <p className="text-[13px] leading-relaxed text-slate-600">
              {letztesAbgelaufen
                ? `Das letzte Angebot (${letztesAbgelaufen.contract_number}) ist abgelaufen.`
                : "Noch kein Angebot erstellt. Der Patient kann sich nicht selbst freischalten."}
            </p>
            <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-white/70 p-3">
              <input
                type="checkbox"
                checked={konsultationBezahlt}
                onChange={(e) => setKonsultationBezahlt(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#2C3E2D]"
              />
              <span className="text-[12.5px] leading-relaxed text-slate-600">
                Der Patient hat die Videokonsultation bereits einzeln bezahlt (69 €) — dann
                anrechnen, es sind noch <strong>430 €</strong> offen. Ohne Haken gilt der volle
                Programmpreis von <strong>499 €</strong>, die Konsultation ist darin enthalten.
              </span>
            </label>

            <Button
              size="sm"
              onClick={() => erstellen(!!letztesAbgelaufen)}
              disabled={busy}
              className="mt-3 bg-[#2C3E2D] hover:bg-[#24321f]"
            >
              {busy ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Wird erstellt…
                </>
              ) : letztesAbgelaufen ? (
                <>
                  <RefreshCw className="mr-1.5 h-4 w-4" /> Angebot neu ausstellen
                </>
              ) : (
                <>
                  <CalendarRange className="mr-1.5 h-4 w-4" /> Programm-Angebot erstellen
                </>
              )}
            </Button>
            <p className="mt-2 text-[12px] text-slate-500">
              Erzeugt den Vertrag, schickt ihn per E-Mail und zeigt den QR-Code für den Call.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
