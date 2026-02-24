"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Pencil, Printer, Lock, Clock, User, AlertTriangle } from "lucide-react"
import { ClinicalSection, ClinicalCard, StatusBadge, NrsDisplay } from "@/components/clinical-ui"
import type { TreatmentSession, BehandlungExtendedData } from "@/types/behandlung"
import { MASSNAHMEN_KATALOG, INTENSITAET_OPTIONS } from "@/types/behandlung"

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

// ── BehandlungView ────────────────────────────────────────────────────────────

export function BehandlungView({
  session,
  patientId,
  isAdmin = false,
}: BehandlungViewProps) {
  const { isLocked, lockedUntil } = getLockInfo(session)
  const canEdit = isEditable(session, isAdmin)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extData = ((session as any).data ?? {}) as BehandlungExtendedData

  const sessionDate = new Date(session.session_date).toLocaleDateString(
    "de-DE",
    { weekday: "long", day: "2-digit", month: "long", year: "numeric" }
  )

  const confirmedAt = session.confirmed_at
    ? new Date(session.confirmed_at).toLocaleString("de-DE", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : null

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
          <AlertDescription>Bearbeitbar bis {lockedUntil}.</AlertDescription>
        </Alert>
      )}

      {session.status === "entwurf" && (
        <Alert>
          <AlertDescription className="text-amber-700">
            Dieses Protokoll ist ein Entwurf und wurde noch nicht abgeschlossen.
          </AlertDescription>
        </Alert>
      )}

      {/* ── Basisdaten ── */}
      <ClinicalSection title="Basisdaten" flat>
        <div className="space-y-3">
          <ViewRow label="Datum"><span className="font-medium">{sessionDate}</span></ViewRow>
          {session.duration_minutes && (
            <ViewRow label="Behandlungsdauer">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {session.duration_minutes} Minuten
              </span>
            </ViewRow>
          )}
          {session.therapist_name && (
            <ViewRow label="Therapeut">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                {session.therapist_name}
              </span>
            </ViewRow>
          )}
          <ViewRow label="Status">
            <StatusBadge status={session.status === "abgeschlossen" ? "abgeschlossen" : "entwurf"} />
          </ViewRow>
        </div>
      </ClinicalSection>

      {/* ── NRS ── */}
      <ClinicalSection title="Schmerzwerte (NRS)" flat>
        <div className="space-y-3">
          <ViewRow label="Zu Beginn">
            <NrsDisplay value={session.nrs_before} />
          </ViewRow>
          {session.nrs_after !== null && session.nrs_after !== undefined && (
            <ViewRow label="Am Ende">
              <div className="flex items-center gap-2">
                <NrsDisplay value={session.nrs_after} />
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
            </ViewRow>
          )}
        </div>
      </ClinicalSection>

      {/* ── Maßnahmen ── */}
      <ClinicalSection title="Durchgeführte Maßnahmen" flat>
        {session.measures.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {standardMeasures.map((m) => <Badge key={m} variant="secondary">{m}</Badge>)}
            {freitextMeasures.map((m) => <Badge key={m} variant="outline">{m}</Badge>)}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">Keine Maßnahmen erfasst.</p>
        )}
      </ClinicalSection>

      {/* ── Maßnahmen-Details ── */}
      {extData.massnahmen_detail && extData.massnahmen_detail.length > 0 && (
        <ClinicalSection title="Maßnahmen-Details" flat>
          <div className="space-y-2">
            {extData.massnahmen_detail.map((d, i) => {
              const label = MASSNAHMEN_KATALOG.find((m) => m.id === d.massnahme_id)?.label ?? d.massnahme_id
              return (
                <ClinicalCard key={i}>
                  <div className="flex items-center gap-3 flex-wrap text-sm">
                    <span className="font-medium">{label}</span>
                    {d.dauer_minuten && <Badge variant="outline" className="text-xs">{d.dauer_minuten} Min</Badge>}
                    {d.region && <Badge variant="secondary" className="text-xs">{d.region}</Badge>}
                    {d.intensitaet && (
                      <Badge variant="outline" className="text-xs">
                        {INTENSITAET_OPTIONS.find((o) => o.value === d.intensitaet)?.label}
                      </Badge>
                    )}
                    {d.notiz && <span className="text-muted-foreground text-xs">{d.notiz}</span>}
                  </div>
                </ClinicalCard>
              )
            })}
          </div>
        </ClinicalSection>
      )}

      {/* ── SOAP ── */}
      {extData.soap && (extData.soap.subjektiv || extData.soap.objektiv || extData.soap.assessment || extData.soap.plan) && (
        <ClinicalSection title="SOAP-Verlaufsdokumentation" flat>
          <div className="space-y-3">
            {extData.soap.subjektiv && (
              <div>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-100 text-emerald-700 text-xs font-bold mr-2">S</span>
                <span className="text-xs font-semibold text-slate-500">Subjektiv</span>
                <p className="text-sm mt-1 whitespace-pre-wrap">{extData.soap.subjektiv}</p>
              </div>
            )}
            {extData.soap.objektiv && (
              <div>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-blue-100 text-blue-700 text-xs font-bold mr-2">O</span>
                <span className="text-xs font-semibold text-slate-500">Objektiv</span>
                <p className="text-sm mt-1 whitespace-pre-wrap">{extData.soap.objektiv}</p>
              </div>
            )}
            {extData.soap.assessment && (
              <div>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-amber-100 text-amber-700 text-xs font-bold mr-2">A</span>
                <span className="text-xs font-semibold text-slate-500">Assessment</span>
                <p className="text-sm mt-1 whitespace-pre-wrap">{extData.soap.assessment}</p>
              </div>
            )}
            {extData.soap.plan && (
              <div>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-purple-100 text-purple-700 text-xs font-bold mr-2">P</span>
                <span className="text-xs font-semibold text-slate-500">Plan</span>
                <p className="text-sm mt-1 whitespace-pre-wrap">{extData.soap.plan}</p>
              </div>
            )}
          </div>
        </ClinicalSection>
      )}

      {/* ── Patientenreaktion ── */}
      {(session.notes || extData.schmerzreaktion || extData.vertraeglichkeit) && (
        <ClinicalSection title="Patientenreaktion & Besonderheiten" flat>
          <div className="space-y-3">
            {session.notes && <p className="text-sm whitespace-pre-wrap">{session.notes}</p>}
            {extData.schmerzreaktion && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">Schmerzreaktion</span>
                <p className="text-sm whitespace-pre-wrap mt-0.5">{extData.schmerzreaktion}</p>
              </div>
            )}
            {extData.vertraeglichkeit && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">Verträglichkeit</span>
                <p className="text-sm whitespace-pre-wrap mt-0.5">{extData.vertraeglichkeit}</p>
              </div>
            )}
          </div>
        </ClinicalSection>
      )}

      {/* ── Post-ROM ── */}
      {extData.post_rom && extData.post_rom.length > 0 && (
        <ClinicalSection title="ROM-Vergleich (vorher / nachher)" flat>
          <div className="space-y-2">
            {extData.post_rom.map((r, i) => {
              const improved = r.grad_vorher !== undefined && r.grad_nachher !== undefined && r.grad_nachher > r.grad_vorher
              return (
                <ClinicalCard key={i} highlighted={improved}>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-medium">{r.gelenk}</span>
                    <span className="text-muted-foreground">{r.richtung}</span>
                    {r.grad_vorher !== undefined && <Badge variant="outline" className="text-xs">Vorher: {r.grad_vorher}°</Badge>}
                    {r.grad_nachher !== undefined && <Badge variant="outline" className="text-xs">Nachher: {r.grad_nachher}°</Badge>}
                    {improved && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        +{(r.grad_nachher ?? 0) - (r.grad_vorher ?? 0)}°
                      </Badge>
                    )}
                  </div>
                </ClinicalCard>
              )
            })}
          </div>
        </ClinicalSection>
      )}

      {/* ── Nächste Schritte ── */}
      {session.next_steps && (
        <ClinicalSection title="Nächste Schritte / Therapieziel" flat>
          <p className="text-sm whitespace-pre-wrap">{session.next_steps}</p>
        </ClinicalSection>
      )}

      {/* ── Bestätigung ── */}
      {confirmedAt && (
        <p className="text-xs text-muted-foreground">
          Protokoll bestätigt am {confirmedAt}
          {session.therapist_name && ` von ${session.therapist_name}`}.
        </p>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center gap-3 flex-wrap print:hidden">
        <Button asChild variant="outline">
          <Link href={`/os/patients/${patientId}?tab=behandlungen`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Link>
        </Button>

        {canEdit && (
          <Button asChild>
            <Link href={`/os/patients/${patientId}/behandlung/${session.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Bearbeiten
            </Link>
          </Button>
        )}

        <Button variant="outline" onClick={() => window.print()} className="ml-auto">
          <Printer className="mr-2 h-4 w-4" />
          Als PDF exportieren
        </Button>
      </div>
    </div>
  )
}

// ── Section Row ───────────────────────────────────────────────────────────────

function ViewRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[180px_1fr]">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <div className="text-sm">{children}</div>
    </div>
  )
}
