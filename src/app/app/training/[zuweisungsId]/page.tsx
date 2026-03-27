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
  Star,
  AlertCircle,
} from "lucide-react"
import { ExerciseVorlesen } from "@/components/app/ExerciseVorlesen"
import { GuidedModeController } from "@/components/app/GuidedModeController"
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

interface ExerciseFeedback {
  difficulty?: number // 1-5
  pain_during?: number // 0-10
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
  skipReasons: Record<number, string>
  exerciseFeedback: Record<number, ExerciseFeedback> // per-exercise feedback
  startedAt: string // ISO timestamp
}

function loadSession(assignmentId: string): SessionState | null {
  try {
    const raw = localStorage.getItem(getSessionKey(assignmentId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as SessionState
    if (!parsed.skipReasons) parsed.skipReasons = {}
    if (!parsed.exerciseFeedback) parsed.exerciseFeedback = {}
    if (!parsed.startedAt) parsed.startedAt = new Date().toISOString()
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
  const onDoneRef = useRef(onDone)
  useEffect(() => { onDoneRef.current = onDone }, [onDone])

  useEffect(() => {
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

// ── ExerciseFeedbackDialog ────────────────────────────────────────────────────

function ExerciseFeedbackDialog({
  open,
  exerciseName,
  onSubmit,
}: {
  open: boolean
  exerciseName: string
  onSubmit: (feedback: ExerciseFeedback) => void
}) {
  const [difficulty, setDifficulty] = useState<number>(0)
  const [painDuring, setPainDuring] = useState<number | null>(null)

  const handleSubmit = () => {
    onSubmit({
      difficulty: difficulty > 0 ? difficulty : undefined,
      pain_during: painDuring ?? undefined,
    })
    setDifficulty(0)
    setPainDuring(null)
  }

  const handleSkip = () => {
    onSubmit({})
    setDifficulty(0)
    setPainDuring(null)
  }

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-sm mx-4 rounded-2xl" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-lg">Wie war&apos;s?</DialogTitle>
          <DialogDescription>
            Kurzes Feedback zu <strong>{exerciseName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Difficulty rating (1-5 stars) */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Schwierigkeit</p>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                    level <= difficulty
                      ? "bg-amber-400 text-white shadow-sm scale-110"
                      : "bg-slate-100 text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  <Star className="h-5 w-5" fill={level <= difficulty ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
              <span>Leicht</span>
              <span>Sehr schwer</span>
            </div>
          </div>

          {/* Pain during exercise (0-10) */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Schmerzen während der Übung</p>
            <div className="flex gap-1.5 justify-center flex-wrap">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
                const isSelected = painDuring === level
                const color = level === 0
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : level <= 3
                  ? "bg-green-100 text-green-700 border-green-200"
                  : level <= 6
                  ? "bg-amber-100 text-amber-700 border-amber-200"
                  : "bg-red-100 text-red-700 border-red-200"
                return (
                  <button
                    key={level}
                    onClick={() => setPainDuring(level)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold border transition-all ${
                      isSelected
                        ? `${color} scale-110 shadow-sm`
                        : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {level}
                  </button>
                )
              })}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
              <span>Kein Schmerz</span>
              <span>Unerträglich</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={handleSkip} className="text-slate-400 text-sm">
            Überspringen
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
          >
            Weiter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── AbschlussScreen (Enhanced) ────────────────────────────────────────────────

function AbschlussScreen({
  planName,
  onSubmit,
  isSubmitting,
  overallDifficulty,
  overallPain,
  notes,
  onDifficultyChange,
  onPainChange,
  onNotesChange,
}: {
  planName: string
  onSubmit: () => void
  isSubmitting: boolean
  overallDifficulty: number
  overallPain: number | null
  notes: string
  onDifficultyChange: (v: number) => void
  onPainChange: (v: number | null) => void
  onNotesChange: (v: string) => void
}) {
  return (
    <div className="container mx-auto max-w-lg px-4 py-8 space-y-6">
      {/* Success header */}
      <div className="text-center space-y-3">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <PartyPopper className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Training abgeschlossen!</h2>
        <p className="text-slate-500">
          Großartig! Du hast <strong>{planName}</strong> erfolgreich beendet.
        </p>
      </div>

      {/* Overall Feedback Card */}
      <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm p-5 space-y-5">
        <p className="text-sm font-semibold text-slate-700">Wie war das Training insgesamt?</p>

        {/* Overall Difficulty */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Schwierigkeit</p>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => onDifficultyChange(level)}
                className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                  level <= overallDifficulty
                    ? "bg-amber-400 text-white shadow-sm scale-110"
                    : "bg-slate-100 text-slate-300 hover:bg-slate-200"
                }`}
              >
                <Star className="h-5 w-5" fill={level <= overallDifficulty ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
            <span>Leicht</span>
            <span>Sehr schwer</span>
          </div>
        </div>

        {/* Overall Pain */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Schmerz-Level insgesamt</p>
          <div className="flex gap-1.5 justify-center flex-wrap">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
              const isSelected = overallPain === level
              const color = level === 0
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : level <= 3
                ? "bg-green-100 text-green-700 border-green-200"
                : level <= 6
                ? "bg-amber-100 text-amber-700 border-amber-200"
                : "bg-red-100 text-red-700 border-red-200"
              return (
                <button
                  key={level}
                  onClick={() => onPainChange(level)}
                  className={`h-8 w-8 rounded-lg text-xs font-semibold border transition-all ${
                    isSelected
                      ? `${color} scale-110 shadow-sm`
                      : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {level}
                </button>
              )
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Notizen (optional)</p>
          <Textarea
            placeholder="Wie hast du dich gefühlt? Gab es Probleme?"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={2}
            className="resize-none rounded-xl text-sm"
            maxLength={2000}
          />
        </div>
      </div>

      {/* Submit */}
      <Button
        className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-base font-semibold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Wird gespeichert…" : "Einheit abschließen"}
        <CheckCircle2 className="h-5 w-5 ml-2" />
      </Button>

      <Link href="/app/dashboard" className="block text-center">
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

  const exercises: FlatExercise[] = assignment ? flattenExercises(assignment) : []

  // PROJ-17: Education flow state
  const [educationPhase, setEducationPhase] = useState<"loading" | "lesson" | "quiz" | "training">("loading")
  const [educationModule, setEducationModule] = useState<EducationModule | null>(null)
  const [lessonProgress, setLessonProgress] = useState<{ current: number; total: number; completed: number } | null>(null)
  const [quizScore, setQuizScore] = useState<{ score: number; total: number } | null>(null)

  // Session state
  const [session, setSession] = useState<SessionState | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showSkipDialog, setShowSkipDialog] = useState(false)
  const [skipReason, setSkipReason] = useState("")
  const [showSteps, setShowSteps] = useState(false)
  const [done, setDone] = useState(false)

  // Exercise feedback dialog state
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [pendingNextAction, setPendingNextAction] = useState<"next" | "finish" | null>(null)

  // Finish screen state
  const [overallDifficulty, setOverallDifficulty] = useState(0)
  const [overallPain, setOverallPain] = useState<number | null>(null)
  const [finishNotes, setFinishNotes] = useState("")

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
        exerciseFeedback: {},
        startedAt: new Date().toISOString(),
      }
      setSession(initial)
      saveSession(assignmentId, initial)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment?.id, exercises.length])

  // PROJ-17: Fetch next lesson
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

  // When sets are all done, show feedback dialog before advancing
  const handleAdvance = useCallback((action: "next" | "finish") => {
    setPendingNextAction(action)
    setShowFeedbackDialog(true)
  }, [])

  const handleFeedbackSubmit = useCallback(
    (feedback: ExerciseFeedback) => {
      setShowFeedbackDialog(false)

      // Save feedback for current exercise
      updateSession((s) => {
        const newFeedback = { ...s.exerciseFeedback, [s.exerciseIndex]: feedback }
        return { ...s, exerciseFeedback: newFeedback }
      })

      // Execute pending action
      if (pendingNextAction === "finish") {
        setDone(true)
      } else {
        updateSession((s) => ({
          ...s,
          exerciseIndex: s.exerciseIndex + 1,
        }))
        setShowSteps(false)
      }
      setPendingNextAction(null)
    },
    [pendingNextAction, updateSession]
  )

  const handleSkip = useCallback(() => {
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
    if (!assignment || !session) return
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Build exercise logs for the training-log API
      const exerciseLogs = exercises.map((ex, i) => {
        const feedback = session.exerciseFeedback[i]
        const isSkipped = session.skipped.includes(i)
        return {
          exercise_id: ex.exerciseId,
          sets_done: isSkipped ? 0 : (session.completedSets[i] ?? 0),
          reps_done: ex.params.wiederholungen ?? undefined,
          duration_seconds: ex.params.dauer_sekunden ?? undefined,
          difficulty: feedback?.difficulty,
          pain_during: feedback?.pain_during,
          skipped: isSkipped,
          skip_reason: session.skipReasons[i] ?? undefined,
        }
      })

      const startedAt = session.startedAt
      const completedAt = new Date().toISOString()
      const durationSec = Math.round(
        (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000
      )

      // Submit training log (fire-and-forget — don't block on failure)
      fetch("/api/me/training-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignment_id: assignmentId,
          started_at: startedAt,
          completed_at: completedAt,
          duration_seconds: durationSec,
          overall_difficulty: overallDifficulty > 0 ? overallDifficulty : undefined,
          overall_pain: overallPain ?? undefined,
          notes: finishNotes.trim() || undefined,
          exercise_logs: exerciseLogs,
        }),
      }).catch(() => {
        // Silently fail — completion is more important
      })

      // Submit completion (main API)
      const res = await fetch(`/api/assignments/${assignmentId}/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completed_date: new Date().toISOString().split("T")[0],
        }),
      })
      if (!res.ok && res.status !== 409) {
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
  }, [assignment, session, exercises, assignmentId, router, overallDifficulty, overallPain, finishNotes])

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
      <>
        {submitError && (
          <div className="container mx-auto max-w-lg p-4">
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {submitError}
            </div>
          </div>
        )}
        <AbschlussScreen
          planName={assignment.plan_name ?? "Training"}
          onSubmit={handleFinish}
          isSubmitting={isSubmitting}
          overallDifficulty={overallDifficulty}
          overallPain={overallPain}
          notes={finishNotes}
          onDifficultyChange={setOverallDifficulty}
          onPainChange={setOverallPain}
          onNotesChange={setFinishNotes}
        />
      </>
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
          <p className="text-xs text-slate-400 truncate">
            Übung {currentIndex + 1} von {exercises.length} — {assignment.plan_name ?? "Training"}
          </p>
          <p className="text-sm font-semibold text-slate-700 truncate">
            {currentExercise?.name ?? "Übung"}
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

      {/* Session Mode Banner (PROJ-18) */}
      <Link href={`/app/training/${assignmentId}/session`}>
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Play className="h-5 w-5 text-white" fill="white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Premium-Training starten</p>
              <p className="text-xs text-white/70">Immersiver Vollbild-Modus mit Timer & Atmung</p>
            </div>
            <ChevronRight className="h-5 w-5 text-white/60" />
          </div>
        </div>
      </Link>

      {/* Guided Mode */}
      <GuidedModeController
        exercises={exercises}
        currentIndex={currentIndex}
        isSessionActive={!!session}
      />

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

            {/* Vorlesen (TTS) */}
            {currentExercise.ausfuehrung && currentExercise.ausfuehrung.length > 0 && (
              <ExerciseVorlesen
                exerciseId={currentExercise.exerciseId}
                exerciseName={currentExercise.name}
                ausfuehrung={currentExercise.ausfuehrung}
                params={currentExercise.params}
              />
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
          onClick={() => handleAdvance(isLast ? "finish" : "next")}
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

      {/* Exercise Feedback Dialog */}
      {currentExercise && (
        <ExerciseFeedbackDialog
          open={showFeedbackDialog}
          exerciseName={currentExercise.name}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  )
}
