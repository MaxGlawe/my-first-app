import { NewPatientForm } from "@/components/patients/NewPatientForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Neuer Patient | Praxis OS",
}

export default function NewPatientPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-6">
        <Link href="/os/patients">
          <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Zurück zur Patientenliste
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mt-4">Neuer Patient</h1>
        <p className="text-muted-foreground mt-1">
          Lege einen neuen Patienten an. Pflichtfelder sind mit{" "}
          <span className="text-destructive">*</span> markiert.
        </p>
      </div>

      <NewPatientForm />
    </div>
  )
}
