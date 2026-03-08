"use client"

import { PraxisSettingsForm } from "@/components/billing/PraxisSettingsForm"
import { Building2 } from "lucide-react"

export default function PraxisSettingsPage() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Praxis-Einstellungen</h1>
          <p className="text-sm text-slate-400">
            Stammdaten, Bankverbindung und rechtliche Angaben — erscheinen auf Rechnungen, Verträgen, Impressum und Datenschutzerklärung.
          </p>
        </div>
      </div>

      <PraxisSettingsForm />
    </div>
  )
}
