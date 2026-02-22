import { Metadata } from "next"
import { IntakeForm } from "@/components/intake/IntakeForm"

export const metadata: Metadata = {
  title: "Anfrage stellen | Online Physiotherapie — Praxis OS",
  description:
    "Füllen Sie unseren kurzen Fragebogen aus und starten Sie mit Ihrer persönlichen Online-Therapie.",
}

export default function AnfragePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Anfrage stellen</h1>
        <p className="text-sm text-slate-500 mt-2">
          Füllen Sie den Fragebogen aus — wir melden uns innerhalb von 24 Stunden.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6 sm:p-8 shadow-sm">
        <IntakeForm />
      </div>
    </div>
  )
}
