"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft, Plus, MoreHorizontal, Send, CheckCircle2, AlertTriangle,
  FileText, FileCode, Download, Loader2, Receipt,
} from "lucide-react"
import type { BgfInvoice } from "@/types/bgf-invoice"
import { BGF_INVOICE_STATUS_CONFIG, formatZeitraum } from "@/types/bgf-invoice"

// ── Status Badge ─────────────────────────────────────────────────────

function InvoiceStatusBadge({ status }: { status: string }) {
  const config = BGF_INVOICE_STATUS_CONFIG[status as keyof typeof BGF_INVOICE_STATUS_CONFIG]
  if (!config) return <Badge variant="secondary">{status}</Badge>
  return <Badge className={`${config.color} border-0 text-[11px]`}>{config.label}</Badge>
}

// ── Create Invoice Dialog ────────────────────────────────────────────

function CreateInvoiceDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([])
  const [selectedOrg, setSelectedOrg] = useState("")
  const [monat, setMonat] = useState(new Date().getMonth() + 1)
  const [jahr, setJahr] = useState(new Date().getFullYear())
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    fetch("/api/bgf/organizations")
      .then((r) => r.json())
      .then((d) => setOrgs(d.organizations ?? []))
      .catch(() => {})
  }, [open])

  async function handleCreate() {
    if (!selectedOrg) return
    setCreating(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/bgf-invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: selectedOrg,
          zeitraum_monat: monat,
          zeitraum_jahr: jahr,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setOpen(false)
      onCreated()
    } catch {
      setError("Netzwerkfehler.")
    } finally {
      setCreating(false)
    }
  }

  const monate = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Rechnung erstellen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neue BGF-Rechnung</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

          <div>
            <label className="text-sm font-medium text-slate-700">Organisation</label>
            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Organisation wählen" /></SelectTrigger>
              <SelectContent>
                {orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Monat</label>
              <Select value={String(monat)} onValueChange={(v) => setMonat(parseInt(v))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {monate.map((m, i) => <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Jahr</label>
              <Select value={String(jahr)} onValueChange={(v) => setJahr(parseInt(v))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[2025, 2026, 2027].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleCreate} disabled={!selectedOrg || creating} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
            Rechnung erstellen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Page ──────────────────────────────────────────────────────────────

export default function BgfRechnungenPage() {
  const [invoices, setInvoices] = useState<BgfInvoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("alle")

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = filterStatus !== "alle" ? `?status=${filterStatus}` : ""
      const res = await fetch(`/api/admin/bgf-invoices${params}`)
      const data = await res.json()
      setInvoices(data.invoices ?? [])
    } catch { /* */ } finally {
      setIsLoading(false)
    }
  }, [filterStatus])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  async function handleAction(id: string, action: string, body?: object) {
    setActionLoading(id)
    try {
      const url = action === "paid"
        ? `/api/admin/bgf-invoices/${id}`
        : `/api/admin/bgf-invoices/${id}/${action}`
      const res = await fetch(url, {
        method: action === "paid" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "paid" ? { status: "bezahlt" } : body ?? {}),
      })
      if (res.ok) fetchInvoices()
    } catch { /* */ } finally {
      setActionLoading(null)
    }
  }

  // Summary stats
  const offen = invoices.filter((i) => ["versendet", "ueberfaellig"].includes(i.status)).length
  const ueberfaellig = invoices.filter((i) => ["ueberfaellig", "gemahnt_1", "gemahnt_2"].includes(i.status)).length
  const offenerBetrag = invoices
    .filter((i) => i.status !== "bezahlt")
    .reduce((s, i) => s + Number(i.gesamtbetrag), 0)

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/os/bgf" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mb-4 w-fit">
          <ArrowLeft className="h-4 w-4" /> BGF-Übersicht
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">BGF-Rechnungen</h1>
            <p className="text-sm text-slate-500 mt-1">Rechnungen, Zahlungserinnerungen & Mahnwesen</p>
          </div>
          <CreateInvoiceDialog onCreated={fetchInvoices} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-400 font-medium">Offene Rechnungen</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{offen}</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-400 font-medium">Ausstehender Betrag</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{offenerBetrag.toFixed(2)} €</p>
        </div>
        <div className={`rounded-2xl border p-4 shadow-sm ${ueberfaellig > 0 ? "bg-red-50 border-red-200" : "bg-white border-slate-200"}`}>
          <p className="text-xs text-slate-400 font-medium">Überfällig / Gemahnt</p>
          <p className={`text-2xl font-bold mt-1 ${ueberfaellig > 0 ? "text-red-600" : "text-slate-900"}`}>{ueberfaellig}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Status</SelectItem>
            <SelectItem value="entwurf">Entwurf</SelectItem>
            <SelectItem value="versendet">Offen</SelectItem>
            <SelectItem value="ueberfaellig">Überfällig</SelectItem>
            <SelectItem value="gemahnt_1">1. Mahnung</SelectItem>
            <SelectItem value="gemahnt_2">2. Mahnung</SelectItem>
            <SelectItem value="bezahlt">Bezahlt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-16">
          <Receipt className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Keine Rechnungen vorhanden.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rechnungsnr.</TableHead>
                <TableHead>Organisation</TableHead>
                <TableHead>Zeitraum</TableHead>
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <button
                      onClick={() => window.open(`/api/admin/bgf-invoices/${inv.id}/pdf`, "_blank")}
                      className="font-mono text-sm text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                      title="Vorschau öffnen"
                    >
                      {inv.invoice_number}
                    </button>
                  </TableCell>
                  <TableCell className="font-medium">{inv.org_name}</TableCell>
                  <TableCell>{formatZeitraum(inv.zeitraum_monat, inv.zeitraum_jahr)}</TableCell>
                  <TableCell className="text-right font-semibold">{Number(inv.gesamtbetrag).toFixed(2)} €</TableCell>
                  <TableCell><InvoiceStatusBadge status={inv.status} /></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={actionLoading === inv.id}>
                          {actionLoading === inv.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {inv.status === "entwurf" && (
                          <DropdownMenuItem onClick={() => handleAction(inv.id, "send")}>
                            <Send className="h-4 w-4 mr-2" /> Rechnung senden
                          </DropdownMenuItem>
                        )}
                        {["versendet", "ueberfaellig"].includes(inv.status) && (
                          <DropdownMenuItem onClick={() => handleAction(inv.id, "reminder")}>
                            <AlertTriangle className="h-4 w-4 mr-2" /> Zahlungserinnerung
                          </DropdownMenuItem>
                        )}
                        {["versendet", "ueberfaellig"].includes(inv.status) && (
                          <DropdownMenuItem onClick={() => handleAction(inv.id, "mahnung", { stufe: 1 })}>
                            <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" /> 1. Mahnung senden
                          </DropdownMenuItem>
                        )}
                        {inv.status === "gemahnt_1" && (
                          <DropdownMenuItem onClick={() => handleAction(inv.id, "mahnung", { stufe: 2 })}>
                            <AlertTriangle className="h-4 w-4 mr-2 text-red-500" /> 2. Mahnung senden
                          </DropdownMenuItem>
                        )}
                        {inv.status !== "bezahlt" && (
                          <DropdownMenuItem onClick={() => handleAction(inv.id, "paid")}>
                            <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" /> Als bezahlt markieren
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => window.open(`/api/admin/bgf-invoices/${inv.id}/pdf`, "_blank")}>
                          <FileText className="h-4 w-4 mr-2" /> Vorschau (PDF mit E-Rechnung)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/api/admin/bgf-invoices/${inv.id}/xml`, "_blank")}>
                          <FileCode className="h-4 w-4 mr-2" /> E-Rechnung als XML
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
