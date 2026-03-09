"use client"

import { ContractForm } from "@/components/contracts/ContractForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NeuenVertragPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <Link
        href="/os/admin/vertraege"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {"Zur\u00fcck zu Vertr\u00e4ge"}
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Neuer Behandlungsvertrag
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {"W\u00e4hlen Sie einen Patienten, Vertragstyp und Leistungen."}
        </p>
      </div>

      <ContractForm />
    </div>
  )
}
