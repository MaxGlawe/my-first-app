"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useConversionTracker } from "@/hooks/use-conversion-tracker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IntakeProgress } from "./IntakeProgress"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"

const BESCHWERDE_BEREICHE = [
  { value: "ruecken", label: "Rücken / Wirbelsäule" },
  { value: "nacken_schulter", label: "Nacken & Schulter" },
  { value: "knie", label: "Knie" },
  { value: "huefte", label: "Hüfte" },
  { value: "fuss_sprunggelenk", label: "Fuß & Sprunggelenk" },
  { value: "hand_arm", label: "Hand & Arm" },
  { value: "kopf", label: "Kopfschmerzen / Migräne" },
  { value: "sonstiges", label: "Sonstiges" },
]

const SYMPTOM_DAUER_OPTIONS = [
  { value: "weniger_1_woche", label: "Weniger als 1 Woche" },
  { value: "1_4_wochen", label: "1–4 Wochen" },
  { value: "1_3_monate", label: "1–3 Monate" },
  { value: "3_6_monate", label: "3–6 Monate" },
  { value: "mehr_6_monate", label: "Mehr als 6 Monate" },
]

const VORBEHANDLUNG_OPTIONS = [
  { value: "physiotherapie", label: "Physiotherapie" },
  { value: "orthopaedie", label: "Orthopäde" },
  { value: "hausarzt", label: "Hausarzt" },
  { value: "chiropraktik", label: "Chiropraktik" },
  { value: "osteopathie", label: "Osteopathie" },
  { value: "keine", label: "Keine Behandlung bisher" },
]

interface FormData {
  vorname: string
  nachname: string
  email: string
  telefon: string
  beschwerde_bereich: string
  beschwerde_freitext: string
  symptom_dauer: string
  vorherige_behandlung: string[]
  vorherige_behandlung_details: string
  datenschutz_akzeptiert: boolean
  agb_akzeptiert: boolean
  heilpraktiker_info: boolean
  website: string // honeypot
  fax_number: string // honeypot 2
}

const initialData: FormData = {
  vorname: "",
  nachname: "",
  email: "",
  telefon: "",
  beschwerde_bereich: "",
  beschwerde_freitext: "",
  symptom_dauer: "",
  vorherige_behandlung: [],
  vorherige_behandlung_details: "",
  datenschutz_akzeptiert: false,
  agb_akzeptiert: false,
  heilpraktiker_info: false,
  website: "",
  fax_number: "",
}

export function IntakeForm() {
  const router = useRouter()
  const { trackConversion } = useConversionTracker()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<FormData>(initialData)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formLoadTime] = useState(() => Date.now())

  useEffect(() => { trackConversion("anfrage_opened") }, [trackConversion])

  function update(fields: Partial<FormData>) {
    setData((prev) => ({ ...prev, ...fields }))
    setError(null)
  }

  function toggleBehandlung(value: string) {
    setData((prev) => ({
      ...prev,
      vorherige_behandlung: prev.vorherige_behandlung.includes(value)
        ? prev.vorherige_behandlung.filter((v) => v !== value)
        : [...prev.vorherige_behandlung, value],
    }))
  }

  function validateStep(): boolean {
    if (step === 1) {
      if (!data.vorname.trim()) { setError("Bitte geben Sie Ihren Vornamen ein."); return false }
      if (!data.nachname.trim()) { setError("Bitte geben Sie Ihren Nachnamen ein."); return false }
      if (!data.email.includes("@")) { setError("Bitte geben Sie eine gültige E-Mail-Adresse ein."); return false }
      if (data.telefon.length < 5) { setError("Bitte geben Sie Ihre Telefonnummer ein."); return false }
    }
    if (step === 2) {
      if (!data.beschwerde_bereich) { setError("Bitte wählen Sie einen Bereich."); return false }
      if (data.beschwerde_freitext.length < 10) { setError("Bitte beschreiben Sie Ihre Beschwerden genauer (min. 10 Zeichen)."); return false }
    }
    if (step === 3) {
      if (!data.symptom_dauer) { setError("Bitte wählen Sie die Dauer Ihrer Beschwerden."); return false }
      if (data.vorherige_behandlung.length === 0) { setError("Bitte wählen Sie mindestens eine Option."); return false }
    }
    if (step === 4) {
      if (!data.datenschutz_akzeptiert) { setError("Bitte akzeptieren Sie die Datenschutzerklärung."); return false }
      if (!data.agb_akzeptiert) { setError("Bitte akzeptieren Sie die AGB."); return false }
      if (!data.heilpraktiker_info) { setError("Bitte bestätigen Sie den Hinweis zur Behandlung."); return false }
    }
    return true
  }

  function goNext() {
    if (!validateStep()) return
    setStep((s) => Math.min(s + 1, 4))
  }

  function goBack() {
    setError(null)
    setStep((s) => Math.max(s - 1, 1))
  }

  async function handleSubmit() {
    if (!validateStep()) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, _t: formLoadTime }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? "Ein Fehler ist aufgetreten.")
        return
      }

      trackConversion("anfrage_submitted", { bereich: data.beschwerde_bereich })
      router.push("/danke")
    } catch {
      setError("Netzwerkfehler. Bitte versuchen Sie es erneut.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <IntakeProgress currentStep={step} />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Honeypot fields — hidden from real users, bots fill them */}
      <div className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden="true">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={data.website}
          onChange={(e) => update({ website: e.target.value })}
        />
        <input
          type="text"
          name="fax_number"
          tabIndex={-1}
          autoComplete="off"
          value={data.fax_number}
          onChange={(e) => update({ fax_number: e.target.value })}
        />
      </div>

      {/* Step 1: Kontakt */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800 mb-1">Ihre Kontaktdaten</h2>
          <p className="text-sm text-slate-500 mb-4">Damit wir Sie erreichen können.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="vorname">Vorname *</Label>
              <Input id="vorname" value={data.vorname} onChange={(e) => update({ vorname: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nachname">Nachname *</Label>
              <Input id="nachname" value={data.nachname} onChange={(e) => update({ nachname: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">E-Mail *</Label>
            <Input id="email" type="email" value={data.email} onChange={(e) => update({ email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="telefon">Telefon *</Label>
            <Input id="telefon" type="tel" value={data.telefon} onChange={(e) => update({ telefon: e.target.value })} />
          </div>
        </div>
      )}

      {/* Step 2: Beschwerden */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800 mb-1">Ihre Beschwerden</h2>
          <p className="text-sm text-slate-500 mb-4">Wo haben Sie Probleme?</p>
          <div className="space-y-1.5">
            <Label>Bereich *</Label>
            <div className="grid grid-cols-2 gap-2">
              {BESCHWERDE_BEREICHE.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => update({ beschwerde_bereich: b.value })}
                  className={`rounded-lg border px-3 py-2.5 text-sm text-left transition-colors ${
                    data.beschwerde_bereich === b.value
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-medium"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="freitext">Beschreibung *</Label>
            <Textarea
              id="freitext"
              placeholder="Beschreiben Sie Ihre Beschwerden in eigenen Worten..."
              rows={4}
              value={data.beschwerde_freitext}
              onChange={(e) => update({ beschwerde_freitext: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Step 3: Vorgeschichte */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800 mb-1">Vorgeschichte</h2>
          <p className="text-sm text-slate-500 mb-4">Wie lange bestehen die Beschwerden?</p>
          <div className="space-y-1.5">
            <Label>Dauer der Beschwerden *</Label>
            <div className="space-y-2">
              {SYMPTOM_DAUER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update({ symptom_dauer: opt.value })}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm text-left transition-colors ${
                    data.symptom_dauer === opt.value
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-medium"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Bisherige Behandlung *</Label>
            <div className="grid grid-cols-2 gap-2">
              {VORBEHANDLUNG_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleBehandlung(opt.value)}
                  className={`rounded-lg border px-3 py-2.5 text-sm text-left transition-colors ${
                    data.vorherige_behandlung.includes(opt.value)
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-medium"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="details">Details (optional)</Label>
            <Textarea
              id="details"
              placeholder="Was hat Ihnen geholfen? Was nicht?"
              rows={3}
              value={data.vorherige_behandlung_details}
              onChange={(e) => update({ vorherige_behandlung_details: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Step 4: Consent */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800 mb-1">Fast geschafft!</h2>
          <p className="text-sm text-slate-500 mb-4">Bitte bestätigen Sie die folgenden Punkte.</p>

          <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 mb-5">
            <p className="text-sm text-emerald-800 leading-relaxed">
              <span className="font-medium">Hinweis:</span> Unsere Leistungen sind Privatleistungen
              (Heilpraktiker für Physiotherapie). Die genauen Kosten besprechen wir transparent
              im kostenlosen Erstgespräch — Ihre Anfrage ist unverbindlich.
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={data.datenschutz_akzeptiert}
                onCheckedChange={(v) => update({ datenschutz_akzeptiert: v === true })}
                className="mt-0.5"
              />
              <span className="text-sm text-slate-600 leading-relaxed">
                Ich habe die{" "}
                <Link href="/datenschutz" target="_blank" className="underline text-emerald-600">
                  Datenschutzerklärung
                </Link>{" "}
                gelesen und stimme der Verarbeitung meiner Daten zu. *
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={data.agb_akzeptiert}
                onCheckedChange={(v) => update({ agb_akzeptiert: v === true })}
                className="mt-0.5"
              />
              <span className="text-sm text-slate-600 leading-relaxed">
                Ich akzeptiere die{" "}
                <Link href="/agb" target="_blank" className="underline text-emerald-600">
                  Allgemeinen Geschäftsbedingungen
                </Link>
                . *
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={data.heilpraktiker_info}
                onCheckedChange={(v) => update({ heilpraktiker_info: v === true })}
                className="mt-0.5"
              />
              <span className="text-sm text-slate-600 leading-relaxed">
                Ich verstehe, dass die Behandlung durch einen Heilpraktiker für Physiotherapie
                erfolgt und nicht durch einen Arzt. *
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        {step > 1 ? (
          <Button type="button" variant="ghost" onClick={goBack}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Zurück
          </Button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <Button type="button" onClick={goNext} className="bg-emerald-600 hover:bg-emerald-700">
            Weiter
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Wird gesendet...
              </>
            ) : (
              "Anfrage absenden"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
