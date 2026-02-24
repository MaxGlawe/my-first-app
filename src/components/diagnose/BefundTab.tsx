"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StatusBadge } from "@/components/clinical-ui"
import { useDiagnoseRecords } from "@/hooks/use-diagnoses"
import type { DiagnoseRecord, DiagnoseSicherheitsgrad } from "@/types/diagnose"
import { Plus, FileSearch, ChevronRight } from "lucide-react"

interface BefundTabProps {
  patientId: string
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function BefundCardSkeleton() {
  return (
    <div className="bg-white/60 border border-slate-200/40 rounded-2xl p-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
    </div>
  )
}

// ── Sicherheitsgrad Badge ─────────────────────────────────────────────────────

function SicherheitsgradBadge({ grad }: { grad: DiagnoseSicherheitsgrad }) {
  if (grad === "gesichert") {
    return (
      <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 text-xs">
        Gesichert
      </Badge>
    )
  }
  if (grad === "verdacht") {
    return (
      <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 text-xs">
        Verdacht
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-slate-600 border-slate-200 bg-slate-50 text-xs">
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
      ? hauptdiagnoseLabel.slice(0, 60) + "\u2026"
      : hauptdiagnoseLabel

  return (
    <Link
      href={`/os/patients/${patientId}/befund/${record.id}`}
      className="block"
    >
      <div className="flex items-start justify-between p-4 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all group cursor-pointer">
        <div className="flex items-start gap-3 min-w-0">
          <div className="rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 p-2 mt-0.5 shrink-0">
            <FileSearch className="h-4 w-4 text-purple-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-slate-800">
                Befund — {date} {time}
              </span>
              <StatusBadge status={record.status === "abgeschlossen" ? "abgeschlossen" : "entwurf"} />
            </div>
            <p className="text-xs text-slate-500 mt-1 truncate">{label}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {record.hauptdiagnose?.sicherheitsgrad && (
                <SicherheitsgradBadge grad={record.hauptdiagnose.sicherheitsgrad} />
              )}
              {record.nebendiagnosen && record.nebendiagnosen.length > 0 && (
                <span className="text-xs text-slate-400">
                  + {record.nebendiagnosen.length} Nebendiagnose
                  {record.nebendiagnosen.length > 1 ? "n" : ""}
                </span>
              )}
            </div>
            {record.created_by_name && (
              <p className="text-xs text-slate-400 mt-0.5">
                Erstellt von: {record.created_by_name}
              </p>
            )}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-300 shrink-0 mt-1 group-hover:text-emerald-500 transition-colors" />
      </div>
    </Link>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ patientId }: { patientId: string }) {
  return (
    <div className="bg-white/60 backdrop-blur-sm border border-dashed border-slate-200/60 rounded-2xl">
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 p-4 mb-4">
          <FileSearch className="h-6 w-6 text-purple-600" />
        </div>
        <h3 className="font-semibold text-base text-slate-800">Noch kein Befundbericht vorhanden</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-xs">
          Erstelle den ersten Befundbericht mit ICD-10-Diagnose für diesen Patienten.
        </p>
        <Button asChild className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-sm">
          <Link href={`/os/patients/${patientId}/befund/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Ersten Befund erstellen
          </Link>
        </Button>
      </div>
    </div>
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
          <Skeleton className="h-9 w-44 rounded-xl" />
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
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Befundberichte</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {records.length} {records.length === 1 ? "Eintrag" : "Einträge"}
          </p>
        </div>
        <Button asChild size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-sm rounded-xl">
          <Link href={`/os/patients/${patientId}/befund/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Neuer Befund
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        {records.map((record) => (
          <BefundCard key={record.id} record={record} patientId={patientId} />
        ))}
      </div>
    </div>
  )
}
