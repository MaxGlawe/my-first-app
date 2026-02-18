"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Pencil, Printer, Lock, Clock, User, AlertTriangle } from "lucide-react"
import type { TreatmentSession } from "@/types/behandlung"
import { MASSNAHMEN_KATALOG } from "@/types/behandlung"

// ── Props ──────────────────────────────────────────────────────────────────────

interface BehandlungViewProps {
  session: TreatmentSession
  patientId: string
  isAdmin?: boolean
  currentUserId?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isEditable(session: TreatmentSession, isAdmin: boolean): boolean {
  if (isAdmin) return true
  if (!session.locked_at) return true
  return new Date(session.locked_at) > new Date()
}

function getLockInfo(session: TreatmentSession): {
  isLocked: boolean
  lockedUntil: string | null
} {
  if (!session.locked_at) {
    return { isLocked: false, lockedUntil: null }
  }
  const lockDate = new Date(session.locked_at)
  const isLocked = lockDate < new Date()
  return {
    isLocked,
    lockedUntil: lockDate.toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }
}

// ── NRS Badge ─────────────────────────────────────────────────────────────────

function NrsBadge({ value }: { value: number }) {
  const colorClass =
    value <= 3
      ? "text-green-700 border-green-300 bg-green-50"
      : value <= 6
      ? "text-amber-700 border-amber-300 bg-amber-50"
      : "text-red-700 border-red-300 bg-red-50"

  return (
    <Badge variant="outline" className={`text-sm font-bold px-2 ${colorClass}`}>
      {value}/10
    </Badge>
  )
}

// ── Section Row ───────────────────────────────────────────────────────────────

function SectionRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-[180px_1fr]">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <div className="text-sm">{children}</div>
    </div>
  )
}

// ── BehandlungView ────────────────────────────────────────────────────────────

export function BehandlungView({
  session,
  patientId,
  isAdmin = false,
}: BehandlungViewProps) {
  const { isLocked, lockedUntil } = getLockInfo(session)
  const canEdit = isEditable(session, isAdmin)

  const sessionDate = new Date(session.session_date).toLocaleDateString(
    "de-DE",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  )

  const confirmedAt = session.confirmed_at
    ? new Date(session.confirmed_at).toLocaleString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null

  // Separate standard measures from freitext
  const standardMeasures = session.measures.filter((m) =>
    MASSNAHMEN_KATALOG.some((k) => k.id === m)
  )
  const freitextMeasures = session.measures.filter(
    (m) => !MASSNAHMEN_KATALOG.some((k) => k.id === m)
  )

  return (
    <div className="space-y-6">
      {/* ── Lock / Status Alert ── */}
      {session.status === "abgeschlossen" && isLocked && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Dieses Protokoll wurde am {lockedUntil} gesperrt und ist schreibgeschützt.
            {isAdmin && " Als Admin können Sie es freischalten."}
          </AlertDescription>
        </Alert>
      )}

      {session.status === "abgeschlossen" && !isLocked && lockedUntil && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Bearbeitbar bis {lockedUntil}.
          </AlertDescription>
        </Alert>
      )}

      {session.status === "entwurf" && (
        <Alert>
          <AlertDescription className="text-amber-700">
            Dieses Protokoll ist ein Entwurf und wurde noch nicht abgeschlossen.
          </AlertDescription>
        </Alert>
      )}

      {/* ── Main Content ── */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          {/* Basisdaten */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Basisdaten
            </h3>
            <SectionRow label="Datum">
              <span className="font-medium">{sessionDate}</span>
            </SectionRow>
            {session.duration_minutes && (
              <SectionRow label="Behandlungsdauer">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {session.duration_minutes} Minuten
                </span>
              </SectionRow>
            )}
            {session.therapist_name && (
              <SectionRow label="Therapeut">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  {session.therapist_name}
                </span>
              </SectionRow>
            )}
            <SectionRow label="Status">
              {session.status === "entwurf" ? (
                <Badge
                  variant="outline"
                  className="text-amber-600 border-amber-300 bg-amber-50"
                >
                  Entwurf
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-300 bg-green-50"
                >
                  Abgeschlossen
                </Badge>
              )}
            </SectionRow>
          </div>

          <Separator />

          {/* NRS */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Schmerzwerte (NRS)
            </h3>
            <SectionRow label="Zu Beginn">
              <NrsBadge value={session.nrs_before} />
            </SectionRow>
            {session.nrs_after !== null && session.nrs_after !== undefined && (
              <SectionRow label="Am Ende">
                <div className="flex items-center gap-2">
                  <NrsBadge value={session.nrs_after} />
                  {session.nrs_before - session.nrs_after > 0 && (
                    <span className="text-xs text-green-600 font-medium">
                      -{session.nrs_before - session.nrs_after} Punkte
                    </span>
                  )}
                  {session.nrs_before - session.nrs_after < 0 && (
                    <span className="text-xs text-red-600 font-medium">
                      +{Math.abs(session.nrs_before - session.nrs_after)} Punkte
                    </span>
                  )}
                </div>
              </SectionRow>
            )}
          </div>

          <Separator />

          {/* Maßnahmen */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Durchgeführte Maßnahmen
            </h3>
            {session.measures.length > 0 ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {standardMeasures.map((m) => (
                    <Badge key={m} variant="secondary">
                      {m}
                    </Badge>
                  ))}
                  {freitextMeasures.map((m) => (
                    <Badge key={m} variant="outline">
                      {m}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Keine Maßnahmen erfasst.
              </p>
            )}
          </div>

          {/* Notes */}
          {session.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Patientenreaktion & Besonderheiten
                </h3>
                <p className="text-sm whitespace-pre-wrap">{session.notes}</p>
              </div>
            </>
          )}

          {/* Next Steps */}
          {session.next_steps && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Nächste Schritte / Therapieziel
                </h3>
                <p className="text-sm whitespace-pre-wrap">
                  {session.next_steps}
                </p>
              </div>
            </>
          )}

          {/* Confirmation */}
          {confirmedAt && (
            <>
              <Separator />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Bestätigung
                </h3>
                <p className="text-xs text-muted-foreground">
                  Protokoll bestätigt am {confirmedAt}
                  {session.therapist_name && ` von ${session.therapist_name}`}.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button asChild variant="outline">
          <Link href={`/os/patients/${patientId}?tab=behandlungen`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Link>
        </Button>

        {canEdit && (
          <Button asChild>
            <Link
              href={`/os/patients/${patientId}/behandlung/${session.id}/edit`}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Bearbeiten
            </Link>
          </Button>
        )}

        <Button
          variant="outline"
          onClick={() => window.print()}
          className="ml-auto"
        >
          <Printer className="mr-2 h-4 w-4" />
          Als PDF exportieren
        </Button>
      </div>
    </div>
  )
}
