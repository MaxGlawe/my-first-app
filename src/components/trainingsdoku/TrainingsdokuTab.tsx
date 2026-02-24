"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StatusBadge } from "@/components/clinical-ui"
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
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-9 w-44 rounded-xl" />
        </div>
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Trainingsdokumentation</h3>
          {records.length > 0 && (
            <p className="text-xs text-slate-500 mt-0.5">
              {records.length} {records.length === 1 ? "Dokumentation" : "Dokumentationen"}
            </p>
          )}
        </div>
        {!readOnly && (
          <Link href={`/os/patients/${patientId}/trainingsdoku/new`}>
            <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-sm rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Neue Dokumentation
            </Button>
          </Link>
        )}
      </div>

      {records.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-sm border border-dashed border-slate-200/60 rounded-2xl p-8 text-center">
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-4 mx-auto w-fit mb-3">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-sm text-slate-500">Noch keine Trainingsdokumentation vorhanden.</p>
          {!readOnly && (
            <Link href={`/os/patients/${patientId}/trainingsdoku/new`}>
              <Button variant="outline" size="sm" className="mt-4 border-slate-200/60">
                <Plus className="mr-2 h-4 w-4" />
                Erste Dokumentation erstellen
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((session) => (
            <Link
              key={session.id}
              href={`/os/patients/${patientId}/trainingsdoku/${session.id}`}
              className="block"
            >
              <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`rounded-xl p-2 shrink-0 ${
                    session.typ === "training"
                      ? "bg-gradient-to-br from-blue-50 to-cyan-50"
                      : "bg-gradient-to-br from-emerald-50 to-teal-50"
                  }`}>
                    {session.typ === "training" ? (
                      <Dumbbell className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Stethoscope className="h-4 w-4 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-800">
                        {session.typ === "training" ? "Training" : "Therapeutisch"}
                      </span>
                      <StatusBadge status={session.status === "abgeschlossen" ? "abgeschlossen" : "entwurf"} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
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
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 shrink-0 group-hover:text-emerald-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
