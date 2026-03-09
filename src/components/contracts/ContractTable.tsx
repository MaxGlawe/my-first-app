"use client"

import Link from "next/link"
import { ContractStatusBadge } from "./ContractStatusBadge"
import { CONTRACT_TYPE_CONFIG } from "@/types/contract"
import type { ContractWithPatient, ContractType } from "@/types/contract"
import { FileText, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContractTableProps {
  contracts: ContractWithPatient[]
  loading: boolean
}

export function ContractTable({ contracts, loading }: ContractTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">{"Vertr\u00e4ge werden geladen..."}</p>
      </div>
    )
  }

  if (contracts.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-500">{"Noch keine Vertr\u00e4ge vorhanden."}</p>
        <Link href="/os/admin/vertraege/neu">
          <Button className="mt-4" size="sm">
            Ersten Vertrag erstellen
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50">
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nr.</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Typ</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Betrag</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Datum</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {contracts.map((c) => {
            const typeConfig = CONTRACT_TYPE_CONFIG[c.contract_type as ContractType]
            const patientName = c.patient
              ? `${c.patient.vorname} ${c.patient.nachname}`
              : c.patient_name

            return (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <span className="text-sm font-mono text-slate-600">{c.contract_number}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-slate-900">{patientName}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-600">{typeConfig?.label || c.contract_type}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-slate-900">
                    {Number(c.gesamtpreis).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ContractStatusBadge status={c.status} />
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-500">
                    {new Date(c.created_at).toLocaleDateString("de-DE")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/os/admin/vertraege/${c.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
