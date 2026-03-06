"use client"

/**
 * PROJ-17: Compact Ampel Banner for Dashboard
 * Shows a single-line alert card linking to /os/ampel.
 * Only appears when there are ROT or GELB patients.
 */

import Link from "next/link"
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react"
import { usePatientAlerts } from "@/hooks/use-patient-alerts"

export function AmpelBanner() {
  const { alerts, isLoading } = usePatientAlerts()

  if (isLoading) return null

  const rotCount = alerts.filter((a) => a.status === "ROT").length
  const gelbCount = alerts.filter((a) => a.status === "GELB").length
  const total = rotCount + gelbCount

  if (total === 0) return null

  const hasRot = rotCount > 0

  return (
    <Link href="/os/ampel" className="block">
      <div className={`rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-all border ${
        hasRot
          ? "bg-gradient-to-r from-red-50 to-red-50/30 border-red-200/60"
          : "bg-gradient-to-r from-amber-50 to-amber-50/30 border-amber-200/60"
      }`}>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
          hasRot ? "bg-red-100" : "bg-amber-100"
        }`}>
          {hasRot ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${hasRot ? "text-red-800" : "text-amber-800"}`}>
            {total} {total === 1 ? "Patient braucht" : "Patienten brauchen"} Aufmerksamkeit
          </p>
          <p className={`text-xs mt-0.5 ${hasRot ? "text-red-600/70" : "text-amber-600/70"}`}>
            {rotCount > 0 && `${rotCount} kritisch`}
            {rotCount > 0 && gelbCount > 0 && " · "}
            {gelbCount > 0 && `${gelbCount} beobachten`}
            {" — Zur Patienten-Ampel"}
          </p>
        </div>
        <ChevronRight className={`h-5 w-5 shrink-0 ${hasRot ? "text-red-400" : "text-amber-400"}`} />
      </div>
    </Link>
  )
}
