"use client"

import { use } from "react"
import Link from "next/link"
import { usePatient } from "@/hooks/use-patients"
import { useUserRole } from "@/hooks/use-user-role"
import { useDiagnoseRecord } from "@/hooks/use-diagnoses"
import { BefundView } from "@/components/diagnose/BefundView"
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

interface BefundDetailPageProps {
  params: Promise<{ id: string; befundId: string }>
}

function PageSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Skeleton className="h-4 w-72 mb-6" />
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <Skeleton className="h-px w-full mb-6" />
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BefundDetailPage({ params }: BefundDetailPageProps) {
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

  // Frontend guard
  if (!isHeilpraktiker && !isAdmin) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            Zugriff verweigert. Befundberichte dürfen nur von Heilpraktikern eingesehen werden.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (recordError || !record) {
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
              <BreadcrumbPage>Befundbericht</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
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

  // User can edit if they are the creator or an admin, and the record is a draft
  const canEdit =
    isAdmin ||
    (isHeilpraktiker && currentUserId === record.created_by)

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
            <BreadcrumbPage>Befundbericht</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <BefundView
        record={record}
        patientId={id}
        patientName={`${patient.vorname} ${patient.nachname}`}
        canEdit={canEdit}
      />
    </div>
  )
}
