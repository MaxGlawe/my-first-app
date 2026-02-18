"use client"

import { use } from "react"
import Link from "next/link"
import { usePatient } from "@/hooks/use-patients"
import { useUserRole } from "@/hooks/use-user-role"
import { useDiagnoseRecord } from "@/hooks/use-diagnoses"
import { BefundEditForm } from "@/components/diagnose/BefundEditForm"
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
import { ShieldAlert } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react"

interface BefundEditPageProps {
  params: Promise<{ id: string; befundId: string }>
}

function PageSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Skeleton className="h-4 w-72 mb-6" />
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-48 mb-8" />
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
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

export default function BefundEditPage({ params }: BefundEditPageProps) {
  const { id, befundId } = use(params)

  const { patient, isLoading: patientLoading, error: patientError } = usePatient(id)
  const { isLoading: roleLoading, isHeilpraktiker, isAdmin } = useUserRole()
  const { record, isLoading: recordLoading, error: recordError } = useDiagnoseRecord(id, befundId)

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null)
    })
  }, [])

  const isLoading = patientLoading || roleLoading || recordLoading

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

  // Frontend guard: only Heilpraktiker and Admin
  if (!isHeilpraktiker && !isAdmin) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            Zugriff verweigert. Befundberichte dürfen nur von Heilpraktikern bearbeitet werden.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (recordError || !record) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Alert variant="destructive">
          <AlertDescription>
            {recordError ?? "Befundbericht nicht gefunden."}
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`/os/patients/${id}`}>Zurück zur Patientenakte</Link>
        </Button>
      </div>
    )
  }

  // Guard: only drafts can be edited
  if (record.status === "abgeschlossen") {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Alert>
          <AlertDescription>
            Dieser Befundbericht ist abgeschlossen und kann nicht mehr bearbeitet werden.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`/os/patients/${id}/befund/${befundId}`}>
            Befund anzeigen
          </Link>
        </Button>
      </div>
    )
  }

  // Guard: only creator or admin can edit
  const canEdit = isAdmin || (isHeilpraktiker && currentUserId === record.created_by)

  if (!canEdit) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            Nur der Ersteller oder ein Admin darf diesen Befundbericht bearbeiten.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`/os/patients/${id}/befund/${befundId}`}>
            Befund anzeigen
          </Link>
        </Button>
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
            <BreadcrumbLink asChild>
              <Link href={`/os/patients/${id}/befund/${befundId}`}>
                Befundbericht
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Bearbeiten</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Befundbericht bearbeiten</h1>
        <p className="text-muted-foreground mt-1">
          Patient: {patient.vorname} {patient.nachname}
        </p>
      </div>

      <BefundEditForm record={record} patientId={id} />
    </div>
  )
}
