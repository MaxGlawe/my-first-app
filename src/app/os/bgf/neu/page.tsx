"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Building2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { VertragTier, OrgGroesse } from "@/types/bgf"

export default function NeueOrganisationPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [branche, setBranche] = useState("")
  const [groesse, setGroesse] = useState<OrgGroesse | "">("")
  const [kontaktName, setKontaktName] = useState("")
  const [kontaktEmail, setKontaktEmail] = useState("")
  const [kontaktTelefon, setKontaktTelefon] = useState("")
  const [strasse, setStrasse] = useState("")
  const [plz, setPlz] = useState("")
  const [ort, setOrt] = useState("")
  const [tier, setTier] = useState<VertragTier>("pro")
  const [lizenzen, setLizenzen] = useState(50)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const res = await fetch("/api/bgf/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          branche: branche.trim() || undefined,
          groesse: groesse || undefined,
          kontakt_name: kontaktName.trim(),
          kontakt_email: kontaktEmail.trim(),
          kontakt_telefon: kontaktTelefon.trim() || undefined,
          adresse_strasse: strasse.trim() || undefined,
          adresse_plz: plz.trim() || undefined,
          adresse_ort: ort.trim() || undefined,
          vertrag_tier: tier,
          vertrag_lizenzen: lizenzen,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Fehler beim Anlegen.")
        setSaving(false)
        return
      }

      router.push(`/os/bgf/${data.organization.id}`)
    } catch {
      setError("Netzwerkfehler. Bitte erneut versuchen.")
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/os/bgf"
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Zurück zum BGF-Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Neue Organisation anlegen</h1>
            <p className="text-sm text-slate-400">BGF-Firma einrichten und Mitarbeiter freischalten</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Firmen-Daten */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">
            Unternehmen
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Firmenname *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mustermann GmbH"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="branche">Branche</Label>
              <Input
                id="branche"
                value={branche}
                onChange={(e) => setBranche(e.target.value)}
                placeholder="z.B. IT, Handwerk, Pflege"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Unternehmensgröße</Label>
              <Select value={groesse} onValueChange={(v) => setGroesse(v as OrgGroesse)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-49">1–49 Mitarbeitende</SelectItem>
                  <SelectItem value="50-99">50–99 Mitarbeitende</SelectItem>
                  <SelectItem value="100-249">100–249 Mitarbeitende</SelectItem>
                  <SelectItem value="250-499">250–499 Mitarbeitende</SelectItem>
                  <SelectItem value="500+">500+ Mitarbeitende</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Kontakt */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">
            Ansprechpartner (HR)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kontaktName">Name *</Label>
              <Input
                id="kontaktName"
                value={kontaktName}
                onChange={(e) => setKontaktName(e.target.value)}
                placeholder="Max Mustermann"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="kontaktEmail">E-Mail *</Label>
              <Input
                id="kontaktEmail"
                type="email"
                value={kontaktEmail}
                onChange={(e) => setKontaktEmail(e.target.value)}
                placeholder="hr@firma.de"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="kontaktTelefon">Telefon</Label>
              <Input
                id="kontaktTelefon"
                value={kontaktTelefon}
                onChange={(e) => setKontaktTelefon(e.target.value)}
                placeholder="+49 123 456789"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">
            Adresse
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_2fr] gap-4">
            <div className="sm:col-span-3">
              <Label htmlFor="strasse">Straße + Nr.</Label>
              <Input
                id="strasse"
                value={strasse}
                onChange={(e) => setStrasse(e.target.value)}
                placeholder="Musterstraße 1"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="plz">PLZ</Label>
              <Input
                id="plz"
                value={plz}
                onChange={(e) => setPlz(e.target.value)}
                placeholder="10115"
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="ort">Ort</Label>
              <Input
                id="ort"
                value={ort}
                onChange={(e) => setOrt(e.target.value)}
                placeholder="Berlin"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Vertrag */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">
            Vertrag
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Tier</Label>
              <Select value={tier} onValueChange={(v) => setTier(v as VertragTier)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic — 19€/MA</SelectItem>
                  <SelectItem value="pro">Pro — 39€/MA</SelectItem>
                  <SelectItem value="enterprise">Enterprise — 59€/MA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="lizenzen">Anzahl Lizenzen</Label>
              <Input
                id="lizenzen"
                type="number"
                value={lizenzen}
                onChange={(e) => setLizenzen(parseInt(e.target.value) || 50)}
                min={1}
                max={10000}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/os/bgf">
            <Button type="button" variant="ghost">
              Abbrechen
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={saving || !name.trim() || !kontaktName.trim() || !kontaktEmail.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Organisation anlegen
          </Button>
        </div>
      </form>
    </div>
  )
}
