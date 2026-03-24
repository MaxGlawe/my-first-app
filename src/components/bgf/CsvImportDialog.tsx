"use client"

import { useState, useRef } from "react"
import { Upload, Download, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface CsvImportDialogProps {
  orgId: string
  onSuccess: () => void
}

interface ParsedMember {
  email: string
  vorname?: string
  nachname?: string
  abteilung?: string
  arbeitsplatz_typ?: string
}

function parseCsv(raw: string): ParsedMember[] {
  const lines = raw.trim().split(/\r?\n/)
  const result: ParsedMember[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    // Skip header row
    if (trimmed.toLowerCase().startsWith("email")) continue

    const parts = trimmed.split(/[,;]/).map((p) => p.trim().replace(/^["']|["']$/g, ""))
    const [email, vorname, nachname, abteilung, arbeitsplatz_typ] = parts

    if (email && email.includes("@")) {
      result.push({
        email: email.toLowerCase(),
        vorname: vorname || undefined,
        nachname: nachname || undefined,
        abteilung: abteilung || undefined,
        arbeitsplatz_typ: arbeitsplatz_typ || undefined,
      })
    }
  }

  return result
}

export function CsvImportDialog({ orgId, onSuccess }: CsvImportDialogProps) {
  const [open, setOpen] = useState(false)
  const [csvText, setCsvText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importedCount, setImportedCount] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const parsed = parseCsv(csvText)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setCsvText(ev.target?.result as string ?? "")
    reader.readAsText(file, "UTF-8")
  }

  function reset() {
    setCsvText("")
    setError(null)
    setImportedCount(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  async function handleImport() {
    if (parsed.length === 0) return

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/bgf/organizations/${orgId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members: parsed }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? "Import fehlgeschlagen.")
        return
      }

      const data = await res.json()
      setImportedCount(data.imported ?? parsed.length)
      setTimeout(() => {
        reset()
        setOpen(false)
        onSuccess()
      }, 1800)
    } catch {
      setError("Netzwerkfehler. Bitte erneut versuchen.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const exampleCsv = `email,vorname,nachname,abteilung,arbeitsplatz_typ
max.mustermann@firma.de,Max,Mustermann,Vertrieb,buero
anna.schmidt@firma.de,Anna,Schmidt,HR,homeoffice`

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        CSV-Import
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); setOpen(v) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Mitarbeiter per CSV importieren</DialogTitle>
            <DialogDescription>
              Laden Sie eine CSV-Datei hoch oder fügen Sie den Inhalt direkt ein.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* File upload */}
            <div className="space-y-1.5">
              <Label>CSV-Datei hochladen</Label>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-slate-200 file:text-sm file:font-medium file:bg-slate-50 hover:file:bg-slate-100 cursor-pointer"
              />
            </div>

            {/* Or paste */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Oder CSV-Inhalt einfügen</Label>
                <button
                  type="button"
                  onClick={() => setCsvText(exampleCsv)}
                  className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  Beispiel laden
                </button>
              </div>
              <Textarea
                placeholder={exampleCsv}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={6}
                className="font-mono text-xs"
              />
            </div>

            {/* Preview */}
            {parsed.length > 0 && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-sm text-emerald-700">
                <strong>{parsed.length}</strong> Mitarbeiter erkannt und bereit zum Import.
              </div>
            )}

            {/* Success */}
            {importedCount !== null && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                <span>{importedCount} Mitarbeiter erfolgreich importiert.</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => { reset(); setOpen(false) }}
                disabled={isSubmitting}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleImport}
                disabled={isSubmitting || parsed.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? "Wird importiert…" : `${parsed.length} importieren`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
