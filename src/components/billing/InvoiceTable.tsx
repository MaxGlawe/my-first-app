"use client"

import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { InvoiceStatusBadge } from "./InvoiceStatusBadge"
import { Eye, FileDown } from "lucide-react"
import type { InvoiceWithPatient } from "@/types/billing"

interface InvoiceTableProps {
  invoices: InvoiceWithPatient[]
  loading: boolean
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—"
  return new Date(dateStr + "T00:00:00").toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function formatCurrency(amount: number) {
  return amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
}

export function InvoiceTable({ invoices, loading }: InvoiceTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Keine Rechnungen vorhanden.</p>
        <p className="text-sm mt-1">Erstelle deine erste Rechnung über den Button oben.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nr.</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Datum</TableHead>
            <TableHead>Betrag</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => (
            <TableRow key={inv.id}>
              <TableCell className="font-mono text-sm">
                {inv.invoice_number}
              </TableCell>
              <TableCell>
                {inv.patient
                  ? `${inv.patient.vorname} ${inv.patient.nachname}`
                  : inv.patient_name}
              </TableCell>
              <TableCell>{formatDate(inv.invoice_date)}</TableCell>
              <TableCell className="font-medium">
                {formatCurrency(Number(inv.total))}
              </TableCell>
              <TableCell>
                <InvoiceStatusBadge status={inv.status} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/os/admin/billing/${inv.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {inv.status !== "entwurf" && (
                    <a
                      href={`/api/admin/invoices/${inv.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="sm">
                        <FileDown className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
