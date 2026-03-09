"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ContractTypeSelector } from "./ContractTypeSelector"
import { ContractPreview } from "./ContractPreview"
import { CONTRACT_TYPE_CONFIG } from "@/types/contract"
import type { ContractType, Leistung } from "@/types/contract"
import { ArrowRight, ArrowLeft, Loader2, Trash2, Plus } from "lucide-react"

interface Patient {
  id: string
  vorname: string
  nachname: string
  email: string | null
}

export function ContractForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: Patient
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientsLoading, setPatientsLoading] = useState(true)
  const [patientId, setPatientId] = useState("")
  const [patientSearch, setPatientSearch] = useState("")

  // Step 2: Type
  const [contractType, setContractType] = useState<ContractType | null>(null)

  // Step 3: Leistungen
  const [leistungen, setLeistungen] = useState<Leistung[]>([])
  const [gesamtpreis, setGesamtpreis] = useState(0)
  const [zahlungsweise, setZahlungsweise] = useState<"einmalig" | "pro_sitzung">("pro_sitzung")
  const [dauerWochen, setDauerWochen] = useState<number | undefined>()
  const [sitzungenAnzahl, setSitzungenAnzahl] = useState<number | undefined>()
  const [notes, setNotes] = useState("")

  // Load patients
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/patients?pageSize=500")
        if (!res.ok) throw new Error()
        const json = await res.json()
        setPatients(
          (json.patients || []).map((p: Record<string, unknown>) => ({
            id: p.id,
            vorname: p.vorname,
            nachname: p.nachname,
            email: p.email,
          }))
        )
      } catch {
        setPatients([])
      } finally {
        setPatientsLoading(false)
      }
    }
    load()
  }, [])

  // Auto-fill leistungen when type changes
  useEffect(() => {
    if (!contractType) return
    const config = CONTRACT_TYPE_CONFIG[contractType]
    setLeistungen([...config.defaultLeistungen])
    setZahlungsweise(config.defaultZahlungsweise)

    const total = config.defaultLeistungen.reduce((s, l) => s + l.preis, 0)
    setGesamtpreis(total)
  }, [contractType])

  // Recalculate total when leistungen change
  useEffect(() => {
    const total = leistungen.reduce((s, l) => s + l.preis, 0)
    setGesamtpreis(total)
  }, [leistungen])

  const selectedPatient = patients.find((p) => p.id === patientId)

  const filteredPatients = patientSearch
    ? patients.filter((p) =>
        `${p.vorname} ${p.nachname}`.toLowerCase().includes(patientSearch.toLowerCase())
      )
    : patients

  function updateLeistung(index: number, field: keyof Leistung, value: string | number) {
    setLeistungen((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  function removeLeistung(index: number) {
    setLeistungen((prev) => prev.filter((_, i) => i !== index))
  }

  function addLeistung() {
    setLeistungen((prev) => [...prev, { beschreibung: "", preis: 0 }])
  }

  async function handleSubmit() {
    if (!patientId || !contractType || leistungen.length === 0) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/admin/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          contract_type: contractType,
          leistungen,
          gesamtpreis,
          zahlungsweise,
          dauer_wochen: dauerWochen || undefined,
          sitzungen_anzahl: sitzungenAnzahl || undefined,
          notes: notes || undefined,
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || "Fehler beim Erstellen")
      }

      const json = await res.json()
      router.push(`/os/admin/vertraege/${json.data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler")
    } finally {
      setSubmitting(false)
    }
  }

  const canProceedStep1 = !!patientId && !!selectedPatient?.email
  const canProceedStep2 = !!contractType
  const canProceedStep3 = leistungen.length > 0 && leistungen.every((l) => l.beschreibung)

  return (
    <div className="max-w-3xl">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
              s === step
                ? "bg-emerald-500 text-white"
                : s < step
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-400"
            }`}>
              {s}
            </div>
            {s < 4 && <div className={`h-0.5 w-8 ${s < step ? "bg-emerald-200" : "bg-slate-200"}`} />}
          </div>
        ))}
        <span className="ml-3 text-sm text-slate-500">
          {step === 1 && "Patient w\u00e4hlen"}
          {step === 2 && "Vertragstyp"}
          {step === 3 && "Leistungen"}
          {step === 4 && "Vorschau"}
        </span>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Step 1: Patient */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label>Patient suchen</Label>
            <Input
              placeholder="Name eingeben..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="mt-1"
            />
          </div>

          {patientsLoading ? (
            <p className="text-sm text-slate-500">Patienten werden geladen...</p>
          ) : (
            <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
              {filteredPatients.slice(0, 20).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPatientId(p.id)}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    patientId === p.id
                      ? "bg-emerald-50 border-l-2 border-emerald-500"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <p className="text-sm font-medium text-slate-900">
                    {p.vorname} {p.nachname}
                  </p>
                  <p className="text-xs text-slate-500">
                    {p.email || "Keine E-Mail"}
                  </p>
                </button>
              ))}
              {filteredPatients.length === 0 && (
                <p className="px-4 py-3 text-sm text-slate-500">Keine Patienten gefunden.</p>
              )}
            </div>
          )}

          {selectedPatient && !selectedPatient.email && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
              <p className="text-sm text-amber-700">
                {"Dieser Patient hat keine E-Mail-Adresse. Bitte f\u00fcgen Sie zuerst eine E-Mail hinzu."}
              </p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>
              Weiter <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Type */}
      {step === 2 && (
        <div className="space-y-6">
          <ContractTypeSelector value={contractType} onChange={setContractType} />

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {"Zur\u00fcck"}
            </Button>
            <Button onClick={() => setStep(3)} disabled={!canProceedStep2}>
              Weiter <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Leistungen */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Leistungen</Label>
            {leistungen.map((l, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-1">
                  <Input
                    value={l.beschreibung}
                    onChange={(e) => updateLeistung(i, "beschreibung", e.target.value)}
                    placeholder="Leistungsbeschreibung"
                  />
                </div>
                <div className="w-28">
                  <Input
                    type="number"
                    step="0.01"
                    value={l.preis}
                    onChange={(e) => updateLeistung(i, "preis", parseFloat(e.target.value) || 0)}
                    placeholder="Preis"
                  />
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeLeistung(i)} className="mt-1">
                  <Trash2 className="h-4 w-4 text-slate-400" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addLeistung}>
              <Plus className="mr-2 h-4 w-4" /> {"Position hinzuf\u00fcgen"}
            </Button>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">Gesamtbetrag:</span>
              <span className="text-lg font-bold text-slate-900">
                {gesamtpreis.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Zahlungsweise</Label>
              <select
                value={zahlungsweise}
                onChange={(e) => setZahlungsweise(e.target.value as "einmalig" | "pro_sitzung")}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="pro_sitzung">Pro Sitzung</option>
                <option value="einmalig">Einmalig</option>
              </select>
            </div>
            <div>
              <Label>Dauer (Wochen)</Label>
              <Input
                type="number"
                value={dauerWochen || ""}
                onChange={(e) => setDauerWochen(parseInt(e.target.value) || undefined)}
                placeholder="Optional"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Sitzungen (Anzahl)</Label>
            <Input
              type="number"
              value={sitzungenAnzahl || ""}
              onChange={(e) => setSitzungenAnzahl(parseInt(e.target.value) || undefined)}
              placeholder="Optional"
              className="mt-1 max-w-[200px]"
            />
          </div>

          <div>
            <Label>Interne Notizen (optional)</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder={"Nur f\u00fcr interne Zwecke..."}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {"Zur\u00fcck"}
            </Button>
            <Button onClick={() => setStep(4)} disabled={!canProceedStep3}>
              Vorschau <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Preview & Submit */}
      {step === 4 && contractType && (
        <div className="space-y-6">
          <ContractPreview
            contractType={contractType}
            patientName={selectedPatient ? `${selectedPatient.vorname} ${selectedPatient.nachname}` : ""}
            leistungen={leistungen}
            gesamtpreis={gesamtpreis}
            zahlungsweise={zahlungsweise}
          />

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(3)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {"Zur\u00fcck"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird erstellt...
                </>
              ) : (
                "Vertrag erstellen"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
