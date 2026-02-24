"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StatusBadge } from "@/components/clinical-ui"
import { useTreatments } from "@/hooks/use-treatments"
import type { TreatmentSession } from "@/types/behandlung"
import {
  Plus,
  Activity,
  ChevronRight,
  Clock,
  User,
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
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <Activity className="h-4 w-4 text-blue-600" />
        </div>
        <span className="text-sm font-semibold text-slate-800">NRS-Schmerzwert-Verlauf</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            stroke="#94a3b8"
          />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fontSize: 11 }}
            stroke="#94a3b8"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(226,232,240,0.6)",
              borderRadius: "12px",
              fontSize: "12px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
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
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function BehandlungCardSkeleton() {
  return (
    <div className="bg-white/60 border border-slate-200/40 rounded-2xl p-4">
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
    </div>
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

  const isLocked = session.locked_at && new Date(session.locked_at) < new Date()
  const badgeStatus = session.status === "entwurf"
    ? "entwurf" as const
    : isLocked
    ? "gesperrt" as const
    : "abgeschlossen" as const

  return (
    <Link
      href={`/os/patients/${patientId}/behandlung/${session.id}`}
      className="block"
    >
      <div className="flex items-start justify-between p-4 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all group cursor-pointer">
        <div className="flex items-start gap-3 min-w-0">
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-2 mt-0.5 shrink-0">
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-slate-800">{date}</span>
              <StatusBadge status={badgeStatus} />
            </div>

            {session.measures.length > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {massnahmenPreview.map((m) => (
                  <Badge
                    key={m}
                    variant="secondary"
                    className="text-xs px-1.5 py-0 bg-slate-100/80 text-slate-600"
                  >
                    {m}
                  </Badge>
                ))}
                {extraCount > 0 && (
                  <span className="text-xs text-slate-400">
                    +{extraCount}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
              {session.nrs_before !== null &&
                session.nrs_before !== undefined && (
                  <span>
                    NRS:{" "}
                    <span className="font-medium text-slate-700">
                      {session.nrs_before}
                    </span>
                    {session.nrs_after !== null &&
                      session.nrs_after !== undefined && (
                        <span>
                          {" "}
                          →{" "}
                          <span className="font-medium text-slate-700">
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
        <ChevronRight className="h-4 w-4 text-slate-300 shrink-0 mt-1 group-hover:text-emerald-500 transition-colors" />
      </div>
    </Link>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ patientId }: { patientId: string }) {
  return (
    <div className="bg-white/60 backdrop-blur-sm border border-dashed border-slate-200/60 rounded-2xl">
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 mb-4">
          <Activity className="h-6 w-6 text-emerald-600" />
        </div>
        <h3 className="font-semibold text-base text-slate-800">Noch keine Behandlung dokumentiert</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-xs">
          Erfasse die erste Behandlung für diesen Patienten.
        </p>
        <Button asChild className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-sm">
          <Link href={`/os/patients/${patientId}/behandlung/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Erste Behandlung erfassen
          </Link>
        </Button>
      </div>
    </div>
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
          <Skeleton className="h-9 w-44 rounded-xl" />
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
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
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Behandlungen</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {sessions.length}{" "}
            {sessions.length === 1 ? "Behandlung" : "Behandlungen"}
          </p>
        </div>
        <Button asChild size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-sm rounded-xl">
          <Link href={`/os/patients/${patientId}/behandlung/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Neue Behandlung
          </Link>
        </Button>
      </div>

      <NrsVerlaufChart sessions={sessions} />

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
