"use client"

// PROJ-6: KI-Arztbericht-Generator — BerichteTab
// Zeigt die Berichte-Liste im Patienten-Detail-Tab an.

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useReports } from "@/hooks/use-reports"
import { useUserRole } from "@/hooks/use-user-role"
import type { MedicalReport, ReportType } from "@/types/arztbericht"
import {
  FileText,
  Plus,
  ChevronRight,
  CheckCircle,
  Clock,
  Info,
} from "lucide-react"

// ── Props ──────────────────────────────────────────────────────────────────────

interface BerichteTabProps {
  patientId: string
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function BerichtCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="space-y-2 flex-1">
        <div className="flex gap-2">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-3 w-56" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-4 w-4 ml-4" />
    </div>
  )
}

// ── Report Type Badge ──────────────────────────────────────────────────────────

function ReportTypeBadge({ reportType }: { reportType: ReportType }) {
  if (reportType === "arztbericht") {
    return (
      <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100">
        Arztbericht
      </Badge>
    )
  }
  return (
    <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
      Therapiebericht
    </Badge>
  )
}

// ── Status Badge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: MedicalReport["status"] }) {
  if (status === "finalisiert") {
    return (
      <Badge
        variant="outline"
        className="text-green-700 border-green-300 bg-green-50 text-xs gap-1"
      >
        <CheckCircle className="h-3 w-3" />
        Finalisiert
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="text-amber-600 border-amber-300 bg-amber-50 text-xs gap-1"
    >
      <Clock className="h-3 w-3" />
      Entwurf
    </Badge>
  )
}

// ── Bericht Card ───────────────────────────────────────────────────────────────

function BerichtCard({
  report,
  patientId,
}: {
  report: MedicalReport
  patientId: string
}) {
  const createdDate = new Date(report.created_at).toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  const periodFrom = new Date(report.date_from).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
  const periodTo = new Date(report.date_to).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  return (
    <Link
      href={`/os/patients/${patientId}/arztbericht/${report.id}`}
      className="block"
    >
      <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer">
        <div className="flex items-start gap-3 min-w-0">
          <div className="rounded-full bg-teal-100 p-2 mt-0.5 shrink-0">
            <FileText className="h-4 w-4 text-teal-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{createdDate}</span>
              <ReportTypeBadge reportType={report.report_type} />
              <StatusBadge status={report.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              An: {report.recipient_name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Zeitraum: {periodFrom} – {periodTo}
            </p>
            {report.generated_by_name && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Erstellt von: {report.generated_by_name}
              </p>
            )}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-foreground transition-colors" />
      </div>
    </Link>
  )
}

// ── Empty State ────────────────────────────────────────────────────────────────

function EmptyState({
  patientId,
  reportLabel,
}: {
  patientId: string
  reportLabel: string
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-teal-100 p-4 mb-4">
          <FileText className="h-6 w-6 text-teal-600" />
        </div>
        <h3 className="font-semibold text-base">Noch kein {reportLabel} vorhanden</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Generiere mit einem Klick einen KI-Entwurf auf Basis der vorhandenen Dokumentation.
        </p>
        <Button asChild className="mt-6">
          <Link href={`/os/patients/${patientId}/arztbericht/new`}>
            <Plus className="mr-2 h-4 w-4" />
            {reportLabel} generieren
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// ── Info Banner ────────────────────────────────────────────────────────────────

function BerichtsTypBanner({
  role,
}: {
  role: string | null
}) {
  if (role === "heilpraktiker") {
    return (
      <div className="flex items-start gap-2 p-3 rounded-lg bg-purple-50 border border-purple-200 text-sm text-purple-800">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          Als Heilpraktiker generieren Sie <strong>Arztberichte</strong> — mit Anamnese,
          klinischem Befund, ICD-10-Diagnosen, Behandlungsverlauf und Prognose.
        </span>
      </div>
    )
  }
  if (role === "physiotherapeut") {
    return (
      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          Als Physiotherapeut generieren Sie <strong>Therapieberichte</strong> — mit
          Behandlungsverlauf, NRS-Entwicklung und Weiterbehandlungsempfehlung (ohne Diagnoseabschnitt).
        </span>
      </div>
    )
  }
  if (role === "admin") {
    return (
      <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          Als Admin sehen Sie alle Berichte (Arztberichte und Therapieberichte).
        </span>
      </div>
    )
  }
  return null
}

// ── BerichteTab ────────────────────────────────────────────────────────────────

export function BerichteTab({ patientId }: BerichteTabProps) {
  const { reports, isLoading, error, refresh } = useReports(patientId)
  const { role, isLoading: roleLoading } = useUserRole()

  const isHeilpraktiker = role === "heilpraktiker"
  const isAdmin = role === "admin"

  const reportLabel = isAdmin
    ? "Bericht"
    : isHeilpraktiker
    ? "Arztbericht"
    : "Therapiebericht"

  if (isLoading || roleLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-lg" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-44" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <BerichtCardSkeleton key={i} />
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

  if (reports.length === 0) {
    return (
      <div className="space-y-4">
        <BerichtsTypBanner role={role} />
        <EmptyState patientId={patientId} reportLabel={reportLabel} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <BerichtsTypBanner role={role} />

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold">Berichte</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {reports.length} {reports.length === 1 ? "Bericht" : "Berichte"}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href={`/os/patients/${patientId}/arztbericht/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Bericht generieren
          </Link>
        </Button>
      </div>

      <Separator />

      <div className="space-y-3">
        {reports.map((report) => (
          <BerichtCard key={report.id} report={report} patientId={patientId} />
        ))}
      </div>
    </div>
  )
}
