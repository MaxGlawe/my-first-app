"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, ArrowRight, Building2 } from "lucide-react"
import { BGF_PAKETE, GROSSES_TEAM_LABEL, paketLabel } from "@/lib/bgf-pakete"

const MITARBEITER_OPTIONS = ["bis 10", "11–20", "21–35", "36–50", "über 50"]

// Reihenfolge & Wortlaut identisch zur Pricing-Sektion — sonst greift die
// Vorauswahl über ?modell=… nicht (siehe MODELL_OPTIONS.includes unten).
const MODELL_OPTIONS = [
  ...BGF_PAKETE.map(paketLabel),
  GROSSES_TEAM_LABEL,
  "Noch unsicher – Beratung",
]

interface FormData {
  firma: string
  vorname: string
  nachname: string
  position: string
  email: string
  telefon: string
  mitarbeiter: string
  modell: string
  pilot: boolean
  nachricht: string
  datenschutz_akzeptiert: boolean
  website: string // honeypot
  fax_number: string // honeypot 2
}

export function BgfContactForm({ defaultModell = "" }: { defaultModell?: string }) {
  const initial: FormData = {
    firma: "",
    vorname: "",
    nachname: "",
    position: "",
    email: "",
    telefon: "",
    mitarbeiter: "",
    modell: MODELL_OPTIONS.includes(defaultModell) ? defaultModell : "",
    pilot: false,
    nachricht: "",
    datenschutz_akzeptiert: false,
    website: "",
    fax_number: "",
  }

  const [data, setData] = useState<FormData>(initial)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formLoadTime] = useState(() => Date.now())

  function update(fields: Partial<FormData>) {
    setData((prev) => ({ ...prev, ...fields }))
    setError(null)
  }

  function validate(): boolean {
    if (!data.firma.trim()) return fail("Bitte geben Sie Ihren Firmennamen ein.")
    if (!data.vorname.trim()) return fail("Bitte geben Sie Ihren Vornamen ein.")
    if (!data.nachname.trim()) return fail("Bitte geben Sie Ihren Nachnamen ein.")
    if (!data.email.includes("@")) return fail("Bitte geben Sie eine gültige E-Mail-Adresse ein.")
    if (!data.mitarbeiter) return fail("Bitte wählen Sie die Größe Ihres Unternehmens.")
    if (!data.modell) return fail("Bitte wählen Sie ein Paket.")
    if (data.nachricht.trim().length < 10) return fail("Bitte beschreiben Sie Ihr Anliegen (min. 10 Zeichen).")
    if (!data.datenschutz_akzeptiert) return fail("Bitte akzeptieren Sie die Datenschutzerklärung.")
    return true
  }

  function fail(msg: string): false {
    setError(msg)
    return false
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/bgf-anfrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, _t: formLoadTime }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? "Ein Fehler ist aufgetreten.")
        return
      }
      setSuccess(true)
    } catch {
      setError("Netzwerkfehler. Bitte versuchen Sie es erneut.")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-14 h-14 rounded-full bg-landing-accent/10 flex items-center justify-center mb-5">
          <CheckCircle2 className="h-7 w-7 text-landing-accent" />
        </div>
        <h3 className="font-display text-2xl font-bold text-landing-fg mb-2">Vielen Dank!</h3>
        <p className="text-landing-fg-muted max-w-md mx-auto">
          Ihre Anfrage ist bei uns eingegangen. Wir melden uns innerhalb von{" "}
          <span className="font-semibold text-landing-fg">24 Stunden</span> persönlich bei Ihnen —
          in der Regel direkt von Max Glawe.
        </p>
        <Link href="/unternehmen" className="inline-flex items-center gap-1.5 mt-6 text-landing-accent font-semibold hover:gap-2.5 transition-all">
          Zurück zur Übersicht
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  const focusRing = "focus-visible:ring-landing-accent"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Honeypots — hidden from real users */}
      <div className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden="true">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => update({ website: e.target.value })} />
        <input type="text" name="fax_number" tabIndex={-1} autoComplete="off" value={data.fax_number} onChange={(e) => update({ fax_number: e.target.value })} />
      </div>

      {/* Firma */}
      <div className="space-y-1.5">
        <Label htmlFor="firma">Unternehmen *</Label>
        <Input id="firma" value={data.firma} onChange={(e) => update({ firma: e.target.value })} className={focusRing} placeholder="Muster GmbH" />
      </div>

      {/* Ansprechpartner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="vorname">Vorname *</Label>
          <Input id="vorname" value={data.vorname} onChange={(e) => update({ vorname: e.target.value })} className={focusRing} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nachname">Nachname *</Label>
          <Input id="nachname" value={data.nachname} onChange={(e) => update({ nachname: e.target.value })} className={focusRing} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="position">Position / Rolle <span className="text-landing-fg-subtle font-normal">(optional)</span></Label>
        <Input id="position" value={data.position} onChange={(e) => update({ position: e.target.value })} className={focusRing} placeholder="z. B. HR-Leitung, Geschäftsführung" />
      </div>

      {/* Kontakt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-Mail (geschäftlich) *</Label>
          <Input id="email" type="email" value={data.email} onChange={(e) => update({ email: e.target.value })} className={focusRing} placeholder="name@unternehmen.de" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="telefon">Telefon <span className="text-landing-fg-subtle font-normal">(optional)</span></Label>
          <Input id="telefon" type="tel" value={data.telefon} onChange={(e) => update({ telefon: e.target.value })} className={focusRing} />
        </div>
      </div>

      {/* Mitarbeitende */}
      <div className="space-y-2">
        <Label>Anzahl Mitarbeitende *</Label>
        <div className="flex flex-wrap gap-2">
          {MITARBEITER_OPTIONS.map((opt) => {
            const selected = data.mitarbeiter === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => update({ mitarbeiter: opt })}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  selected
                    ? "border-landing-accent bg-landing-accent/10 text-landing-accent font-semibold"
                    : "border-landing-border text-landing-fg-muted hover:border-landing-accent/40"
                }`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>

      {/* Passendes Paket */}
      <div className="space-y-2">
        <Label>Passendes Paket *</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MODELL_OPTIONS.map((opt) => {
            const selected = data.modell === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => update({ modell: opt })}
                className={`rounded-xl border px-4 py-3 text-sm text-left transition-colors ${
                  selected
                    ? "border-landing-accent bg-landing-accent/10 text-landing-accent font-semibold"
                    : "border-landing-border text-landing-fg-muted hover:border-landing-accent/40"
                }`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>

      {/* Nachricht */}
      <div className="space-y-1.5">
        <Label htmlFor="nachricht">Ihre Fragen / Ihr Anliegen *</Label>
        <Textarea
          id="nachricht"
          rows={5}
          value={data.nachricht}
          onChange={(e) => update({ nachricht: e.target.value })}
          className={focusRing}
          placeholder="Erzählen Sie uns kurz von Ihrem Team, Ihren Zielen und worüber Sie sprechen möchten."
        />
      </div>

      {/* Pilot */}
      <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-landing-border bg-landing-bg p-4">
        <Checkbox checked={data.pilot} onCheckedChange={(v) => update({ pilot: v === true })} className="mt-0.5" />
        <span className="text-sm leading-relaxed text-landing-fg-muted">
          <span className="font-semibold text-landing-fg">Ja, ich interessiere mich für das Pilot-Programm</span>{" "}
          — 30 Tage kostenlos mit 10–20 Mitarbeitenden, unverbindlich.
        </span>
      </label>

      {/* Datenschutz */}
      <label className="flex items-start gap-3 cursor-pointer">
        <Checkbox checked={data.datenschutz_akzeptiert} onCheckedChange={(v) => update({ datenschutz_akzeptiert: v === true })} className="mt-0.5" />
        <span className="text-sm leading-relaxed text-landing-fg-muted">
          Ich habe die{" "}
          <Link href="/datenschutz" target="_blank" className="underline text-landing-accent">
            Datenschutzerklärung
          </Link>{" "}
          gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung der Anfrage zu. *
        </span>
      </label>

      <Button
        type="submit"
        disabled={submitting}
        size="lg"
        className="w-full sm:w-auto bg-landing-accent hover:bg-landing-accent-hover text-white rounded-full px-8 shadow-lg shadow-landing-accent/25"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Wird gesendet…
          </>
        ) : (
          <>
            <Building2 className="mr-2 h-4 w-4" />
            Anfrage absenden
          </>
        )}
      </Button>
    </form>
  )
}
