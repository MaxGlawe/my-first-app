"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { usePatientApp } from "@/hooks/use-patient-app"
import type { PatientAppAssignment } from "@/hooks/use-patient-app"
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  SkipForward,
  Play,
  Pause,
  Timer,
  ImageOff,
  PartyPopper,
  BookOpen,
} from "lucide-react"
import { LessonScreen } from "@/components/education/LessonScreen"
import { QuizScreen } from "@/components/education/QuizScreen"
import type { EducationModule } from "@/types/education"

// ── Types ─────────────────────────────────────────────────────────────────────

interface FlatExercise {
  id: string // plan_exercise.id
  exerciseId: string
  name: string
  muskelgruppen: string[]
  beschreibung: string | null
  ausfuehrung: Array<{ nummer: number; beschreibung: string }> | null
  media_url: string | null
  media_type: "image" | "video" | null
  params: {
    saetze: number
    wiederholungen?: number | null
    dauer_sekunden?: number | null
    pause_sekunden: number
    anmerkung?: string | null
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const SESSION_KEY_PREFIX = "praxis_session_"

function getSessionKey(assignmentId: string): string {
  return `${SESSION_KEY_PREFIX}${assignmentId}`
}

interface SessionState {
  exerciseIndex: number
  completedSets: number[] // number of completed sets per exercise
  skipped: number[] // exercise indices that were skipped
  // BUG-5 FIX: store the optional skip reason per exercise index
  skipReasons: Record<number, string>
}

function loadSession(assignmentId: string): SessionState | null {
  try {
    const raw = localStorage.getItem(getSessionKey(assignmentId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as SessionState
    // BUG-5 FIX: handle sessions saved before skipReasons was added
    if (!parsed.skipReasons) parsed.skipReasons = {}
    return parsed
  } catch {
    return null
  }
}

function saveSession(assignmentId: string, state: SessionState): void {
  try {
    localStorage.setItem(getSessionKey(assignmentId), JSON.stringify(state))
  } catch {
    // storage quota exceeded — ignore
  }
}

function clearSession(assignmentId: string): void {
  try {
    localStorage.removeItem(getSessionKey(assignmentId))
  } catch {
    /* ignore */
  }
}

function flattenExercises(assignment: PatientAppAssignment): FlatExercise[] {
  const result: FlatExercise[] = []

  if (assignment.plan) {
    const sortedPhases = [...assignment.plan.plan_phases].sort((a, b) => a.order - b.order)
    for (const phase of sortedPhases) {
      const sortedUnits = [...phase.plan_units].sort((a, b) => a.order - b.order)
      for (const unit of sortedUnits) {
        const sortedExercises = [...unit.plan_exercises].sort((a, b) => a.order - b.order)
        for (const pe of sortedExercises) {
          if (!pe.exercises) continue
          result.push({
            id: pe.id,
            exerciseId: pe.exercise_id,
            name: pe.exercises.name,
            muskelgruppen: pe.exercises.muskelgruppen ?? [],
            beschreibung: pe.exercises.beschreibung ?? null,
            ausfuehrung: pe.exercises.ausfuehrung ?? null,
            media_url: pe.exercises.media_url ?? null,
            media_type: pe.exercises.media_type ?? null,
            params: pe.params as FlatExercise["params"],
          })
        }
      }
    }
  } else {
    // Ad-hoc exercises (enriched with media data from API)
    for (const ae of assignment.adhoc_exercises ?? []) {
      result.push({
        id: ae.exercise_id,
        exerciseId: ae.exercise_id,
        name: ae.exercise_name ?? "Übung",
        muskelgruppen: ae.muskelgruppen ?? [],
        beschreibung: ae.beschreibung ?? ae.anmerkung ?? null,
        ausfuehrung: ae.ausfuehrung ?? null,
        media_url: ae.media_url ?? null,
        media_type: ae.media_type ?? null,
        params: {
          saetze: ae.saetze,
          wiederholungen: ae.wiederholungen ?? null,
          dauer_sekunden: ae.dauer_sekunden ?? null,
          pause_sekunden: ae.pause_sekunden,
          anmerkung: ae.anmerkung ?? null,
        },
      })
    }
  }

  return result
}

// ── PauseTimer ────────────────────────────────────────────────────────────────

function PauseTimer({
  seconds,
  onDone,
}: {
  seconds: number
  onDone: () => void
}) {
  const [remaining, setRemaining] = useState(seconds)
  const [running, setRunning] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  // BUG-4 FIX: keep onDone in a ref so the interval effect doesn't need it as a dependency.
  // Without this, changing onDone would restart the interval on every render.
  const onDoneRef = useRef(onDone)
  useEffect(() => { onDoneRef.current = onDone }, [onDone])

  useEffect(() => {
    // BUG-4 FIX: only depend on `running`, NOT on `remaining`.
    // Previously `remaining` was in the dep array, which restarted the interval every second
    // and could cause double-speed counting after pause/resume.
    // The functional setRemaining(r => ...) gives us the latest value without a dependency.
    if (!running) return
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current!)
          onDoneRef.current()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running])

  const toggle = () => {
    setRunning((r) => !r)
  }

  const pct = Math.round(((seconds - remaining) / seconds) * 100)

  return (
    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Timer className="h-4 w-4 text-amber-600" />
        <p className="text-sm font-semibold text-amber-700">Pause</p>
      </div>
      <div className="text-4xl font-bold text-amber-700 mb-3 tabular-nums">
        {String(Math.floor(remaining / 60)).padStart(2, "0")}:
        {String(remaining % 60).padStart(2, "0")}
      </div>
      <Progress value={pct} className="h-2 mb-3 [&>div]:bg-amber-400" />
      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1 border-amber-300 text-amber-700"
          onClick={toggle}
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? "Pause" : "Weiter"}
        </Button>
        <Button
          size="sm"
          className="h-9 bg-amber-500 hover:bg-amber-600 text-white"
          onClick={onDone}
        >
          Überspringen
        </Button>
      </div>
    </div>
  )
}

// ── MediaAnzeige ──────────────────────────────────────────────────────────────

function MediaAnzeige({
  url,
  type,
  name,
  beschreibung,
}: {
  url: string | null
  type: "image" | "video" | null
  name: string
  // BUG-6 FIX: show text description as fallback when media is unavailable
  beschreibung: string | null
}) {
  const [imgError, setImgError] = useState(false)

  if (!url || imgError) {
    return (
      <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-5">
        {beschreibung ? (
          <p className="text-sm text-slate-600 leading-relaxed">{beschreibung}</p>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-slate-300">
            <ImageOff className="h-10 w-10 mb-2" />
            <p className="text-xs">Kein Bild verfügbar</p>
          </div>
        )}
      </div>
    )
  }

  if (type === "video") {
    return (
      <video
        src={url}
        controls
        playsInline
        className="w-full h-48 rounded-2xl object-contain bg-black"
        onError={() => setImgError(true)}
        aria-label={`Video: ${name}`}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={name}
      className="w-full h-48 rounded-2xl object-contain bg-slate-50"
      onError={() => setImgError(true)}
    />
  )
}

// ── SatzTracker ───────────────────────────────────────────────────────────────

function SatzTracker({
  totalSets,
  completedSets,
  pauseSeconds,
  onSetDone,
}: {
  totalSets: number
  completedSets: number
  pauseSeconds: number
  onSetDone: (newCount: number) => void
}) {
  const [showPause, setShowPause] = useState(false)
  const [pendingCount, setPendingCount] = useState(completedSets)

  const handleSetDone = () => {
    const next = pendingCount + 1
    setPendingCount(next)
    if (next < totalSets && pauseSeconds > 0) {
      setShowPause(true)
    } else {
      onSetDone(next)
    }
  }

  const handlePauseDone = () => {
    setShowPause(false)
    onSetDone(pendingCount)
  }

  if (showPause) {
    return <PauseTimer seconds={pauseSeconds} onDone={handlePauseDone} />
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSets }).map((_, i) => {
          const done = i < completedSets
          return (
            <div
              key={i}
              className={`flex-1 h-12 rounded-xl flex items-center justify-center text-sm font-semibold transition-colors ${
                done
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {done ? <CheckCircle2 className="h-5 w-5" /> : `Satz ${i + 1}`}
            </div>
          )
        })}
      </div>

      {completedSets < totalSets && (
        <Button
          className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
          onClick={handleSetDone}
        >
          Satz {completedSets + 1} erledigt
          <CheckCircle2 className="h-5 w-5 ml-2" />
        </Button>
      )}

      {completedSets >= totalSets && (
        <p className="text-center text-emerald-600 font-semibold text-sm">
          Alle Sätze geschafft!
        </p>
      )}
    </div>
  )
}

// ── AbschlussScreen ───────────────────────────────────────────────────────────

function AbschlussScreen({
  planName,
  assignmentId,
  onSubmit,
  isSubmitting,
}: {
  planName: string
  assignmentId: string
  onSubmit: () => void
  isSubmitting: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6">
      <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
        <PartyPopper className="h-10 w-10 text-emerald-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Training abgeschlossen!</h2>
        <p className="text-slate-500">
          Großartig! Du hast <strong>{planName}</strong> erfolgreich beendet.
        </p>
      </div>
      <Button
        className="w-full max-w-xs h-14 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold rounded-2xl"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Wird gespeichert…" : "Einheit abschließen"}
        <CheckCircle2 className="h-5 w-5 ml-2" />
      </Button>
      <Link href="/app/dashboard">
        <Button variant="ghost" className="text-slate-400">
          Zurück zum Dashboard
        </Button>
      </Link>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TrainingSessionPage() {
  const params = useParams()
  const router = useRouter()
  const assignmentId = params.zuweisungsId as string

  const { assignments, isLoading } = usePatientApp()
  const assignment = assignments.find((a) => a.id === assignmentId) ?? null

  // Derived flat exercise list
  const exercises: FlatExercise[] = assignment ? flattenExercises(assignment) : []

  // PROJ-17: Education flow state (multi-lesson curriculum)
  const [educationPhase, setEducationPhase] = useState<"loading" | "lesson" | "quiz" | "training">("loading")
  const [educationModule, setEducationModule] = useState<EducationModule | null>(null)
  const [lessonProgress, setLessonProgress] = useState<{ current: number; total: number; completed: number } | null>(null)
  const [quizScore, setQuizScore] = useState<{ score: number; total: number } | null>(null)

  // Session state (persisted to localStorage)
  const [session, setSession] = useState<SessionState | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showSkipDialog, setShowSkipDialog] = useState(false)
  const [skipReason, setSkipReason] = useState("")
  const [showSteps, setShowSteps] = useState(false)
  const [done, setDone] = useState(false)

  // Load or init session
  useEffect(() => {
    if (!assignment || exercises.length === 0) return
    const saved = loadSession(assignmentId)
    if (saved && saved.exerciseIndex < exercises.length) {
      setSession(saved)
    } else {
      const initial: SessionState = {
        exerciseIndex: 0,
        completedSets: new Array(exercises.length).fill(0),
        skipped: [],
        skipReasons: {},
      }
      setSession(initial)
      saveSession(assignmentId, initial)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment?.id, exercises.length])

  // PROJ-17: Fetch next lesson from the multi-lesson curriculum
  useEffect(() => {
    if (!assignment) return
    if (!assignment.hauptproblem) {
      setEducationPhase("training")
      return
    }
    async function fetchNextLesson() {
      try {
        const res = await fetch("/api/me/education/next-lesson", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hauptproblem: assignment!.hauptproblem }),
        })
        if (!res.ok) {
          setEducationPhase("training")
          return
        }
        const data = await res.json()
        if (!data.lesson) {
          // No lesson available (all completed, no curriculum, etc.)
          if (data.reason === "all_completed") {
            setLessonProgress({ current: data.total, total: data.total, completed: data.completed })
          }
          setEducationPhase("training")
          return
        }
        setEducationModule(data.lesson)
        setLessonProgress({
          current: data.lessonNumber,
          total: data.totalLessons,
          completed: data.completed,
        })
        setEducationPhase("lesson")
      } catch {
        setEducationPhase("training")
      }
    }
    fetchNextLesson()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment?.id, assignment?.hauptproblem])

  const currentIndex = session?.exerciseIndex ?? 0
  const currentExercise = exercises[currentIndex]
  const progressPct = exercises.length > 0 ? Math.round((currentIndex / exercises.length) * 100) : 0

  const updateSession = useCallback(
    (updater: (prev: SessionState) => SessionState) => {
      setSession((prev) => {
        if (!prev) return prev
        const next = updater(prev)
        saveSession(assignmentId, next)
        return next
      })
    },
    [assignmentId]
  )

  const handleSetsDone = useCallback(
    (newCount: number) => {
      updateSession((s) => {
        const sets = [...s.completedSets]
        sets[s.exerciseIndex] = newCount
        return { ...s, completedSets: sets }
      })
    },
    [updateSession]
  )

  const goNext = useCallback(() => {
    updateSession((s) => {
      const next = s.exerciseIndex + 1
      return { ...s, exerciseIndex: next }
    })
    setShowSteps(false)
  }, [updateSession])

  const handleSkip = useCallback(() => {
    // BUG-5 FIX: store the skip reason in session state (previously discarded)
    const reason = skipReason.trim()
    setShowSkipDialog(false)
    setSkipReason("")
    updateSession((s) => {
      const newReasons = reason
        ? { ...s.skipReasons, [s.exerciseIndex]: reason }
        : s.skipReasons
      return {
        ...s,
        skipped: [...s.skipped, s.exerciseIndex],
        skipReasons: newReasons,
        exerciseIndex: s.exerciseIndex + 1,
      }
    })
    setShowSteps(false)
  }, [updateSession, skipReason])

  const handleFinish = useCallback(async () => {
    if (!assignment) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completed_date: new Date().toISOString().split("T")[0],
        }),
      })
      if (!res.ok && res.status !== 409) {
        // 409 = already done today — treat as success
        const body = await res.json().catch(() => ({}))
        setSubmitError(body.error ?? "Einheit konnte nicht gespeichert werden.")
        return
      }
      clearSession(assignmentId)
      router.push("/app/dashboard?done=1")
    } catch {
      setSubmitError("Netzwerkfehler. Bitte versuche es erneut.")
    } finally {
      setIsSubmitting(false)
    }
  }, [assignment, assignmentId, router])

  // PROJ-17: Education flow screens
  if (educationPhase === "lesson" && educationModule) {
    return (
      <LessonScreen
        module={educationModule}
        lessonProgress={lessonProgress}
        onComplete={() => setEducationPhase("quiz")}
      />
    )
  }

  if (educationPhase === "quiz" && educationModule) {
    return (
      <QuizScreen
        moduleId={educationModule.id}
        quizzes={educationModule.quizzes}
        onComplete={(score, total) => {
          setQuizScore({ score, total })
          setEducationPhase("training")
        }}
      />
    )
  }

  // Loading state
  if (isLoading || !session || educationPhase === "loading") {
    return (
      <div className="container mx-auto py-6 px-4 max-w-lg space-y-4">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    )
  }

  // Not found
  if (!assignment || exercises.length === 0) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-lg text-center">
        <p className="text-slate-500 mb-4">Zuweisung nicht gefunden.</p>
        <Link href="/app/training">
          <Button variant="outline">Zurück</Button>
        </Link>
      </div>
    )
  }

  // Completed all exercises — show finish screen
  if (done || currentIndex >= exercises.length) {
    return (
      <div className="container mx-auto max-w-lg">
        {submitError && (
          <div className="p-4">
            <p className="text-sm text-red-500 text-center">{submitError}</p>
          </div>
        )}
        <AbschlussScreen
          planName={assignment.plan_name ?? "Training"}
          assignmentId={assignmentId}
          onSubmit={handleFinish}
          isSubmitting={isSubmitting}
        />
      </div>
    )
  }

  const completedSetsForCurrent = session.completedSets[currentIndex] ?? 0
  const allSetsDone = completedSetsForCurrent >= (currentExercise?.params?.saetze ?? 1)
  const isLast = currentIndex === exercises.length - 1

  return (
    <div className="container mx-auto py-6 px-4 max-w-lg space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/app/training">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 truncate">{assignment.plan_name ?? "Training"}</p>
          <p className="text-sm font-semibold text-slate-700">
            Übung {currentIndex + 1} von {exercises.length}
          </p>
        </div>
        {quizScore && (
          <Badge variant="outline" className="shrink-0 gap-1 text-teal-700 border-teal-300 bg-teal-50">
            <BookOpen className="h-3 w-3" />
            {quizScore.score}/{quizScore.total}
          </Badge>
        )}
      </div>

      {/* Progress bar */}
      <Progress value={progressPct} className="h-2" />

      {/* Exercise card */}
      {currentExercise && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          {/* Media */}
          <MediaAnzeige
            url={currentExercise.media_url}
            type={currentExercise.media_type}
            name={currentExercise.name}
            beschreibung={currentExercise.beschreibung}
          />

          <div className="p-5 space-y-4">
            {/* Name + muscles */}
            <div>
              <h2 className="text-xl font-bold text-slate-800">{currentExercise.name}</h2>
              {currentExercise.muskelgruppen.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {currentExercise.muskelgruppen.map((m) => (
                    <Badge key={m} variant="secondary" className="text-xs">
                      {m}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Params */}
            <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
              <div className="px-3 py-1.5 rounded-lg bg-slate-100">
                {currentExercise.params.saetze} Sätze
              </div>
              {currentExercise.params.wiederholungen && (
                <div className="px-3 py-1.5 rounded-lg bg-slate-100">
                  {currentExercise.params.wiederholungen} Wdh.
                </div>
              )}
              {currentExercise.params.dauer_sekunden && (
                <div className="px-3 py-1.5 rounded-lg bg-slate-100">
                  {currentExercise.params.dauer_sekunden}s
                </div>
              )}
              {currentExercise.params.pause_sekunden > 0 && (
                <div className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700">
                  {currentExercise.params.pause_sekunden}s Pause
                </div>
              )}
            </div>

            {/* Anmerkung */}
            {currentExercise.params.anmerkung && (
              <p className="text-xs text-slate-400 italic">{currentExercise.params.anmerkung}</p>
            )}

            {/* Execution steps */}
            {currentExercise.ausfuehrung && currentExercise.ausfuehrung.length > 0 && (
              <Collapsible open={showSteps} onOpenChange={setShowSteps}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full gap-2 h-9">
                    Ausführungsschritte anzeigen
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${showSteps ? "rotate-180" : ""}`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ol className="mt-3 space-y-2">
                    {currentExercise.ausfuehrung.map((step) => (
                      <li key={step.nummer} className="flex gap-3 text-sm text-slate-600">
                        <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {step.nummer}
                        </span>
                        <p>{step.beschreibung}</p>
                      </li>
                    ))}
                  </ol>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Set tracker */}
            <SatzTracker
              totalSets={currentExercise.params.saetze}
              completedSets={completedSetsForCurrent}
              pauseSeconds={currentExercise.params.pause_sekunden}
              onSetDone={handleSetsDone}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 h-12 rounded-xl gap-2 text-slate-500"
          onClick={() => setShowSkipDialog(true)}
        >
          <SkipForward className="h-4 w-4" />
          Überspringen
        </Button>

        <Button
          className={`flex-2 h-12 rounded-xl font-semibold gap-2 ${
            allSetsDone
              ? "bg-emerald-600 hover:bg-emerald-700 text-white flex-[2]"
              : "flex-[2] opacity-40 cursor-not-allowed bg-slate-200 text-slate-500"
          }`}
          disabled={!allSetsDone}
          onClick={() => {
            if (isLast) {
              setDone(true)
            } else {
              goNext()
            }
          }}
        >
          {isLast ? "Einheit abschließen" : "Weiter"}
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Skip dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle>Übung überspringen?</DialogTitle>
            <DialogDescription>
              Möchtest du <strong>{currentExercise?.name}</strong> überspringen?
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Grund (optional): z.B. Schmerzen, nicht möglich…"
            value={skipReason}
            onChange={(e) => setSkipReason(e.target.value)}
            rows={3}
            className="resize-none rounded-xl"
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowSkipDialog(false)} className="flex-1">
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={handleSkip}
              className="flex-1"
            >
              Überspringen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
