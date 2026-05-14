"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Loader2,
  Sparkles,
  Target,
  MessageCircleQuestion,
  Hourglass,
  BookOpen,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Play,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { usePathDetail, type PathLesson } from "@/hooks/use-paths"
import { PathIcon } from "@/components/app/paths/PathIcon"
import { ModuleQuiz } from "@/components/app/paths/ModuleQuiz"
import { CourseCertificate } from "@/components/app/paths/CourseCertificate"
import { LessonContent } from "@/components/app/paths/LessonContent"
import { CourseIntro } from "@/components/app/paths/CourseIntro"
import { Countdown } from "@/components/app/paths/Countdown"
import { cn } from "@/lib/utils"

// ── Color config ────────────────────────────────────────────────────────────

const COLOR_MAP: Record<
  string,
  {
    gradient: string
    bar: string
    btn: string
    btnHover: string
    accent: string
    iconBg: string
    tagBg: string
    tagText: string
    ring: string
  }
> = {
  cyan: {
    gradient: "from-cyan-500 to-sky-500",
    bar: "bg-cyan-500",
    btn: "bg-cyan-500",
    btnHover: "hover:bg-cyan-600",
    accent: "text-cyan-600",
    iconBg: "bg-gradient-to-br from-cyan-100 to-sky-100",
    tagBg: "bg-cyan-50",
    tagText: "text-cyan-700",
    ring: "ring-cyan-500/20",
  },
  emerald: {
    gradient: "from-emerald-500 to-teal-500",
    bar: "bg-emerald-500",
    btn: "bg-emerald-500",
    btnHover: "hover:bg-emerald-600",
    accent: "text-emerald-600",
    iconBg: "bg-gradient-to-br from-emerald-100 to-teal-100",
    tagBg: "bg-emerald-50",
    tagText: "text-emerald-700",
    ring: "ring-emerald-500/20",
  },
  rose: {
    gradient: "from-rose-500 to-pink-500",
    bar: "bg-rose-500",
    btn: "bg-rose-500",
    btnHover: "hover:bg-rose-600",
    accent: "text-rose-600",
    iconBg: "bg-gradient-to-br from-rose-100 to-pink-100",
    tagBg: "bg-rose-50",
    tagText: "text-rose-700",
    ring: "ring-rose-500/20",
  },
  indigo: {
    gradient: "from-indigo-500 to-violet-500",
    bar: "bg-indigo-500",
    btn: "bg-indigo-500",
    btnHover: "hover:bg-indigo-600",
    accent: "text-indigo-600",
    iconBg: "bg-gradient-to-br from-indigo-100 to-violet-100",
    tagBg: "bg-indigo-50",
    tagText: "text-indigo-700",
    ring: "ring-indigo-500/20",
  },
}

function colorFor(c: string) {
  return COLOR_MAP[c] ?? COLOR_MAP.emerald
}

// ── Module item in vertical roadmap ─────────────────────────────────────────

interface ModuleItemProps {
  lesson: PathLesson
  isCompleted: boolean
  isCurrent: boolean
  isLocked: boolean
  isExpanded: boolean
  isLast: boolean
  colorKey: string
  onExpand: () => void
  canComplete: boolean
  isLockedUntilTomorrow: boolean
  nextAvailableLabel: string | null
  nextAvailableAt: string | null
  onUnlock: () => void
  reflection: string
  onReflectionChange: (v: string) => void
  onStartQuiz: () => void
  isSubmitting: boolean
}

function ModuleItem({
  lesson,
  isCompleted,
  isCurrent,
  isLocked,
  isExpanded,
  isLast,
  colorKey,
  onExpand,
  canComplete,
  isLockedUntilTomorrow,
  nextAvailableLabel,
  nextAvailableAt,
  onUnlock,
  reflection,
  onReflectionChange,
  onStartQuiz,
  isSubmitting,
}: ModuleItemProps) {
  const c = colorFor(colorKey)

  // Status icon
  let statusIcon: React.ReactNode
  let dotClass: string
  let cardClass: string

  if (isCompleted) {
    statusIcon = <CheckCircle2 className="h-5 w-5 text-white" />
    dotClass = `${c.btn} shadow-lg ${c.ring} ring-4`
    cardClass = "bg-white border-slate-200 opacity-80"
  } else if (isLocked) {
    statusIcon = <Lock className="h-4 w-4 text-slate-400" />
    dotClass = "bg-slate-100 border-2 border-slate-200"
    cardClass = "bg-slate-50/60 border-slate-200 opacity-70"
  } else if (isLockedUntilTomorrow && isCurrent) {
    statusIcon = <Clock className="h-4 w-4 text-slate-400" />
    dotClass = "bg-amber-100 border-2 border-amber-300"
    cardClass = "bg-white border-slate-200"
  } else if (isCurrent) {
    statusIcon = <Play className="h-4 w-4 text-white" />
    dotClass = `${c.btn} shadow-lg ${c.ring} ring-4 animate-pulse`
    cardClass = `bg-white border-2 border-transparent ring-2 ${c.ring}`
  } else {
    statusIcon = <BookOpen className="h-4 w-4 text-slate-400" />
    dotClass = "bg-slate-100 border-2 border-slate-200"
    cardClass = "bg-white border-slate-200"
  }

  const isClickable = !isLocked && (isCompleted || isCurrent || (!isCompleted && !isLocked))

  return (
    <div className="flex gap-4">
      {/* Timeline column */}
      <div className="flex flex-col items-center shrink-0 w-10">
        <div className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
          dotClass
        )}>
          {statusIcon}
        </div>
        {!isLast && (
          <div className={cn(
            "flex-1 w-0.5 mt-1 min-h-4",
            isCompleted ? c.bar : "bg-slate-200"
          )} />
        )}
      </div>

      {/* Card column */}
      <div className="flex-1 pb-4 min-w-0">
        <button
          onClick={isClickable ? onExpand : undefined}
          disabled={!isClickable}
          className={cn(
            "w-full text-left rounded-2xl border p-4 transition-all duration-200",
            cardClass,
            isClickable && !isExpanded && "hover:shadow-sm hover:border-slate-300",
            isExpanded && "shadow-md"
          )}
        >
          {/* Module header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  isCompleted ? "text-slate-400" : isCurrent ? c.accent : "text-slate-400"
                )}>
                  Modul {lesson.day_number}
                </span>
                {isCompleted && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 h-4 px-1.5 text-[10px]">
                    Abgeschlossen
                  </Badge>
                )}
                {isCurrent && !isCompleted && !isLockedUntilTomorrow && (
                  <Badge className={cn("border-0 h-4 px-1.5 text-[10px] text-white", c.btn)}>
                    Aktuell
                  </Badge>
                )}
                {isLockedUntilTomorrow && isCurrent && (
                  <Badge className="bg-amber-100 text-amber-700 border-0 h-4 px-1.5 text-[10px]">
                    Warte bis morgen
                  </Badge>
                )}
              </div>
              <p className={cn(
                "text-sm font-semibold leading-snug",
                isLocked ? "text-slate-400" : "text-slate-800"
              )}>
                {lesson.title}
              </p>
            </div>
            {isClickable && (
              <div className="shrink-0 text-slate-400">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            )}
          </div>

          {/* Expanded content */}
          {isExpanded && (
            <div className="mt-4 border-t border-slate-100 pt-4 space-y-4">
              {isLockedUntilTomorrow && isCurrent ? (
                /* Locked until tomorrow — hide the lesson content, show only
                   the live countdown until the module unlocks. */
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-5 text-center">
                  <Hourglass className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700 mb-1">
                    Heute bereits erledigt
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    Pfade brauchen Tage, keine Klicks — der therapeutische Effekt
                    entsteht durch tägliche Wiederholung. Der Inhalt dieses Moduls
                    wird mit der Freischaltung sichtbar.
                  </p>
                  {nextAvailableAt && (
                    <>
                      <div className="inline-flex items-center gap-2 rounded-lg bg-white border border-amber-200 px-4 py-2.5 shadow-sm">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <span className="text-base font-bold text-slate-700">
                          <Countdown targetIso={nextAvailableAt} onComplete={onUnlock} />
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2">
                        bis zur Freischaltung
                        {nextAvailableLabel ? ` am ${nextAvailableLabel}` : ""}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  {/* Content */}
                  <LessonContent
                    markdown={lesson.content}
                    accentText={c.accent}
                    accentBullet={c.bar}
                  />

                  {/* Task */}
                  {lesson.task && (
                    <div className={cn("rounded-xl p-3 border", c.tagBg, "border-current/10")}>
                      <div className="flex items-start gap-2">
                        <Target className={cn("h-4 w-4 shrink-0 mt-0.5", c.accent)} />
                        <div>
                          <p className={cn("text-[11px] font-bold uppercase tracking-wider mb-1", c.accent)}>
                            Tages-Aufgabe
                          </p>
                          <p className="text-sm text-slate-700 leading-relaxed">{lesson.task}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reflection */}
                  {lesson.reflection_question && canComplete && (
                    <div>
                      <div className="flex items-start gap-2 mb-2">
                        <MessageCircleQuestion className={cn("h-4 w-4 shrink-0 mt-0.5", c.accent)} />
                        <p className={cn("text-[11px] font-bold uppercase tracking-wider", c.accent)}>
                          Reflexion
                        </p>
                      </div>
                      <p className="text-sm text-slate-600 italic leading-relaxed mb-2">
                        {lesson.reflection_question}
                      </p>
                      <Textarea
                        value={reflection}
                        onChange={(e) => onReflectionChange(e.target.value)}
                        placeholder="Deine Antwort (optional)…"
                        className="min-h-[72px] resize-none text-sm"
                        maxLength={4000}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}

                  {lesson.reflection_question && !canComplete && (
                    <div className="flex items-start gap-2">
                      <MessageCircleQuestion className={cn("h-4 w-4 shrink-0 mt-0.5", c.accent)} />
                      <p className="text-sm text-slate-600 italic leading-relaxed">
                        {lesson.reflection_question}
                      </p>
                    </div>
                  )}

                  {/* CTA */}
                  {canComplete && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        onStartQuiz()
                      }}
                      disabled={isSubmitting}
                      className={cn("w-full h-11 font-semibold rounded-xl text-white", c.btn, c.btnHover)}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <GraduationCap className="h-4 w-4 mr-2" />
                      )}
                      Wissens-Check starten
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </button>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function KursDetailPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const { data, isLoading, error, enroll, completeDay, abandon, refresh } = usePathDetail(params.slug)

  const [expandedDay, setExpandedDay] = useState<number | null>(null)
  const [reflection, setReflection] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [showCertificate, setShowCertificate] = useState(false)
  const [completedAt, setCompletedAt] = useState<string | null>(null)

  const c = colorFor(data?.path.color ?? "emerald")

  const completedSet = useMemo(
    () => new Set(data?.enrollment?.completed_days ?? []),
    [data]
  )

  const currentDay = data?.enrollment?.current_day ?? 1
  const totalDays = data?.path.duration_days ?? 21
  const completedCount = data?.enrollment?.completed_days.length ?? 0
  const progressPct = Math.round((completedCount / totalDays) * 100)
  const isEnrolled = !!data?.enrollment
  const isCompleted = data?.enrollment?.status === "completed"

  const nextAvailableAt = data?.enrollment?.next_available_at
    ? new Date(data.enrollment.next_available_at)
    : null
  const isLockedUntilTomorrow = !!nextAvailableAt && nextAvailableAt.getTime() > Date.now()
  const nextAvailableLabel = nextAvailableAt
    ? nextAvailableAt.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })
    : null

  // Active lesson is the expanded one, or defaults to current
  const activeLesson: PathLesson | null = useMemo(() => {
    if (!data) return null
    const day = expandedDay ?? currentDay
    return data.lessons.find((l) => l.day_number === day) ?? null
  }, [data, expandedDay, currentDay])

  // Once data loads, expand current day
  useMemo(() => {
    if (data && expandedDay === null) {
      setExpandedDay(data.enrollment?.current_day ?? 1)
    }
  }, [data, expandedDay])

  const quizQuestions = activeLesson?.quizzes ?? []
  const isFinalExam = !!activeLesson && activeLesson.day_number >= totalDays

  async function handleEnroll() {
    setIsSubmitting(true)
    try {
      await enroll()
      toast.success("Du bist eingeschrieben. Modul 1 wartet.")
      setExpandedDay(1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Anmeldung fehlgeschlagen.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCompleteModule(quizScore: number, quizTotal: number) {
    if (!activeLesson || !data) return
    setIsSubmitting(true)
    try {
      const { pathCompleted } = await completeDay(
        activeLesson.day_number,
        reflection.trim() ? reflection.trim() : null,
        quizScore,
        quizTotal
      )
      setReflection("")
      setShowQuiz(false)
      if (pathCompleted) {
        setCompletedAt(new Date().toISOString())
        setShowCertificate(true)
      } else {
        toast.success(`Modul ${activeLesson.day_number} abgeschlossen!`)
        setExpandedDay(null)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Speichern fehlgeschlagen.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open the quiz — or, if a module has no quiz yet, complete it directly.
  function handleStartQuiz() {
    if (quizQuestions.length === 0) {
      handleCompleteModule(0, 0)
    } else {
      setShowQuiz(true)
    }
  }

  async function handleAbandon() {
    if (!confirm("Kurs wirklich abbrechen? Dein Fortschritt bleibt gespeichert.")) return
    setIsSubmitting(true)
    try {
      await abandon()
      toast.success("Kurs abgebrochen.")
      router.push("/app/kurse")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Abbruch fehlgeschlagen.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Skeleton className="h-52 w-full" />
        <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  // ── Error ───────────────────────────────────────────────────────────────────

  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-4 text-sm text-red-700 mb-4">
          {error ?? "Kurs nicht gefunden."}
        </div>
        <Button variant="outline" onClick={() => router.push("/app/kurse")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zu Kursen
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Quiz overlay */}
      {showQuiz && activeLesson && (
        <ModuleQuiz
          questions={quizQuestions}
          modulTitle={activeLesson.title}
          color={data.path.color}
          isFinalExam={isFinalExam}
          onPass={handleCompleteModule}
          onSkip={() => setShowQuiz(false)}
        />
      )}

      {/* Certificate overlay */}
      {showCertificate && (
        <CourseCertificate
          courseName={data.path.name}
          subtitle={data.path.subtitle}
          icon={data.path.icon}
          color={data.path.color}
          completedAt={completedAt}
          totalModules={totalDays}
          patientName={data.patient_name}
          certificateId={data.enrollment?.id ?? ""}
          onClose={() => {
            setShowCertificate(false)
            router.push("/app/kurse")
          }}
        />
      )}

      <div className="min-h-[calc(100vh-5rem)]">
        {/* Hero header — KI hero image if available, else gradient placeholder */}
        <div className={`relative overflow-hidden bg-gradient-to-br ${c.gradient} px-5 pt-12 pb-8`}>
          {data.path.hero_image ? (
            <div className="absolute inset-0 pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.path.hero_image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20" />
            </div>
          ) : (
            /* Decorative elements (placeholder until a hero image exists) */
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 right-6 h-28 w-28 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 left-0 h-32 w-32 rounded-full bg-white/10" />
            </div>
          )}

          {/* Back button */}
          <button
            onClick={() => router.push("/app/kurse")}
            className="relative z-10 flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Alle Kurse
          </button>

          {/* Course identity */}
          <div className="relative z-10 flex items-start gap-4">
            <div className="h-16 w-16 rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-xl shrink-0">
              <PathIcon name={data.path.icon} className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-xs text-white/60 font-medium uppercase tracking-widest mb-1">
                Kurs
              </p>
              <h1 className="text-xl font-bold text-white leading-tight">{data.path.name}</h1>
              {data.path.subtitle && (
                <p className="text-xs text-white/70 mt-1 leading-relaxed">{data.path.subtitle}</p>
              )}
            </div>
          </div>

          {/* Progress (if enrolled) */}
          {isEnrolled && (
            <div className="relative z-10 mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white/80">
                  {isCompleted ? "Abgeschlossen" : `${completedCount} / ${totalDays} Module`}
                </span>
                <span className="text-sm font-bold text-white">{progressPct}%</span>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Not enrolled — description + CTA */}
          {!isEnrolled && (
            <div className="relative z-10 mt-5">
              {data.path.description && (
                <p className="text-sm text-white/80 leading-relaxed mb-4">{data.path.description}</p>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-white/60 flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {totalDays} Module
                </span>
                {data.path.target_audience && (
                  <span className="text-xs text-white/60">· {data.path.target_audience}</span>
                )}
              </div>
              <Button
                onClick={handleEnroll}
                disabled={isSubmitting}
                className="mt-4 bg-white text-slate-800 hover:bg-white/90 font-bold h-12 rounded-xl px-6 shadow-lg"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Kurs starten
              </Button>
            </div>
          )}
        </div>

        {/* Module roadmap */}
        <div className="max-w-lg mx-auto px-4 py-6">
          {/* Pre-enrollment: the intro shown before the course is started */}
          {!isEnrolled && (
            <CourseIntro
              introContent={data.path.intro_content}
              totalModules={totalDays}
              lessons={data.lessons}
              color={c}
              defaultExpanded
              showConnector={false}
              onEnroll={handleEnroll}
              isEnrolling={isSubmitting}
            />
          )}

          {/* Description for enrolled users */}
          {isEnrolled && data.path.description && (
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 mb-6">
              <p className="text-sm text-slate-600 leading-relaxed">{data.path.description}</p>
            </div>
          )}

          {/* Roadmap section header */}
          {isEnrolled && (
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                Modul-Reise
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
          )}

          {/* Module list */}
          {isEnrolled && (
            <div className="space-y-0">
              <CourseIntro
                introContent={data.path.intro_content}
                totalModules={totalDays}
                lessons={data.lessons}
                color={c}
              />
              {data.lessons.map((lesson, idx) => {
                const isDone = completedSet.has(lesson.day_number)
                const isCurrent = lesson.day_number === currentDay
                const isLocked = !isDone && !isCurrent && lesson.day_number > currentDay
                const isExpanded = expandedDay === lesson.day_number

                const canComplete =
                  isCurrent &&
                  !isDone &&
                  !isLockedUntilTomorrow

                return (
                  <ModuleItem
                    key={lesson.day_number}
                    lesson={lesson}
                    isCompleted={isDone}
                    isCurrent={isCurrent}
                    isLocked={isLocked}
                    isExpanded={isExpanded}
                    isLast={idx === data.lessons.length - 1}
                    colorKey={data.path.color}
                    onExpand={() => setExpandedDay(isExpanded ? null : lesson.day_number)}
                    canComplete={canComplete}
                    isLockedUntilTomorrow={isLockedUntilTomorrow}
                    nextAvailableLabel={nextAvailableLabel}
                    nextAvailableAt={data.enrollment?.next_available_at ?? null}
                    onUnlock={refresh}
                    reflection={reflection}
                    onReflectionChange={setReflection}
                    onStartQuiz={handleStartQuiz}
                    isSubmitting={isSubmitting}
                  />
                )
              })}
            </div>
          )}

          {/* Abandon link */}
          {isEnrolled && !isCompleted && (
            <div className="text-center pt-6 pb-2">
              <button
                onClick={handleAbandon}
                disabled={isSubmitting}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                Kurs abbrechen
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
