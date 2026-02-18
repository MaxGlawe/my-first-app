"use client"

import { use } from "react"
import Link from "next/link"
import { usePatient } from "@/hooks/use-patients"
import { useUserRole } from "@/hooks/use-user-role"
import { useTreatment } from "@/hooks/use-treatments"
import { BehandlungView } from "@/components/behandlung/BehandlungView"
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

interface BehandlungDetailPageProps {
  params: Promise<{ id: string; sessionId: string }>
}

function PageSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Skeleton className="h-4 w-72 mb-6" />
      <Skeleton className="h-8 w-56 mb-2" />
      <Skeleton className="h-4 w-48 mb-10" />
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  )
}

export default function BehandlungDetailPage({
  params,
}: BehandlungDetailPageProps) {
  const { id, sessionId } = use(params)
  const { patient, isLoading: patientLoading, error: patientError } = usePatient(id)
  const { isLoading: roleLoading, isAdmin } = useUserRole()
  const { session, isLoading: sessionLoading, error: sessionError } = useTreatment(id, sessionId)

  const isLoading = patientLoading || roleLoading || sessionLoading

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

  if (sessionError || !session) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Alert variant="destructive">
          <AlertDescription>
            {sessionError ?? "Behandlung nicht gefunden."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const sessionDate = new Date(session.session_date).toLocaleDateString(
    "de-DE",
    { day: "2-digit", month: "2-digit", year: "numeric" }
  )

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
            <BreadcrumbLink asChild>
              <Link href={`/os/patients/${id}?tab=behandlungen`}>
                Behandlungen
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Behandlung {sessionDate}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Behandlungsprotokoll
        </h1>
        <p className="text-muted-foreground mt-1">
          {patient.vorname} {patient.nachname} — {sessionDate}
        </p>
      </div>

      <BehandlungView session={session} patientId={id} isAdmin={isAdmin} />
    </div>
  )
}
