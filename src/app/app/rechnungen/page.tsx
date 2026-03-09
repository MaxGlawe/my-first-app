"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileDown, Receipt } from "lucide-react"

interface PatientInvoice {
  id: string
  invoice_number: string
  invoice_date: string
  treatment_date: string
  due_date: string
  total: number
  status: string
  paid_at: string | null
  line_items: {
    id: string
    gebueh_ziffer: string | null
    beschreibung: string
    anzahl: number
    einzelpreis: number
    gesamtpreis: number
  }[]
}

const statusLabels: Record<string, { label: string; className: string }> = {
  offen: { label: "Offen", className: "bg-blue-100 text-blue-700" },
  bezahlt: { label: "Bezahlt", className: "bg-emerald-100 text-emerald-700" },
  ueberfaellig: { label: "Überfällig", className: "bg-red-100 text-red-700" },
  storniert: { label: "Storniert", className: "bg-gray-100 text-gray-500" },
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

export default function MeineRechnungenPage() {
  const [invoices, setInvoices] = useState<PatientInvoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/me/invoices")
        if (!res.ok) throw new Error()
        const json = await res.json()
        if (!cancelled) setInvoices(json.data || [])
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Meine Rechnungen</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Receipt className="h-6 w-6 text-emerald-600" />
        <h1 className="text-2xl font-bold">Meine Rechnungen</h1>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Noch keine Rechnungen vorhanden.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => {
            const statusInfo = statusLabels[inv.status] || statusLabels.offen

            return (
              <Card key={inv.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">
                      Rechnung {inv.invoice_number}
                    </CardTitle>
                    <Badge className={statusInfo.className}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                    <span>Behandlung: {formatDate(inv.treatment_date)}</span>
                    <span>Rechnung: {formatDate(inv.invoice_date)}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Positionen */}
                  <div className="space-y-1.5 mb-4">
                    {inv.line_items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {item.gebueh_ziffer && (
                            <span className="font-mono text-xs text-muted-foreground">
                              {item.gebueh_ziffer}
                            </span>
                          )}
                          <span>{item.beschreibung}</span>
                          {item.anzahl > 1 && (
                            <span className="text-muted-foreground">
                              ×{item.anzahl}
                            </span>
                          )}
                        </div>
                        <span className="font-medium">
                          {formatCurrency(Number(item.gesamtpreis))}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Summe + PDF */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="font-bold text-lg">
                      {formatCurrency(Number(inv.total))}
                    </span>
                    <a
                      href={`/api/me/invoices/${inv.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        <FileDown className="h-4 w-4 mr-2" />
                        PDF herunterladen
                      </Button>
                    </a>
                  </div>

                  {inv.status === "offen" && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Fällig bis: {formatDate(inv.due_date)} — Scannen Sie den QR-Code
                      im PDF zum Bezahlen.
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
