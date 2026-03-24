"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PausenFitSession, PausenFitTyp, PausenFitStatus } from "@/types/bgf"
import { CheckCircle2, Clock, Play, AlertCircle, ChevronRight } from "lucide-react"

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getTypLabel(typ: PausenFitTyp): string {
  const map: Record<PausenFitTyp, string> = {
    morgen_aktivierung: "Morgen-Aktivierung",
    mittag_mobilisation: "Mittags-Mobilisation",
    nachmittag_reset: "Nachmittags-Reset",
  }
  return map[typ]
}

export function getTypEmoji(typ: PausenFitTyp): string {
  const map: Record<PausenFitTyp, string> = {
    morgen_aktivierung: "🌅",
    mittag_mobilisation: "☀️",
    nachmittag_reset: "🌙",
  }
  return map[typ]
}

export function getTypTime(typ: PausenFitTyp): string {
  const map: Record<PausenFitTyp, string> = {
    morgen_aktivierung: "Morgens",
    mittag_mobilisation: "Mittags",
    nachmittag_reset: "Nachmittags",
  }
  return map[typ]
}

function StatusBadge({ status }: { status: PausenFitStatus }) {
  if (status === "abgeschlossen") {
    return (
      <Badge className="bg-landing-accent/10 text-landing-accent border-landing-accent/20 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" />
        Geschafft!
      </Badge>
    )
  }
  if (status === "gestartet") {
    return (
      <Badge className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
        <Play className="w-3 h-3" />
        Läuft…
      </Badge>
    )
  }
  if (status === "verpasst") {
    return (
      <Badge className="bg-slate-100 text-slate-500 border-slate-200 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        Verpasst
      </Badge>
    )
  }
  return (
    <Badge className="bg-blue-50 text-blue-600 border-blue-200 flex items-center gap-1">
      <Clock className="w-3 h-3" />
      Geplant
    </Badge>
  )
}

function formatDuration(seconds: number): string {
  const mins = Math.ceil(seconds / 60)
  return `${mins} Min.`
}

// ── Component ─────────────────────────────────────────────────────────────────

interface SessionCardProps {
  session: PausenFitSession
  isNext?: boolean
  onStart: (sessionId: string) => void
}

export function SessionCard({ session, isNext, onStart }: SessionCardProps) {
  const totalSeconds =
    session.dauer_sekunden ??
    session.uebungen.reduce((sum, u) => sum + u.dauer_sekunden, 0)

  const isClickable =
    session.status === "geplant" || session.status === "gestartet"

  const isCompleted = session.status === "abgeschlossen"
  const isMissed = session.status === "verpasst"

  return (
    <Card
      className={[
        "relative overflow-hidden transition-all duration-200",
        isCompleted
          ? "border-landing-accent/30 bg-landing-accent/5"
          : isMissed
          ? "border-slate-200 bg-slate-50 opacity-70"
          : isNext
          ? "border-landing-accent-warm/40 bg-gradient-to-br from-white to-amber-50/60 shadow-md ring-1 ring-landing-accent-warm/20"
          : "border-slate-200 bg-white",
        isClickable ? "cursor-pointer hover:shadow-md active:scale-[0.99]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => isClickable && onStart(session.id)}
    >
      {/* Active glow strip */}
      {isNext && !isCompleted && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-landing-accent-warm via-amber-400 to-landing-accent-warm" />
      )}

      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left: icon + info */}
          <div className="flex items-center gap-3">
            <div
              className={[
                "w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0",
                isCompleted
                  ? "bg-landing-accent/10"
                  : isMissed
                  ? "bg-slate-100"
                  : isNext
                  ? "bg-amber-100"
                  : "bg-slate-100",
              ].join(" ")}
            >
              {getTypEmoji(session.typ)}
            </div>

            <div>
              <p className="font-semibold text-sm text-slate-900">
                {getTypLabel(session.typ)}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500">
                  {getTypTime(session.typ)}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500">
                  {formatDuration(totalSeconds)}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500">
                  {session.uebungen.length} Übungen
                </span>
              </div>

              {session.status === "abgeschlossen" && session.feedback_sterne && (
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < (session.feedback_sterne ?? 0)
                          ? "text-amber-400 text-xs"
                          : "text-slate-300 text-xs"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: badge + arrow */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge status={session.status} />
            {isClickable && (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </div>

        {/* CTA button for next session */}
        {isNext && session.status === "geplant" && (
          <div className="mt-3 pt-3 border-t border-amber-100">
            <Button
              className="w-full bg-landing-accent hover:bg-landing-accent-hover text-white font-semibold text-sm h-10"
              onClick={(e) => {
                e.stopPropagation()
                onStart(session.id)
              }}
            >
              <Play className="w-4 h-4 mr-2" />
              Jetzt starten
            </Button>
          </div>
        )}
        {isNext && session.status === "gestartet" && (
          <div className="mt-3 pt-3 border-t border-amber-100">
            <Button
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm h-10"
              onClick={(e) => {
                e.stopPropagation()
                onStart(session.id)
              }}
            >
              <Play className="w-4 h-4 mr-2" />
              Weiter machen
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
