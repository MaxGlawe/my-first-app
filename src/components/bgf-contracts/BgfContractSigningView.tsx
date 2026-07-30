"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { SignaturePad } from "@/components/contracts/SignaturePad"
import type { BgfContract, BgfVertragText, BgfLeistung } from "@/types/bgf-contract"
import { paketVertragsLabel } from "@/lib/bgf-pakete"
import { istPaketVertrag } from "@/types/bgf-contract"
import {
  Building2,
  FileText,
  PenTool,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Shield,
} from "lucide-react"

// ── Helpers ──────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  return n.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
}

// Altverträge aus der Tarif-Ära zeigen weiter ihren Tarifnamen.
const TIER_LABELS: Record<string, string> = {
  basic: "Basic",
  pro: "Professional",
  enterprise: "Enterprise",
  voll: "Vollzugriff",
}

const STEPS = [
  { label: "Übersicht", icon: Building2 },
  { label: "Vertrag lesen", icon: FileText },
  { label: "Unterschreiben", icon: PenTool },
  { label: "Bestätigung", icon: CheckCircle2 },
]

// Explicit section order (JSONB in PostgreSQL sorts keys alphabetically!)
const VERTRAG_SECTION_ORDER = [
  "vertragsparteien",
  "praeambel",
  "vertragsgegenstand",
  "leistungsumfang",
  "zusatzleistungen",
  "app_nutzung",
  "verguetung",
  "laufzeit_kuendigung",
  "datenschutz",
  "vertraulichkeit",
  "haftung",
  "mitwirkungspflichten",
  "widerrufsrecht",
  "geistiges_eigentum",
  "abwerbeverbot",
  "schlussbestimmungen",
]

// ── Main Component ───────────────────────────────────────────────────

export function BgfContractSigningView({
  token,
  readOnly = false,
}: {
  token: string
  /**
   * Vorschau für die Praxis: Vertrag lesen, aber NICHT unterschreiben.
   * Die Unterschrift auf dieser Seite ist die des Auftraggebers — sie darf
   * niemals von der Praxis geleistet werden.
   */
  readOnly?: boolean
}) {
  const [contract, setContract] = useState<BgfContract | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(0)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [signaturePng, setSignaturePng] = useState<string | null>(null)
  const [consent, setConsent] = useState(false)

  // Stable callback for SignaturePad
  const handleSignatureChange = useCallback((png: string | null) => {
    setSignaturePng(png)
  }, [])
  const [isSigning, setIsSigning] = useState(false)
  const [signResult, setSignResult] = useState<{
    signed_at: string
    widerruf_bis: string
    contract_number: string
  } | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)

  // ── Load contract ──────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/bgf-contracts/${token}`)
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || "Vertrag konnte nicht geladen werden.")
          return
        }
        setContract(data.contract)
      } catch {
        setError("Netzwerkfehler.")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [token])

  // ── Scroll tracking ────────────────────────────────────────────────

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
    if (atBottom) setHasScrolledToBottom(true)
  }

  // ── Sign ───────────────────────────────────────────────────────────

  async function handleSign() {
    if (!signaturePng || !consent) return
    setIsSigning(true)
    try {
      const res = await fetch(`/api/bgf-contracts/${token}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature_png: signaturePng, consent: true }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Unterschrift fehlgeschlagen.")
        setIsSigning(false)
        return
      }
      setSignResult(data)
      setStep(3)
    } catch {
      setError("Netzwerkfehler.")
    } finally {
      setIsSigning(false)
    }
  }

  // ── Loading / Error ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error && !contract) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Fehler</h1>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!contract) return null

  const vertragText = contract.vertrag_text as BgfVertragText
  const leistungen = contract.leistungen as BgfLeistung[]
  const istPaket = istPaketVertrag(contract)
  const umfangLabel = istPaket
    ? (contract.paket_label ?? paketVertragsLabel(contract.paket_max_ma))
    : (TIER_LABELS[contract.contract_type] ?? contract.contract_type)

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-emerald-200" />
            <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              BGF-Dienstleistungsvertrag
            </span>
          </div>
          <h1 className="text-xl font-bold">{contract.praxis_name}</h1>
          <p className="text-sm text-emerald-100 mt-0.5">{contract.contract_number}</p>

          {readOnly && (
            <div className="mt-4 rounded-xl bg-white/15 border border-white/25 px-4 py-3">
              <p className="text-sm font-semibold">Interne Vorschau</p>
              <p className="text-xs text-emerald-50/90 mt-0.5">
                So sieht der Auftraggeber den Vertrag. Unterschreiben darf ausschließlich
                er selbst — die Praxis-Unterschrift leisten Sie im BGF-Dashboard.
              </p>
            </div>
          )}

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-5">
            {(readOnly ? STEPS.slice(0, 2) : STEPS).map((s, i) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="flex items-center gap-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                    i < step ? "bg-white text-emerald-700" :
                    i === step ? "bg-white/20 text-white ring-2 ring-white" :
                    "bg-white/10 text-white/40"
                  }`}>
                    {i < step ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-6 h-px ${i < step ? "bg-white" : "bg-white/20"}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* ── Step 0: Overview ────────────────────────── */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Vertrag für {contract.org_name}
              </h2>
              <p className="text-sm text-slate-500">
                Bitte prüfen Sie die Vertragsdaten und lesen Sie den vollständigen Vertrag.
              </p>
            </div>

            {/* Summary card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">Auftragnehmer</p>
                  <p className="font-semibold text-slate-900">{contract.praxis_name}</p>
                  <p className="text-slate-500 text-xs">{contract.praxis_inhaber}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">Auftraggeber</p>
                  <p className="font-semibold text-slate-900">{contract.org_name}</p>
                  <p className="text-slate-500 text-xs">{contract.kontakt_name}</p>
                </div>
              </div>

              <hr className="border-slate-100" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">{istPaket ? "Paket" : "Tarif"}</p>
                  <p className="font-bold text-emerald-700">{umfangLabel}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">Mitarbeitende</p>
                  <p className="font-semibold text-slate-900">{contract.lizenzen} angemeldet</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">Monatlich</p>
                  <p className="font-bold text-slate-900 text-lg">{fmtCurrency(contract.monatlicher_gesamtpreis)}</p>
                  <p className="text-slate-400 text-[10px]">
                    {istPaket
                      ? "Festpreis — kein Preis pro Kopf"
                      : `${fmtCurrency(contract.preis_pro_ma_monat ?? 0)}/MA/Monat`}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">Laufzeit</p>
                  <p className="font-semibold text-slate-900">{contract.laufzeit_monate} Monate</p>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Leistungen */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Enthaltene Leistungen
                </p>
                <div className="space-y-1.5">
                  {leistungen.filter((l) => l.enthalten).map((l, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{l.beschreibung}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStep(1)}
              className="w-full h-13 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"
            >
              Vertrag lesen
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        )}

        {/* ── Step 1: Read contract ──────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Vertrag vollständig lesen</h2>
            <p className="text-sm text-slate-500">
              Bitte scrollen Sie den gesamten Vertrag durch, bevor Sie unterschreiben können.
            </p>

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-h-[60vh] overflow-y-auto space-y-6"
            >
              {VERTRAG_SECTION_ORDER.map((key) => {
                const text = vertragText[key as keyof BgfVertragText]
                if (!text) return null
                return (
                  <div key={key} className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {text}
                  </div>
                )
              })}

              {/* Praxis signature preview */}
              {contract.praxis_signature_png && (
                <div className="border-t border-slate-100 pt-4 mt-6">
                  <p className="text-xs text-slate-400 mb-2">Unterschrift Auftragnehmer (Praxis):</p>
                  <img
                    src={contract.praxis_signature_png}
                    alt="Praxis-Unterschrift"
                    className="h-16 object-contain"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)} className="h-12 px-5 rounded-xl">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {readOnly ? (
                <div className="flex-1 h-12 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-500">
                  Vorschau — Unterschrift nur durch den Auftraggeber
                </div>
              ) : (
                <Button
                  onClick={() => setStep(2)}
                  disabled={!hasScrolledToBottom}
                  className="flex-1 h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md disabled:opacity-50"
                >
                  {hasScrolledToBottom ? "Weiter zur Unterschrift" : "Bitte vollständig lesen..."}
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ── Step 2: Sign ───────────────────────────── */}
        {step === 2 && !readOnly && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Vertrag unterschreiben</h2>
              <p className="text-sm text-slate-500">
                Zeichnen Sie Ihre Unterschrift im Feld unten. Sie unterschreiben als bevollmächtigte/r
                Vertreter/in von {contract.org_name}.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-xs text-slate-400 mb-3">Unterschrift des Auftraggebers:</p>
              <SignaturePad
                onSignatureChange={handleSignatureChange}
              />
            </div>

            <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
              <Checkbox
                id="consent"
                checked={consent}
                onCheckedChange={(v) => setConsent(v === true)}
                className="mt-0.5"
              />
              <label htmlFor="consent" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                Ich habe den BGF-Dienstleistungsvertrag vollständig gelesen und verstanden.
                Ich bin zur Unterzeichnung im Namen von <strong>{contract.org_name}</strong> berechtigt
                und stimme den Vertragsbedingungen zu.
              </label>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="h-12 px-5 rounded-xl">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleSign}
                disabled={!signaturePng || !consent || isSigning}
                className="flex-1 h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md disabled:opacity-50"
              >
                {isSigning ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <PenTool className="w-4 h-4 mr-2" />
                    Verbindlich unterschreiben
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Confirmation ───────────────────── */}
        {step === 3 && signResult && (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">Vertrag unterschrieben!</h2>
              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                Der BGF-Dienstleistungsvertrag wurde erfolgreich unterzeichnet.
                Eine Bestätigung wurde an {contract.kontakt_email} gesendet.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 max-w-sm mx-auto text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600">Vertragsnummer</span>
                <span className="font-bold text-emerald-800">{signResult.contract_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600">Unterschrieben am</span>
                <span className="font-semibold text-emerald-800">
                  {new Date(signResult.signed_at).toLocaleDateString("de-DE")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600">Rücktritt bis</span>
                <span className="text-emerald-800">
                  {new Date(signResult.widerruf_bis).toLocaleDateString("de-DE")}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Sie haben ein vertragliches Rücktrittsrecht innerhalb von 14 Tagen
              nach Unterzeichnung. Danach wird das BGF-Programm für Ihre Mitarbeitenden eingerichtet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
