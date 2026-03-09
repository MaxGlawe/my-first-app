import { PraxisSettingsForm } from "@/components/billing/PraxisSettingsForm"

export const metadata = {
  title: "Praxis-Einstellungen | Praxis OS",
}

export default function BillingSettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Praxis-Einstellungen</h1>
        <p className="text-muted-foreground mt-1">
          Stammdaten und Bankverbindung für deine Rechnungen.
        </p>
      </div>
      <PraxisSettingsForm />
    </div>
  )
}
