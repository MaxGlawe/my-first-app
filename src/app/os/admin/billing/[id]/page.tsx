"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { InvoiceStatusBadge } from "@/components/billing/InvoiceStatusBadge"
import { InvoicePreview } from "@/components/billing/InvoicePreview"
import {
  ArrowLeft,
  FileDown,
  Send,
  CheckCircle,
  XCircle,
  Eye,
  ListOrdered,
} from "lucide-react"
import { toast } from "sonner"
import type { InvoiceWithItems, InvoiceStatus, PraxisSettings } from "@/types/billing"

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

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<(InvoiceWithItems & { patient?: { vorname: string; nachname: string; email: string | null; telefon: string | null } }) | null>(null)
  const [praxis, setPraxis] = useState<PraxisSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [tab, setTab] = useState<"details" | "vorschau">("vorschau")

  const id = params.id as string

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [invoiceRes, praxisRes] = await Promise.all([
          fetch(`/api/admin/invoices/${id}`),
          fetch("/api/admin/praxis-settings"),
        ])
        if (!invoiceRes.ok) throw new Error()
        const invoiceJson = await invoiceRes.json()
        if (!cancelled) setInvoice(invoiceJson.data)

        if (praxisRes.ok) {
          const praxisJson = await praxisRes.json()
          if (!cancelled) setPraxis(praxisJson.data)
        }
      } catch {
        if (!cancelled) toast.error("Rechnung nicht gefunden.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  const updateStatus = async (status: InvoiceStatus) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      const json = await res.json()
      setInvoice((prev) => prev ? { ...prev, ...json.data } : null)
      toast.success("Status aktualisiert.")
    } catch {
      toast.error("Fehler beim Aktualisieren.")
    } finally {
      setActionLoading(false)
    }
  }

  const finalizeInvoice = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/invoices/${id}/finalize`, {
        method: "POST",
      })
      if (!res.ok) {
        const json = await res.json()
        toast.error(json.error || "Fehler.")
        return
      }
      const json = await res.json()
      setInvoice((prev) => prev ? { ...prev, ...json.data } : null)
      toast.success("Rechnung finalisiert.")
    } catch {
      toast.error("Fehler beim Finalisieren.")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl text-center">
        <p className="text-muted-foreground">Rechnung nicht gefunden.</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          Zurück
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/os/admin/billing">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Zurück
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                Rechnung {invoice.invoice_number}
              </h1>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              {invoice.patient
                ? `${invoice.patient.vorname} ${invoice.patient.nachname}`
                : invoice.patient_name}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {invoice.status !== "entwurf" && (
            <a
              href={`/api/admin/invoices/${id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </a>
          )}

          {invoice.status === "entwurf" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" disabled={actionLoading}>
                  <Send className="h-4 w-4 mr-2" />
                  Finalisieren
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Rechnung finalisieren?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Die Rechnung wird auf &quot;Offen&quot; gesetzt und kann nicht mehr
                    bearbeitet werden. Der Patient kann sie dann in der App sehen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={finalizeInvoice}>
                    Finalisieren
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {invoice.status === "offen" && (
            <Button
              size="sm"
              variant="outline"
              className="text-emerald-600"
              onClick={() => updateStatus("bezahlt")}
              disabled={actionLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Als bezahlt markieren
            </Button>
          )}

          {(invoice.status === "offen" || invoice.status === "ueberfaellig") && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600" disabled={actionLoading}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Stornieren
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Rechnung stornieren?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Dies kann nicht rückgängig gemacht werden. Die Rechnung wird
                    als storniert markiert.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => updateStatus("storniert")}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Stornieren
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab("vorschau")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "vorschau"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Eye className="h-4 w-4" />
          Vorschau
        </button>
        <button
          onClick={() => setTab("details")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "details"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ListOrdered className="h-4 w-4" />
          Details
        </button>
      </div>

      {/* Tab Content */}
      {tab === "vorschau" && praxis ? (
        <InvoicePreview invoice={invoice} praxis={praxis} />
      ) : tab === "vorschau" && !praxis ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Praxis-Einstellungen nicht geladen. Bitte zuerst unter{" "}
            <Link href="/os/admin/billing/settings" className="text-emerald-600 underline">
              Praxis-Daten
            </Link>{" "}
            ausfüllen.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Rechnungsdetails */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Rechnungsdatum</span>
                <p className="font-medium">{formatDate(invoice.invoice_date)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Behandlungsdatum</span>
                <p className="font-medium">{formatDate(invoice.treatment_date)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Fälligkeitsdatum</span>
                <p className="font-medium">{formatDate(invoice.due_date)}</p>
              </div>
              {invoice.diagnose_text && (
                <div>
                  <span className="text-muted-foreground">Diagnose</span>
                  <p className="font-medium">{invoice.diagnose_text}</p>
                </div>
              )}
              {invoice.patient?.email && (
                <div>
                  <span className="text-muted-foreground">E-Mail</span>
                  <p className="font-medium">{invoice.patient.email}</p>
                </div>
              )}
              {invoice.notes && (
                <div>
                  <span className="text-muted-foreground">Notizen</span>
                  <p className="text-xs">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Positionen */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">Positionen</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Ziffer</TableHead>
                    <TableHead>Beschreibung</TableHead>
                    <TableHead className="w-12 text-center">Anz.</TableHead>
                    <TableHead className="w-24 text-right">Einzelpreis</TableHead>
                    <TableHead className="w-24 text-right">Gesamt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(invoice.line_items || []).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">
                        {item.gebueh_ziffer || "—"}
                      </TableCell>
                      <TableCell>{item.beschreibung}</TableCell>
                      <TableCell className="text-center">{item.anzahl}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(item.einzelpreis))}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(item.gesamtpreis))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end items-center gap-4 mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">Gesamtbetrag:</span>
                <span className="text-xl font-bold">
                  {formatCurrency(Number(invoice.total))}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
