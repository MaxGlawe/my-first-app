"use client"

import { CONTRACT_TYPE_CONFIG } from "@/types/contract"
import type { ContractType, Leistung } from "@/types/contract"
import { Check } from "lucide-react"

interface ContractPreviewProps {
  contractType: ContractType
  patientName: string
  leistungen: Leistung[]
  gesamtpreis: number
  zahlungsweise: "einmalig" | "pro_sitzung"
}

export function ContractPreview({
  contractType,
  patientName,
  leistungen,
  gesamtpreis,
  zahlungsweise,
}: ContractPreviewProps) {
  const typeConfig = CONTRACT_TYPE_CONFIG[contractType]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5">
        <p className="text-sm text-emerald-100">Vertragsvorschau</p>
        <h3 className="text-xl font-bold text-white mt-1">{typeConfig.label}</h3>
      </div>

      <div className="p-6 space-y-5">
        {/* Patient */}
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Patient</p>
          <p className="text-sm font-medium text-slate-900">{patientName}</p>
        </div>

        {/* Leistungen */}
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Leistungen</p>
          <ul className="space-y-2">
            {leistungen.map((l, i) => (
              <li key={i} className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{l.beschreibung}</span>
                </div>
                {l.preis > 0 && (
                  <span className="text-sm font-medium text-slate-900 flex-shrink-0">
                    {l.preis.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Total */}
        <div className="rounded-xl bg-slate-50 p-4 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-slate-700">Gesamtbetrag</p>
            <p className="text-xs text-slate-500">
              {zahlungsweise === "einmalig" ? "Einmalige Zahlung" : "Pro Sitzung"}
            </p>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {gesamtpreis.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
          </p>
        </div>

        <p className="text-xs text-slate-400">
          {"Der vollst\u00e4ndige Vertragstext wird automatisch generiert und enth\u00e4lt alle rechtlichen Klauseln (Widerrufsrecht, Datenschutz, Haftung etc.)."}
        </p>
      </div>
    </div>
  )
}
