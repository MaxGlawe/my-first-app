"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useMyEducation } from "@/hooks/use-education"
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  ChevronDown,
  Trophy,
  Loader2,
  Lock,
} from "lucide-react"
import type { CurriculumProgress, PatientEducationModule } from "@/types/education"

export default function WissensHubPage() {
  const { curricula, modules, loading, error } = useMyEducation()
  const hasCurricula = curricula.length > 0

  return (
    <div className="container mx-auto py-6 px-4 max-w-lg space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/app/dashboard">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Mein Wissen</h1>
          <p className="text-xs text-slate-400">
            Lektionen & Quiz zu deinen Beschwerden
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-sm text-red-500 text-center py-8">{error}</div>
      )}

      {/* Empty state */}
      {!loading && !error && modules.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100">
            <BookOpen className="h-8 w-8 text-slate-300" />
          </div>
          <p className="text-sm text-slate-500">
            Noch keine Wissensinhalte verfügbar.
          </p>
          <p className="text-xs text-slate-400">
            Dein Therapeut wird dir bald Lektionen zu deinen Beschwerden freigeben.
          </p>
        </div>
      )}

      {/* Curriculum-based view */}
      {!loading && hasCurricula && (
        <div className="space-y-5">
          {curricula.map((c) => (
            <CurriculumCard key={c.hauptproblem} curriculum={c} />
          ))}
        </div>
      )}

      {/* Fallback: flat module list (for modules without curriculum) */}
      {!loading && !hasCurricula && modules.length > 0 && (
        <div className="space-y-3">
          {modules.map((m) => (
            <FlatModuleCard key={m.id} module={m} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Curriculum Card ──────────────────────────────────────────────────────────

function CurriculumCard({ curriculum }: { curriculum: CurriculumProgress }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { hauptproblem, total_lessons, completed_lessons, curriculum: topics, lessons } = curriculum
  const progressPct = total_lessons > 0 ? Math.round((completed_lessons / total_lessons) * 100) : 0
  const allDone = completed_lessons >= total_lessons

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full text-left p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors"
      >
        <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
          allDone ? "bg-green-100" : "bg-teal-100"
        }`}>
          {allDone ? (
            <Trophy className="h-5 w-5 text-green-600" />
          ) : (
            <BookOpen className="h-5 w-5 text-teal-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">
            {hauptproblem}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {completed_lessons} von {total_lessons} Lektionen abgeschlossen
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-300 transition-transform shrink-0 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              allDone ? "bg-green-500" : "bg-teal-500"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Expanded: lesson list */}
      {isExpanded && topics.length > 0 && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-1.5">
          {topics.map((topic) => {
            const lesson = lessons.find((l) => l.lesson_number === topic.number)
            const isCompleted = lesson?.quiz_completed ?? false
            const isAvailable = !!lesson
            const score = lesson?.quiz_score

            return (
              <div
                key={topic.number}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                  isCompleted
                    ? "bg-green-50 border border-green-200"
                    : isAvailable
                      ? "bg-teal-50 border border-teal-200"
                      : "bg-slate-50 border border-transparent"
                }`}
              >
                <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
                  isCompleted
                    ? "bg-green-100 text-green-700"
                    : isAvailable
                      ? "bg-teal-100 text-teal-700"
                      : "bg-slate-200 text-slate-400"
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    topic.number
                  )}
                </span>
                <span className={`flex-1 ${
                  isCompleted
                    ? "text-green-800"
                    : isAvailable
                      ? "text-teal-800"
                      : "text-slate-400"
                }`}>
                  {topic.topic}
                </span>
                {isCompleted && score !== null && score !== undefined && (
                  <span className="text-xs font-medium text-green-600 shrink-0">
                    {score}/3
                  </span>
                )}
                {!isAvailable && (
                  <Lock className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Flat Module Card (fallback for non-curriculum modules) ───────────────────

function FlatModuleCard({ module }: { module: PatientEducationModule }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full text-left p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors"
      >
        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
          module.quiz_completed ? "bg-green-100" : "bg-teal-100"
        }`}>
          {module.quiz_completed ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <BookOpen className="h-5 w-5 text-teal-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {module.title}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {module.hauptproblem}
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {module.quiz_completed && module.quiz_score !== null && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">
              <Trophy className="h-3 w-3" />
              {module.quiz_score}/3
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-slate-300 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-100">
          <div
            className="prose prose-sm dark:prose-invert max-w-none pt-4
              prose-h2:text-sm prose-h2:font-semibold prose-h2:mt-4 prose-h2:mb-2
              prose-p:text-xs prose-p:leading-relaxed prose-p:text-slate-600
              prose-ul:text-xs prose-li:text-slate-600
              prose-strong:text-slate-800"
            dangerouslySetInnerHTML={{ __html: module.lesson_content }}
          />
          {module.quiz_completed ? (
            <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-3 text-center">
              <p className="text-sm font-medium text-green-700">
                Quiz abgeschlossen — {module.quiz_score}/3 richtig
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-teal-50 border border-teal-200 p-3 text-center">
              <p className="text-sm text-teal-700">
                Quiz noch offen — starte dein Training um das Quiz zu machen.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
