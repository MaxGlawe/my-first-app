"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, FileText, ChevronRight, Dumbbell, Stethoscope } from "lucide-react"
import type { TrainingDocumentation } from "@/types/training-documentation"

interface TrainingsdokuTabProps {
  patientId: string
  readOnly?: boolean
}

export function TrainingsdokuTab({ patientId, readOnly }: TrainingsdokuTabProps) {
  const [records, setRecords] = useState<TrainingDocumentation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch(`/api/patients/${patientId}/trainingsdoku`)
      .then((res) => {
        if (!res.ok) throw new Error("Laden fehlgeschlagen")
        return res.json()
      })
      .then((json) => {
        if (!cancelled) setRecords(json.sessions ?? [])
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [patientId])

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-48" />
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Trainingsdokumentation</h3>
        {!readOnly && (
          <Link href={`/os/patients/${patientId}/trainingsdoku/new`}>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Neue Dokumentation
            </Button>
          </Link>
        )}
      </div>

      {records.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          <FileText className="mx-auto h-10 w-10 mb-3 text-muted-foreground/50" />
          <p>Noch keine Trainingsdokumentation vorhanden.</p>
          {!readOnly && (
            <Link href={`/os/patients/${patientId}/trainingsdoku/new`}>
              <Button variant="outline" size="sm" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Erste Dokumentation erstellen
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((session) => (
            <Link
              key={session.id}
              href={`/os/patients/${patientId}/trainingsdoku/${session.id}`}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {session.typ === "training" ? (
                    <Dumbbell className="h-4 w-4 text-blue-500 shrink-0" />
                  ) : (
                    <Stethoscope className="h-4 w-4 text-emerald-500 shrink-0" />
                  )}
                  <span className="text-sm font-medium">
                    {session.typ === "training" ? "Training" : "Therapeutisch"}
                  </span>
                  <Badge variant={session.status === "abgeschlossen" ? "default" : "secondary"}>
                    {session.status === "abgeschlossen" ? "Abgeschlossen" : "Entwurf"}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>
                    {new Date(session.session_date).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  {session.duration_minutes && (
                    <span>{session.duration_minutes} Min.</span>
                  )}
                  {session.created_by_name && <span>von {session.created_by_name}</span>}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
