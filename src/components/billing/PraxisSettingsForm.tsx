"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save } from "lucide-react"
import { toast } from "sonner"
import type { PraxisSettings } from "@/types/billing"

export function PraxisSettingsForm() {
  const [settings, setSettings] = useState<PraxisSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/admin/praxis-settings")
        if (!res.ok) throw new Error()
        const json = await res.json()
        if (!cancelled) setSettings(json.data)
      } catch {
        // Settings not found
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const update = (field: keyof PraxisSettings, value: string) => {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
  }

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/praxis-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (!res.ok) {
        const json = await res.json()
        toast.error(json.error || "Fehler beim Speichern.")
        return
      }
      toast.success("Praxis-Einstellungen gespeichert.")
    } catch {
      toast.error("Ein Fehler ist aufgetreten.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="h-96 bg-muted animate-pulse rounded-lg" />
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Praxis-Einstellungen konnten nicht geladen werden.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Praxis-Stammdaten</CardTitle>
          <CardDescription>
            Diese Daten erscheinen auf jeder Rechnung als Briefkopf.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Praxisname *</Label>
              <Input value={settings.praxis_name} onChange={(e) => update("praxis_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Inhaber *</Label>
              <Input value={settings.inhaber_name} onChange={(e) => update("inhaber_name", e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Straße *</Label>
              <Input value={settings.strasse} onChange={(e) => update("strasse", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>PLZ *</Label>
              <Input value={settings.plz} onChange={(e) => update("plz", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Ort *</Label>
              <Input value={settings.ort} onChange={(e) => update("ort", e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input value={settings.telefon || ""} onChange={(e) => update("telefon", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>E-Mail</Label>
              <Input value={settings.email || ""} onChange={(e) => update("email", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input value={settings.website || ""} onChange={(e) => update("website", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bankverbindung</CardTitle>
          <CardDescription>
            Wird für die Zahlungsinformationen und den QR-Code auf der Rechnung verwendet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>IBAN *</Label>
            <Input value={settings.iban} onChange={(e) => update("iban", e.target.value)} placeholder="DE00 0000 0000 0000 0000 00" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>BIC</Label>
              <Input value={settings.bic || ""} onChange={(e) => update("bic", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Bankname</Label>
              <Input value={settings.bank_name || ""} onChange={(e) => update("bank_name", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rechtliches</CardTitle>
          <CardDescription>
            Steuernummer und Zulassungsnummer für die Rechnungsfußzeile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Steuernummer</Label>
              <Input value={settings.steuernummer || ""} onChange={(e) => update("steuernummer", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Heilpraktiker-Zulassungsnummer</Label>
              <Input value={settings.zulassungsnummer || ""} onChange={(e) => update("zulassungsnummer", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Speichere..." : "Einstellungen speichern"}
        </Button>
      </div>
    </div>
  )
}
