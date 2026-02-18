"use client"

import { use } from "react"
import Link from "next/link"
import { usePatient } from "@/hooks/use-patients"
import { useAnamnesisRecord } from "@/hooks/use-anamnesis"
import { AnamnesisView } from "@/components/anamnesis/AnamnesisView"
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

interface AnamnesisRecordPageProps {
  params: Promise<{ id: string; recordId: string }>
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
        <div className="flex gap-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <Skeleton className="h-px w-full mb-8" />
      <div className="space-y-8">
        {[1, 2, 3, 4, 5].map((i) => (
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

export default function AnamnesisRecordPage({ params }: AnamnesisRecordPageProps) {
  const { id, recordId } = use(params)
  const { patient, isLoading: patientLoading, error: patientError } = usePatient(id)
  const { record, isLoading: recordLoading, error: recordError } = useAnamnesisRecord(id, recordId)

  const isLoading = patientLoading || recordLoading

  if (isLoading) {
    return <PageSkeleton />
  }

  const error = patientError ?? recordError

  if (error || !patient || !record) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Alert variant="destructive">
          <AlertDescription>
            {error ?? "Anamnesebogen nicht gefunden."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Breadcrumb */}
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
            <BreadcrumbPage>Anamnese Version {record.version}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <AnamnesisView
        record={record}
        patientId={id}
        patientName={`${patient.vorname} ${patient.nachname}`}
      />
    </div>
  )
}
