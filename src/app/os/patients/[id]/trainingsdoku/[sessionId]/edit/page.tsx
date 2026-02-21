"use client"

import { use } from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePatient } from "@/hooks/use-patients"
import { useUserRole } from "@/hooks/use-user-role"
import { TrainingsdokuForm } from "@/components/trainingsdoku/TrainingsdokuForm"
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

interface EditTrainingsdokuPageProps {
  params: Promise<{ id: string; sessionId: string }>
}

function PageSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Skeleton className="h-4 w-64 mb-6" />
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-48 mb-10" />
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
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

export default function EditTrainingsdokuPage({ params }: EditTrainingsdokuPageProps) {
  const { id, sessionId } = use(params)
  const { patient, isLoading: patientLoading, error: patientError } = usePatient(id)
  const { isLoading: roleLoading, isFunktionsRole, isAdmin } = useUserRole()

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

  if (!isFunktionsRole && !isAdmin) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Alert variant="destructive">
          <AlertDescription>Zugriff verweigert.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (session.status === "abgeschlossen") {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Alert variant="destructive">
          <AlertDescription>
            Diese Dokumentation ist bereits abgeschlossen und kann nicht bearbeitet werden.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const typeLabel =
    session.typ === "training" ? "Trainingsdokumentation" : "Therapeutische Dokumentation"

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
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
            <BreadcrumbPage>{typeLabel} bearbeiten</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{typeLabel} bearbeiten</h1>
        <p className="text-muted-foreground mt-1">
          {patient.vorname} {patient.nachname} —{" "}
          {new Date(patient.geburtsdatum).toLocaleDateString("de-DE")}
        </p>
      </div>

      <TrainingsdokuForm
        patientId={id}
        existingId={session.id}
        existingTyp={session.typ}
        existingSessionDate={session.session_date}
        existingDuration={session.duration_minutes}
        existingData={session.data}
        existingStatus={session.status}
      />
    </div>
  )
}
