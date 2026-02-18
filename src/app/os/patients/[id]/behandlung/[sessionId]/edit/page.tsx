"use client"

import { use } from "react"
import Link from "next/link"
import { usePatient } from "@/hooks/use-patients"
import { useUserRole } from "@/hooks/use-user-role"
import { useTreatment } from "@/hooks/use-treatments"
import { BehandlungEditForm } from "@/components/behandlung/BehandlungEditForm"
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

interface BehandlungEditPageProps {
  params: Promise<{ id: string; sessionId: string }>
}

function PageSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Skeleton className="h-4 w-80 mb-6" />
      <Skeleton className="h-8 w-56 mb-2" />
      <Skeleton className="h-4 w-48 mb-10" />
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

function LockedAlert({ patientId, sessionId }: { patientId: string; sessionId: string }) {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Alert variant="destructive">
        <AlertDescription>
          Dieses Behandlungsprotokoll ist gesperrt und kann nicht mehr bearbeitet werden.
          Die Bearbeitungsfrist von 24 Stunden ist abgelaufen.
          <br />
          <Link
            href={`/os/patients/${patientId}/behandlung/${sessionId}`}
            className="underline font-medium mt-1 inline-block"
          >
            Zurück zur Ansicht
          </Link>
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default function BehandlungEditPage({
  params,
}: BehandlungEditPageProps) {
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

  // Check if locked (24h expired) — unless admin
  const isLocked =
    !isAdmin &&
    session.status === "abgeschlossen" &&
    session.locked_at !== null &&
    session.locked_at !== undefined &&
    new Date(session.locked_at) < new Date()

  if (isLocked) {
    return <LockedAlert patientId={id} sessionId={sessionId} />
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
              <Link href={`/os/patients/${id}/behandlung/${sessionId}`}>
                Behandlung {sessionDate}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Bearbeiten</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Behandlung bearbeiten
        </h1>
        <p className="text-muted-foreground mt-1">
          {patient.vorname} {patient.nachname} — {sessionDate}
        </p>
      </div>

      <BehandlungEditForm session={session} patientId={id} />
    </div>
  )
}
