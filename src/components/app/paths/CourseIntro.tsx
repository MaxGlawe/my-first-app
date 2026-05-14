"use client"

import { useState } from "react"
import {
  Flag,
  CalendarDays,
  GraduationCap,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LessonContent } from "@/components/app/paths/LessonContent"
import type { PathLesson } from "@/hooks/use-paths"

interface ColorTheme {
  gradient: string
  accent: string
  bar: string
  btn: string
  btnHover: string
}

/**
 * The intro element. Two uses:
 *  - Before enrollment (defaultExpanded + onEnroll): a prominent, animated
 *    pre-start introduction with a "Kurs starten" CTA.
 *  - In the enrolled roadmap (collapsed by default): a compact card above
 *    Module 1 that the user can expand on click.
 *
 * Shows the per-course intro text, a static "how the challenge works" block,
 * and a week-grouped overview of every module.
 */
export function CourseIntro({
  introContent,
  totalModules,
  lessons,
  color,
  defaultExpanded = false,
  showConnector = true,
  onEnroll,
  isEnrolling = false,
}: {
  introContent: string | null
  totalModules: number
  lessons: PathLesson[]
  color: ColorTheme
  /** start expanded (pre-enrollment view) */
  defaultExpanded?: boolean
  /** show the timeline connector line below the flag (roadmap context) */
  showConnector?: boolean
  /** when provided, renders a "Kurs starten" CTA at the bottom */
  onEnroll?: () => void
  isEnrolling?: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const weeks = groupIntoWeeks(lessons)

  return (
    <div className="flex gap-4 animate-fade-in-up">
      {/* Timeline column */}
      <div className="flex flex-col items-center shrink-0 w-10">
        <div
          className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br shadow-lg",
            color.gradient
          )}
        >
          <Flag className="h-4 w-4 text-white" />
        </div>
        {showConnector && (
          <div className="flex-1 w-0.5 mt-1 min-h-4 bg-slate-200" />
        )}
      </div>

      {/* Card column */}
      <div className="flex-1 pb-4 min-w-0">
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 overflow-hidden">
          {/* Collapsible header */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-full text-left p-4 flex items-start justify-between gap-2 hover:bg-slate-50 transition-colors"
          >
            <div className="min-w-0">
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  color.accent
                )}
              >
                Start hier
              </span>
              <p className="text-sm font-semibold text-slate-800 leading-snug mt-0.5">
                Einführung — was dich erwartet
              </p>
            </div>
            <div className="shrink-0 text-slate-400 mt-0.5">
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </button>

          {/* Expanded body */}
          {expanded && (
            <div className="px-4 pb-4 -mt-1">
              {introContent ? (
                <LessonContent
                  markdown={introContent}
                  accentText={color.accent}
                  accentBullet={color.bar}
                />
              ) : (
                <p className="text-[15px] leading-[1.7] text-slate-500">
                  In den nächsten {totalModules} Tagen begleiten wir dich Schritt
                  für Schritt. Jeden Tag ein kurzes Modul — verständlich,
                  alltagsnah und direkt anwendbar.
                </p>
              )}

              {/* Static "how it works" block */}
              <div className="mt-4 grid gap-2.5 border-t border-slate-200 pt-4">
                <HowItWorksRow
                  icon={<CalendarDays className="h-4 w-4" />}
                  accent={color.accent}
                  title={`1 Modul pro Tag — ${totalModules} Tage`}
                  text="Jeden Tag schaltet sich ein neues Modul frei. Kein Vorspulen — der Effekt entsteht durch tägliche Wiederholung."
                />
                <HowItWorksRow
                  icon={<GraduationCap className="h-4 w-4" />}
                  accent={color.accent}
                  title="Wissens-Check pro Modul"
                  text="3 kurze Fragen festigen das Gelernte. Erst danach gilt das Modul als abgeschlossen."
                />
                <HowItWorksRow
                  icon={<Award className="h-4 w-4" />}
                  accent={color.accent}
                  title="Zertifikat zum Abschluss"
                  text={`Wer alle ${totalModules} Module schafft, erhält ein persönliches Abschluss-Zertifikat.`}
                />
              </div>

              {/* Module overview — the whole journey at a glance */}
              {weeks.length > 0 && (
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <p className="text-[13px] font-semibold text-slate-700 mb-3">
                    Dein Weg — alle {totalModules} Module
                  </p>
                  <div className="space-y-3">
                    {weeks.map((week) => (
                      <div key={week.num}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                          Woche {week.num}
                        </p>
                        <div className="space-y-1">
                          {week.lessons.map((l) => (
                            <div
                              key={l.day_number}
                              className="flex items-center gap-2.5"
                            >
                              <span className="h-5 w-5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-400 flex items-center justify-center shrink-0">
                                {l.day_number}
                              </span>
                              <span className="text-[12.5px] text-slate-600 leading-snug truncate">
                                {l.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pre-enrollment CTA */}
              {onEnroll && (
                <Button
                  onClick={onEnroll}
                  disabled={isEnrolling}
                  className={cn(
                    "w-full h-12 font-semibold rounded-xl text-white mt-5",
                    color.btn,
                    color.btnHover
                  )}
                >
                  {isEnrolling ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Kurs starten
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function groupIntoWeeks(lessons: PathLesson[]) {
  const byWeek = new Map<number, PathLesson[]>()
  for (const lesson of [...lessons].sort((a, b) => a.day_number - b.day_number)) {
    const week = Math.ceil(lesson.day_number / 7)
    if (!byWeek.has(week)) byWeek.set(week, [])
    byWeek.get(week)!.push(lesson)
  }
  return [...byWeek.entries()]
    .sort(([a], [b]) => a - b)
    .map(([num, weekLessons]) => ({ num, lessons: weekLessons }))
}

function HowItWorksRow({
  icon,
  accent,
  title,
  text,
}: {
  icon: React.ReactNode
  accent: string
  title: string
  text: string
}) {
  return (
    <div className="flex gap-2.5">
      <div className={cn("shrink-0 mt-0.5", accent)}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-slate-700 leading-snug">
          {title}
        </p>
        <p className="text-[12px] text-slate-500 leading-relaxed mt-0.5">{text}</p>
      </div>
    </div>
  )
}
