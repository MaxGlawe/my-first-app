"use client"

import { useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useCourse } from "@/hooks/use-course"
import { useCourseEnrollments } from "@/hooks/use-course-enrollments"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, UserPlus } from "lucide-react"
import { ParticipantTable } from "@/components/courses/ParticipantTable"
import { EnrollPatientDialog } from "@/components/courses/EnrollPatientDialog"
import { InviteLinkCard } from "@/components/courses/InviteLinkCard"

export default function CourseParticipantsPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()

  const { course, isLoading: courseLoading } = useCourse(id)
  const { enrollments, isLoading: enrollmentsLoading, refresh } = useCourseEnrollments(id)

  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const [inviteEnabled, setInviteEnabled] = useState(false)

  // Sync invite state from course
  const effectiveInviteToken = inviteToken ?? course?.invite_token ?? null
  const effectiveInviteEnabled = inviteToken !== null ? inviteEnabled : (course?.invite_enabled ?? false)

  const handleEnroll = useCallback(async (patientId: string) => {
    if (!id) return

    setIsEnrolling(true)
    try {
      const res = await fetch(`/api/courses/${id}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Einschreibung fehlgeschlagen.")
      }

      toast({ title: "Patient eingeschrieben" })
      setEnrollDialogOpen(false)
      refresh()
    } catch (err) {
      toast({
        title: "Fehler",
        description: err instanceof Error ? err.message : "Einschreibung fehlgeschlagen.",
        variant: "destructive",
      })
    } finally {
      setIsEnrolling(false)
    }
  }, [id, toast, refresh])

  const handleStatusChange = useCallback(async (
    enrollmentId: string,
    status: "aktiv" | "abgeschlossen" | "abgebrochen"
  ) => {
    try {
      const res = await fetch(`/api/courses/${id}/enrollments/${enrollmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Status konnte nicht geändert werden.")
      }

      refresh()
      toast({ title: "Status aktualisiert" })
    } catch (err) {
      toast({
        title: "Fehler",
        description: err instanceof Error ? err.message : "Status konnte nicht geändert werden.",
        variant: "destructive",
      })
    }
  }, [id, refresh, toast])

  if (courseLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/os/courses/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Teilnehmer</h1>
          <p className="text-muted-foreground">{course?.name ?? "Kurs"}</p>
        </div>
        <Button onClick={() => setEnrollDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Patient einschreiben
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table */}
        <div className="lg:col-span-2">
          <ParticipantTable
            enrollments={enrollments}
            isLoading={enrollmentsLoading}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* Sidebar: Invite link */}
        <div>
          <InviteLinkCard
            courseId={id}
            inviteToken={effectiveInviteToken}
            inviteEnabled={effectiveInviteEnabled}
            onUpdate={(token, enabled) => {
              setInviteToken(token)
              setInviteEnabled(enabled)
            }}
          />
        </div>
      </div>

      <EnrollPatientDialog
        open={enrollDialogOpen}
        onOpenChange={setEnrollDialogOpen}
        onEnroll={handleEnroll}
        isEnrolling={isEnrolling}
      />
    </div>
  )
}
