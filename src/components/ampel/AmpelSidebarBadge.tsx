"use client"

/**
 * PROJ-17: Sidebar badge showing count of ROT+GELB patients.
 */

import { Badge } from "@/components/ui/badge"
import { usePatientAlerts } from "@/hooks/use-patient-alerts"

export function AmpelSidebarBadge() {
  const { alerts, isLoading } = usePatientAlerts()
  if (isLoading) return null

  const count = alerts.filter((a) => a.status === "ROT" || a.status === "GELB").length
  if (count === 0) return null

  const hasRot = alerts.some((a) => a.status === "ROT")

  return (
    <Badge className={`ml-auto text-[10px] h-5 min-w-5 px-1.5 text-white ${
      hasRot ? "bg-red-500" : "bg-amber-400"
    }`}>
      {count > 99 ? "99+" : count}
    </Badge>
  )
}
