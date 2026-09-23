"use client"

/**
 * PROJ-27 — Dokumente im Patientenprofil (Praxisseite).
 *
 * Anders als die Sprechzimmer- und Verschlechterungs-Karte blendet sich diese
 * NICHT aus, wenn sie leer ist. Eine leere Terminkarte war ein Fehler, der
 * nach einer Aufgabe aussah; eine leere Dokumentenakte ist eine Aussage:
 * „Zu diesem Patienten liegt nichts vor." Das ist im Gespräch eine
 * Information, keine Lücke — und der Knopf zum Hochladen muss erreichbar
 * sein, gerade wenn noch nichts da ist.
 *
 * Gemeldete Korrekturen werden hochgezogen: Wenn ein Patient sagt, ein
 * Befund gehöre nicht zu ihm, ist das das Erste, was der Behandler sehen
 * muss.
 */

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FolderOpen, Plus, X, AlertTriangle } from "lucide-react"
import { DokumentUpload } from "@/components/app/DokumentUpload"
import { DokumentListe, useDokumente } from "@/components/app/DokumentListe"

export function DokumenteCard({ patientId }: { patientId: string }) {
  const { dokumente, laedt, fehler, laden } = useDokumente(patientId)
  const [uploadOffen, setUploadOffen] = useState(false)

  const gemeldet = dokumente.filter((d) => d.korrektur_gemeldet_at)
  // Gemeldete zuerst — siehe Kopfkommentar.
  const sortiert = [...gemeldet, ...dokumente.filter((d) => !d.korrektur_gemeldet_at)]

  return (
    <Card className="mb-6">
      <CardContent className="py-5">
        <div className="flex flex-wrap items-center gap-2">
          <FolderOpen className="h-4 w-4 text-[#2C3E2D]" />
          <h3 className="text-sm font-bold text-slate-900">Unterlagen</h3>
          {!laedt && dokumente.length > 0 && (
            <Badge variant="secondary" className="text-[11px]">
              {dokumente.length}
            </Badge>
          )}
          {gemeldet.length > 0 && (
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
              {gemeldet.length} gemeldet
            </Badge>
          )}
          <div className="flex-1" />
          <Button size="sm" variant="outline" onClick={() => setUploadOffen((v) => !v)}>
            {uploadOffen ? (
              <>
                <X className="mr-1.5 h-4 w-4" /> Schliessen
              </>
            ) : (
              <>
                <Plus className="mr-1.5 h-4 w-4" /> Hinzufügen
              </>
            )}
          </Button>
        </div>

        {uploadOffen && (
          <div className="mt-4">
            <DokumentUpload
              patientId={patientId}
              onFertig={() => {
                setUploadOffen(false)
                laden()
              }}
            />
          </div>
        )}

        <div className="mt-4">
          {laedt && (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          )}

          {!laedt && fehler && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <div>
                <p className="text-[13px] text-red-800">{fehler}</p>
                <Button size="sm" variant="outline" onClick={laden} className="mt-2">
                  Erneut versuchen
                </Button>
              </div>
            </div>
          )}

          {!laedt && !fehler && (
            <DokumentListe
              dokumente={sortiert}
              istPraxis
              onAenderung={laden}
              leerText="Zu diesem Patienten liegen noch keine Unterlagen vor."
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
