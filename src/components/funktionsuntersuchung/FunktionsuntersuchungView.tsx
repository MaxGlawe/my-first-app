"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Printer, Edit } from "lucide-react"
import type { FunktionsuntersuchungRecord, JandaTestCatalogEntry } from "@/types/funktionsuntersuchung"
import { JANDA_BEFUND_LABELS, JANDA_KATEGORIE_LABELS } from "@/types/funktionsuntersuchung"

interface FunktionsuntersuchungViewProps {
  record: FunktionsuntersuchungRecord
  patientId: string
  patientName: string
  readOnly?: boolean
}

export function FunktionsuntersuchungView({
  record,
  patientId,
  patientName,
  readOnly,
}: FunktionsuntersuchungViewProps) {
  const [catalog, setCatalog] = useState<JandaTestCatalogEntry[]>([])

  useEffect(() => {
    fetch("/api/janda-catalog")
      .then((res) => res.json())
      .then((json) => setCatalog(json.tests ?? []))
      .catch(() => {})
  }, [])

  const data = record.data
  const canEdit = record.status === "entwurf" && !readOnly

  function getCatalogEntry(catalogId: string) {
    return catalog.find((c) => c.id === catalogId)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Funktionsuntersuchung V{record.version}
          </h1>
          <p className="text-muted-foreground mt-1">
            {patientName} —{" "}
            {new Date(record.created_at).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
            {record.created_by_name && ` — von ${record.created_by_name}`}
          </p>
          <Badge
            className="mt-2"
            variant={record.status === "abgeschlossen" ? "default" : "secondary"}
          >
            {record.status === "abgeschlossen" ? "Abgeschlossen" : "Entwurf"}
          </Badge>
        </div>
        <div className="flex gap-2 print:hidden">
          {canEdit && (
            <Link href={`/os/patients/${patientId}/funktionsuntersuchung/${record.id}/edit`}>
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

      {/* Allgemeine Angaben */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Allgemeine Angaben</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ViewField label="Hauptbeschwerde" value={data.hauptbeschwerde} span={2} />
          <ViewField label="Beschwerdedauer" value={data.beschwerdedauer} />
          <ViewField label="Sportliche Aktivität" value={data.sportliche_aktivitaet} />
          <ViewField label="Trainingsziele" value={data.trainingsziele} span={2} />
        </div>
      </section>

      {/* Bewegungsanalyse */}
      {(data.haltungsanalyse || data.gangbildanalyse) && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Haltungs- & Bewegungsanalyse</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ViewField label="Haltungsanalyse" value={data.haltungsanalyse} />
            <ViewField label="Gangbildanalyse" value={data.gangbildanalyse} />
          </div>
        </section>
      )}

      {/* Janda Tests */}
      {data.janda_tests.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">
            Muskelfunktionstests ({data.janda_tests.length})
          </h2>
          <div className="space-y-2">
            {data.janda_tests.map((test) => {
              const entry = getCatalogEntry(test.catalog_id)
              return (
                <Card key={test.catalog_id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {entry?.test_name ?? test.catalog_id}
                        </span>
                        {entry && (
                          <>
                            <Badge variant="outline" className="text-xs">
                              {entry.muskel}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {JANDA_KATEGORIE_LABELS[entry.kategorie]}
                            </Badge>
                          </>
                        )}
                      </div>
                      <Badge
                        variant={
                          test.befund === "normal"
                            ? "outline"
                            : test.befund === "leicht_auffaellig"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {JANDA_BEFUND_LABELS[test.befund]}
                      </Badge>
                    </div>
                    {test.notiz && (
                      <p className="text-sm text-muted-foreground mt-2">{test.notiz}</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* Trainingsempfehlung */}
      {data.trainingsempfehlung && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Trainingsempfehlung</h2>
          <p className="text-sm whitespace-pre-wrap">{data.trainingsempfehlung}</p>
        </section>
      )}
    </div>
  )
}

function ViewField({
  label,
  value,
  span,
}: {
  label: string
  value: string
  span?: number
}) {
  if (!value) return null
  return (
    <div className={span === 2 ? "sm:col-span-2" : ""}>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm mt-0.5 whitespace-pre-wrap">{value}</dd>
    </div>
  )
}
