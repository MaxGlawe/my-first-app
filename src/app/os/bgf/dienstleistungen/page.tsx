"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft, Plus, Loader2, Package, Video, MapPin, CheckCircle2,
  Clock, Inbox, MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ── Types ────────────────────────────────────────────────────────────

interface Service {
  id: string; name: string; beschreibung: string | null; dauer_minuten: number
  preis: number; art: string; kategorie: string; aktiv: boolean; created_at: string
}

interface Booking {
  id: string; organization_id: string; wunschtermin: string | null; abteilung: string | null
  anmerkung: string | null; teilnehmer_anzahl: number; status: string; created_at: string
  service: { name: string; preis: number; art: string; kategorie: string; dauer_minuten: number } | null
}

const ART_LABELS: Record<string, { label: string; icon: typeof Video }> = {
  video: { label: "Video", icon: Video },
  vor_ort: { label: "Vor Ort", icon: MapPin },
  beides: { label: "Video / Vor Ort", icon: Video },
}

const KAT_LABELS: Record<string, string> = {
  beratung: "Beratung", workshop: "Workshop", analyse: "Analyse", training: "Training",
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  angefragt: { label: "Angefragt", color: "bg-blue-100 text-blue-700" },
  bestaetigt: { label: "Bestätigt", color: "bg-emerald-100 text-emerald-700" },
  durchgefuehrt: { label: "Durchgeführt", color: "bg-slate-100 text-slate-700" },
  abgerechnet: { label: "Abgerechnet", color: "bg-purple-100 text-purple-700" },
  storniert: { label: "Storniert", color: "bg-red-100 text-red-700" },
}

// ── Create Service Dialog ────────────────────────────────────────────

function CreateServiceDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [beschreibung, setBeschreibung] = useState("")
  const [dauer, setDauer] = useState("60")
  const [preis, setPreis] = useState("")
  const [art, setArt] = useState("video")
  const [kategorie, setKategorie] = useState("beratung")

  async function handleCreate() {
    setSaving(true)
    try {
      const res = await fetch("/api/bgf/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(), beschreibung: beschreibung.trim() || undefined,
          dauer_minuten: parseInt(dauer), preis: parseFloat(preis), art, kategorie,
        }),
      })
      if (res.ok) {
        setOpen(false)
        setName(""); setBeschreibung(""); setPreis(""); setDauer("60")
        onCreated()
      }
    } catch { /* */ } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Leistung erstellen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Neue Dienstleistung</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="z.B. Ergonomie-Beratung Arbeitsplatz" className="mt-1" />
          </div>
          <div>
            <Label>Beschreibung</Label>
            <Textarea value={beschreibung} onChange={(e) => setBeschreibung(e.target.value)} placeholder="Was beinhaltet die Leistung?" className="mt-1" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Dauer (Minuten)</Label>
              <Input type="number" value={dauer} onChange={(e) => setDauer(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Preis (€ netto)</Label>
              <Input type="number" step="0.01" value={preis} onChange={(e) => setPreis(e.target.value)} placeholder="z.B. 249" className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Art</Label>
              <Select value={art} onValueChange={setArt}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="vor_ort">Vor Ort</SelectItem>
                  <SelectItem value="beides">Beides</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Kategorie</Label>
              <Select value={kategorie} onValueChange={setKategorie}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beratung">Beratung</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="analyse">Analyse</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleCreate} disabled={saving || !name || !preis} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Leistung erstellen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Page ──────────────────────────────────────────────────────────────

export default function DienstleistungenPage() {
  const [services, setServices] = useState<Service[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [sRes, bRes] = await Promise.all([
        fetch("/api/bgf/services"),
        fetch("/api/bgf/bookings"),
      ])
      const [sData, bData] = await Promise.all([sRes.json(), bRes.json()])
      setServices(sData.services ?? [])
      setBookings(bData.bookings ?? [])
    } catch { /* */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function toggleService(id: string, aktiv: boolean) {
    await fetch(`/api/bgf/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aktiv }),
    })
    setServices((prev) => prev.map((s) => s.id === id ? { ...s, aktiv } : s))
  }

  async function updateBookingStatus(id: string, status: string) {
    setActionLoading(id)
    await fetch(`/api/bgf/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    fetchData()
    setActionLoading(null)
  }

  const offeneAnfragen = bookings.filter((b) => b.status === "angefragt").length

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <Link href="/os/bgf" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mb-4 w-fit">
          <ArrowLeft className="h-4 w-4" /> BGF-Übersicht
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dienstleistungen</h1>
            <p className="text-sm text-slate-500 mt-1">Zusatzleistungen für BGF-Unternehmen (§2a)</p>
          </div>
          <CreateServiceDialog onCreated={fetchData} />
        </div>
      </div>

      {/* Offene Anfragen Hinweis */}
      {offeneAnfragen > 0 && (
        <div className="mb-6 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <Inbox className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">{offeneAnfragen} offene Buchungsanfrage{offeneAnfragen > 1 ? "n" : ""}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Services Catalog */}
          <div>
            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Ihr Leistungskatalog ({services.length})</h2>
            {services.length === 0 ? (
              <Card className="text-center py-12">
                <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Noch keine Leistungen erstellt.</p>
              </Card>
            ) : (
              <div className="grid gap-3">
                {services.map((s) => (
                  <Card key={s.id} className={`rounded-xl ${!s.aktiv ? "opacity-60" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{s.name}</h3>
                            <Badge className="text-[10px] border-0 bg-slate-100 text-slate-600">{KAT_LABELS[s.kategorie] ?? s.kategorie}</Badge>
                            <Badge className="text-[10px] border-0 bg-slate-100 text-slate-600">{ART_LABELS[s.art]?.label ?? s.art}</Badge>
                          </div>
                          {s.beschreibung && <p className="text-xs text-slate-500 line-clamp-1">{s.beschreibung}</p>}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-slate-900">{Number(s.preis).toFixed(2)} €</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                            <Clock className="h-3 w-3" /> {s.dauer_minuten} Min.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Switch checked={s.aktiv} onCheckedChange={(v) => toggleService(s.id, v)} />
                          <span className="text-[10px] text-slate-400 w-8">{s.aktiv ? "An" : "Aus"}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Bookings */}
          <div>
            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Buchungsanfragen ({bookings.length})</h2>
            {bookings.length === 0 ? (
              <Card className="text-center py-12">
                <Inbox className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Noch keine Anfragen.</p>
              </Card>
            ) : (
              <Card className="rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leistung</TableHead>
                      <TableHead>Wunschtermin</TableHead>
                      <TableHead>Abteilung</TableHead>
                      <TableHead>TN</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((b) => {
                      const sc = STATUS_CONFIG[b.status]
                      return (
                        <TableRow key={b.id}>
                          <TableCell className="font-medium">{b.service?.name ?? "—"}</TableCell>
                          <TableCell className="text-sm text-slate-500">{b.wunschtermin ?? "Flexibel"}</TableCell>
                          <TableCell className="text-sm text-slate-500">{b.abteilung ?? "—"}</TableCell>
                          <TableCell className="text-sm">{b.teilnehmer_anzahl}</TableCell>
                          <TableCell><Badge className={`text-[10px] border-0 ${sc?.color ?? ""}`}>{sc?.label ?? b.status}</Badge></TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={actionLoading === b.id}>
                                  {actionLoading === b.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {b.status === "angefragt" && (
                                  <DropdownMenuItem onClick={() => updateBookingStatus(b.id, "bestaetigt")}>
                                    <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" /> Bestätigen
                                  </DropdownMenuItem>
                                )}
                                {b.status === "bestaetigt" && (
                                  <DropdownMenuItem onClick={() => updateBookingStatus(b.id, "durchgefuehrt")}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" /> Als durchgeführt markieren
                                  </DropdownMenuItem>
                                )}
                                {b.status === "durchgefuehrt" && (
                                  <DropdownMenuItem onClick={() => updateBookingStatus(b.id, "abgerechnet")}>
                                    <CheckCircle2 className="h-4 w-4 mr-2 text-purple-500" /> Abgerechnet
                                  </DropdownMenuItem>
                                )}
                                {["angefragt", "bestaetigt"].includes(b.status) && (
                                  <DropdownMenuItem onClick={() => updateBookingStatus(b.id, "storniert")} className="text-red-600">
                                    Stornieren
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
