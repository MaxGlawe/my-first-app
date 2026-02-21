"use client"

// PROJ-6: KI-Arztbericht-Generator — Editor & Archivansicht

import { use } from "react"
import Link from "next/link"
import { usePatient } from "@/hooks/use-patients"
import { useReport } from "@/hooks/use-reports"
import { BerichtEditor } from "@/components/arztbericht/BerichtEditor"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ArrowLeft } from "lucide-react"

interface BerichtEditorPageProps {
  params: Promise<{ id: string; reportId: string }>
}

function EditorSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-96 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  )
}

export default function BerichtEditorPage({ params }: BerichtEditorPageProps) {
  const { id, reportId } = use(params)
  const { patient, isLoading: patientLoading, error: patientError } = usePatient(id)
  const { report, isLoading: reportLoading, error: reportError } = useReport(id, reportId)

  const isLoading = patientLoading || reportLoading
  const error = patientError || reportError

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Skeleton className="h-4 w-64 mb-6" />
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-4 w-40 mb-8" />
        <EditorSkeleton />
      </div>
    )
  }

  if (error || !patient || !report) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Alert variant="destructive">
          <AlertDescription>
            {error ?? "Bericht nicht gefunden."}
          </AlertDescription>
        </Alert>
        <Button variant="outline" asChild className="mt-4">
          <Link href={`/os/patients/${id}?tab=berichte`}>
            Zurück zur Patientenakte
          </Link>
        </Button>
      </div>
    )
  }

  const patientName = `${patient.vorname} ${patient.nachname}`
  const reportTypeLabel =
    report.report_type === "arztbericht" ? "Arztbericht" : "Therapiebericht"

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl print:py-0 print:px-0 print:max-w-none">
      {/* Breadcrumb — wird beim Drucken ausgeblendet */}
      <div className="print:hidden">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/os/patients">Patienten</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/os/patients/${id}?tab=berichte`}>
                {patientName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{reportTypeLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-4 -ml-2 gap-1 text-muted-foreground"
        >
          <Link href={`/os/patients/${id}?tab=berichte`}>
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Patientenakte
          </Link>
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">{reportTypeLabel}</h1>
          <p className="text-muted-foreground mt-1">
            Patient: <span className="font-medium text-foreground">{patientName}</span>
          </p>
        </div>
      </div>

      {/* Editor */}
      <BerichtEditor
        report={report}
        patientId={id}
        patientName={patientName}
        patientGeburtsdatum={patient.geburtsdatum}
      />
    </div>
  )
}
