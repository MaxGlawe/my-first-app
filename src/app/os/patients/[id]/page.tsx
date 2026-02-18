"use client"

import { use } from "react"
import { useSearchParams } from "next/navigation"
import { usePatient } from "@/hooks/use-patients"
import { useUserRole } from "@/hooks/use-user-role"
import { PatientDetailHeader } from "@/components/patients/PatientDetailHeader"
import { StammdatenTab } from "@/components/patients/StammdatenTab"
import { PlaceholderTab } from "@/components/patients/PlaceholderTab"
import { AnamnesisTab } from "@/components/anamnesis/AnamnesisTab"
import { BefundTab } from "@/components/diagnose/BefundTab"
import { BehandlungTab } from "@/components/behandlung/BehandlungTab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PatientDetailPageProps {
  params: Promise<{ id: string }>
}

function PatientDetailSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Skeleton className="h-4 w-32 mb-6" />
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-10 w-full mb-6" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const { patient, isLoading: patientLoading, error, refresh } = usePatient(id)
  const { isLoading: roleLoading, isHeilpraktiker, isAdmin } = useUserRole()

  const isLoading = patientLoading || roleLoading
  const canSeeBefund = isHeilpraktiker || isAdmin

  if (isLoading) {
    return <PatientDetailSkeleton />
  }

  if (error || !patient) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <Alert variant="destructive">
          <AlertDescription>
            {error ?? "Patient nicht gefunden."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <PatientDetailHeader patient={patient} onRefresh={refresh} />

      <Tabs defaultValue={searchParams.get("tab") ?? "stammdaten"} className="mt-2">
        <TabsList className="mb-6">
          <TabsTrigger value="stammdaten">Stammdaten</TabsTrigger>
          <TabsTrigger value="termine">Termine</TabsTrigger>
          <TabsTrigger value="dokumentation">Dokumentation</TabsTrigger>
          <TabsTrigger value="behandlungen">Behandlungen</TabsTrigger>
          {canSeeBefund && (
            <TabsTrigger value="befund">Befund & Diagnose</TabsTrigger>
          )}
          <TabsTrigger value="trainingsplaene">Trainingspläne</TabsTrigger>
        </TabsList>

        <TabsContent value="stammdaten">
          <StammdatenTab patient={patient} onRefresh={refresh} />
        </TabsContent>

        <TabsContent value="termine">
          <PlaceholderTab
            title="Terminhistorie"
            description="Vergangene und zukünftige Termine des Patienten werden hier nach der Buchungstool-Integration angezeigt."
            projId="PROJ-7 — Buchungstool-Integration"
          />
        </TabsContent>

        <TabsContent value="dokumentation">
          <AnamnesisTab patientId={patient.id} />
        </TabsContent>

        <TabsContent value="behandlungen">
          <BehandlungTab patientId={patient.id} />
        </TabsContent>

        {canSeeBefund && (
          <TabsContent value="befund">
            <BefundTab patientId={patient.id} />
          </TabsContent>
        )}

        <TabsContent value="trainingsplaene">
          <PlaceholderTab
            title="Trainingspläne"
            description="Zugewiesene Trainingspläne und Hausaufgaben des Patienten werden hier nach Implementierung des Trainingsplan-Builders angezeigt."
            projId="PROJ-9, PROJ-10"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
