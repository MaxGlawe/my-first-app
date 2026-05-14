/**
 * PROJ-21: TrustRow — geteilte Trust-Signal-Leiste für den Shop.
 * Genutzt auf der Kursseite und der Kurs-Übersicht. Ruhig, sachlich, premium.
 */

import { ShieldCheck, Stethoscope, Infinity as InfinityIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    label: "Sichere Zahlung",
    sub: "Kreditkarte, SEPA, Sofort — via Stripe",
  },
  {
    icon: Stethoscope,
    label: "Physiotherapeutisch entwickelt",
    sub: "Evidenzbasierte Inhalte",
  },
  {
    icon: InfinityIcon,
    label: "Lebenslanger Zugriff",
    sub: "Einmal kaufen, behalten",
  },
]

export function TrustRow({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-3", className)}>
      {TRUST_ITEMS.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 rounded-xl bg-white border border-slate-200 px-4 py-3"
        >
          <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <item.icon className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 leading-tight">
              {item.label}
            </p>
            <p className="text-xs text-slate-400 leading-tight mt-0.5">{item.sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
