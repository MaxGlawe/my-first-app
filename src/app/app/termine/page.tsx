"use client"

// PROJ-34 / Phase 1: Patienten-Termin-Seite.
// Phase-1-Stand: listet die via Webhook synchronisierten Termine (Quelle
// /api/me/appointments). Phase 2 stellt auf den Live-`list`-Endpunkt um;
// Phase 3 ergänzt Umbuchen/Stornieren. Die Seite ist paywall-exempt
// (siehe supabase-middleware.ts) — auch ohne Abo erreichbar.

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, User, AlertTriangle, CalendarX } from "lucide-react"

interface Appointment {
  id: string
  scheduled_at: string
  duration_minutes: number
  therapist_name: string | null
  service_name: string | null
  status: "scheduled" | "cancelled" | "completed"
}

function fmt(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }),
    time: d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
  }
}

const STATUS_BADGE: Record<Appointment["status"], { label: string; cls: string }> = {
  scheduled: { label: "Geplant", cls: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  completed: { label: "Stattgefunden", cls: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" },
  cancelled: { label: "Storniert", cls: "bg-slate-100 text-slate-600 hover:bg-slate-100" },
}

function AppointmentRow({ appt }: { appt: Appointment }) {
  const { date, time } = fmt(appt.scheduled_at)
  const badge = STATUS_BADGE[appt.status]
  return (
    <li className="flex items-start gap-3 rounded-xl border bg-white p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
        <Calendar className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{appt.service_name ?? "Behandlung"}</p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{date}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{time} ({appt.duration_minutes} Min.)</span>
          {appt.therapist_name && (
            <span className="flex items-center gap-1"><User className="h-3 w-3" />{appt.therapist_name}</span>
          )}
        </div>
      </div>
      <Badge className={`shrink-0 text-xs ${badge.cls}`}>{badge.label}</Badge>
    </li>
  )
}

export default function TerminePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [linked, setLinked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/me/appointments")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else {
          setAppointments(data.appointments ?? [])
          setLinked(data.linked ?? false)
        }
      })
      .catch(() => setError("Termine konnten nicht geladen werden."))
      .finally(() => setIsLoading(false))
  }, [])

  const now = new Date()
  const upcoming = appointments
    .filter((a) => a.status === "scheduled" && new Date(a.scheduled_at) >= now)
    .sort((a, b) => +new Date(a.scheduled_at) - +new Date(b.scheduled_at))
  const past = appointments
    .filter((a) => a.status !== "scheduled" || new Date(a.scheduled_at) < now)
    .sort((a, b) => +new Date(b.scheduled_at) - +new Date(a.scheduled_at))

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Meine Termine</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deine Physiotherapie-Termine auf einen Blick. Umbuchen und Stornieren folgt in Kürze.
        </p>
      </header>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      )}

      {!isLoading && error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && !linked && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            <CalendarX className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            Noch keine Terminverknüpfung vorhanden. Sobald du einen Termin buchst, erscheint er hier.
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && linked && (
        <div className="space-y-8">
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Kommende Termine</CardTitle>
                <CardDescription>{upcoming.length === 0 ? "Aktuell keine geplanten Termine." : `${upcoming.length} geplant`}</CardDescription>
              </CardHeader>
              {upcoming.length > 0 && (
                <CardContent>
                  <ul className="space-y-3">
                    {upcoming.map((a) => <AppointmentRow key={a.id} appt={a} />)}
                  </ul>
                </CardContent>
              )}
            </Card>
          </section>

          {past.length > 0 && (
            <section>
              <h2 className="mb-3 px-1 text-sm font-semibold text-muted-foreground">Vergangene Termine</h2>
              <ul className="space-y-3 opacity-80">
                {past.slice(0, 10).map((a) => <AppointmentRow key={a.id} appt={a} />)}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
