"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, RefreshCw, BookOpen, HelpCircle, ListOrdered } from "lucide-react"
import { toast } from "sonner"
import type { EducationModule } from "@/types/education"

interface EducationPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  module: EducationModule
  onModuleUpdate: (module: EducationModule) => void
}

export function EducationPreviewDialog({
  open,
  onOpenChange,
  module,
  onModuleUpdate,
}: EducationPreviewDialogProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<"curriculum" | "lesson" | "quiz">("curriculum")

  async function handleApprove() {
    setIsApproving(true)
    try {
      const res = await fetch(`/api/education/${module.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "freigegeben" }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Freigabe fehlgeschlagen.")
        return
      }
      onModuleUpdate(data.module)
      toast.success("Wissensinhalte freigegeben! Patient sieht sie beim nächsten Training.")
      onOpenChange(false)
    } catch {
      toast.error("Fehler bei der Freigabe.")
    } finally {
      setIsApproving(false)
    }
  }

  async function handleRegenerate() {
    setIsRegenerating(true)
    try {
      const res = await fetch("/api/education/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hauptproblem: module.hauptproblem, regenerate: true }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Neu-Generierung fehlgeschlagen.")
        return
      }
      onModuleUpdate(data.module)
      toast.success("Neue Wissensinhalte generiert!")
    } catch {
      toast.error("Fehler bei der Neu-Generierung.")
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-teal-600" />
            {module.title}
          </DialogTitle>
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <Badge variant={module.status === "freigegeben" ? "default" : "secondary"}>
              {module.status === "freigegeben" ? "Freigegeben" : module.status === "archiviert" ? "Archiviert" : "Entwurf"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {module.hauptproblem}
            </span>
            {module.total_lessons > 1 && (
              <Badge variant="outline" className="text-xs">
                {module.total_lessons} Lektionen
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Tab Toggle */}
        <div className="flex rounded-lg border overflow-hidden">
          {module.curriculum && module.curriculum.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("curriculum")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                activeTab === "curriculum"
                  ? "bg-teal-600 text-white"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              <ListOrdered className="h-4 w-4" />
              Lehrplan
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab("lesson")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
              activeTab === "lesson"
                ? "bg-teal-600 text-white"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Lektion 1
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("quiz")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
              activeTab === "quiz"
                ? "bg-teal-600 text-white"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            Quiz
          </button>
        </div>

        {/* Curriculum Overview */}
        {activeTab === "curriculum" && module.curriculum && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {module.total_lessons} Lektionen — eine pro Trainingstag, progressiv aufgebaut:
            </p>
            <div className="space-y-1.5">
              {module.curriculum.map((topic) => (
                <div
                  key={topic.number}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm ${
                    topic.number === 1
                      ? "bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800"
                      : "bg-muted/20 border-transparent"
                  }`}
                >
                  <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
                    topic.number === 1
                      ? "bg-teal-100 dark:bg-teal-900/40 text-teal-700"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                  }`}>
                    {topic.number}
                  </span>
                  <span className={topic.number === 1 ? "font-medium text-teal-800 dark:text-teal-200" : "text-muted-foreground"}>
                    {topic.topic}
                  </span>
                  {topic.number === 1 && (
                    <Badge variant="outline" className="ml-auto text-xs shrink-0 border-teal-300 text-teal-700">
                      Vorschau
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic pt-1">
              Lektion 1 wird sofort generiert. Weitere Lektionen werden automatisch am jeweiligen Trainingstag erstellt.
            </p>
          </div>
        )}

        {/* Lesson Content */}
        {activeTab === "lesson" && (
          <div
            className="prose prose-sm dark:prose-invert max-w-none border rounded-lg p-4 bg-muted/20"
            dangerouslySetInnerHTML={{ __html: module.lesson_content }}
          />
        )}

        {/* Quiz Preview */}
        {activeTab === "quiz" && (
          <div className="space-y-4">
            {module.quizzes.map((q, i) => (
              <div key={q.id || i} className="border rounded-lg p-4 space-y-3">
                <p className="font-medium text-sm">
                  Frage {q.question_number}: {q.question_text}
                </p>
                <div className="space-y-1.5">
                  {q.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${
                        oi === q.correct_index
                          ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                          : "bg-muted/30 border border-transparent"
                      }`}
                    >
                      <span className="font-medium w-5">
                        {String.fromCharCode(65 + oi)}.
                      </span>
                      <span>{opt}</span>
                      {oi === q.correct_index && (
                        <CheckCircle className="h-3.5 w-3.5 ml-auto text-green-600 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="text-xs text-muted-foreground italic mt-2">
                    {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleRegenerate}
            disabled={isRegenerating || isApproving}
          >
            {isRegenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Neu generieren
          </Button>
          {module.status !== "freigegeben" && (
            <Button
              type="button"
              onClick={handleApprove}
              disabled={isApproving || isRegenerating}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isApproving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Freigeben
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
