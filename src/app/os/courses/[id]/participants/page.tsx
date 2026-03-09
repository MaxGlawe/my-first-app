"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useCourse } from "@/hooks/use-course"
import { useCourseEnrollments } from "@/hooks/use-course-enrollments"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, UserPlus, Search, Loader2 } from "lucide-react"
import { ParticipantTable } from "@/components/courses/ParticipantTable"
import { InviteLinkCard } from "@/components/courses/InviteLinkCard"

// ── Inline patient list (replaces EnrollPatientDialog for reliability) ───────
function InlinePatientList({ onEnroll, isEnrolling, onClose }: {
  onEnroll: (patientId: string) => void
  isEnrolling: boolean
  onClose: () => void
}) {
  const [search, setSearch] = useState("")
  const [patients, setPatients] = useState<{ id: string; first_name: string; last_name: string; email: string | null }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    const params = new URLSearchParams({ pageSize: "50" })
    if (search.trim()) params.set("search", search.trim())

    fetch(`/api/patients?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((json) => { if (!cancelled) setPatients(json.patients ?? []) })
      .catch(() => { if (!cancelled) setPatients([]) })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [search])

  return (
    <>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          placeholder="Patient suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          autoFocus
        />
      </div>
      <div className="max-h-[50vh] overflow-y-auto space-y-1">
        {isLoading && <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>}
        {!isLoading && patients.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">Keine Patienten gefunden.</p>
        )}
        {!isLoading && patients.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50">
            <div>
              <p className="text-sm font-medium">{p.first_name} {p.last_name}</p>
              {p.email && <p className="text-xs text-slate-500">{p.email}</p>}
            </div>
            <Button size="sm" variant="outline" onClick={() => onEnroll(p.id)} disabled={isEnrolling}>
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Einschreiben
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="ghost" size="sm" onClick={onClose}>Schließen</Button>
      </div>
    </>
  )
}

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

  const [enrollError, setEnrollError] = useState<string | null>(null)

  const handleEnroll = useCallback(async (patientId: string) => {
    if (!id) return

    setIsEnrolling(true)
    setEnrollError(null)
    try {
      const res = await fetch(`/api/courses/${id}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId }),
      })

      const body = await res.json().catch(() => ({}))

      if (!res.ok) {
        const msg = body.error ?? `Einschreibung fehlgeschlagen (Status ${res.status}).`
        setEnrollError(msg)
        return
      }

      alert("Patient erfolgreich eingeschrieben!")
      setEnrollDialogOpen(false)
      refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Netzwerkfehler bei Einschreibung."
      setEnrollError(msg)
    } finally {
      setIsEnrolling(false)
    }
  }, [id, refresh])

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
      {/* Hero header */}
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 border border-emerald-100/60 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href={`/os/courses/${id}`}>
            <Button variant="ghost" size="icon" className="bg-white/80 border border-slate-200/60">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">Teilnehmer</h1>
            <p className="text-sm text-slate-500 mt-0.5">{course?.name ?? "Kurs"}</p>
          </div>
          <Button onClick={() => setEnrollDialogOpen(true)} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Patient einschreiben
          </Button>
        </div>
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

      {/* DEBUG: Inline patient enrollment instead of dialog */}
      {enrollDialogOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center" onClick={() => setEnrollDialogOpen(false)}>
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-2">Patient einschreiben</h2>
            <p className="text-sm text-muted-foreground mb-4">Wähle einen Patienten aus.</p>
            {enrollError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <strong>Fehler:</strong> {enrollError}
              </div>
            )}
            <InlinePatientList onEnroll={handleEnroll} isEnrolling={isEnrolling} onClose={() => setEnrollDialogOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
