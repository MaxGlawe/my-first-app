"use client"

import { useState, useEffect, useCallback } from "react"
import { useHrAuth } from "@/hooks/use-hr-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Video, MapPin, Clock, ShoppingCart, CheckCircle2, Loader2,
  Package, Inbox,
} from "lucide-react"

// ── Types ────────────────────────────────────────────────────────────

interface Service {
  id: string; name: string; beschreibung: string | null; dauer_minuten: number
  preis: number; art: string; kategorie: string
}

interface Booking {
  id: string; status: string; wunschtermin: string | null; abteilung: string | null
  teilnehmer_anzahl: number; created_at: string
  service: { name: string; preis: number; art: string; dauer_minuten: number } | null
}

const ART_ICONS: Record<string, { label: string; icon: typeof Video }> = {
  video: { label: "Video-Termin", icon: Video },
  vor_ort: { label: "Vor-Ort-Termin", icon: MapPin },
  beides: { label: "Video oder Vor Ort", icon: Video },
}

const KAT_COLORS: Record<string, string> = {
  beratung: "bg-blue-50 text-blue-700 border-blue-100",
  workshop: "bg-violet-50 text-violet-700 border-violet-100",
  analyse: "bg-amber-50 text-amber-700 border-amber-100",
  training: "bg-emerald-50 text-emerald-700 border-emerald-100",
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  angefragt: { label: "Angefragt", color: "bg-blue-100 text-blue-700" },
  bestaetigt: { label: "Bestätigt", color: "bg-emerald-100 text-emerald-700" },
  durchgefuehrt: { label: "Durchgeführt", color: "bg-slate-100 text-slate-700" },
  abgerechnet: { label: "Abgerechnet", color: "bg-purple-100 text-purple-700" },
  storniert: { label: "Storniert", color: "bg-red-100 text-red-700" },
}

// ── Page ──────────────────────────────────────────────────────────────

export default function HrLeistungenPage() {
  const { isLoading: authLoading, isAuthorized, organizationId } = useHrAuth()
  const [services, setServices] = useState<Service[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  // Booking dialog
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [wunschtermin, setWunschtermin] = useState("")
  const [abteilung, setAbteilung] = useState("")
  const [anmerkung, setAnmerkung] = useState("")
  const [teilnehmer, setTeilnehmer] = useState("1")
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)

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

  useEffect(() => {
    if (isAuthorized) fetchData()
  }, [isAuthorized, fetchData])

  async function handleBook() {
    if (!selectedService || !organizationId) return
    setBooking(true)
    try {
      const res = await fetch("/api/bgf/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: selectedService.id,
          organization_id: organizationId,
          wunschtermin: wunschtermin.trim() || undefined,
          abteilung: abteilung.trim() || undefined,
          anmerkung: anmerkung.trim() || undefined,
          teilnehmer_anzahl: parseInt(teilnehmer) || 1,
        }),
      })
      if (res.ok) {
        setBooked(true)
        fetchData()
        setTimeout(() => {
          setSelectedService(null)
          setBooked(false)
          setWunschtermin(""); setAbteilung(""); setAnmerkung(""); setTeilnehmer("1")
        }, 2000)
      }
    } catch { /* */ } finally { setBooking(false) }
  }

  if (authLoading) return <div className="space-y-4 p-8"><Skeleton className="h-40 w-full" /><Skeleton className="h-40 w-full" /></div>
  if (!isAuthorized) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Zusatzleistungen buchen</h1>
        <p className="text-sm text-slate-500 mt-1">
          Individuelle Beratungen, Workshops und Analysen für Ihr Unternehmen (gem. §2a Ihres Vertrages)
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* Service Catalog */}
          {services.length === 0 ? (
            <Card className="text-center py-16 rounded-2xl">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Noch keine Leistungen verfügbar.</p>
              <p className="text-sm text-slate-400 mt-1">Ihr Therapeut wird in Kürze Leistungen freischalten.</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {services.map((s) => {
                const artInfo = ART_ICONS[s.art]
                const ArtIcon = artInfo?.icon ?? Video
                return (
                  <Card key={s.id} className="rounded-2xl border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all group">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Badge className={`text-[10px] border mb-2 ${KAT_COLORS[s.kategorie] ?? "bg-slate-50 text-slate-600"}`}>
                            {s.kategorie.charAt(0).toUpperCase() + s.kategorie.slice(1)}
                          </Badge>
                          <h3 className="text-base font-bold text-slate-900">{s.name}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-emerald-700">{Number(s.preis).toFixed(0)} €</p>
                          <p className="text-[10px] text-slate-400">netto</p>
                        </div>
                      </div>

                      {s.beschreibung && (
                        <details className="mb-3 group">
                          <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-700 list-none">
                            <span className="line-clamp-2 group-open:line-clamp-none">{s.beschreibung}</span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1 group-open:hidden">
                              Mehr lesen ▾
                            </span>
                            <span className="hidden group-open:inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
                              Weniger ▴
                            </span>
                          </summary>
                        </details>
                      )}

                      <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.dauer_minuten} Min.</span>
                        <span className="flex items-center gap-1"><ArtIcon className="h-3 w-3" />{artInfo?.label ?? s.art}</span>
                      </div>

                      <Button
                        onClick={() => setSelectedService(s)}
                        className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                        size="sm"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Anfragen
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* My Bookings */}
          {bookings.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Ihre Buchungen</h2>
              <div className="space-y-2">
                {bookings.map((b) => {
                  const sc = STATUS_CONFIG[b.status]
                  return (
                    <Card key={b.id} className="rounded-xl">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900">{b.service?.name ?? "—"}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {b.wunschtermin ?? "Flexibel"} {b.abteilung ? `· ${b.abteilung}` : ""}
                            {b.teilnehmer_anzahl > 1 ? ` · ${b.teilnehmer_anzahl} TN` : ""}
                          </p>
                        </div>
                        <Badge className={`text-[10px] border-0 ${sc?.color ?? ""}`}>{sc?.label ?? b.status}</Badge>
                        <span className="text-sm font-bold text-slate-700">{Number(b.service?.preis ?? 0).toFixed(0)} €</span>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Booking Dialog */}
      <Dialog open={!!selectedService} onOpenChange={(v) => { if (!v) setSelectedService(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedService?.name}</DialogTitle>
          </DialogHeader>

          {booked ? (
            <div className="text-center py-6">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">Anfrage gesendet!</h3>
              <p className="text-sm text-slate-500 mt-1">Ihr Therapeut wird sich in Kürze bei Ihnen melden.</p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
                <span className="text-sm text-slate-600">{selectedService?.dauer_minuten} Min. · {ART_ICONS[selectedService?.art ?? ""]?.label ?? ""}</span>
                <span className="text-lg font-bold text-emerald-700">{Number(selectedService?.preis ?? 0).toFixed(0)} €</span>
              </div>

              <div>
                <Label>Wunschtermin</Label>
                <Input value={wunschtermin} onChange={(e) => setWunschtermin(e.target.value)} placeholder="z.B. KW 14, Dienstag Vormittag" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Abteilung</Label>
                  <Input value={abteilung} onChange={(e) => setAbteilung(e.target.value)} placeholder="z.B. Verwaltung" className="mt-1" />
                </div>
                <div>
                  <Label>Teilnehmer</Label>
                  <Input type="number" min="1" value={teilnehmer} onChange={(e) => setTeilnehmer(e.target.value)} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Anmerkungen (optional)</Label>
                <Textarea value={anmerkung} onChange={(e) => setAnmerkung(e.target.value)} placeholder="Besondere Wünsche oder Informationen..." className="mt-1" rows={2} />
              </div>
              <Button onClick={handleBook} disabled={booking} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
                {booking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                Verbindlich anfragen
              </Button>
              <p className="text-[10px] text-slate-400 text-center">
                Die Anfrage ist zunächst unverbindlich. Nach Bestätigung durch den Therapeuten wird die Leistung gemäß §2a Ihres Vertrages separat abgerechnet.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
