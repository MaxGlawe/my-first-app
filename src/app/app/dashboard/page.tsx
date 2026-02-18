"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { HeuteKarte, NoAssignmentState } from "@/components/app/HeuteKarte"
import { FortschrittsRing } from "@/components/app/FortschrittsRing"
import { MeineTermineKarte } from "@/components/app/MeineTermineKarte"
import {
  usePatientApp,
  getTodayAssignments,
  getActiveAssignments,
  overallCompliance7Days,
} from "@/hooks/use-patient-app"
import { AlertTriangle, ClipboardList, TrendingUp } from "lucide-react"

export default function PatientDashboardPage() {
  const { assignments, isLoading, error } = usePatientApp()

  const todayAssignments = getTodayAssignments(assignments)
  const activeAssignments = getActiveAssignments(assignments)
  const compliance = overallCompliance7Days(assignments)
  const hasAnyAssignment = assignments.length > 0

  return (
    <div className="container mx-auto py-6 px-4 max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mein Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {new Date().toLocaleDateString("de-DE", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <form action="/api/auth/signout" method="post">
          <Button variant="ghost" size="sm" type="submit" className="text-slate-400">
            Abmelden
          </Button>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      )}

      {/* Main content */}
      {!isLoading && !error && (
        <>
          {/* Today's training card */}
          {hasAnyAssignment ? (
            <HeuteKarte todayAssignments={todayAssignments} allAssignments={assignments} />
          ) : (
            <NoAssignmentState />
          )}

          {/* Compliance ring + quick links */}
          {hasAnyAssignment && (
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-5">
                <FortschrittsRing compliance={compliance} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 mb-1">
                    Deine Trainings-Compliance
                  </p>
                  <p className="text-xs text-slate-400">
                    {activeAssignments.length} aktiver Plan
                    {activeAssignments.length !== 1 ? "e" : ""}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Link href="/app/plans">
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                        <ClipboardList className="h-3 w-3" />
                        Pläne
                      </Button>
                    </Link>
                    <Link href="/app/progress">
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Fortschritt
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appointments */}
          <MeineTermineKarte />
        </>
      )}
    </div>
  )
}
