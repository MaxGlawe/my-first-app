"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Plus, ClipboardList, ChevronDown, ChevronRight, RefreshCw } from "lucide-react"
import { useAssignments } from "@/hooks/use-assignments"
import { ZuweisungsKarte } from "./ZuweisungsKarte"
import { ZuweisungsDialog } from "./ZuweisungsDialog"
import type { PatientAssignment } from "@/types/hausaufgaben"

// ── Skeleton ──────────────────────────────────────────────────────────────────

function AssignmentSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-10 w-12 rounded" />
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-7 rounded" />
        ))}
      </div>
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-blue-100 p-4 mb-4">
          <ClipboardList className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="font-semibold text-base">Noch keine Hausaufgaben zugewiesen</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Weise diesem Patienten einen Trainingsplan oder einzelne Übungen als Hausaufgabe zu.
        </p>
        <Button className="mt-6" onClick={onNew}>
          <Plus className="mr-2 h-4 w-4" />
          Erste Hausaufgabe zuweisen
        </Button>
      </CardContent>
    </Card>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface HausaufgabenTabProps {
  patientId: string
}

// ── HausaufgabenTab ───────────────────────────────────────────────────────────

export function HausaufgabenTab({ patientId }: HausaufgabenTabProps) {
  const { assignments, isLoading, error, refresh } = useAssignments(patientId)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editAssignment, setEditAssignment] = useState<PatientAssignment | null>(null)
  const [archivedOpen, setArchivedOpen] = useState(false)

  const activeAssignments = assignments.filter((a) => a.status === "aktiv")
  const archivedAssignments = assignments.filter(
    (a) => a.status === "abgelaufen" || a.status === "deaktiviert"
  )

  function handleNew() {
    setEditAssignment(null)
    setDialogOpen(true)
  }

  function handleEdit(assignment: PatientAssignment) {
    setEditAssignment(assignment)
    setDialogOpen(true)
  }

  function handleDialogSuccess() {
    refresh()
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-48" />
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <AssignmentSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Erneut versuchen
        </Button>
      </div>
    )
  }

  // ── Empty ────────────────────────────────────────────────────────────────────
  if (assignments.length === 0) {
    return (
      <>
        <EmptyState onNew={handleNew} />
        <ZuweisungsDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          patientId={patientId}
          editAssignment={null}
          onSuccess={handleDialogSuccess}
        />
      </>
    )
  }

  // ── Content ──────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-semibold">Hausaufgaben</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeAssignments.length} aktiv
              {archivedAssignments.length > 0 &&
                `, ${archivedAssignments.length} archiviert`}
            </p>
          </div>
          <Button size="sm" onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Neue Zuweisung
          </Button>
        </div>

        {/* Aktive Zuweisungen */}
        {activeAssignments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Keine aktiven Hausaufgaben.
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={handleNew}>
                <Plus className="mr-2 h-4 w-4" />
                Hausaufgabe zuweisen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-muted-foreground">Aktiv</h4>
              <Badge variant="secondary" className="text-xs">
                {activeAssignments.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {activeAssignments.map((assignment) => (
                <ZuweisungsKarte
                  key={assignment.id}
                  assignment={assignment}
                  patientId={patientId}
                  isArchived={false}
                  onEdit={handleEdit}
                  onDeactivated={refresh}
                />
              ))}
            </div>
          </div>
        )}

        {/* Archivierte Zuweisungen */}
        {archivedAssignments.length > 0 && (
          <Collapsible open={archivedOpen} onOpenChange={setArchivedOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-left"
                aria-expanded={archivedOpen}
              >
                {archivedOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
                <span className="font-medium">Archiviert</span>
                <Badge variant="outline" className="text-xs ml-1">
                  {archivedAssignments.length}
                </Badge>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3">
              {archivedAssignments.map((assignment) => (
                <ZuweisungsKarte
                  key={assignment.id}
                  assignment={assignment}
                  patientId={patientId}
                  isArchived={true}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      <ZuweisungsDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditAssignment(null)
        }}
        patientId={patientId}
        editAssignment={editAssignment}
        onSuccess={handleDialogSuccess}
      />
    </>
  )
}
