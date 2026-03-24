import { Badge } from "@/components/ui/badge"
import type { MemberStatus } from "@/types/bgf"

const statusConfig: Record<MemberStatus, { label: string; className: string }> = {
  eingeladen: {
    label: "Eingeladen",
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
  deaktiviert: {
    label: "Deaktiviert",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
}

export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  const cfg = statusConfig[status] ?? { label: status, className: "bg-slate-100 text-slate-600" }
  return (
    <Badge variant="outline" className={cfg.className}>
      {cfg.label}
    </Badge>
  )
}
