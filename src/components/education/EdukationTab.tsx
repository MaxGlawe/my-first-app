"use client"

import { usePatientQuizResults } from "@/hooks/use-patient-quiz-results"
import { Loader2, BookOpen, CheckCircle, XCircle, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface EdukationTabProps {
  patientId: string
}

export function EdukationTab({ patientId }: EdukationTabProps) {
  const { results, loading, error } = usePatientQuizResults(patientId)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-destructive text-center py-8">
        {error}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Noch keine Quiz-Ergebnisse vorhanden.
        </p>
        <p className="text-xs text-muted-foreground">
          Quiz-Ergebnisse erscheinen hier, sobald der Patient eine Wissenslektion mit Quiz abgeschlossen hat.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground px-1">
        Quiz-Ergebnisse ({results.length})
      </h3>
      {results.map((r) => (
        <div
          key={r.id}
          className="border rounded-lg p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-teal-600 shrink-0" />
              <span className="font-medium text-sm">
                {r.module?.title ?? "Modul"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ScoreBadge score={r.score} total={r.total} />
              <span className="text-xs text-muted-foreground">
                {new Date(r.completed_at).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
          {r.module?.hauptproblem && (
            <Badge variant="outline" className="text-xs">
              {r.module.hauptproblem}
            </Badge>
          )}
          {/* Answer details */}
          <div className="flex gap-2 pt-1">
            {r.answers.map((a, i) => (
              <div
                key={i}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                  a.is_correct
                    ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300"
                    : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300"
                }`}
              >
                {a.is_correct ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                Frage {i + 1}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ScoreBadge({ score, total }: { score: number; total: number }) {
  const color =
    score === total
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      : score >= total / 2
        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      <Trophy className="h-3 w-3" />
      {score}/{total}
    </span>
  )
}
