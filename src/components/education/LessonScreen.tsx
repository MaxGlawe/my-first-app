"use client"

import { useState, useMemo } from "react"
import {
  BookOpen,
  ArrowRight,
  Brain,
  Activity,
  Lightbulb,
  ShieldCheck,
  Heart,
  Clock,
  ChevronDown,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { EducationModule } from "@/types/education"

// ── Types ────────────────────────────────────────────────────────────────────

interface LessonProgressInfo {
  current: number
  total: number
  completed: number
}

interface LessonScreenProps {
  module: EducationModule
  lessonProgress?: LessonProgressInfo | null
  onComplete: () => void
}

interface ContentSection {
  title: string
  html: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const SECTION_STYLES = [
  { bg: "bg-teal-50 dark:bg-teal-950/30", border: "border-teal-200 dark:border-teal-800", iconBg: "bg-teal-100 dark:bg-teal-900/50", iconColor: "text-teal-600", accent: "text-teal-700 dark:text-teal-300", Icon: Brain },
  { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", iconBg: "bg-blue-100 dark:bg-blue-900/50", iconColor: "text-blue-600", accent: "text-blue-700 dark:text-blue-300", Icon: Activity },
  { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", iconBg: "bg-emerald-100 dark:bg-emerald-900/50", iconColor: "text-emerald-600", accent: "text-emerald-700 dark:text-emerald-300", Icon: Lightbulb },
  { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", iconBg: "bg-amber-100 dark:bg-amber-900/50", iconColor: "text-amber-600", accent: "text-amber-700 dark:text-amber-300", Icon: ShieldCheck },
  { bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800", iconBg: "bg-purple-100 dark:bg-purple-900/50", iconColor: "text-purple-600", accent: "text-purple-700 dark:text-purple-300", Icon: Heart },
  { bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800", iconBg: "bg-rose-100 dark:bg-rose-900/50", iconColor: "text-rose-600", accent: "text-rose-700 dark:text-rose-300", Icon: Sparkles },
]

function parseContentSections(html: string): ContentSection[] {
  // Split HTML by <h2> tags into sections
  const parts = html.split(/<h2[^>]*>/i)
  const sections: ContentSection[] = []

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim()
    if (!part) continue

    if (i === 0) {
      // Content before first <h2> — intro text
      const cleaned = part.replace(/<\/h2>/gi, "").trim()
      if (cleaned) {
        sections.push({ title: "", html: cleaned })
      }
    } else {
      // Split at closing </h2> to get title and body
      const closingIdx = part.indexOf("</h2>")
      if (closingIdx === -1) {
        sections.push({ title: "", html: part })
      } else {
        const title = part.slice(0, closingIdx).replace(/<[^>]+>/g, "").trim()
        const body = part.slice(closingIdx + 5).trim()
        sections.push({ title, html: body })
      }
    }
  }

  return sections
}

function estimateReadingMinutes(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  const words = text.split(" ").length
  return Math.max(1, Math.round(words / 150)) // ~150 words/min for German B1
}

// ── Component ────────────────────────────────────────────────────────────────

export function LessonScreen({ module, lessonProgress, onComplete }: LessonScreenProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())

  const sections = useMemo(() => parseContentSections(module.lesson_content), [module.lesson_content])
  const readingTime = useMemo(() => estimateReadingMinutes(module.lesson_content), [module.lesson_content])
  const hasMultipleSections = sections.filter((s) => s.title).length > 1

  // Start with all sections expanded if 3 or fewer, otherwise collapse
  const allExpanded = !hasMultipleSections || sections.length <= 3

  function toggleSection(idx: number) {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
      } else {
        next.add(idx)
      }
      return next
    })
  }

  function isSectionOpen(idx: number): boolean {
    return allExpanded || expandedSections.has(idx)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 px-4 py-6">
      <div className="max-w-lg mx-auto space-y-5">
        {/* Lesson progress indicator */}
        {lessonProgress && lessonProgress.total > 1 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Lektion {lessonProgress.current} von {lessonProgress.total}</span>
              <span>{lessonProgress.completed} abgeschlossen</span>
            </div>
            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-300"
                style={{ width: `${(lessonProgress.current / lessonProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Hero Header */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg shadow-teal-200/50 dark:shadow-teal-900/30">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
            {module.title}
          </h1>
          <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              ~{readingTime} Min. Lesezeit
            </span>
            {hasMultipleSections && (
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {sections.filter((s) => s.title).length} Abschnitte
              </span>
            )}
          </div>
        </div>

        {/* Intro hint */}
        <div className="rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-4 py-3 flex items-start gap-3">
          <div className="shrink-0 w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center mt-0.5">
            <Lightbulb className="h-4 w-4 text-teal-600" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Nimm dir kurz Zeit für diese Lektion — danach folgt ein kurzes Quiz.
            Das Wissen hilft dir, dein Training besser zu verstehen!
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-3">
          {sections.map((section, idx) => {
            const style = SECTION_STYLES[idx % SECTION_STYLES.length]
            const SectionIcon = style.Icon
            const isOpen = isSectionOpen(idx)

            // Intro section (no title) — render as plain card
            if (!section.title) {
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white dark:bg-slate-800/80 shadow-sm border border-slate-200 dark:border-slate-700 px-5 py-4"
                >
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none
                      prose-p:text-sm prose-p:leading-relaxed prose-p:text-slate-600 dark:prose-p:text-slate-300
                      prose-ul:text-sm prose-li:text-slate-600 dark:prose-li:text-slate-300
                      prose-strong:text-slate-800 dark:prose-strong:text-slate-100"
                    dangerouslySetInnerHTML={{ __html: section.html }}
                  />
                </div>
              )
            }

            // Named sections — collapsible cards with colored accents
            return (
              <div
                key={idx}
                className={`rounded-2xl border shadow-sm overflow-hidden transition-all ${style.border} ${style.bg}`}
              >
                {/* Section header */}
                <button
                  type="button"
                  onClick={() => toggleSection(idx)}
                  className={`w-full text-left px-5 py-4 flex items-center gap-3 ${
                    !allExpanded ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${style.iconBg}`}>
                    <SectionIcon className={`h-5 w-5 ${style.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${style.accent}`}>
                      {section.title}
                    </p>
                    {!isOpen && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        Tippe um zu lesen
                      </p>
                    )}
                  </div>
                  {!allExpanded && (
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform shrink-0 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Section body */}
                {isOpen && (
                  <div className="px-5 pb-5">
                    <div className="h-px bg-current opacity-10 mb-4" />
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none
                        prose-p:text-[13px] prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:mb-3
                        prose-ul:text-[13px] prose-ul:my-2 prose-ul:pl-0
                        prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-li:mb-1.5 prose-li:pl-0
                        prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-semibold"
                      dangerouslySetInnerHTML={{ __html: section.html }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="pt-2 pb-4">
          <Button
            onClick={onComplete}
            className="w-full h-13 text-base font-semibold rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg shadow-teal-200/40 dark:shadow-teal-900/30"
          >
            Weiter zum Quiz
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-center text-[11px] text-slate-400 mt-2">
            3 kurze Fragen — dauert nur 1 Minute
          </p>
        </div>
      </div>
    </div>
  )
}
