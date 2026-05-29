/**
 * PROJ-21: TrustRow — geteilte Trust-Signal-Leiste für den Shop.
 * Genutzt auf der Kursseite und der Kurs-Übersicht. Ruhig, sachlich, premium.
 */

import { ShieldCheck, Stethoscope, Infinity as InfinityIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Premium-Markenwelt (Masterclass-Format)
const INK = "#0f172a"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const LINE = "#e7e1d6"

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
          className="flex items-center gap-3 rounded-xl bg-white border px-4 py-3"
          style={{ borderColor: LINE }}
        >
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(44,62,45,0.1)" }}
          >
            <item.icon className="h-5 w-5" style={{ color: GREEN }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight" style={{ color: INK }}>
              {item.label}
            </p>
            <p className="text-xs leading-tight mt-0.5" style={{ color: MUTED }}>
              {item.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
