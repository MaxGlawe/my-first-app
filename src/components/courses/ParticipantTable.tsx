"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, UserX, CheckCircle2, RotateCcw } from "lucide-react"
import { ENROLLMENT_STATUS_LABELS } from "@/types/course"
import type { CourseEnrollment } from "@/types/course"

interface ParticipantTableProps {
  enrollments: CourseEnrollment[]
  isLoading: boolean
  onStatusChange: (enrollmentId: string, status: "aktiv" | "abgeschlossen" | "abgebrochen") => void
}

const statusColors: Record<string, string> = {
  aktiv: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  abgeschlossen: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  abgebrochen: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
}

export function ParticipantTable({ enrollments, isLoading, onStatusChange }: ParticipantTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (enrollments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Noch keine Teilnehmer eingeschrieben.
      </p>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Fortschritt</TableHead>
            <TableHead>Eingeschrieben am</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment) => {
            const date = new Date(enrollment.enrolled_at).toLocaleDateString("de-DE")
            return (
              <TableRow key={enrollment.id}>
                <TableCell className="font-medium">
                  {enrollment.patient_name ?? "Unbekannt"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusColors[enrollment.status] ?? ""}>
                    {ENROLLMENT_STATUS_LABELS[enrollment.status]}
                  </Badge>
                </TableCell>
                <TableCell>v{enrollment.enrolled_version}</TableCell>
                <TableCell>
                  {enrollment.completed_lessons ?? 0} Lektionen
                </TableCell>
                <TableCell>{date}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {enrollment.status !== "abgeschlossen" && (
                        <DropdownMenuItem
                          onClick={() => onStatusChange(enrollment.id, "abgeschlossen")}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Als abgeschlossen markieren
                        </DropdownMenuItem>
                      )}
                      {enrollment.status === "aktiv" && (
                        <DropdownMenuItem
                          onClick={() => onStatusChange(enrollment.id, "abgebrochen")}
                          className="text-destructive focus:text-destructive"
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Abbrechen
                        </DropdownMenuItem>
                      )}
                      {enrollment.status !== "aktiv" && (
                        <DropdownMenuItem
                          onClick={() => onStatusChange(enrollment.id, "aktiv")}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Reaktivieren
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
