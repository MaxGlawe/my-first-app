"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, FileText, ChevronRight } from "lucide-react"
import type { FunktionsuntersuchungRecord } from "@/types/funktionsuntersuchung"

interface FunktionsuntersuchungTabProps {
  patientId: string
  readOnly?: boolean
}

export function FunktionsuntersuchungTab({ patientId, readOnly }: FunktionsuntersuchungTabProps) {
  const [records, setRecords] = useState<FunktionsuntersuchungRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch(`/api/patients/${patientId}/funktionsuntersuchung`)
      .then((res) => {
        if (!res.ok) throw new Error("Laden fehlgeschlagen")
        return res.json()
      })
      .then((json) => {
        if (!cancelled) setRecords(json.records ?? [])
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
        <h3 className="text-lg font-semibold">Funktionsuntersuchungen</h3>
        {!readOnly && (
          <Link href={`/os/patients/${patientId}/funktionsuntersuchung/new`}>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Neue Untersuchung
            </Button>
          </Link>
        )}
      </div>

      {records.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          <FileText className="mx-auto h-10 w-10 mb-3 text-muted-foreground/50" />
          <p>Noch keine Funktionsuntersuchung dokumentiert.</p>
          {!readOnly && (
            <Link href={`/os/patients/${patientId}/funktionsuntersuchung/new`}>
              <Button variant="outline" size="sm" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Erste Untersuchung erstellen
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((record) => (
            <Link
              key={record.id}
              href={`/os/patients/${patientId}/funktionsuntersuchung/${record.id}`}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    Untersuchung V{record.version}
                  </span>
                  <Badge variant={record.status === "abgeschlossen" ? "default" : "secondary"}>
                    {record.status === "abgeschlossen" ? "Abgeschlossen" : "Entwurf"}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>
                    {new Date(record.created_at).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  {record.created_by_name && <span>von {record.created_by_name}</span>}
                  {record.data?.janda_tests?.length > 0 && (
                    <span>{record.data.janda_tests.length} Tests dokumentiert</span>
                  )}
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
