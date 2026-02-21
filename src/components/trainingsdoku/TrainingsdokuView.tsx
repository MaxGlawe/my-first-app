"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Printer, Edit, Dumbbell, Stethoscope } from "lucide-react"
import type {
  TrainingDocumentation,
  TrainingModeData,
  TherapeutischModeData,
} from "@/types/training-documentation"
import { MASSNAHMEN_OPTIONS } from "@/types/training-documentation"

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            {isTraining ? (
              <Dumbbell className="h-5 w-5 text-blue-500" />
            ) : (
              <Stethoscope className="h-5 w-5 text-emerald-500" />
            )}
            <h1 className="text-2xl font-bold tracking-tight">
              {isTraining ? "Trainingsdokumentation" : "Therapeutische Dokumentation"}
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            {patientName} —{" "}
            {new Date(session.session_date).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
            {session.duration_minutes && ` — ${session.duration_minutes} Min.`}
            {session.created_by_name && ` — von ${session.created_by_name}`}
          </p>
          <Badge
            className="mt-2"
            variant={session.status === "abgeschlossen" ? "default" : "secondary"}
          >
            {session.status === "abgeschlossen" ? "Abgeschlossen" : "Entwurf"}
          </Badge>
        </div>
        <div className="flex gap-2 print:hidden">
          {canEdit && (
            <Link href={`/os/patients/${patientId}/trainingsdoku/${session.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Bearbeiten
              </Button>
            </Link>
          )}
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Drucken
          </Button>
        </div>
      </div>

      <Separator />

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
      {/* Details */}
      {(data.trainingsart || data.schwerpunkt) && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Trainingsdetails</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.trainingsart && (
              <ViewField label="Trainingsart" value={data.trainingsart} />
            )}
            {data.schwerpunkt && (
              <ViewField label="Schwerpunkt" value={data.schwerpunkt} />
            )}
          </div>
        </section>
      )}

      {/* Exercises */}
      {data.uebungen.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">
            Übungen ({data.uebungen.length})
          </h2>
          <div className="space-y-2">
            {data.uebungen.map((exercise, idx) => (
              <Card key={idx}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-medium text-sm">{exercise.name || "Unbenannt"}</span>
                    {exercise.saetze && (
                      <Badge variant="outline" className="text-xs">
                        {exercise.saetze} Sätze
                      </Badge>
                    )}
                    {exercise.wiederholungen && (
                      <Badge variant="outline" className="text-xs">
                        {exercise.wiederholungen} Wdh.
                      </Badge>
                    )}
                    {exercise.gewicht && (
                      <Badge variant="outline" className="text-xs">
                        {exercise.gewicht}
                      </Badge>
                    )}
                  </div>
                  {exercise.anmerkung && (
                    <p className="text-xs text-muted-foreground mt-1">{exercise.anmerkung}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Notes */}
      {(data.anmerkung || data.naechstes_training) && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Anmerkungen</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.anmerkung && <ViewField label="Allgemeine Anmerkung" value={data.anmerkung} />}
            {data.naechstes_training && (
              <ViewField label="Nächstes Training" value={data.naechstes_training} />
            )}
          </div>
        </section>
      )}
    </>
  )
}

function TherapeutischView({ data }: { data: TherapeutischModeData }) {
  return (
    <>
      {/* Maßnahmen */}
      {data.massnahmen.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Therapeutische Maßnahmen</h2>
          <div className="flex flex-wrap gap-2">
            {data.massnahmen.map((m) => (
              <Badge key={m} variant="secondary">
                {m}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* NRS */}
      {(data.nrs_before !== null || data.nrs_after !== null) && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Schmerzskala (NRS)</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.nrs_before !== null && (
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Vor Behandlung</dt>
                <dd className="text-2xl font-bold mt-1">{data.nrs_before}/10</dd>
              </div>
            )}
            {data.nrs_after !== null && (
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Nach Behandlung</dt>
                <dd className="text-2xl font-bold mt-1">{data.nrs_after}/10</dd>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Befund & Notizen */}
      {(data.befund || data.notizen || data.naechste_schritte) && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Befund & Notizen</h2>
          <div className="grid gap-4">
            {data.befund && <ViewField label="Befund" value={data.befund} />}
            {data.notizen && <ViewField label="Notizen" value={data.notizen} />}
            {data.naechste_schritte && (
              <ViewField label="Nächste Schritte" value={data.naechste_schritte} />
            )}
          </div>
        </section>
      )}
    </>
  )
}

function ViewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm mt-0.5 whitespace-pre-wrap">{value}</dd>
    </div>
  )
}
