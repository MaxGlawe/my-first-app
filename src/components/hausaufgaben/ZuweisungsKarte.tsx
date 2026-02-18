"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Pencil, Power, ClipboardList, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import type { PatientAssignment, Wochentag } from "@/types/hausaufgaben"

// ── Helpers ───────────────────────────────────────────────────────────────────

const WOCHENTAG_LABELS: Record<Wochentag, string> = {
  mo: "Mo",
  di: "Di",
  mi: "Mi",
  do: "Do",
  fr: "Fr",
  sa: "Sa",
  so: "So",
}

const ALL_DAYS: Wochentag[] = ["mo", "di", "mi", "do", "fr", "sa", "so"]

function formatDate(str: string): string {
  const [y, m, d] = str.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function ComplianceRing({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, Math.round(percent)))
  const color =
    clamped >= 80
      ? "text-green-600"
      : clamped >= 50
      ? "text-yellow-600"
      : "text-red-500"

  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[52px]">
      <div
        className={`text-lg font-bold leading-none ${color}`}
        aria-label={`Compliance: ${clamped}%`}
      >
        {clamped}%
      </div>
      <div className="text-[10px] text-muted-foreground leading-none">7 Tage</div>
      <Progress
        value={clamped}
        className="h-1.5 w-12 mt-1"
        aria-hidden="true"
      />
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ZuweisungsKarteProps {
  assignment: PatientAssignment
  patientId: string
  isArchived?: boolean
  onEdit?: (assignment: PatientAssignment) => void
  onDeactivated?: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ZuweisungsKarte({
  assignment,
  patientId,
  isArchived = false,
  onEdit,
  onDeactivated,
}: ZuweisungsKarteProps) {
  const [isDeactivating, setIsDeactivating] = useState(false)

  const isAdHoc = !assignment.plan_id
  const complianceValue = assignment.compliance_7days ?? 0

  async function handleDeactivate() {
    setIsDeactivating(true)
    try {
      const res = await fetch(
        `/api/patients/${patientId}/assignments/${assignment.id}`,
        { method: "DELETE" }
      )
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json.error ?? "Zuweisung konnte nicht deaktiviert werden.")
        return
      }
      toast.success("Zuweisung deaktiviert.")
      onDeactivated?.()
    } catch {
      toast.error("Ein unerwarteter Fehler ist aufgetreten.")
    } finally {
      setIsDeactivating(false)
    }
  }

  return (
    <Card
      className={`transition-opacity ${
        isArchived ? "opacity-60 bg-muted/30" : ""
      }`}
    >
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-start justify-between gap-3">
          {/* Plan info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {isAdHoc ? (
                <ClipboardList className="h-4 w-4 text-purple-500 shrink-0" />
              ) : (
                <ClipboardList className="h-4 w-4 text-blue-500 shrink-0" />
              )}
              <h4 className="font-semibold text-sm truncate">
                {assignment.plan_name ?? (isAdHoc ? "Ad-hoc Übungen" : "Trainingsplan")}
              </h4>
              {isAdHoc && (
                <Badge variant="secondary" className="text-xs">
                  Ad-hoc
                </Badge>
              )}
              {assignment.status === "abgelaufen" && (
                <Badge variant="secondary" className="text-xs text-muted-foreground">
                  Abgelaufen
                </Badge>
              )}
              {assignment.status === "deaktiviert" && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Deaktiviert
                </Badge>
              )}
            </div>

            {assignment.plan_beschreibung && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {assignment.plan_beschreibung}
              </p>
            )}
          </div>

          {/* Compliance Ring (only for active) */}
          {!isArchived && (
            <ComplianceRing percent={complianceValue} />
          )}
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3">
        {/* Zeitraum */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {formatDate(assignment.start_date)}
          </span>
          <span>–</span>
          <span className="font-medium text-foreground">
            {formatDate(assignment.end_date)}
          </span>
        </div>

        {/* Wochentage Badges */}
        <div className="flex gap-1 flex-wrap" aria-label="Trainingstage">
          {ALL_DAYS.map((day) => {
            const isActive = assignment.active_days.includes(day)
            return (
              <span
                key={day}
                className={`px-1.5 py-0.5 text-[11px] font-medium rounded border ${
                  isActive
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-muted/40 border-muted text-muted-foreground"
                }`}
                aria-label={`${WOCHENTAG_LABELS[day]}: ${isActive ? "Trainingstag" : "kein Training"}`}
              >
                {WOCHENTAG_LABELS[day]}
              </span>
            )
          })}
        </div>

        {/* Notiz */}
        {assignment.notiz && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2">
            <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <p className="line-clamp-3">{assignment.notiz}</p>
          </div>
        )}

        {/* Completion stats */}
        {!isArchived && assignment.completion_count !== undefined && (
          <p className="text-xs text-muted-foreground">
            {assignment.completion_count ?? 0} von{" "}
            {assignment.expected_count ?? "?"} Einheiten erledigt
          </p>
        )}

        {/* Actions (only for active) */}
        {!isArchived && (
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={() => onEdit?.(assignment)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Bearbeiten
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1.5 text-muted-foreground"
                  disabled={isDeactivating}
                >
                  <Power className="h-3.5 w-3.5" />
                  Deaktivieren
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Zuweisung deaktivieren?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Die Zuweisung von{" "}
                    <strong>
                      {assignment.plan_name ?? "diesem Plan"}
                    </strong>{" "}
                    wird vorzeitig beendet. Der Patient kann keine neuen
                    Einheiten mehr abhaken. Die bisherigen Daten bleiben erhalten.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeactivate}>
                    Deaktivieren
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
