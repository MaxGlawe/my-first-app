"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GebuehSearch } from "./GebuehSearch"
import { useGebueh } from "@/hooks/use-gebueh"
import { Plus, Trash2, Save } from "lucide-react"
import { toast } from "sonner"
import type { GebuehCode, LineItemFormData } from "@/types/billing"

interface Patient {
  id: string
  vorname: string
  nachname: string
}

export function InvoiceForm() {
  const router = useRouter()
  const { codes, loading: gebuehLoading } = useGebueh()
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientsLoading, setPatientsLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [patientId, setPatientId] = useState("")
  const [treatmentDate, setTreatmentDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [diagnoseText, setDiagnoseText] = useState("")
  const [notes, setNotes] = useState("")
  const [lineItems, setLineItems] = useState<LineItemFormData[]>([])

  // Patienten laden
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { supabase } = await import("@/lib/supabase")
        const { data } = await supabase
          .from("patients")
          .select("id, vorname, nachname")
          .is("archived_at", null)
          .order("nachname", { ascending: true })
          .limit(500)

        if (!cancelled && data) setPatients(data)
      } catch {
        // silent
      } finally {
        if (!cancelled) setPatientsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const addGebuehItem = (code: GebuehCode) => {
    setLineItems((prev) => [
      ...prev,
      {
        gebueh_ziffer: code.ziffer,
        beschreibung: code.bezeichnung,
        anzahl: 1,
        einzelpreis: code.preis_default ?? code.preis_min,
      },
    ])
  }

  const addCustomItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        gebueh_ziffer: null,
        beschreibung: "",
        anzahl: 1,
        einzelpreis: 0,
      },
    ])
  }

  const updateItem = (index: number, field: keyof LineItemFormData, value: string | number | null) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const removeItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index))
  }

  const totalAmount = lineItems.reduce(
    (sum, item) => sum + item.anzahl * item.einzelpreis,
    0
  )

  const handleSave = async () => {
    if (!patientId) {
      toast.error("Bitte wähle einen Patienten aus.")
      return
    }
    if (lineItems.length === 0) {
      toast.error("Bitte füge mindestens eine Position hinzu.")
      return
    }
    if (lineItems.some((item) => !item.beschreibung)) {
      toast.error("Alle Positionen brauchen eine Beschreibung.")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          treatment_date: treatmentDate,
          invoice_date: invoiceDate,
          diagnose_text: diagnoseText || null,
          notes: notes || null,
          line_items: lineItems,
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        toast.error(json.error || "Fehler beim Erstellen der Rechnung.")
        return
      }

      const { data } = await res.json()
      toast.success(`Rechnung ${data.invoice_number} erstellt.`)
      router.push(`/os/admin/billing/${data.id}`)
    } catch {
      toast.error("Ein Fehler ist aufgetreten.")
    } finally {
      setSaving(false)
    }
  }

  // GebüH-Code Preisgrenzen-Info
  const getCodeForZiffer = (ziffer: string | null) =>
    ziffer ? codes.find((c) => c.ziffer === ziffer) : null

  return (
    <div className="space-y-6">
      {/* Basisdaten */}
      <Card>
        <CardHeader>
          <CardTitle>Rechnungsdaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Patient *</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      patientsLoading ? "Laden..." : "Patient auswählen..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nachname}, {p.vorname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Diagnose (optional)</Label>
              <Input
                placeholder="z.B. LWS-Syndrom, Cervicobrachialgie"
                value={diagnoseText}
                onChange={(e) => setDiagnoseText(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Behandlungsdatum *</Label>
              <Input
                type="date"
                value={treatmentDate}
                onChange={(e) => setTreatmentDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Rechnungsdatum</Label>
              <Input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notizen (intern, nicht auf Rechnung)</Label>
            <Textarea
              placeholder="Interne Notizen..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Positionen */}
      <Card>
        <CardHeader>
          <CardTitle>Rechnungspositionen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* GebüH-Suche */}
          <div className="flex gap-2">
            <div className="flex-1">
              <GebuehSearch
                codes={gebuehLoading ? [] : codes}
                onSelect={addGebuehItem}
              />
            </div>
            <Button variant="outline" onClick={addCustomItem}>
              <Plus className="h-4 w-4 mr-1" />
              Freie Position
            </Button>
          </div>

          {/* Line Items */}
          {lineItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Noch keine Positionen. Wähle eine GebüH-Leistung aus oder füge
              eine freie Position hinzu.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Header */}
              <div className="hidden md:grid grid-cols-12 gap-2 px-2 text-xs font-medium text-muted-foreground">
                <div className="col-span-1">Ziffer</div>
                <div className="col-span-5">Beschreibung</div>
                <div className="col-span-1">Anz.</div>
                <div className="col-span-2">Einzelpreis</div>
                <div className="col-span-2 text-right">Gesamt</div>
                <div className="col-span-1" />
              </div>

              {lineItems.map((item, index) => {
                const codeInfo = getCodeForZiffer(item.gebueh_ziffer)
                const gesamt = item.anzahl * item.einzelpreis
                const outOfRange =
                  codeInfo &&
                  (item.einzelpreis < codeInfo.preis_min ||
                    item.einzelpreis > codeInfo.preis_max)

                return (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-start p-2 rounded-lg border bg-card"
                  >
                    <div className="col-span-12 md:col-span-1">
                      <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.gebueh_ziffer || "—"}
                      </span>
                    </div>
                    <div className="col-span-12 md:col-span-5">
                      <Input
                        value={item.beschreibung}
                        onChange={(e) =>
                          updateItem(index, "beschreibung", e.target.value)
                        }
                        placeholder="Beschreibung"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-4 md:col-span-1">
                      <Input
                        type="number"
                        min={1}
                        value={item.anzahl}
                        onChange={(e) =>
                          updateItem(index, "anzahl", parseInt(e.target.value) || 1)
                        }
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-5 md:col-span-2">
                      <div>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          value={item.einzelpreis}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "einzelpreis",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className={`text-sm ${outOfRange ? "border-amber-400" : ""}`}
                        />
                        {codeInfo && (
                          <p className={`text-[10px] mt-0.5 ${outOfRange ? "text-amber-600" : "text-muted-foreground"}`}>
                            {codeInfo.preis_min.toFixed(2)}–{codeInfo.preis_max.toFixed(2)} €
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2 md:col-span-2 flex items-center justify-end">
                      <span className="font-medium text-sm">
                        {gesamt.toFixed(2).replace(".", ",")} €
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}

              {/* Summe */}
              <div className="flex justify-end items-center gap-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">
                  Gesamtbetrag (netto = brutto, §4 Nr.14 UStG):
                </span>
                <span className="text-xl font-bold">
                  {totalAmount.toFixed(2).replace(".", ",")} €
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Aktionen */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          Abbrechen
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Speichere..." : "Rechnung speichern"}
        </Button>
      </div>
    </div>
  )
}
