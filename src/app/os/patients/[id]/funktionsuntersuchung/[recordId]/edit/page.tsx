"use client"

import { use } from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePatient } from "@/hooks/use-patients"
import { useUserRole } from "@/hooks/use-user-role"
import { FunktionsuntersuchungForm } from "@/components/funktionsuntersuchung/FunktionsuntersuchungForm"
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
import type { FunktionsuntersuchungRecord } from "@/types/funktionsuntersuchung"

interface EditFunktionsuntersuchungPageProps {
  params: Promise<{ id: string; recordId: string }>
}

function PageSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Skeleton className="h-4 w-64 mb-6" />
      <Skeleton className="h-8 w-64 mb-2" />
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

export default function EditFunktionsuntersuchungPage({
  params,
}: EditFunktionsuntersuchungPageProps) {
  const { id, recordId } = use(params)
  const { patient, isLoading: patientLoading, error: patientError } = usePatient(id)
  const { isLoading: roleLoading, isFunktionsRole, isAdmin } = useUserRole()

  const [record, setRecord] = useState<FunktionsuntersuchungRecord | null>(null)
  const [recordLoading, setRecordLoading] = useState(true)
  const [recordError, setRecordError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setRecordLoading(true)

    fetch(`/api/patients/${id}/funktionsuntersuchung/${recordId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Laden fehlgeschlagen")
        return res.json()
      })
      .then((json) => {
        if (!cancelled) setRecord(json.record)
      })
      .catch((err) => {
        if (!cancelled) setRecordError(err.message)
      })
      .finally(() => {
        if (!cancelled) setRecordLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, recordId])

  const isLoading = patientLoading || roleLoading || recordLoading

  if (isLoading) {
    return <PageSkeleton />
  }

  const error = patientError ?? recordError
  if (error || !patient || !record) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Alert variant="destructive">
          <AlertDescription>
            {error ?? "Funktionsuntersuchung nicht gefunden."}
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

  if (record.status === "abgeschlossen") {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Alert variant="destructive">
          <AlertDescription>
            Diese Untersuchung ist bereits abgeschlossen und kann nicht bearbeitet werden.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

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
            <BreadcrumbPage>
              Funktionsuntersuchung V{record.version} bearbeiten
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Funktionsuntersuchung V{record.version} bearbeiten
        </h1>
        <p className="text-muted-foreground mt-1">
          {patient.vorname} {patient.nachname} —{" "}
          {new Date(patient.geburtsdatum).toLocaleDateString("de-DE")}
        </p>
      </div>

      <FunktionsuntersuchungForm
        patientId={id}
        existingData={record.data}
        existingId={record.id}
        existingStatus={record.status}
      />
    </div>
  )
}
