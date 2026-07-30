"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useHrAuth } from "@/hooks/use-hr-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FileText,
  Loader2,
  Download,
  ArrowLeft,
  Building2,
  Calendar,
  AlertCircle,
  ShieldCheck,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Report {
  titel: string
  quartal: string
  firma: string
  erstellt_am: string
  erstellt_von: string
  inhalt: string
  zusammenfassung?: string
  empfehlungen?: string[]
  pdf_base64?: string
}

/** Strip markdown formatting for clean display */
function stripMd(text: string | undefined | null): string {
  if (!text) return ""
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/<[^>]+>/g, "") // strip any XML-like tags Claude may inject
    .replace(/^#+\s*/gm, "")
    .trim()
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HrReportsPage() {
  const router = useRouter()
  const { isLoading: authLoading, isAuthorized, organizationId, organizationName } = useHrAuth()
  const [isGenerating, setIsGenerating] = useState(false)
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function generateReport() {
    if (!organizationId) return
    setIsGenerating(true)
    setError(null)
    setReport(null)

    try {
      const res = await fetch(`/api/bgf/organizations/${organizationId}/report`, {
        method: "POST",
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? "Fehler beim Generieren des Reports.")
      }

      const json = await res.json()
      setReport(json.report)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler.")
    } finally {
      setIsGenerating(false)
    }
  }

  function handleDownload() {
    if (!report) return

    // Download as PDF if available, otherwise fallback to text
    if (report.pdf_base64) {
      const byteChars = atob(report.pdf_base64)
      const byteArray = new Uint8Array(byteChars.length)
      for (let i = 0; i < byteChars.length; i++) {
        byteArray[i] = byteChars.charCodeAt(i)
      }
      const blob = new Blob([byteArray], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${report.firma.replace(/\s+/g, "-")}-Gesundheitsbericht-${report.quartal.replace(/\s+/g, "-")}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const content = `${report.titel}\n${report.quartal} | ${new Date(report.erstellt_am).toLocaleDateString("de-DE")}\n${report.erstellt_von}\n\n${report.inhalt}`
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${report.firma.replace(/\s+/g, "-")}-Gesundheitsbericht-${report.quartal.replace(/\s+/g, "-")}.txt`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  if (authLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!isAuthorized) return null

  return (
    <>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/hr/dashboard")}
            className="no-print gap-2 text-slate-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zum Dashboard
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quartals-Report</h1>
            <p className="mt-1 text-sm text-slate-500">
              KI-generierter Gesundheitsbericht für die Geschäftsführung
            </p>
          </div>

          {!report && !isGenerating && (
            <Button
              onClick={generateReport}
              className="no-print gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              size="lg"
              disabled={isGenerating}
            >
              <FileText className="h-4 w-4" />
              Report generieren
            </Button>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <button onClick={generateReport} className="ml-auto font-medium underline">
              Erneut versuchen
            </button>
          </div>
        )}

        {/* Loading state */}
        {isGenerating && (
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center gap-6 py-16">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-slate-900">Report wird generiert…</p>
                <p className="mt-1 text-sm text-slate-500">
                  Claude KI analysiert Ihre Gesundheitsdaten und erstellt einen professionellen Bericht.
                  Dies dauert ca. 15–30 Sekunden.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2 text-xs text-slate-500">
                <ShieldCheck className="h-3 w-3 shrink-0" />
                Alle Daten bleiben anonymisiert — keine individuellen Gesundheitsdaten im Report
              </div>
            </CardContent>
          </Card>
        )}

        {/* Report — PDF-first: show summary + download */}
        {report && !isGenerating && (
          <div className="space-y-6">
            {/* Success card with PDF download */}
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  {/* PDF icon */}
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/20">
                    <FileText className="h-8 w-8 text-white" />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900 mb-1">{report.titel}</h2>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-500 mb-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {report.quartal}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        {report.firma}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(report.erstellt_am).toLocaleDateString("de-DE", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={handleDownload}
                        className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/15"
                        size="lg"
                      >
                        <Download className="h-4 w-4" />
                        PDF herunterladen
                      </Button>
                      <Button
                        variant="outline"
                        onClick={generateReport}
                        className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      >
                        <FileText className="h-4 w-4" />
                        Neu generieren
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary preview */}
            {report.zusammenfassung && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-slate-900">Zusammenfassung</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {stripMd(report.zusammenfassung)}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Empfehlungen preview */}
            {report.empfehlungen && report.empfehlungen.length > 0 && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-slate-900">Handlungsempfehlungen</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {report.empfehlungen.map((emp, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                          {i + 1}
                        </span>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {stripMd(emp)}
                        </p>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* DSGVO note */}
            <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Dieser Report enthält ausschließlich anonymisierte und aggregierte Gesundheitsdaten.
                Individuelle Mitarbeiterdaten sind nicht enthalten. Erstellt gemäß DSGVO.
              </span>
            </div>
          </div>
        )}

        {/* Empty state — no report generated yet */}
        {!report && !isGenerating && !error && (
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center gap-6 py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-slate-900">Kein Report vorhanden</p>
                <p className="mt-1 text-sm text-slate-500">
                  Generieren Sie einen aktuellen Quartals-Report mit den Gesundheitsdaten Ihres Unternehmens.
                </p>
              </div>
              <Button
                onClick={generateReport}
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                size="lg"
              >
                <FileText className="h-4 w-4" />
                Jetzt Report generieren
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
