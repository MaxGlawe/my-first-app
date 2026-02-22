import { NewPatientForm } from "@/components/patients/NewPatientForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft, UserPlus } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Neuer Patient | Praxis OS",
}

export default function NewPatientPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-6">
        <Link href="/os/patients">
          <Button variant="ghost" size="sm" className="-ml-2 text-slate-500">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Zurück zur Patientenliste
          </Button>
        </Link>
        <div className="mt-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 border border-emerald-100/60 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <UserPlus className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">Neuer Patient</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Lege einen neuen Patienten an. Pflichtfelder sind mit{" "}
                <span className="text-destructive">*</span> markiert.
              </p>
            </div>
          </div>
        </div>
      </div>

      <NewPatientForm />
    </div>
  )
}
