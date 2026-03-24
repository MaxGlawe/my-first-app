import { Badge } from "@/components/ui/badge"
import type { OrgStatus } from "@/types/bgf"

const statusConfig: Record<OrgStatus, { label: string; className: string }> = {
  pilot: {
    label: "Pilot",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  aktiv: {
    label: "Aktiv",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  pausiert: {
    label: "Pausiert",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  gekuendigt: {
    label: "Gekündigt",
    className: "bg-red-100 text-red-700 border-red-200",
  },
}

export function OrgStatusBadge({ status }: { status: OrgStatus }) {
  const cfg = statusConfig[status] ?? { label: status, className: "bg-slate-100 text-slate-600" }
  return (
    <Badge variant="outline" className={cfg.className}>
      {cfg.label}
    </Badge>
  )
}
