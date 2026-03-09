import { Badge } from "@/components/ui/badge"
import type { InvoiceStatus } from "@/types/billing"

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  entwurf: {
    label: "Entwurf",
    className: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  },
  offen: {
    label: "Offen",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  },
  bezahlt: {
    label: "Bezahlt",
    className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  },
  ueberfaellig: {
    label: "Überfällig",
    className: "bg-red-100 text-red-700 hover:bg-red-100",
  },
  storniert: {
    label: "Storniert",
    className: "bg-gray-100 text-gray-500 hover:bg-gray-100",
  },
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const config = statusConfig[status] || statusConfig.entwurf

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  )
}
