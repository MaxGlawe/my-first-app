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
import { useUserRole } from "@/hooks/use-user-role"
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
} from "lucide-react"

// ── Props ──────────────────────────────────────────────────────────────────────

interface BerichtEditorProps {
  report: MedicalReport
  patientId: string
  patientName: string
}

// ── Report Type Badge ──────────────────────────────────────────────────────────

function ReportTypeBadge({ reportType }: { reportType: MedicalReport["report_type"] }) {
  if (reportType === "arztbericht") {
    return (
      <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100">
        Arztbericht
      </Badge>
    )
  }
  return (
    <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
      Therapiebericht
    </Badge>
  )
}

// ── Briefkopf-Vorschau ─────────────────────────────────────────────────────────

function BriefkopfPreview({ report }: { report: MedicalReport }) {
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

  return (
    <div className="border rounded-lg p-4 bg-slate-50 text-sm space-y-2 print:bg-white print:border-none">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-base">Praxis OS</p>
          <p className="text-muted-foreground text-xs">Physiotherapie</p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>{createdDate}</p>
          <p>Zeitraum: {periodFrom} – {periodTo}</p>
        </div>
      </div>
      <Separator />
      <div>
        <p className="text-xs text-muted-foreground">An:</p>
        <p className="font-medium">{report.recipient_name}</p>
        {report.recipient_address && (
          <p className="text-xs text-muted-foreground whitespace-pre-line">
            {report.recipient_address}
          </p>
        )}
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
    <div className="flex items-center gap-1 p-2 border-b bg-muted/30 flex-wrap">
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

// ── BerichtEditor ─────────────────────────────────────────────────────────────

export function BerichtEditor({
  report: initialReport,
  patientId,
  patientName,
}: BerichtEditorProps) {
  const router = useRouter()
  const { role } = useUserRole()
  const [report, setReport] = useState<MedicalReport>(initialReport)
  const [isSaving, setIsSaving] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const isFinalized = report.status === "finalisiert"

  // TipTap Editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: report.final_content || report.draft_content,
    editable: !isFinalized,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4 text-sm leading-relaxed",
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

  return (
    <div className="space-y-4">
      {/* Status-Banner für finalisierte Berichte */}
      {isFinalized && (
        <Alert className="bg-green-50 border-green-200">
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
          <Alert className="bg-amber-50 border-amber-200">
            <FileText className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <span className="font-medium">Kein Diagnoseabschnitt:</span> Im gewählten Zeitraum
              waren keine ICD-10-Diagnosen dokumentiert. Der Bericht enthält daher keinen
              Diagnoseabschnitt. Bitte ggf. vor dem Versenden ergänzen.
            </AlertDescription>
          </Alert>
        )}

      {/* Briefkopf */}
      <BriefkopfPreview report={report} />

      {/* Bericht-Meta */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <ReportTypeBadge reportType={report.report_type} />
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
          })}{" "}
          — KI-Entwurf —{" "}
          <span className="font-medium">{report.generated_by_role === "heilpraktiker" ? "Heilpraktiker" : "Physiotherapeut"}</span> verantwortlich
        </p>
      </div>

      {/* Editor */}
      <Card className="print:shadow-none print:border-none">
        <CardHeader className="p-0">
          {!isFinalized && <EditorToolbar editor={editor} />}
        </CardHeader>
        <CardContent className="p-0">
          <EditorContent editor={editor} />
        </CardContent>
      </Card>

      {/* Unterschriftsfeld (für PDF) */}
      <div className="border-t pt-6 mt-8 print:block">
        <div className="flex gap-16 mt-8">
          <div className="flex-1">
            <div className="border-b border-foreground/50 mb-1" />
            <p className="text-xs text-muted-foreground">Datum, Ort</p>
          </div>
          <div className="flex-1">
            <div className="border-b border-foreground/50 mb-1" />
            <p className="text-xs text-muted-foreground">Unterschrift, Stempel</p>
          </div>
        </div>
      </div>

      {/* Fehleranzeige */}
      {saveError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      {/* Erfolgsanzeige */}
      {saveSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Entwurf gespeichert.
          </AlertDescription>
        </Alert>
      )}

      {/* Aktionsleiste */}
      <Separator />
      <div className="flex items-center justify-between gap-3 flex-wrap print:hidden">
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
