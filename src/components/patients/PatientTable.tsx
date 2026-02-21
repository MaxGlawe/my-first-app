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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-destructive font-medium">{error}</p>
        <p className="text-muted-foreground text-sm mt-1">
          Bitte die Seite neu laden.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
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
        <div className="rounded-full bg-muted p-5 mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg">Keine Patienten gefunden</h3>
        <p className="text-muted-foreground text-sm mt-1 max-w-xs">
          Lege einen neuen Patienten an oder passe deine Suche an.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
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
              className="cursor-pointer hover:bg-muted/50"
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
                <div className="font-medium">
                  {patient.nachname}, {patient.vorname}
                </div>
                {patient.email && (
                  <div className="text-sm text-muted-foreground">{patient.email}</div>
                )}
              </TableCell>
              <TableCell>
                {getAlter(patient.geburtsdatum)} / {formatGeschlecht(patient.geschlecht)}
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {patient.krankenkasse ?? <span className="text-muted-foreground">—</span>}
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
