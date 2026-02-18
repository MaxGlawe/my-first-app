"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useTreatments } from "@/hooks/use-treatments"
import type { TreatmentSession } from "@/types/behandlung"
import {
  Plus,
  Activity,
  ChevronRight,
  Clock,
  User,
  Lock,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// ── Props ──────────────────────────────────────────────────────────────────────

interface BehandlungTabProps {
  patientId: string
}

// ── NRS Chart ─────────────────────────────────────────────────────────────────

function NrsVerlaufChart({ sessions }: { sessions: TreatmentSession[] }) {
  const data = sessions
    .filter((s) => s.nrs_before !== null && s.nrs_before !== undefined)
    .map((s) => ({
      date: new Date(s.session_date).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
      }),
      "NRS Beginn": s.nrs_before,
      "NRS Ende": s.nrs_after ?? undefined,
    }))

  if (data.length < 2) return null

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-500" />
          NRS-Schmerzwert-Verlauf
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Line
              type="monotone"
              dataKey="NRS Beginn"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="NRS Ende"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function BehandlungCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="space-y-2 flex-1">
        <div className="flex gap-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-4 w-4 ml-4" />
    </div>
  )
}

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ session }: { session: TreatmentSession }) {
  const isLocked =
    session.locked_at && new Date(session.locked_at) < new Date()

  if (session.status === "entwurf") {
    return (
      <Badge
        variant="outline"
        className="text-amber-600 border-amber-300 bg-amber-50 text-xs"
      >
        Entwurf
      </Badge>
    )
  }

  if (isLocked) {
    return (
      <Badge
        variant="outline"
        className="text-slate-600 border-slate-300 bg-slate-50 text-xs gap-1"
      >
        <Lock className="h-2.5 w-2.5" />
        Gesperrt
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className="text-green-600 border-green-300 bg-green-50 text-xs"
    >
      Abgeschlossen
    </Badge>
  )
}

// ── Behandlung Card ────────────────────────────────────────────────────────────

function BehandlungCard({
  session,
  patientId,
}: {
  session: TreatmentSession
  patientId: string
}) {
  const date = new Date(session.session_date).toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  const massnahmenPreview = session.measures.slice(0, 4)
  const extraCount = session.measures.length - massnahmenPreview.length

  return (
    <Link
      href={`/os/patients/${patientId}/behandlung/${session.id}`}
      className="block"
    >
      <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer">
        <div className="flex items-start gap-3 min-w-0">
          <div className="rounded-full bg-blue-100 p-2 mt-0.5 shrink-0">
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{date}</span>
              <StatusBadge session={session} />
            </div>

            {/* Maßnahmen Badges */}
            {session.measures.length > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {massnahmenPreview.map((m) => (
                  <Badge
                    key={m}
                    variant="secondary"
                    className="text-xs px-1.5 py-0"
                  >
                    {m}
                  </Badge>
                ))}
                {extraCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    +{extraCount}
                  </span>
                )}
              </div>
            )}

            {/* NRS + Dauer */}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              {session.nrs_before !== null &&
                session.nrs_before !== undefined && (
                  <span>
                    NRS:{" "}
                    <span className="font-medium text-foreground">
                      {session.nrs_before}
                    </span>
                    {session.nrs_after !== null &&
                      session.nrs_after !== undefined && (
                        <span>
                          {" "}
                          →{" "}
                          <span className="font-medium text-foreground">
                            {session.nrs_after}
                          </span>
                        </span>
                      )}
                  </span>
                )}
              {session.duration_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {session.duration_minutes} min
                </span>
              )}
              {session.therapist_name && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {session.therapist_name}
                </span>
              )}
            </div>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-foreground transition-colors" />
      </div>
    </Link>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ patientId }: { patientId: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-blue-100 p-4 mb-4">
          <Activity className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="font-semibold text-base">Noch keine Behandlung dokumentiert</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Erfasse die erste Behandlung für diesen Patienten.
        </p>
        <Button asChild className="mt-6">
          <Link href={`/os/patients/${patientId}/behandlung/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Erste Behandlung erfassen
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// ── BehandlungTab ─────────────────────────────────────────────────────────────

export function BehandlungTab({ patientId }: BehandlungTabProps) {
  const { sessions, isLoading, error, refresh } = useTreatments(patientId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-44" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <BehandlungCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={refresh}>
          Erneut versuchen
        </Button>
      </div>
    )
  }

  if (sessions.length === 0) {
    return <EmptyState patientId={patientId} />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold">Behandlungen</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {sessions.length}{" "}
            {sessions.length === 1 ? "Behandlung" : "Behandlungen"}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href={`/os/patients/${patientId}/behandlung/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Neue Behandlung
          </Link>
        </Button>
      </div>

      <NrsVerlaufChart sessions={sessions} />

      <Separator />

      <div className="space-y-3">
        {sessions.map((session) => (
          <BehandlungCard
            key={session.id}
            session={session}
            patientId={patientId}
          />
        ))}
      </div>
    </div>
  )
}
