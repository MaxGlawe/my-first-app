"use client"

import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Users } from "lucide-react"
import type { Patient } from "@/types/patient"
import { AmpelDot } from "@/components/ampel/AmpelDashboard"
import { usePatientAmpelStatus } from "@/hooks/use-patient-alerts"

interface PatientTableProps {
  patients: Patient[]
  isLoading: boolean
  error: string | null
}

function getAlter(geburtsdatum: string): string {
  const birth = new Date(geburtsdatum)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return `${age} Jahre`
}

function getInitials(vorname: string, nachname: string): string {
  return `${vorname.charAt(0)}${nachname.charAt(0)}`.toUpperCase()
}

/** Kurzes Datum für den Begleitungs-Badge: 12.10.2026 */
function formatDatum(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function formatGeschlecht(g: Patient["geschlecht"]): string {
  switch (g) {
    case "maennlich":
      return "m"
    case "weiblich":
      return "w"
    case "divers":
      return "d"
    default:
      return "—"
  }
}

export function PatientTable({ patients, isLoading, error }: PatientTableProps) {
  const router = useRouter()
  const { statusMap } = usePatientAmpelStatus()

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-destructive font-medium">{error}</p>
        <p className="text-slate-500 text-sm mt-1">
          Bitte die Seite neu laden.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200/60 overflow-hidden bg-white/80 backdrop-blur-sm shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Alter / Geschlecht</TableHead>
              <TableHead>Krankenkasse</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-9 w-9 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-emerald-100 p-5 mb-4">
          <Users className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="font-semibold text-lg">Keine Patienten gefunden</h3>
        <p className="text-slate-500 text-sm mt-1 max-w-xs">
          Lege einen neuen Patienten an oder passe deine Suche an.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 overflow-hidden bg-white/80 backdrop-blur-sm shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Alter / Geschlecht</TableHead>
            <TableHead>Krankenkasse</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow
              key={patient.id}
              className="cursor-pointer hover:bg-slate-50/80"
              onClick={() => router.push(`/os/patients/${patient.id}`)}
              aria-label={`Patient ${patient.vorname} ${patient.nachname} öffnen`}
            >
              <TableCell>
                <Avatar className="h-9 w-9">
                  {patient.avatar_url && (
                    <AvatarImage
                      src={patient.avatar_url}
                      alt={`${patient.vorname} ${patient.nachname}`}
                    />
                  )}
                  <AvatarFallback className="text-xs font-medium">
                    {getInitials(patient.vorname, patient.nachname)}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {statusMap.has(patient.id) && (
                    <AmpelDot status={statusMap.get(patient.id)!} size="sm" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {patient.nachname}, {patient.vorname}
                      </span>
                      {patient.bgf_organization_name && (
                        <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0 h-5 border-blue-200 bg-blue-50 text-blue-700">
                          {patient.bgf_organization_name}
                        </Badge>
                      )}
                      {patient.begleitung_bis && (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-bold px-1.5 py-0 h-5 border-emerald-200 bg-emerald-50 text-emerald-700"
                          title={`Masterclass-Begleitung bis ${formatDatum(patient.begleitung_bis)}`}
                        >
                          Begleitung bis {formatDatum(patient.begleitung_bis)}
                        </Badge>
                      )}
                    </div>
                    {patient.email && (
                      <div className="text-sm text-slate-500">{patient.email}</div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {getAlter(patient.geburtsdatum)} / {formatGeschlecht(patient.geschlecht)}
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {patient.krankenkasse ?? <span className="text-slate-400">—</span>}
                </span>
              </TableCell>
              <TableCell>
                {patient.archived_at ? (
                  <Badge variant="secondary">Archiviert</Badge>
                ) : (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">Aktiv</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
