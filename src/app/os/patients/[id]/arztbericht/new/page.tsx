"use client"

// PROJ-6: KI-Arztbericht-Generator — Konfigurationsseite

import { use } from "react"
import Link from "next/link"
import { usePatient } from "@/hooks/use-patients"
import { BerichtKonfigForm } from "@/components/arztbericht/BerichtKonfigForm"
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

interface NewBerichtPageProps {
  params: Promise<{ id: string }>
}

export default function NewBerichtPage({ params }: NewBerichtPageProps) {
  const { id } = use(params)
  const { patient, isLoading, error } = usePatient(id)

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Skeleton className="h-4 w-48 mb-6" />
        <Skeleton className="h-7 w-64 mb-2" />
        <Skeleton className="h-4 w-48 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Alert variant="destructive">
          <AlertDescription>{error ?? "Patient nicht gefunden."}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const patientName = `${patient.vorname} ${patient.nachname}`

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      {/* Breadcrumb */}
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
            <BreadcrumbPage>Bericht generieren</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 gap-1 text-muted-foreground">
        <Link href={`/os/patients/${id}?tab=berichte`}>
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Patientenakte
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Bericht generieren</h1>
        <p className="text-muted-foreground mt-1">
          Patient: <span className="font-medium text-foreground">{patientName}</span>
        </p>
      </div>

      {/* Form */}
      <BerichtKonfigForm patientId={id} />
    </div>
  )
}
