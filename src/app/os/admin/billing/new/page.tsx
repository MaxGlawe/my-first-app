import { InvoiceForm } from "@/components/billing/InvoiceForm"

export const metadata = {
  title: "Neue Rechnung | Praxis OS",
}

export default function NewInvoicePage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Neue Rechnung</h1>
        <p className="text-muted-foreground mt-1">
          Erstelle eine neue Rechnung nach GebüH.
        </p>
      </div>
      <InvoiceForm />
    </div>
  )
}
