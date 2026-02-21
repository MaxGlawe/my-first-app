"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ClipboardList, RefreshCw, CheckCircle2, XCircle, BookOpen } from "lucide-react"
import { useComplianceDashboard } from "@/hooks/use-assignments"
import type { PatientComplianceRow } from "@/types/hausaufgaben"

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function formatTodayHeader(): string {
  return new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="border border-slate-200 rounded-2xl bg-white shadow-sm">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b last:border-0">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-5 w-10 ml-auto" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Compliance Bar ─────────────────────────────────────────────────────────────

function ComplianceBar({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)))
  const color =
    clamped >= 80
      ? "text-green-600"
      : clamped >= 50
      ? "text-yellow-600"
      : "text-red-500"

  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <Progress value={clamped} className="h-2 flex-1" aria-hidden="true" />
      <span className={`text-xs font-semibold tabular-nums ${color}`}>
        {clamped}%
      </span>
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

type FilterMode = "alle" | "aktiv"

// ── Component ─────────────────────────────────────────────────────────────────

export function KomplianzDashboard() {
  const { rows, isLoading, error, refresh } = useComplianceDashboard()
  const [filter, setFilter] = useState<FilterMode>("aktiv")

  const filteredRows: PatientComplianceRow[] =
    filter === "aktiv"
      ? rows.filter((r) => r.active_plans_count > 0)
      : rows

  if (isLoading) return <DashboardSkeleton />

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hausaufgaben-Compliance</h1>
            <p className="text-sm text-slate-500 mt-0.5">{formatTodayHeader()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={filter}
            onValueChange={(v) => setFilter(v as FilterMode)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aktiv">Nur mit aktivem Plan</SelectItem>
              <SelectItem value="alle">Alle Patienten</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={refresh} aria-label="Aktualisieren">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {filteredRows.length === 0 ? (
        <Card className="border-dashed rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-blue-100 p-4 mb-4">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-base">
              {filter === "aktiv"
                ? "Keine Patienten mit aktivem Hausaufgaben-Plan"
                : "Keine Patienten vorhanden"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              {filter === "aktiv"
                ? "Wechsle zu \"Alle Patienten\" um alle anzuzeigen, oder weise einem Patienten einen Plan zu."
                : "Sobald du Patienten anlegen und Hausaufgaben zuweisen, erscheinen diese hier."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead className="text-center">Aktive Pläne</TableHead>
                <TableHead className="text-center">Heute trainiert?</TableHead>
                <TableHead>7-Tage Compliance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow key={row.patient_id} className="hover:bg-muted/50">
                  <TableCell>
                    <Link
                      href={`/os/patients/${row.patient_id}?tab=hausaufgaben`}
                      className="flex items-center gap-3 hover:underline group"
                    >
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="text-xs font-semibold">
                          {getInitials(row.patient_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm group-hover:text-primary transition-colors">
                        {row.patient_name}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="tabular-nums">
                      {row.active_plans_count}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {row.trained_today ? (
                      <div className="flex items-center justify-center gap-1.5 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xs font-medium">Ja</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                        <XCircle className="h-4 w-4" />
                        <span className="text-xs font-medium">Nein</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <ComplianceBar value={row.compliance_7days} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Summary */}
      {filteredRows.length > 0 && (
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>
            <strong className="text-foreground">{filteredRows.length}</strong> Patient
            {filteredRows.length !== 1 ? "en" : ""}
          </span>
          <span>
            <strong className="text-green-600">
              {filteredRows.filter((r) => r.trained_today).length}
            </strong>{" "}
            heute trainiert
          </span>
          <span>
            Ø Compliance:{" "}
            <strong className="text-foreground">
              {filteredRows.length > 0
                ? Math.round(
                    filteredRows.reduce((sum, r) => sum + r.compliance_7days, 0) /
                      filteredRows.length
                  )
                : 0}
              %
            </strong>
          </span>
        </div>
      )}
    </div>
  )
}
