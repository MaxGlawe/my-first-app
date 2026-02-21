"use client"

import { use } from "react"
import { useSearchParams } from "next/navigation"
import { usePatient } from "@/hooks/use-patients"
import { useUserRole } from "@/hooks/use-user-role"
import { PatientDetailHeader } from "@/components/patients/PatientDetailHeader"
import { StammdatenTab } from "@/components/patients/StammdatenTab"
import { PlaceholderTab } from "@/components/patients/PlaceholderTab"
import { TermineTab } from "@/components/patients/TermineTab"
import { AnamnesisTab } from "@/components/anamnesis/AnamnesisTab"
import { BefundTab } from "@/components/diagnose/BefundTab"
import { BehandlungTab } from "@/components/behandlung/BehandlungTab"
import { BerichteTab } from "@/components/arztbericht/BerichteTab"
import { HausaufgabenTab } from "@/components/hausaufgaben/HausaufgabenTab"
import { ChatTab } from "@/components/chat/ChatTab"
import { FunktionsuntersuchungTab } from "@/components/funktionsuntersuchung/FunktionsuntersuchungTab"
import { TrainingsdokuTab } from "@/components/trainingsdoku/TrainingsdokuTab"
import { BefindlichkeitTab } from "@/components/befindlichkeit/BefindlichkeitTab"
import { EdukationTab } from "@/components/education/EdukationTab"
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
  const {
    isLoading: roleLoading,
    isHeilpraktiker,
    isAdmin,
    isTrainer,
    isPraxismanagement,
    isFunktionsRole,
  } = useUserRole()

  const isLoading = patientLoading || roleLoading

  // Clinical roles (HP, Physio, Admin) see Befund tab
  const canSeeBefund = isHeilpraktiker || isAdmin
  // Trainer roles see Funktionsuntersuchung + Trainingsdoku instead of clinical tabs
  const isClinicalRole = isHeilpraktiker || isAdmin || (!isTrainer && !isPraxismanagement)
  // Praxismanagement sees everything read-only
  const readOnly = isPraxismanagement

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
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="stammdaten">Stammdaten</TabsTrigger>
          <TabsTrigger value="termine">Termine</TabsTrigger>

          {/* Clinical roles: Anamnese + Dokumentation + Befund */}
          {(isClinicalRole || readOnly) && (
            <>
              <TabsTrigger value="dokumentation">Anamnese/Untersuchung</TabsTrigger>
              <TabsTrigger value="behandlungen">Dokumentation</TabsTrigger>
            </>
          )}
          {(canSeeBefund || readOnly) && (
            <TabsTrigger value="befund">Befund</TabsTrigger>
          )}

          {/* Trainer roles: Funktionsuntersuchung + Trainingsdoku */}
          {(isFunktionsRole || readOnly) && (
            <>
              <TabsTrigger value="funktionsuntersuchung">Funktionsuntersuchung</TabsTrigger>
              <TabsTrigger value="trainingsdoku">Trainingsdoku</TabsTrigger>
            </>
          )}

          <TabsTrigger value="berichte">Berichte</TabsTrigger>

          {/* Therapy tools tabs — hidden for praxismanagement (no access) */}
          {!isPraxismanagement && (
            <>
              <TabsTrigger value="trainingsplaene">Trainingspläne</TabsTrigger>
              <TabsTrigger value="hausaufgaben">Hausaufgaben</TabsTrigger>
            </>
          )}

          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="befindlichkeit">Befindlichkeit</TabsTrigger>
          <TabsTrigger value="edukation">Edukation</TabsTrigger>
        </TabsList>

        <TabsContent value="stammdaten">
          <StammdatenTab patient={patient} onRefresh={refresh} hideInterneNotizen={isPraxismanagement} />
        </TabsContent>

        <TabsContent value="termine">
          <TermineTab
            patientId={patient.id}
            patientName={`${patient.vorname} ${patient.nachname}`}
            bookingSystemId={patient.booking_system_id}
          />
        </TabsContent>

        {/* Clinical tabs */}
        {(isClinicalRole || readOnly) && (
          <>
            <TabsContent value="dokumentation">
              <AnamnesisTab patientId={patient.id} />
            </TabsContent>
            <TabsContent value="behandlungen">
              <BehandlungTab patientId={patient.id} />
            </TabsContent>
          </>
        )}
        {(canSeeBefund || readOnly) && (
          <TabsContent value="befund">
            <BefundTab patientId={patient.id} />
          </TabsContent>
        )}

        {/* Trainer/Funktions tabs */}
        {(isFunktionsRole || readOnly) && (
          <>
            <TabsContent value="funktionsuntersuchung">
              <FunktionsuntersuchungTab patientId={patient.id} readOnly={readOnly} />
            </TabsContent>
            <TabsContent value="trainingsdoku">
              <TrainingsdokuTab patientId={patient.id} readOnly={readOnly} />
            </TabsContent>
          </>
        )}

        <TabsContent value="berichte">
          <BerichteTab patientId={patient.id} />
        </TabsContent>

        {!isPraxismanagement && (
          <>
            <TabsContent value="trainingsplaene">
              <PlaceholderTab
                title="Trainingspläne"
                description="Trainingspläne des Patienten — über den Hausaufgaben-Tab zuweisen."
                projId="PROJ-9"
              />
            </TabsContent>
            <TabsContent value="hausaufgaben">
              <HausaufgabenTab patientId={patient.id} />
            </TabsContent>
          </>
        )}

        <TabsContent value="chat">
          <ChatTab patientId={patient.id} isArchived={!!patient.archived_at} />
        </TabsContent>

        <TabsContent value="befindlichkeit">
          <BefindlichkeitTab patientId={patient.id} />
        </TabsContent>

        <TabsContent value="edukation">
          <EdukationTab patientId={patient.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
