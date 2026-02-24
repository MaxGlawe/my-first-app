"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClinicalSection, ClinicalCard, StatusBadge, NrsDisplay } from "@/components/clinical-ui"
import { Printer, Edit, Dumbbell, Stethoscope, ClipboardList, MessageSquare, Activity } from "lucide-react"
import type {
  TrainingDocumentation,
  TrainingModeData,
  TherapeutischModeData,
} from "@/types/training-documentation"

interface TrainingsdokuViewProps {
  session: TrainingDocumentation
  patientId: string
  patientName: string
  readOnly?: boolean
}

export function TrainingsdokuView({
  session,
  patientId,
  patientName,
  readOnly,
}: TrainingsdokuViewProps) {
  const canEdit = session.status === "entwurf" && !readOnly
  const isTraining = session.typ === "training"
  const data = session.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className={`rounded-xl p-2 ${
              isTraining
                ? "bg-gradient-to-br from-blue-50 to-cyan-50"
                : "bg-gradient-to-br from-emerald-50 to-teal-50"
            }`}>
              {isTraining ? (
                <Dumbbell className="h-5 w-5 text-blue-600" />
              ) : (
                <Stethoscope className="h-5 w-5 text-emerald-600" />
              )}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              {isTraining ? "Trainingsdokumentation" : "Therapeutische Dokumentation"}
            </h1>
          </div>
          <p className="text-slate-500 mt-1 text-sm">
            {patientName} &mdash;{" "}
            {new Date(session.session_date).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
            {session.duration_minutes && ` — ${session.duration_minutes} Min.`}
            {session.created_by_name && ` — von ${session.created_by_name}`}
          </p>
          <div className="mt-2">
            <StatusBadge status={session.status === "abgeschlossen" ? "abgeschlossen" : "entwurf"} />
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          {canEdit && (
            <Link href={`/os/patients/${patientId}/trainingsdoku/${session.id}/edit`}>
              <Button variant="outline" size="sm" className="border-slate-200/60">
                <Edit className="mr-2 h-4 w-4" />
                Bearbeiten
              </Button>
            </Link>
          )}
          <Button variant="outline" size="sm" onClick={() => window.print()} className="border-slate-200/60">
            <Printer className="mr-2 h-4 w-4" />
            Drucken
          </Button>
        </div>
      </div>

      {/* Training Mode View */}
      {isTraining && <TrainingView data={data as TrainingModeData} />}

      {/* Therapeutisch Mode View */}
      {!isTraining && <TherapeutischView data={data as TherapeutischModeData} />}
    </div>
  )
}

function TrainingView({ data }: { data: TrainingModeData }) {
  return (
    <>
      {(data.trainingsart || data.schwerpunkt) && (
        <ClinicalSection title="Trainingsdetails" icon={Dumbbell} accent="blue" flat>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.trainingsart && (
              <ViewField label="Trainingsart" value={data.trainingsart} />
            )}
            {data.schwerpunkt && (
              <ViewField label="Schwerpunkt" value={data.schwerpunkt} />
            )}
          </div>
        </ClinicalSection>
      )}

      {data.uebungen.length > 0 && (
        <ClinicalSection
          title={`Übungen (${data.uebungen.length})`}
          icon={ClipboardList}
          accent="blue"
          flat
        >
          <div className="space-y-2">
            {data.uebungen.map((exercise, idx) => (
              <ClinicalCard key={idx}>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-medium text-sm text-slate-800">{exercise.name || "Unbenannt"}</span>
                  {exercise.saetze && (
                    <Badge variant="outline" className="text-xs border-slate-200/60">
                      {exercise.saetze} Sätze
                    </Badge>
                  )}
                  {exercise.wiederholungen && (
                    <Badge variant="outline" className="text-xs border-slate-200/60">
                      {exercise.wiederholungen} Wdh.
                    </Badge>
                  )}
                  {exercise.gewicht && (
                    <Badge variant="outline" className="text-xs border-slate-200/60">
                      {exercise.gewicht}
                    </Badge>
                  )}
                </div>
                {exercise.anmerkung && (
                  <p className="text-xs text-slate-500 mt-1">{exercise.anmerkung}</p>
                )}
              </ClinicalCard>
            ))}
          </div>
        </ClinicalSection>
      )}

      {(data.anmerkung || data.naechstes_training) && (
        <ClinicalSection title="Anmerkungen" icon={MessageSquare} accent="amber" flat>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.anmerkung && <ViewField label="Allgemeine Anmerkung" value={data.anmerkung} />}
            {data.naechstes_training && (
              <ViewField label="Nächstes Training" value={data.naechstes_training} />
            )}
          </div>
        </ClinicalSection>
      )}
    </>
  )
}

function TherapeutischView({ data }: { data: TherapeutischModeData }) {
  return (
    <>
      {data.massnahmen.length > 0 && (
        <ClinicalSection title="Therapeutische Maßnahmen" icon={Stethoscope} accent="emerald" flat>
          <div className="flex flex-wrap gap-2">
            {data.massnahmen.map((m) => (
              <Badge key={m} variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                {m}
              </Badge>
            ))}
          </div>
        </ClinicalSection>
      )}

      {(data.nrs_before !== null || data.nrs_after !== null) && (
        <ClinicalSection title="Schmerzskala (NRS)" icon={Activity} accent="red" flat>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.nrs_before !== null && (
              <div>
                <dt className="text-xs font-medium text-slate-500">Vor Behandlung</dt>
                <dd className="mt-1">
                  <NrsDisplay value={data.nrs_before} />
                </dd>
              </div>
            )}
            {data.nrs_after !== null && (
              <div>
                <dt className="text-xs font-medium text-slate-500">Nach Behandlung</dt>
                <dd className="mt-1">
                  <NrsDisplay value={data.nrs_after} />
                </dd>
              </div>
            )}
          </div>
        </ClinicalSection>
      )}

      {(data.befund || data.notizen || data.naechste_schritte) && (
        <ClinicalSection title="Befund & Notizen" icon={ClipboardList} accent="blue" flat>
          <div className="grid gap-4">
            {data.befund && <ViewField label="Befund" value={data.befund} />}
            {data.notizen && <ViewField label="Notizen" value={data.notizen} />}
            {data.naechste_schritte && (
              <ViewField label="Nächste Schritte" value={data.naechste_schritte} />
            )}
          </div>
        </ClinicalSection>
      )}
    </>
  )
}

function ViewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</dt>
      <dd className="text-sm mt-0.5 whitespace-pre-wrap text-slate-700">{value}</dd>
    </div>
  )
}
