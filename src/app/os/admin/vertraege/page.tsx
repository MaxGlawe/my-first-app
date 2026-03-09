"use client"

import { useContracts } from "@/hooks/use-contracts"
import { ContractTable } from "@/components/contracts/ContractTable"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, FileText } from "lucide-react"

export default function VertraegePage() {
  const { contracts, loading } = useContracts()

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <FileText className="h-6 w-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-900">
              {"Vertr\u00e4ge"}
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            {"Behandlungsvertr\u00e4ge erstellen, versenden und verwalten."}
          </p>
        </div>
        <Link href="/os/admin/vertraege/neu">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Vertrag
          </Button>
        </Link>
      </div>

      <ContractTable contracts={contracts} loading={loading} />
    </div>
  )
}
