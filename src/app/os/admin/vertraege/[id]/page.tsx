"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ContractStatusBadge } from "@/components/contracts/ContractStatusBadge"
import { ContractPreview } from "@/components/contracts/ContractPreview"
import { SignaturePad } from "@/components/contracts/SignaturePad"
import { CONTRACT_TYPE_CONFIG } from "@/types/contract"
import type { TreatmentContract, ContractType } from "@/types/contract"
import {
  ArrowLeft,
  Send,
  Download,
  XCircle,
  Loader2,
  Mail,
  Clock,
  CheckCircle2,
  PenLine,
} from "lucide-react"

export default function VertragDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [contract, setContract] = useState<TreatmentContract | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [praxisSignature, setPraxisSignature] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/contracts/${id}`)
        if (!res.ok) throw new Error()
        const json = await res.json()
        setContract(json.data)
        setPraxisSignature(json.data.praxis_signature_png || null)
      } catch {
        setError("Vertrag konnte nicht geladen werden.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleSavePraxisSignature() {
    if (!praxisSignature) return
    setActionLoading("signature")
    setError(null)

    try {
      const res = await fetch(`/api/admin/contracts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ praxis_signature_png: praxisSignature }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setContract(json.data)
      setShowSignaturePad(false)
      setSuccess("Praxis-Unterschrift gespeichert!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleSend() {
    if (!contract) return

    if (!contract.praxis_signature_png && !praxisSignature) {
      setError("Bitte zuerst die Praxis-Unterschrift hinzuf\u00fcgen, bevor der Vertrag versendet wird.")
      setShowSignaturePad(true)
      return
    }

    setActionLoading("send")
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch(`/api/admin/contracts/${id}/send`, { method: "POST" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setContract(json.data)
      setSuccess("Vertrag erfolgreich per E-Mail versendet!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Versenden")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleCancel() {
    if (!contract || !confirm("Vertrag wirklich stornieren?")) return
    setActionLoading("cancel")
    setError(null)

    try {
      const res = await fetch(`/api/admin/contracts/${id}/cancel`, { method: "POST" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setContract(json.data)
      setSuccess("Vertrag storniert.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Stornieren")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDownloadPdf() {
    setActionLoading("pdf")
    try {
      const res = await fetch(`/api/admin/contracts/${id}/pdf`)
      if (!res.ok) throw new Error("PDF-Download fehlgeschlagen")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Vertrag_${contract?.contract_number || id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF-Download fehlgeschlagen")
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <p className="text-sm text-slate-500">Vertrag nicht gefunden.</p>
      </div>
    )
  }

  const typeConfig = CONTRACT_TYPE_CONFIG[contract.contract_type as ContractType]
  const canSend = contract.status === "entwurf" || contract.status === "versendet"
  const canCancel = contract.status === "entwurf" || contract.status === "versendet"
  const canSign = contract.status === "entwurf" || contract.status === "versendet"

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link
        href="/os/admin/vertraege"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {"Zur\u00fcck zu Vertr\u00e4ge"}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">
              {contract.contract_number}
            </h1>
            <ContractStatusBadge status={contract.status} />
          </div>
          <p className="text-sm text-slate-500">
            {typeConfig?.label} {"\u2014"} {contract.patient_name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={actionLoading === "pdf"}
          >
            {actionLoading === "pdf" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="ml-2">PDF</span>
          </Button>

          {canSend && (
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!!actionLoading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {actionLoading === "send" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="ml-2">
                {contract.status === "versendet" ? "Erneut senden" : "Vertrag senden"}
              </span>
            </Button>
          )}

          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={!!actionLoading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {actionLoading === "cancel" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span className="ml-2">Stornieren</span>
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 mb-6">
          <p className="text-sm text-emerald-700">{success}</p>
        </div>
      )}

      {/* Praxis-Unterschrift */}
      {canSign && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <PenLine className="h-4 w-4 text-slate-500" />
              Praxis-Unterschrift (Behandler)
            </h3>
            {contract.praxis_signature_png && !showSignaturePad && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSignaturePad(true)}
              >
                Neu unterschreiben
              </Button>
            )}
          </div>

          {contract.praxis_signature_png && !showSignaturePad ? (
            <div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 inline-block">
                <img
                  src={contract.praxis_signature_png}
                  alt="Praxis-Unterschrift"
                  className="max-h-20"
                />
              </div>
              <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Unterschrift vorhanden — wird dem Patienten im Vertrag angezeigt
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-500 mb-4">
                Bitte unterschreiben Sie den Vertrag, bevor Sie ihn an den Patienten versenden.
                Ihre Unterschrift wird im Vertrag angezeigt.
              </p>
              <SignaturePad onSignatureChange={setPraxisSignature} />
              <div className="flex gap-3 mt-4">
                {contract.praxis_signature_png && (
                  <Button
                    variant="outline"
                    onClick={() => setShowSignaturePad(false)}
                  >
                    Abbrechen
                  </Button>
                )}
                <Button
                  onClick={handleSavePraxisSignature}
                  disabled={!praxisSignature || actionLoading === "signature"}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  {actionLoading === "signature" ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Unterschrift speichern
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Timeline */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Verlauf</h3>
        <div className="space-y-3">
          <TimelineItem
            icon={<Clock className="h-4 w-4" />}
            label="Erstellt"
            date={contract.created_at}
            active
          />
          {contract.sent_at && (
            <TimelineItem
              icon={<Mail className="h-4 w-4" />}
              label={`Versendet an ${contract.sent_to_email}`}
              date={contract.sent_at}
              active
            />
          )}
          {contract.signed_at && (
            <TimelineItem
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Unterschrieben"
              date={contract.signed_at}
              active
              highlight
            />
          )}
          {contract.widerrufen_at && (
            <TimelineItem
              icon={<XCircle className="h-4 w-4" />}
              label="Widerrufen"
              date={contract.widerrufen_at}
              active
            />
          )}
        </div>
      </div>

      {/* Contract Preview */}
      <ContractPreview
        contractType={contract.contract_type as ContractType}
        patientName={contract.patient_name}
        leistungen={contract.leistungen}
        gesamtpreis={Number(contract.gesamtpreis)}
        zahlungsweise={contract.zahlungsweise}
      />

      {/* Signing Info */}
      {contract.signed_at && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 mt-6">
          <h3 className="text-sm font-semibold text-emerald-900 mb-3">Signatur-Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-emerald-600">Unterschrieben am</p>
              <p className="font-medium text-emerald-900">
                {new Date(contract.signed_at).toLocaleString("de-DE")}
              </p>
            </div>
            <div>
              <p className="text-emerald-600">{"Widerruf m\u00f6glich bis"}</p>
              <p className="font-medium text-emerald-900">
                {contract.widerruf_bis
                  ? new Date(contract.widerruf_bis + "T00:00:00").toLocaleDateString("de-DE")
                  : "\u2014"}
              </p>
            </div>
            {contract.signer_ip && (
              <div>
                <p className="text-emerald-600">IP-Adresse</p>
                <p className="font-medium text-emerald-900 font-mono text-xs">{contract.signer_ip}</p>
              </div>
            )}
          </div>
          {contract.signature_png && (
            <div className="mt-4 pt-4 border-t border-emerald-200">
              <p className="text-xs text-emerald-600 mb-2">Patienten-Signatur</p>
              <img
                src={contract.signature_png}
                alt="Signatur"
                className="max-h-20 rounded border border-emerald-200 bg-white p-2"
              />
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {contract.notes && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 mt-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Interne Notizen</h3>
          <p className="text-sm text-slate-600">{contract.notes}</p>
        </div>
      )}
    </div>
  )
}

function TimelineItem({
  icon,
  label,
  date,
  active,
  highlight,
}: {
  icon: React.ReactNode
  label: string
  date: string
  active?: boolean
  highlight?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
        highlight
          ? "bg-emerald-100 text-emerald-600"
          : active
          ? "bg-slate-100 text-slate-600"
          : "bg-slate-50 text-slate-300"
      }`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className={`text-sm ${active ? "text-slate-900" : "text-slate-400"}`}>{label}</p>
      </div>
      <p className="text-xs text-slate-400">
        {new Date(date).toLocaleString("de-DE", {
          day: "2-digit", month: "2-digit", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })}
      </p>
    </div>
  )
}
