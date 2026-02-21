"use client"

// PROJ-6: KI-Arztbericht-Generator — Bericht-Editor
// TipTap WYSIWYG-Editor für die Bearbeitung des KI-generierten Berichts.

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import type { MedicalReport } from "@/types/arztbericht"
import {
  Save,
  CheckCircle,
  Printer,
  Loader2,
  Lock,
  AlertTriangle,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Undo,
  Redo,
  FileText,
  Trash2,
} from "lucide-react"

// ── Props ──────────────────────────────────────────────────────────────────────

interface BerichtEditorProps {
  report: MedicalReport
  patientId: string
  patientName: string
  patientGeburtsdatum?: string
}

// ── Briefkopf (professioneller medizinischer Briefkopf) ──────────────────────

function BriefkopfPreview({
  report,
  patientName,
  patientGeburtsdatum,
}: {
  report: MedicalReport
  patientName: string
  patientGeburtsdatum?: string
}) {
  const createdDate = new Date(report.created_at).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  const periodFrom = new Date(report.date_from).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
  const periodTo = new Date(report.date_to).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  const geburtsdatum = patientGeburtsdatum
    ? new Date(patientGeburtsdatum).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null

  const reportTypeLabel =
    report.report_type === "arztbericht" ? "Arztbericht" : "Therapieverlaufsbericht"

  const therapistName = report.generated_by_name ?? null
  // Berufsbezeichnung aus report_type ableiten (nicht aus generated_by_role)
  // → Admin-generierte Berichte zeigen die korrekte Fachbezeichnung
  const roleLabel =
    report.report_type === "arztbericht"
      ? "Heilpraktiker/in"
      : "Physiotherapeut/in"

  return (
    <div className="border rounded-lg bg-white text-sm print:border-none print:rounded-none briefkopf-container">
      {/* Praxis-Kopfzeile */}
      <div className="px-6 pt-5 pb-3 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold tracking-wide text-foreground">
              PRAXIS OS
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Physiotherapie & Heilpraktik
            </p>
            {therapistName && (
              <p className="text-xs text-muted-foreground">{therapistName} — {roleLabel}</p>
            )}
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{createdDate}</p>
          </div>
        </div>
      </div>

      {/* Empfänger-Block */}
      <div className="px-6 py-4">
        <p className="text-xs text-muted-foreground mb-1">An:</p>
        <p className="font-medium text-base">{report.recipient_name}</p>
        {report.recipient_address && (
          <p className="text-sm text-muted-foreground whitespace-pre-line mt-0.5">
            {report.recipient_address}
          </p>
        )}
      </div>

      {/* Betreff & Patient-Info */}
      <div className="px-6 pb-5 space-y-1.5 border-t pt-4">
        <p className="text-sm">
          <span className="font-semibold">Betreff: </span>
          <span className="font-semibold">{reportTypeLabel}</span>
        </p>
        <p className="text-sm">
          <span className="text-muted-foreground">Patient: </span>
          <span className="font-medium">{patientName}</span>
          {geburtsdatum && (
            <span className="text-muted-foreground">, geb. {geburtsdatum}</span>
          )}
        </p>
        <p className="text-sm text-muted-foreground">
          Berichtszeitraum: {periodFrom} – {periodTo}
        </p>
      </div>
    </div>
  )
}

// ── Editor-Toolbar ─────────────────────────────────────────────────────────────

function EditorToolbar({
  editor,
}: {
  editor: ReturnType<typeof useEditor>
}) {
  if (!editor) return null

  return (
    <div className="flex items-center gap-1 p-2 border-b bg-muted/30 flex-wrap print:hidden">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`h-7 w-7 p-0 ${editor.isActive("bold") ? "bg-muted" : ""}`}
        title="Fett (Strg+B)"
      >
        <Bold className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`h-7 w-7 p-0 ${editor.isActive("italic") ? "bg-muted" : ""}`}
        title="Kursiv (Strg+I)"
      >
        <Italic className="h-3.5 w-3.5" />
      </Button>
      <Separator orientation="vertical" className="h-5" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`h-7 w-7 p-0 ${editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}`}
        title="Überschrift"
      >
        <Heading2 className="h-3.5 w-3.5" />
      </Button>
      <Separator orientation="vertical" className="h-5" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`h-7 w-7 p-0 ${editor.isActive("bulletList") ? "bg-muted" : ""}`}
        title="Aufzählung"
      >
        <List className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`h-7 w-7 p-0 ${editor.isActive("orderedList") ? "bg-muted" : ""}`}
        title="Nummerierte Liste"
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </Button>
      <Separator orientation="vertical" className="h-5" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="h-7 w-7 p-0"
        title="Rückgängig (Strg+Z)"
      >
        <Undo className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="h-7 w-7 p-0"
        title="Wiederholen (Strg+Y)"
      >
        <Redo className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

// ── Unterschriftsfeld ──────────────────────────────────────────────────────────

function SignatureBlock({ report }: { report: MedicalReport }) {
  const therapistName = report.generated_by_name ?? null
  // Berufsbezeichnung aus report_type ableiten (nicht aus generated_by_role)
  // → Admin-generierte Berichte zeigen die korrekte Fachbezeichnung
  const roleLabel =
    report.report_type === "arztbericht"
      ? "Heilpraktiker/in für Physiotherapie"
      : "Physiotherapeut/in"

  return (
    <div className="pt-8 mt-6 space-y-8">
      <div className="flex gap-12">
        {/* Ort, Datum */}
        <div className="flex-1">
          <div className="border-b border-foreground/40 mb-1.5 mt-10" />
          <p className="text-xs text-muted-foreground">Ort, Datum</p>
        </div>
        {/* Unterschrift */}
        <div className="flex-1">
          <div className="border-b border-foreground/40 mb-1.5 mt-10" />
          <p className="text-xs text-muted-foreground">Unterschrift / Stempel</p>
          {therapistName && (
            <div className="mt-2">
              <p className="text-sm font-medium">{therapistName}</p>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
              <p className="text-xs text-muted-foreground">Praxis OS</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── BerichtEditor ─────────────────────────────────────────────────────────────

export function BerichtEditor({
  report: initialReport,
  patientId,
  patientName,
  patientGeburtsdatum,
}: BerichtEditorProps) {
  const router = useRouter()
  const [report, setReport] = useState<MedicalReport>(initialReport)
  const [isSaving, setIsSaving] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const isFinalized = report.status === "finalisiert"

  // TipTap Editor
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: report.final_content || report.draft_content,
    editable: !isFinalized,
    editorProps: {
      attributes: {
        class:
          "prose max-w-none focus:outline-none min-h-[600px] px-6 py-5 text-[15px] leading-[1.7]",
      },
    },
  })

  // Update editor editability when finalized state changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isFinalized)
    }
  }, [editor, isFinalized])

  const saveContent = useCallback(
    async (finalize = false) => {
      if (!editor) return

      const content = editor.getHTML()

      if (finalize) {
        setIsFinalizing(true)
      } else {
        setIsSaving(true)
      }
      setSaveError(null)
      setSaveSuccess(false)

      try {
        const body: Record<string, unknown> = { final_content: content }
        if (finalize) {
          body.status = "finalisiert"
        }

        const res = await fetch(
          `/api/patients/${patientId}/reports/${report.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        )

        const data = await res.json()

        if (!res.ok) {
          setSaveError(data.error ?? "Speichern fehlgeschlagen.")
          return
        }

        setReport(data.report)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } catch {
        setSaveError("Ein Netzwerkfehler ist aufgetreten.")
      } finally {
        setIsSaving(false)
        setIsFinalizing(false)
      }
    },
    [editor, patientId, report.id, isSaving]
  )

  const handlePrint = () => {
    window.print()
  }

  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(
        `/api/patients/${patientId}/reports/${report.id}`,
        { method: "DELETE" }
      )
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setSaveError(json.error ?? "Entwurf konnte nicht gelöscht werden.")
        return
      }
      toast.success("Entwurf gelöscht.")
      router.push(`/os/patients/${patientId}?tab=berichte`)
    } catch {
      setSaveError("Ein Fehler ist aufgetreten.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Status-Banner für finalisierte Berichte */}
      {isFinalized && (
        <Alert className="bg-green-50 border-green-200 print:hidden">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Dieser Bericht ist finalisiert und archiviert. Er kann nicht mehr bearbeitet werden.
          </AlertDescription>
        </Alert>
      )}

      {/* Hinweis-Banner: Arztbericht ohne ICD-10-Diagnosen */}
      {report.report_type === "arztbericht" &&
        !isFinalized &&
        !/[A-Z]\d{2}/.test(report.draft_content) && (
          <Alert className="bg-amber-50 border-amber-200 print:hidden">
            <FileText className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <span className="font-medium">Kein Diagnoseabschnitt:</span> Im gewählten Zeitraum
              waren keine ICD-10-Diagnosen dokumentiert. Der Bericht enthält daher keinen
              Diagnoseabschnitt. Bitte ggf. vor dem Versenden ergänzen.
            </AlertDescription>
          </Alert>
        )}

      {/* Bericht-Meta (nur Screen) */}
      <div className="flex items-center justify-between flex-wrap gap-2 print:hidden">
        <div className="flex items-center gap-2 flex-wrap">
          {report.report_type === "arztbericht" ? (
            <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100">
              Arztbericht
            </Badge>
          ) : (
            <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
              Therapiebericht
            </Badge>
          )}
          {isFinalized ? (
            <Badge
              variant="outline"
              className="text-green-700 border-green-300 bg-green-50 text-xs gap-1"
            >
              <CheckCircle className="h-3 w-3" />
              Finalisiert
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-amber-600 border-amber-300 bg-amber-50 text-xs"
            >
              Entwurf
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Generiert am{" "}
          {new Date(report.created_at).toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
          {" "} — KI-Entwurf
        </p>
      </div>

      {/* Professioneller Briefkopf */}
      <BriefkopfPreview
        report={report}
        patientName={patientName}
        patientGeburtsdatum={patientGeburtsdatum}
      />

      {/* Editor */}
      <Card className="print:shadow-none print:border-none">
        <CardHeader className="p-0">
          {!isFinalized && editor && <EditorToolbar editor={editor} />}
        </CardHeader>
        <CardContent className="p-0">
          <EditorContent editor={editor} />
        </CardContent>
      </Card>

      {/* Unterschriftsfeld */}
      <SignatureBlock report={report} />

      {/* Fehleranzeige */}
      {saveError && (
        <Alert variant="destructive" className="print:hidden">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      {/* Erfolgsanzeige */}
      {saveSuccess && (
        <Alert className="bg-green-50 border-green-200 print:hidden">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Entwurf gespeichert.
          </AlertDescription>
        </Alert>
      )}

      {/* Aktionsleiste */}
      <Separator className="print:hidden" />
      <div className="flex items-center justify-between gap-3 flex-wrap print:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Als PDF exportieren
          </Button>

          {!isFinalized && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                  Entwurf löschen
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Entwurf löschen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Dieser Berichts-Entwurf wird unwiderruflich gelöscht.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDelete}
                  >
                    Löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {!isFinalized && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => saveContent(false)}
              disabled={isSaving || isFinalizing}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Als Entwurf speichern
            </Button>

            <Button
              size="sm"
              onClick={() => saveContent(true)}
              disabled={isSaving || isFinalizing}
              className="gap-2"
            >
              {isFinalizing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              Finalisieren & archivieren
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
