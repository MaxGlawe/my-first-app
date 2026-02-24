"use client"

import { Badge } from "@/components/ui/badge"
import { FileEdit, CheckCircle2, Lock } from "lucide-react"

type ClinicalStatus = "entwurf" | "abgeschlossen" | "gesperrt"

const STATUS_CONFIG: Record<
  ClinicalStatus,
  { label: string; icon: typeof FileEdit; className: string }
> = {
  entwurf: {
    label: "Entwurf",
    icon: FileEdit,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  abgeschlossen: {
    label: "Abgeschlossen",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  gesperrt: {
    label: "Gesperrt",
    icon: Lock,
    className: "bg-slate-50 text-slate-500 border-slate-200",
  },
}

export function StatusBadge({
  status,
  className = "",
}: {
  status: ClinicalStatus
  className?: string
}) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.entwurf
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={`gap-1.5 font-medium ${config.className} ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  )
}
