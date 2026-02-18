"use client"

// PROJ-7 BUG-4: Patient-facing appointments card for /app/dashboard

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, User, AlertTriangle } from "lucide-react"

interface Appointment {
  id: string
  scheduled_at: string
  duration_minutes: number
  therapist_name: string | null
  service_name: string | null
  status: "scheduled" | "cancelled" | "completed"
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString("de-DE", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
  }
}

export function MeineTermineKarte() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [linked, setLinked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/me/appointments")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setAppointments(data.appointments ?? [])
          setLinked(data.linked ?? false)
        }
      })
      .catch(() => setError("Termine konnten nicht geladen werden."))
      .finally(() => setIsLoading(false))
  }, [])

  const upcoming = appointments.filter(
    (a) => a.status === "scheduled" && new Date(a.scheduled_at) >= new Date()
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meine Termine</CardTitle>
        <CardDescription>Nächste Termine in der Praxis</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        )}

        {!isLoading && error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && !linked && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Noch keine Terminverknüpfung vorhanden.
          </p>
        )}

        {!isLoading && !error && linked && upcoming.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Keine kommenden Termine.
          </p>
        )}

        {!isLoading && !error && upcoming.length > 0 && (
          <ul className="space-y-3">
            {upcoming.slice(0, 3).map((appt) => {
              const { date, time } = formatDateTime(appt.scheduled_at)
              return (
                <li key={appt.id} className="flex items-start gap-3 p-3 rounded-lg border bg-blue-50/50">
                  <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {appt.service_name ?? "Behandlung"}
                    </p>
                    <div className="flex flex-wrap gap-x-3 mt-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {time} ({appt.duration_minutes} Min.)
                      </span>
                      {appt.therapist_name && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {appt.therapist_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs shrink-0">
                    Geplant
                  </Badge>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
