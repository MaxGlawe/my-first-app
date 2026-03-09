"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Inbox, Mail, Phone, MapPin, Clock, FileText, Loader2, UserPlus } from "lucide-react"

interface IntakeRequest {
  id: string
  created_at: string
  vorname: string
  nachname: string
  email: string
  telefon: string
  beschwerde_bereich: string
  beschwerde_freitext: string
  symptom_dauer: string
  vorherige_behandlung: string[]
  vorherige_behandlung_details: string | null
  status: string
  interne_notizen: string | null
  patient_id: string | null
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  neu: { label: "Neu", color: "bg-amber-100 text-amber-800" },
  kontaktiert: { label: "Kontaktiert", color: "bg-blue-100 text-blue-800" },
  termin_gebucht: { label: "Termin gebucht", color: "bg-violet-100 text-violet-800" },
  patient_erstellt: { label: "Patient erstellt", color: "bg-emerald-100 text-emerald-800" },
  abgelehnt: { label: "Abgelehnt", color: "bg-red-100 text-red-800" },
}

const BEREICH_LABELS: Record<string, string> = {
  ruecken: "Rücken / Wirbelsäule",
  nacken_schulter: "Nacken & Schulter",
  knie: "Knie",
  huefte: "Hüfte",
  fuss_sprunggelenk: "Fuß & Sprunggelenk",
  hand_arm: "Hand & Arm",
  kopf: "Kopfschmerzen / Migräne",
  sonstiges: "Sonstiges",
}

const DAUER_LABELS: Record<string, string> = {
  weniger_1_woche: "< 1 Woche",
  "1_4_wochen": "1–4 Wochen",
  "1_3_monate": "1–3 Monate",
  "3_6_monate": "3–6 Monate",
  mehr_6_monate: "> 6 Monate",
}

export default function AnfragenPage() {
  const [requests, setRequests] = useState<IntakeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("alle")
  const [saving, setSaving] = useState(false)
  const [converting, setConverting] = useState(false)

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/intake")
      const data = await res.json()
      setRequests(data.requests ?? [])
    } catch (err) {
      console.error("Failed to load requests:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const selected = requests.find((r) => r.id === selectedId) ?? null

  const filteredRequests =
    filterStatus === "alle"
      ? requests
      : requests.filter((r) => r.status === filterStatus)

  const statusCounts: Record<string, number> = {}
  for (const r of requests) {
    statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1
  }

  async function updateStatus(id: string, status: string) {
    setSaving(true)
    try {
      await fetch(`/api/intake/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      await fetchRequests()
    } finally {
      setSaving(false)
    }
  }

  async function saveNotes(id: string, notes: string) {
    setSaving(true)
    try {
      await fetch(`/api/intake/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interne_notizen: notes }),
      })
      await fetchRequests()
    } finally {
      setSaving(false)
    }
  }

  async function convertToPatient(id: string) {
    setConverting(true)
    try {
      const res = await fetch(`/api/intake/${id}/convert`, { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        alert(data.message)
        await fetchRequests()
        setSelectedId(null)
      } else {
        alert(data.error ?? "Fehler beim Konvertieren.")
      }
    } finally {
      setConverting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Inbox className="h-8 w-8 text-emerald-600" />
          Anfragen
        </h1>
        <p className="text-muted-foreground mt-2">
          Tele-Therapie-Anfragen von der Website
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "alle", label: "Alle", count: requests.length },
          { key: "neu", label: "Neu", count: statusCounts["neu"] ?? 0 },
          { key: "kontaktiert", label: "Kontaktiert", count: statusCounts["kontaktiert"] ?? 0 },
          { key: "termin_gebucht", label: "Termin gebucht", count: statusCounts["termin_gebucht"] ?? 0 },
          { key: "patient_erstellt", label: "Patient erstellt", count: statusCounts["patient_erstellt"] ?? 0 },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={filterStatus === tab.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(tab.key)}
            className={filterStatus === tab.key ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            {tab.label}
            {tab.count > 0 && (
              <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-xs">
                {tab.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">
          <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
          Lade Anfragen...
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center text-muted-foreground">
            <Inbox className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p>Keine Anfragen vorhanden.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((r) => {
            const statusInfo = STATUS_MAP[r.status] ?? { label: r.status, color: "bg-slate-100 text-slate-600" }
            return (
              <Card
                key={r.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedId(r.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {r.vorname} {r.nachname}
                    </CardTitle>
                    <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-slate-500">
                  <div className="flex flex-wrap gap-x-6 gap-y-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {BEREICH_LABELS[r.beschwerde_bereich] ?? r.beschwerde_bereich}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {DAUER_LABELS[r.symptom_dauer] ?? r.symptom_dauer}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {r.email}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(r.created_at).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={() => setSelectedId(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>
                  {selected.vorname} {selected.nachname}
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Status */}
                <div>
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Status</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(STATUS_MAP).map(([key, info]) => (
                      <Button
                        key={key}
                        size="sm"
                        variant={selected.status === key ? "default" : "outline"}
                        className={selected.status === key ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                        onClick={() => updateStatus(selected.id, key)}
                        disabled={saving}
                      >
                        {info.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Kontakt</Label>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /> {selected.email}</p>
                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /> {selected.telefon}</p>
                  </div>
                </div>

                {/* Complaint */}
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Beschwerden</Label>
                  <p className="text-sm">
                    <Badge variant="outline" className="mr-2">
                      {BEREICH_LABELS[selected.beschwerde_bereich] ?? selected.beschwerde_bereich}
                    </Badge>
                    <Badge variant="outline">
                      {DAUER_LABELS[selected.symptom_dauer] ?? selected.symptom_dauer}
                    </Badge>
                  </p>
                  <p className="text-sm text-slate-600 mt-2 bg-slate-50 rounded-lg p-3">
                    {selected.beschwerde_freitext}
                  </p>
                </div>

                {/* History */}
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Vorbehandlung</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.vorherige_behandlung.map((b) => (
                      <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>
                    ))}
                  </div>
                  {selected.vorherige_behandlung_details && (
                    <p className="text-sm text-slate-500 bg-slate-50 rounded-lg p-3">
                      {selected.vorherige_behandlung_details}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    Interne Notizen
                  </Label>
                  <Textarea
                    rows={3}
                    defaultValue={selected.interne_notizen ?? ""}
                    placeholder="Notizen für das Team..."
                    onBlur={(e) => {
                      if (e.target.value !== (selected.interne_notizen ?? "")) {
                        saveNotes(selected.id, e.target.value)
                      }
                    }}
                  />
                </div>

                {/* Convert to patient */}
                {selected.status !== "patient_erstellt" && !selected.patient_id && (
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => convertToPatient(selected.id)}
                    disabled={converting}
                  >
                    {converting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    Patient erstellen
                  </Button>
                )}

                {selected.patient_id && (
                  <p className="text-sm text-emerald-600 font-medium text-center">
                    Patient wurde erstellt
                  </p>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
