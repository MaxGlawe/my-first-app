"use client"

import { useAppointments, type Appointment } from "@/hooks/use-appointments"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calendar,
  Clock,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  User,
  CheckCircle2,
  XCircle,
} from "lucide-react"

interface TermineTabProps {
  patientId: string
  patientName: string
  bookingSystemId?: string | null
}

function formatDateTime(iso: string): { date: string; time: string } {
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

function formatLastSync(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)

  if (diffMin < 1) return "gerade eben"
  if (diffMin < 60) return `vor ${diffMin} Minuten`
  if (diffH < 24) return `vor ${diffH} Stunden`
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getStatusBadge(status: Appointment["status"]) {
  switch (status) {
    case "scheduled":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Geplant</Badge>
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Abgeschlossen
        </Badge>
      )
    case "cancelled":
      return (
        <Badge variant="secondary" className="text-muted-foreground">
          <XCircle className="mr-1 h-3 w-3" />
          Storniert
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function isUpcoming(iso: string): boolean {
  return new Date(iso) >= new Date()
}

function AppointmentCardSkeleton() {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border">
      <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  )
}

export function TermineTab({
  patientId,
  patientName,
  bookingSystemId,
}: TermineTabProps) {
  const { appointments, isLoading, error, isStale, lastSyncedAt, refresh } =
    useAppointments(patientId)

  const upcoming = appointments.filter(
    (a) => a.status === "scheduled" && isUpcoming(a.scheduled_at)
  )
  const past = appointments.filter(
    (a) => a.status !== "scheduled" || !isUpcoming(a.scheduled_at)
  )

  const bookingToolUrl = process.env.NEXT_PUBLIC_BOOKING_TOOL_URL
  const bookingUrl = bookingToolUrl
    ? bookingSystemId
      ? `${bookingToolUrl}?patient=${encodeURIComponent(patientName)}`
      : `${bookingToolUrl}?name=${encodeURIComponent(patientName)}`
    : null

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Termine</h2>
          {lastSyncedAt && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Zuletzt synchronisiert: {formatLastSync(lastSyncedAt)}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Aktualisieren
          </Button>
          {bookingUrl ? (
            <Button size="sm" asChild>
              <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Termin buchen
              </a>
            </Button>
          ) : (
            <Button size="sm" disabled title="Buchungstool-URL nicht konfiguriert (NEXT_PUBLIC_BOOKING_TOOL_URL)">
              <ExternalLink className="mr-2 h-4 w-4" />
              Termin buchen
            </Button>
          )}
        </div>
      </div>

      {/* Stale data warning */}
      {isStale && !isLoading && (
        <Alert className="border-yellow-200 bg-yellow-50 text-yellow-900">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            Die Termindaten sind älter als 24 Stunden. Das Buchungstool sendet
            Aktualisierungen automatisch per Webhook. Stellen Sie sicher, dass die
            Integration aktiv ist.
          </AlertDescription>
        </Alert>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Booking link info when no booking_system_id */}
      {!bookingSystemId && !isLoading && !error && (
        <Alert className="border-blue-200 bg-blue-50 text-blue-900">
          <AlertDescription>
            Dieser Patient ist noch nicht mit dem Buchungstool verknüpft. Termine
            werden automatisch synchronisiert, sobald der Patient im Buchungstool
            registriert ist.
          </AlertDescription>
        </Alert>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <AppointmentCardSkeleton />
            <AppointmentCardSkeleton />
          </CardContent>
        </Card>
      )}

      {/* Upcoming appointments */}
      {!isLoading && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Kommende Termine
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Keine kommenden Termine vorhanden.
              </p>
            ) : (
              <ul className="space-y-3" aria-label="Kommende Termine">
                {upcoming.map((appt) => {
                  const { date, time } = formatDateTime(appt.scheduled_at)
                  return (
                    <li
                      key={appt.id}
                      className="flex items-start gap-4 p-3 rounded-lg border bg-blue-50/50 hover:bg-blue-50 transition-colors"
                    >
                      <div
                        className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100 text-blue-700 flex-shrink-0"
                        aria-hidden="true"
                      >
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {appt.service_name ?? "Behandlung"}
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
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
                      <div className="flex-shrink-0">{getStatusBadge(appt.status)}</div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* Past appointments */}
      {!isLoading && !error && past.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              Vergangene Termine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3" aria-label="Vergangene Termine">
              {past.map((appt) => {
                const { date, time } = formatDateTime(appt.scheduled_at)
                return (
                  <li
                    key={appt.id}
                    className="flex items-start gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className="flex items-center justify-center h-10 w-10 rounded-lg bg-muted text-muted-foreground flex-shrink-0"
                      aria-hidden="true"
                    >
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-muted-foreground">
                        {appt.service_name ?? "Behandlung"}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
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
                    <div className="flex-shrink-0">{getStatusBadge(appt.status)}</div>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Empty state — no appointments at all and no error */}
      {!isLoading && !error && appointments.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-base">Keine Termine gefunden</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Sobald der Patient Termine im Buchungstool bucht, werden sie hier
              automatisch angezeigt.
            </p>
            {bookingUrl ? (
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ersten Termin buchen
                </a>
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="mt-4" disabled>
                <ExternalLink className="mr-2 h-4 w-4" />
                Ersten Termin buchen
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
