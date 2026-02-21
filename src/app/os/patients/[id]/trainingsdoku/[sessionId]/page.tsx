"use client"

import { use } from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePatient } from "@/hooks/use-patients"
import { useUserRole } from "@/hooks/use-user-role"
import { TrainingsdokuView } from "@/components/trainingsdoku/TrainingsdokuView"
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
import type { TrainingDocumentation } from "@/types/training-documentation"

interface TrainingsdokuDetailPageProps {
  params: Promise<{ id: string; sessionId: string }>
}

function PageSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Skeleton className="h-4 w-80 mb-6" />
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <Skeleton className="h-px w-full mb-8" />
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TrainingsdokuDetailPage({ params }: TrainingsdokuDetailPageProps) {
  const { id, sessionId } = use(params)
  const { patient, isLoading: patientLoading, error: patientError } = usePatient(id)
  const { isLoading: roleLoading, isPraxismanagement } = useUserRole()

  const [session, setSession] = useState<TrainingDocumentation | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [sessionError, setSessionError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setSessionLoading(true)

    fetch(`/api/patients/${id}/trainingsdoku/${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Laden fehlgeschlagen")
        return res.json()
      })
      .then((json) => {
        if (!cancelled) setSession(json.session)
      })
      .catch((err) => {
        if (!cancelled) setSessionError(err.message)
      })
      .finally(() => {
        if (!cancelled) setSessionLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, sessionId])

  const isLoading = patientLoading || roleLoading || sessionLoading

  if (isLoading) {
    return <PageSkeleton />
  }

  const error = patientError ?? sessionError
  if (error || !patient || !session) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Alert variant="destructive">
          <AlertDescription>
            {error ?? "Dokumentation nicht gefunden."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const typeLabel = session.typ === "training" ? "Trainingsdokumentation" : "Therapeutische Dokumentation"

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Breadcrumb className="mb-6 print:hidden">
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
            <BreadcrumbPage>{typeLabel}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <TrainingsdokuView
        session={session}
        patientId={id}
        patientName={`${patient.vorname} ${patient.nachname}`}
        readOnly={isPraxismanagement}
      />
    </div>
  )
}
