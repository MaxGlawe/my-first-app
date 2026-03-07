"use client"

/**
 * PROJ-17: Sidebar badge showing count of ROT+GELB patients (excluding dismissed).
 */

import { Badge } from "@/components/ui/badge"
import { usePatientAlerts } from "@/hooks/use-patient-alerts"
import { useAmpelDismissed } from "@/hooks/use-ampel-dismissed"

export function AmpelSidebarBadge() {
  const { alerts, isLoading } = usePatientAlerts()
  const { dismissed } = useAmpelDismissed()
  if (isLoading) return null

  const active = alerts.filter(
    (a) => (a.status === "ROT" || a.status === "GELB") && !dismissed.has(a.patientId),
  )
  if (active.length === 0) return null

  const hasRot = active.some((a) => a.status === "ROT")

  return (
    <Badge className={`ml-auto text-[10px] h-5 min-w-5 px-1.5 text-white ${
      hasRot ? "bg-red-500" : "bg-amber-400"
    }`}>
      {active.length > 99 ? "99+" : active.length}
    </Badge>
  )
}
