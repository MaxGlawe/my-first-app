"use client"

/**
 * PROJ-26 Phase 3 — „Mir geht es schlechter" auf dem Patienten-Dashboard.
 *
 * Diese Karte löst genau eine Zusage aus dem Behandlungsvertrag ein, die es
 * bisher nur auf dem Papier gab: kurzfristig eine zusätzliche Video-Sitzung,
 * Rückmeldung spätestens am nächsten Werktag — in BEIDEN Varianten.
 *
 * Bewusste Entscheidungen:
 *
 *  — Kein Alarmrot im Ruhezustand. Eine Karte, die dauernd nach Notfall
 *    aussieht, wird nach einer Woche nicht mehr gesehen. Sie ist ruhig, bis
 *    etwas gemeldet wurde.
 *
 *  — Die Beschreibung ist FREIWILLIG. Wer Schmerzen hat, soll drücken können,
 *    ohne erst ein Formular auszufüllen. Das Feld steht da, es hält aber
 *    niemanden auf.
 *
 *  — Nach dem Melden steht die zugesagte Frist im Klartext da. Das ist der
 *    ganze Unterschied zu einer Chatnachricht: Der Patient sieht, bis wann
 *    er eine Antwort bekommt, statt zu warten und zu raten.
 *
 *  — Kein Notfallkanal. Der Hinweis auf 112 steht direkt daneben, damit
 *    niemand hier drückt und dann auf Antwort wartet, während er in die
 *    Notaufnahme gehört.
 */

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { GlassCard } from "@/components/app/GlassCard"
import { AlertTriangle, Check, Loader2, HeartPulse } from "lucide-react"

interface Meldung {
  id: string
  beschreibung: string | null
  gemeldet_at: string
  frist_at: string
  erledigt_at?: string | null
  erledigt_notiz?: string | null
}

function fristText(iso: string): string {
  const d = new Date(iso)
  return (
    d.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "2-digit" }) +
    " bis " +
    d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) +
    " Uhr"
  )
}

export function VerschlechterungKarte() {
  const [offen, setOffen] = useState<Meldung | null>(null)
  const [laedt, setLaedt] = useState(true)
  const [formOffen, setFormOffen] = useState(false)
  const [text, setText] = useState("")
  const [sendet, setSendet] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)

  const laden = useCallback(() => {
    fetch("/api/me/verschlechterung")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setOffen(d?.offen ?? null))
      .catch(() => setOffen(null))
      .finally(() => setLaedt(false))
  }, [])

  useEffect(() => laden(), [laden])

  async function melden() {
    setSendet(true)
    setFehler(null)
    try {
      const res = await fetch("/api/me/verschlechterung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beschreibung: text.trim() || null }),
      })
      const json = await res.json()
      if (!res.ok) {
        setFehler(json.error ?? "Die Meldung konnte nicht gespeichert werden.")
        return
      }
      setOffen(json.meldung)
      setFormOffen(false)
      setText("")
    } catch {
      setFehler("Keine Verbindung. Bitte noch einmal versuchen.")
    } finally {
      setSendet(false)
    }
  }

  if (laedt) return null

  // ── Es liegt eine Meldung vor ────────────────────────────────────────────
  if (offen) {
    return (
      <GlassCard className="p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-4 w-4 text-emerald-700" />
          </span>
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-slate-900">
              Deine Meldung ist angekommen
            </h3>
            <p className="mt-1 text-[13.5px] leading-relaxed text-slate-600">
              Dein Behandler meldet sich bei dir — zugesagt ist eine Rückmeldung bis{" "}
              <strong className="text-slate-900">{fristText(offen.frist_at)}</strong>. Wenn nötig,
              schieben wir kurzfristig eine zusätzliche Video-Sitzung ein; die ist in deinem
              Programm enthalten.
            </p>
            {offen.beschreibung && (
              <p className="mt-2 rounded-lg bg-slate-50 p-2.5 text-[13px] leading-relaxed text-slate-600">
                „{offen.beschreibung}"
              </p>
            )}
          </div>
        </div>
      </GlassCard>
    )
  }

  // ── Ruhezustand ─────────────────────────────────────────────────────────
  return (
    <GlassCard className="p-5">
      {!formOffen ? (
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
            <HeartPulse className="h-4 w-4 text-slate-600" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold text-slate-900">
              Ist es schlechter geworden?
            </h3>
            <p className="mt-1 text-[13.5px] leading-relaxed text-slate-600">
              Dann sag Bescheid. Dein Behandler meldet sich spätestens am nächsten Werktag, und
              wir schieben bei Bedarf eine zusätzliche Video-Sitzung ein — ohne Zusatzkosten.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => setFormOffen(true)}
            >
              Verschlechterung melden
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-[15px] font-semibold text-slate-900">Was hat sich verändert?</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
            Ein, zwei Sätze reichen. Du kannst das Feld auch leer lassen.
          </p>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Seit gestern zieht es wieder ins Bein, vor allem beim Sitzen."
            className="mt-3"
          />

          {fehler && (
            <p className="mt-2 flex items-start gap-1.5 text-[13px] text-red-600">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {fehler}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={melden} disabled={sendet}>
              {sendet ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Wird gesendet…
                </>
              ) : (
                "Melden"
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setFormOffen(false)
                setFehler(null)
              }}
              disabled={sendet}
            >
              Abbrechen
            </Button>
          </div>

          <p className="mt-3 text-[12px] leading-relaxed text-slate-500">
            Praxis OS ist kein Notdienst. Bei starken, plötzlichen Beschwerden, Taubheit oder
            Lähmungserscheinungen wende dich bitte sofort an den ärztlichen Notdienst oder die 112.
          </p>
        </div>
      )}
    </GlassCard>
  )
}
