"use client"

import { use } from "react"
import Link from "next/link"
import { usePatient } from "@/hooks/use-patients"
import { useUserRole } from "@/hooks/use-user-role"
import { BefundForm } from "@/components/diagnose/BefundForm"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ShieldAlert } from "lucide-react"

interface NewBefundPageProps {
  params: Promise<{ id: string }>
}

function PageSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Skeleton className="h-4 w-72 mb-6" />
      <Skeleton className="h-8 w-56 mb-2" />
      <Skeleton className="h-4 w-48 mb-10" />
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function NewBefundPage({ params }: NewBefundPageProps) {
  const { id } = use(params)
  const { patient, isLoading: patientLoading, error: patientError } = usePatient(id)
  const { isLoading: roleLoading, isHeilpraktiker, isAdmin } = useUserRole()

  const isLoading = patientLoading || roleLoading

  if (isLoading) {
    return <PageSkeleton />
  }

  if (patientError || !patient) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Alert variant="destructive">
          <AlertDescription>
            {patientError ?? "Patient nicht gefunden."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Frontend guard: only Heilpraktiker and Admin can create diagnoses
  // (Server-side RLS + API route provide the real security)
  if (!isHeilpraktiker && !isAdmin) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            Zugriff verweigert. Befundberichte und Diagnosen dürfen nur von
            Heilpraktikern erstellt werden.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/os/patients">Patienten</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/os/patients/${id}`}>
                {patient.vorname} {patient.nachname}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Neuer Befundbericht</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Neuer Befundbericht</h1>
        <p className="text-muted-foreground mt-1">
          {patient.vorname} {patient.nachname} —{" "}
          {new Date(patient.geburtsdatum).toLocaleDateString("de-DE")}
        </p>
      </div>

      <BefundForm patientId={id} />
    </div>
  )
}
