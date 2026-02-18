"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useDiagnoseRecords } from "@/hooks/use-diagnoses"
import type { DiagnoseRecord, DiagnoseSicherheitsgrad } from "@/types/diagnose"
import { Plus, FileSearch, ChevronRight } from "lucide-react"

interface BefundTabProps {
  patientId: string
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function BefundCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <Skeleton className="h-4 w-4" />
    </div>
  )
}

// ── Sicherheitsgrad Badge ─────────────────────────────────────────────────────

function SicherheitsgradBadge({ grad }: { grad: DiagnoseSicherheitsgrad }) {
  if (grad === "gesichert") {
    return (
      <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 text-xs">
        Gesichert
      </Badge>
    )
  }
  if (grad === "verdacht") {
    return (
      <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 text-xs">
        Verdacht
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-slate-600 border-slate-300 bg-slate-50 text-xs">
      Ausschluss
    </Badge>
  )
}

// ── Befund Card ───────────────────────────────────────────────────────────────

function BefundCard({
  record,
  patientId,
}: {
  record: DiagnoseRecord
  patientId: string
}) {
  const date = new Date(record.created_at).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  const time = new Date(record.created_at).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const hauptdiagnoseLabel = record.hauptdiagnose?.icd10
    ? `${record.hauptdiagnose.icd10.code} — ${record.hauptdiagnose.icd10.bezeichnung}`
    : record.hauptdiagnose?.freitextDiagnose
    ? record.hauptdiagnose.freitextDiagnose
    : "Keine Hauptdiagnose"

  const label =
    hauptdiagnoseLabel.length > 60
      ? hauptdiagnoseLabel.slice(0, 60) + "…"
      : hauptdiagnoseLabel

  return (
    <Link
      href={`/os/patients/${patientId}/befund/${record.id}`}
      className="block"
    >
      <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer">
        <div className="flex items-start gap-3 min-w-0">
          <div className="rounded-full bg-purple-100 p-2 mt-0.5 shrink-0">
            <FileSearch className="h-4 w-4 text-purple-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">
                Befund — {date} {time}
              </span>
              {record.status === "entwurf" ? (
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
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">{label}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {record.hauptdiagnose?.sicherheitsgrad && (
                <SicherheitsgradBadge grad={record.hauptdiagnose.sicherheitsgrad} />
              )}
              {record.nebendiagnosen && record.nebendiagnosen.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  + {record.nebendiagnosen.length} Nebendiagnose
                  {record.nebendiagnosen.length > 1 ? "n" : ""}
                </span>
              )}
            </div>
            {record.created_by_name && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Erstellt von: {record.created_by_name}
              </p>
            )}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-foreground transition-colors" />
      </div>
    </Link>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ patientId }: { patientId: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-purple-100 p-4 mb-4">
          <FileSearch className="h-6 w-6 text-purple-600" />
        </div>
        <h3 className="font-semibold text-base">Noch kein Befundbericht vorhanden</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Erstelle den ersten Befundbericht mit ICD-10-Diagnose für diesen Patienten.
        </p>
        <Button asChild className="mt-6">
          <Link href={`/os/patients/${patientId}/befund/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Ersten Befund erstellen
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// ── BefundTab ─────────────────────────────────────────────────────────────────

export function BefundTab({ patientId }: BefundTabProps) {
  const { records, isLoading, error, refresh } = useDiagnoseRecords(patientId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-44" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <BefundCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={refresh}>
          Erneut versuchen
        </Button>
      </div>
    )
  }

  if (records.length === 0) {
    return <EmptyState patientId={patientId} />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold">Befundberichte</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {records.length} {records.length === 1 ? "Eintrag" : "Einträge"}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href={`/os/patients/${patientId}/befund/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Neuer Befund
          </Link>
        </Button>
      </div>

      <Separator />

      <div className="space-y-3">
        {records.map((record) => (
          <BefundCard key={record.id} record={record} patientId={patientId} />
        ))}
      </div>
    </div>
  )
}
