"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BillingSummaryCards } from "@/components/billing/BillingSummaryCards"
import { InvoiceTable } from "@/components/billing/InvoiceTable"
import { useInvoices } from "@/hooks/use-invoices"
import { Plus, Settings } from "lucide-react"

export default function BillingPage() {
  const { invoices, loading } = useInvoices()

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Abrechnung</h1>
          <p className="text-muted-foreground mt-1">
            Rechnungen erstellen, verwalten und versenden.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/os/admin/billing/settings">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Praxis-Daten
            </Button>
          </Link>
          <Link href="/os/admin/billing/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Neue Rechnung
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        <BillingSummaryCards />
        <InvoiceTable invoices={invoices} loading={loading} />
      </div>
    </div>
  )
}
