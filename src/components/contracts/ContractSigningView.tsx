"use client"

import { useState, useEffect, useRef } from "react"
import { SignaturePad } from "./SignaturePad"
import { Button } from "@/components/ui/button"
import { CONTRACT_TYPE_CONFIG } from "@/types/contract"
import type { ContractType, VertragText, Leistung } from "@/types/contract"
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  PenLine,
} from "lucide-react"

interface ContractData {
  contract_number: string
  contract_type: ContractType
  leistungen: Leistung[]
  gesamtpreis: number
  zahlungsweise: "einmalig" | "pro_sitzung"
  vertrag_text: VertragText
  praxis_name: string
  praxis_address: string
  praxis_inhaber: string
  praxis_signature_png: string | null
  patient_name: string
}

interface ContractSigningViewProps {
  token: string
}

type ViewState = "loading" | "error" | "step1" | "step2" | "step3" | "step4" | "already_signed" | "expired"

export function ContractSigningView({ token }: ContractSigningViewProps) {
  const [viewState, setViewState] = useState<ViewState>("loading")
  const [contract, setContract] = useState<ContractData | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [signedAt, setSignedAt] = useState<string | null>(null)
  const [widerrufBis, setWiderrufBis] = useState<string | null>(null)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const contractTextRef = useRef<HTMLDivElement>(null)

  // Load contract data
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/contracts/${token}`)
        const json = await res.json()

        if (!res.ok) {
          if (json.code === "ALREADY_SIGNED") {
            setSignedAt(json.signed_at)
            setViewState("already_signed")
            return
          }
          if (json.code === "EXPIRED" || json.code === "CANCELLED") {
            setErrorMessage(json.error)
            setViewState("expired")
            return
          }
          throw new Error(json.error || "Fehler beim Laden")
        }

        setContract(json.data)
        setViewState("step1")
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Vertrag konnte nicht geladen werden.")
        setViewState("error")
      }
    }
    load()
  }, [token])

  // Track scroll position in step 2
  function handleContractScroll() {
    const el = contractTextRef.current
    if (!el) return
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 30
    if (isAtBottom) setHasScrolledToBottom(true)
  }

  async function handleSign() {
    if (!signatureDataUrl || !consent) return
    setSubmitting(true)
    setErrorMessage("")

    try {
      const res = await fetch(`/api/contracts/${token}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signature_png: signatureDataUrl,
          consent: true,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Fehler beim Unterschreiben")

      setSignedAt(json.signed_at)
      setWiderrufBis(json.widerruf_bis)
      setViewState("step4")
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Fehler beim Unterschreiben")
    } finally {
      setSubmitting(false)
    }
  }

  if (viewState === "loading") {
    return (
      <CenteredCard>
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto" />
        <p className="text-sm text-slate-500 mt-4 text-center">Vertrag wird geladen...</p>
      </CenteredCard>
    )
  }

  if (viewState === "error") {
    return (
      <CenteredCard>
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 mt-4 text-center">Fehler</h2>
        <p className="text-sm text-slate-500 mt-2 text-center">{errorMessage}</p>
      </CenteredCard>
    )
  }

  if (viewState === "expired") {
    return (
      <CenteredCard>
        <Clock className="h-12 w-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 mt-4 text-center">Link abgelaufen</h2>
        <p className="text-sm text-slate-500 mt-2 text-center">{errorMessage}</p>
        <p className="text-sm text-slate-400 mt-4 text-center">
          Bitte kontaktieren Sie Ihre Praxis, um einen neuen Link zu erhalten.
        </p>
      </CenteredCard>
    )
  }

  if (viewState === "already_signed") {
    return (
      <CenteredCard>
        <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 mt-4 text-center">Bereits unterschrieben</h2>
        <p className="text-sm text-slate-500 mt-2 text-center">
          {"Dieser Vertrag wurde bereits am "}
          {signedAt ? new Date(signedAt).toLocaleDateString("de-DE") : ""} unterzeichnet.
        </p>
        <p className="text-sm text-slate-400 mt-2 text-center">
          {"Sie sollten eine Best\u00e4tigungs-E-Mail mit dem signierten PDF erhalten haben."}
        </p>
      </CenteredCard>
    )
  }

  if (!contract) return null

  const typeConfig = CONTRACT_TYPE_CONFIG[contract.contract_type]

  // Step 1: Welcome + Summary
  if (viewState === "step1") {
    return (
      <Card>
        <StepIndicator current={1} />

        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{contract.praxis_name}</h1>
          <p className="text-slate-500 mt-1">Ihr Behandlungsvertrag</p>
        </div>

        <div className="rounded-xl bg-slate-50 p-5 mb-6">
          <p className="text-sm text-slate-500 mb-1">Guten Tag,</p>
          <p className="text-lg font-semibold text-slate-900">{contract.patient_name}</p>
        </div>

        <div className="space-y-3 mb-8">
          <InfoRow label="Behandlung" value={typeConfig?.label || contract.contract_type} />
          <InfoRow label="Vertragsnr." value={contract.contract_number} />
          <InfoRow
            label="Betrag"
            value={Number(contract.gesamtpreis).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
          />
          <InfoRow
            label="Zahlung"
            value={contract.zahlungsweise === "einmalig" ? "Einmalig" : "Pro Sitzung"}
          />
        </div>

        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 mb-8">
          <p className="text-sm text-emerald-700">
            <strong>Leistungen:</strong>
          </p>
          <ul className="mt-2 space-y-1">
            {contract.leistungen.map((l: Leistung, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-emerald-700">
                <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>{l.beschreibung}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button
          onClick={() => setViewState("step2")}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12 rounded-xl"
        >
          Vertragstext lesen
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    )
  }

  // Step 2: Full contract text
  if (viewState === "step2") {
    const sections = [
      contract.vertrag_text.vertragsparteien,
      contract.vertrag_text.praeambel,
      contract.vertrag_text.leistungsbeschreibung,
      contract.vertrag_text.app_nutzung,
      contract.vertrag_text.rechtsgrundlage,
      contract.vertrag_text.fernbehandlung,
      contract.vertrag_text.verguetung,
      contract.vertrag_text.terminregelung,
      contract.vertrag_text.mitwirkungspflichten,
      contract.vertrag_text.schweigepflicht,
      contract.vertrag_text.haftungsausschluss,
      contract.vertrag_text.datenschutz,
      contract.vertrag_text.widerrufsrecht,
      contract.vertrag_text.kuendigung,
      contract.vertrag_text.urheberrecht,
      contract.vertrag_text.schlussbestimmungen,
    ].filter(Boolean)

    return (
      <Card>
        <StepIndicator current={2} />

        <h2 className="text-xl font-bold text-slate-900 mb-2">Vertragstext</h2>
        <p className="text-sm text-slate-500 mb-4">
          {"Bitte lesen Sie den vollst\u00e4ndigen Vertrag durch."}
        </p>

        <div
          ref={contractTextRef}
          onScroll={handleContractScroll}
          className="max-h-[50vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 mb-6 text-sm text-slate-700 leading-relaxed space-y-4"
        >
          {sections.map((section, i) => (
            <div key={i} className="whitespace-pre-wrap">{section}</div>
          ))}

          {/* Unterschriften-Bereich im Vertragstext */}
          <div className="border-t border-slate-200 pt-4 mt-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-500 mb-2">Behandler:</p>
                {contract.praxis_signature_png ? (
                  <img
                    src={contract.praxis_signature_png}
                    alt="Unterschrift Behandler"
                    className="max-h-16 mb-1"
                  />
                ) : (
                  <div className="h-16 flex items-end">
                    <div className="border-b border-slate-300 w-full" />
                  </div>
                )}
                <p className="text-xs font-medium text-slate-700 mt-1">{contract.praxis_inhaber}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">Patient:</p>
                <div className="h-16 flex items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <PenLine className="h-3 w-3" />
                    {"Ihre Unterschrift folgt im n\u00e4chsten Schritt"}
                  </p>
                </div>
                <p className="text-xs font-medium text-slate-700 mt-1">{contract.patient_name}</p>
              </div>
            </div>
          </div>
        </div>

        {!hasScrolledToBottom && (
          <p className="text-xs text-amber-600 text-center mb-4">
            Bitte scrollen Sie den Vertragstext bis zum Ende durch.
          </p>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setViewState("step1")}
            className="flex-1 h-12 rounded-xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {"Zur\u00fcck"}
          </Button>
          <Button
            onClick={() => setViewState("step3")}
            disabled={!hasScrolledToBottom}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white h-12 rounded-xl"
          >
            Unterschreiben
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    )
  }

  // Step 3: Signature
  if (viewState === "step3") {
    return (
      <Card>
        <StepIndicator current={3} />

        <h2 className="text-xl font-bold text-slate-900 mb-2">Unterschrift</h2>
        <p className="text-sm text-slate-500 mb-6">
          Unterschreiben Sie mit dem Finger (Touchscreen) oder der Maus.
        </p>

        {errorMessage && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-4">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        {/* Praxis-Unterschrift (bereits vorhanden) */}
        {contract.praxis_signature_png && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 mb-6">
            <p className="text-xs font-medium text-emerald-700 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Unterschrift des Behandlers ({contract.praxis_inhaber})
            </p>
            <img
              src={contract.praxis_signature_png}
              alt="Unterschrift Behandler"
              className="max-h-16 rounded border border-emerald-200 bg-white p-2"
            />
          </div>
        )}

        {/* Patienten-Unterschrift */}
        <p className="text-sm font-medium text-slate-700 mb-2">
          Ihre Unterschrift ({contract.patient_name}):
        </p>
        <SignaturePad onSignatureChange={setSignatureDataUrl} />

        <label className="flex items-start gap-3 mt-6 mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
          />
          <span className="text-sm text-slate-700">
            {"Ich habe den Behandlungsvertrag vollst\u00e4ndig gelesen und stimme den Vertragsbedingungen zu. Ich stimme ausdr\u00fccklich zu, dass der Behandler mit der Leistungserbringung vor Ablauf der Widerrufsfrist beginnt. Mir ist bekannt, dass mein Widerrufsrecht erlischt, sobald die Leistung vollst\u00e4ndig erbracht wurde, und dass ich bei einem Widerruf nach Behandlungsbeginn die bereits erbrachten Leistungen anteilig verg\u00fcten muss (\u00a7 356 Abs. 4, \u00a7 357 Abs. 8 BGB)."}
          </span>
        </label>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setErrorMessage("")
              setViewState("step2")
            }}
            className="flex-1 h-12 rounded-xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {"Zur\u00fcck"}
          </Button>
          <Button
            onClick={handleSign}
            disabled={!signatureDataUrl || !consent || submitting}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white h-12 rounded-xl"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gespeichert...
              </>
            ) : (
              <>
                Verbindlich unterschreiben
                <Check className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </Card>
    )
  }

  // Step 4: Confirmation
  if (viewState === "step4") {
    return (
      <Card>
        <div className="text-center py-4">
          <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Vertrag erfolgreich unterzeichnet!
          </h2>
          <p className="text-slate-500 mt-3 max-w-md mx-auto">
            {"Vielen Dank, "}{contract.patient_name}{". Sie erhalten in K\u00fcrze eine Best\u00e4tigungs-E-Mail mit dem signierten Vertrag als PDF."}
          </p>

          <div className="rounded-xl bg-slate-50 p-5 mt-8 max-w-sm mx-auto text-left space-y-2">
            <InfoRow label="Vertrag" value={contract.contract_number} />
            <InfoRow
              label="Unterschrieben"
              value={signedAt ? new Date(signedAt).toLocaleDateString("de-DE") : "Soeben"}
            />
            <InfoRow
              label="Widerruf bis"
              value={widerrufBis ? new Date(widerrufBis + "T00:00:00").toLocaleDateString("de-DE") : "\u2014"}
            />
          </div>

          <p className="text-xs text-slate-400 mt-6">
            {"Sie k\u00f6nnen dieses Fenster jetzt schlie\u00dfen."}
          </p>
        </div>
      </Card>
    )
  }

  return null
}

// ── Helper components ──

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl shadow-slate-900/5 border border-slate-100 p-8">
        {children}
      </div>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-start justify-center p-4 pt-8 sm:pt-16">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl shadow-slate-900/5 border border-slate-100 p-6 sm:p-8">
        {children}
      </div>
    </div>
  )
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${
            s === current
              ? "bg-emerald-500 w-6"
              : s < current
              ? "bg-emerald-300"
              : "bg-slate-200"
          } transition-all`} />
        </div>
      ))}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  )
}
