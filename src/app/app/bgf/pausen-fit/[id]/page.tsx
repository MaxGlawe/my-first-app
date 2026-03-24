"use client"

/**
 * PROJ-18: Guided Pausen-Fit Session
 * Full-screen workout experience, mobile-first.
 *
 * Flow:
 *  0: Start screen
 *  1..N: Exercise screens (one per exercise)
 *  N+1: Ergonomie-Tipp screen
 *  N+2: Done / feedback screen
 */

import { useState, useEffect, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CircularTimer } from "@/components/bgf/pausen-fit/CircularTimer"
import { StarRating } from "@/components/bgf/pausen-fit/StarRating"
import { getTypLabel, getTypEmoji } from "@/components/bgf/pausen-fit/SessionCard"
import type { PausenFitSession } from "@/types/bgf"
import {
  ArrowLeft,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  Loader2,
  X,
  Play,
  Pause,
} from "lucide-react"

// ── Constants ─────────────────────────────────────────────────────────────────

const EXERCISE_BG_COLORS = [
  "from-emerald-50 to-teal-50",
  "from-sky-50 to-blue-50",
  "from-violet-50 to-purple-50",
  "from-rose-50 to-pink-50",
  "from-amber-50 to-orange-50",
]

const SLIDE_VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
}

// ── Progress dots ─────────────────────────────────────────────────────────────

function ProgressDots({
  total,
  current,
}: {
  total: number
  current: number
}) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Übung ${current + 1} von ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 20 : 8,
            backgroundColor:
              i < current
                ? "#2D6A4F"
                : i === current
                ? "#2D6A4F"
                : "#CBD5E1",
          }}
          transition={{ duration: 0.3 }}
          className="h-2 rounded-full"
        />
      ))}
    </div>
  )
}

// ── Confetti ──────────────────────────────────────────────────────────────────

function ConfettiPiece({ index }: { index: number }) {
  const colors = ["#2D6A4F", "#D4A574", "#60a5fa", "#f472b6", "#a78bfa", "#34d399"]
  const color = colors[index % colors.length]
  const left = `${(index * 17 + 5) % 100}%`
  const delay = (index * 0.12) % 1.5
  const size = 6 + (index % 4) * 2

  return (
    <motion.div
      style={{
        position: "absolute",
        left,
        top: "-10px",
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: index % 2 === 0 ? "50%" : "2px",
      }}
      animate={{
        y: ["0vh", "110vh"],
        rotate: [0, 360 * (index % 2 === 0 ? 1 : -1)],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 2.5 + (index % 5) * 0.3,
        delay,
        ease: "easeIn",
      }}
    />
  )
}

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {Array.from({ length: 30 }).map((_, i) => (
        <ConfettiPiece key={i} index={i} />
      ))}
    </div>
  )
}

// ── Screen: Start ─────────────────────────────────────────────────────────────

function StartScreen({
  session,
  onStart,
  isStarting,
  onBack,
}: {
  session: PausenFitSession
  onStart: () => void
  isStarting: boolean
  onBack: () => void
}) {
  const totalSeconds = session.uebungen.reduce(
    (s, u) => s + u.dauer_sekunden,
    0
  )
  const totalMinutes = Math.ceil(totalSeconds / 60)

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-landing-accent/5 to-white">
      {/* Top bar */}
      <div className="flex items-center px-4 pt-5 pb-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-slate-600 shadow-sm border border-slate-100"
          aria-label="Zurück"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pb-10">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-24 h-24 bg-landing-accent/10 rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-sm"
        >
          {getTypEmoji(session.typ)}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-xs font-semibold text-landing-accent uppercase tracking-widest mb-2">
            Pausen-Fit
          </p>
          <h1 className="text-3xl font-bold text-slate-900 font-display mb-3">
            {getTypLabel(session.typ)}
          </h1>
          <p className="text-slate-500 text-sm max-w-xs">
            {session.uebungen.length} Übungen · {totalMinutes} Minuten
          </p>
        </motion.div>

        {/* Exercise preview list */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-8 w-full max-w-sm bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
          {session.uebungen.map((uebung, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 ${
                i < session.uebungen.length - 1
                  ? "border-b border-slate-50"
                  : ""
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-landing-accent/10 flex items-center justify-center text-xs font-bold text-landing-accent">
                {i + 1}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-slate-800">
                  {uebung.name}
                </p>
              </div>
              <span className="text-xs text-slate-400">
                {uebung.dauer_sekunden}s
              </span>
            </div>
          ))}
          {session.ergonomie_tipp && (
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-50">
              <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700 font-medium">
                Ergonomie-Tipp inklusive
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-8 pt-2">
        <Button
          onClick={onStart}
          disabled={isStarting}
          className="w-full h-14 text-lg font-bold bg-landing-accent hover:bg-landing-accent-hover text-white rounded-2xl shadow-lg shadow-landing-accent/25"
        >
          {isStarting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Los geht's!"
          )}
        </Button>
      </div>
    </div>
  )
}

// ── Screen: Exercise ──────────────────────────────────────────────────────────

function ExerciseScreen({
  session,
  exerciseIndex,
  direction,
  onNext,
  onSkip,
}: {
  session: PausenFitSession
  exerciseIndex: number
  direction: number
  onNext: () => void
  onSkip: () => void
}) {
  const exercise = session.uebungen[exerciseIndex]
  const [timerStarted, setTimerStarted] = useState(false)
  const [timerRunning, setTimerRunning] = useState(false)
  const bgColor =
    EXERCISE_BG_COLORS[exerciseIndex % EXERCISE_BG_COLORS.length]

  const positionLabel: Record<string, string> = {
    sitzend: "Sitzend",
    stehend: "Stehend",
    liegend: "Liegend",
  }
  const schwierigkeitLabel: Record<string, string> = {
    leicht: "Leicht",
    mittel: "Mittel",
    fordernd: "Fordernd",
  }

  function handleStartTimer() {
    setTimerStarted(true)
    setTimerRunning(true)
  }

  return (
    <motion.div
      key={exerciseIndex}
      custom={direction}
      variants={SLIDE_VARIANTS}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
      className={`flex flex-col min-h-screen bg-gradient-to-b ${bgColor}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <ProgressDots
          total={session.uebungen.length}
          current={exerciseIndex}
        />
        <button
          onClick={onSkip}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
          aria-label="Überspringen"
        >
          Überspringen
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Exercise number label */}
      <div className="px-6 pt-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Übung {exerciseIndex + 1} von {session.uebungen.length}
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
        {/* Timer */}
        <div className="relative">
          <CircularTimer
            durationSeconds={exercise.dauer_sekunden}
            onComplete={onNext}
            running={timerRunning}
            colorClass={
              timerRunning
                ? "#2D6A4F"
                : "#94a3b8"
            }
          />
          {/* Before timer started: big play overlay */}
          {!timerStarted && (
            <button
              onClick={handleStartTimer}
              className="absolute inset-0 flex items-center justify-center"
              aria-label="Timer starten"
            >
              <div className="w-16 h-16 rounded-full bg-landing-accent/90 flex items-center justify-center shadow-lg shadow-landing-accent/30 hover:bg-landing-accent transition-colors">
                <Play className="w-7 h-7 text-white ml-0.5" />
              </div>
            </button>
          )}
          {/* After timer started: small pause/resume toggle */}
          {timerStarted && (
            <button
              onClick={() => setTimerRunning((r) => !r)}
              className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50"
              aria-label={timerRunning ? "Pausieren" : "Fortsetzen"}
            >
              {timerRunning ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Hint before timer starts */}
        {!timerStarted && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-slate-400 -mt-3"
          >
            Lies die Anleitung, dann starte den Timer
          </motion.p>
        )}

        {/* Exercise name */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-display leading-tight">
            {exercise.name}
          </h2>
          {exercise.wiederholungen && (
            <p className="text-sm text-landing-accent font-semibold mt-1">
              {exercise.wiederholungen}× Wiederholungen
            </p>
          )}
        </div>

        {/* Description */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 max-w-xs border border-white shadow-sm">
          <p className="text-sm text-slate-600 leading-relaxed">
            {exercise.beschreibung}
          </p>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2">
          <span className="bg-white/60 text-xs text-slate-500 px-2.5 py-1 rounded-full border border-white">
            {positionLabel[exercise.position] ?? exercise.position}
          </span>
          <span className="bg-white/60 text-xs text-slate-500 px-2.5 py-1 rounded-full border border-white">
            {schwierigkeitLabel[exercise.schwierigkeit] ??
              exercise.schwierigkeit}
          </span>
        </div>
      </div>

      {/* Footer button */}
      <div className="px-6 pb-8 pt-4">
        {!timerStarted ? (
          <Button
            onClick={handleStartTimer}
            className="w-full h-14 text-base font-bold bg-landing-accent hover:bg-landing-accent-hover text-white rounded-2xl shadow-lg shadow-landing-accent/20"
          >
            <Play className="w-5 h-5 mr-2" />
            Timer starten
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="w-full h-14 text-base font-bold bg-landing-accent hover:bg-landing-accent-hover text-white rounded-2xl shadow-lg shadow-landing-accent/20"
          >
            Weiter
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        )}
      </div>
    </motion.div>
  )
}

// ── Screen: Ergonomie-Tipp ────────────────────────────────────────────────────

function ErgonomieTippScreen({
  tipp,
  direction,
  onContinue,
}: {
  tipp: string
  direction: number
  onContinue: () => void
}) {
  return (
    <motion.div
      key="ergonomie-tipp"
      custom={direction}
      variants={SLIDE_VARIANTS}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col min-h-screen bg-gradient-to-b from-amber-50 to-orange-50"
    >
      {/* Header */}
      <div className="h-16" />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
          className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center shadow-sm"
        >
          <Lightbulb className="w-10 h-10 text-amber-500" />
        </motion.div>

        <div>
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-2">
            Wusstest du?
          </p>
          <h2 className="text-2xl font-bold text-slate-900 font-display mb-2">
            Ergonomie-Tipp
          </h2>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 max-w-sm border border-amber-100 shadow-sm">
          <p className="text-base text-slate-700 leading-relaxed">{tipp}</p>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-8 pt-4">
        <Button
          onClick={onContinue}
          className="w-full h-14 text-base font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-2xl shadow-lg shadow-amber-400/25"
        >
          Verstanden!
          <CheckCircle2 className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </motion.div>
  )
}

// ── Screen: Done ──────────────────────────────────────────────────────────────

function DoneScreen({
  direction,
  onComplete,
  isCompleting,
}: {
  direction: number
  onComplete: (sterne: number, text: string) => void
  isCompleting: boolean
}) {
  const [sterne, setSterne] = useState(0)
  const [feedbackText, setFeedbackText] = useState("")

  return (
    <>
      <Confetti />
      <motion.div
        key="done"
        custom={direction}
        variants={SLIDE_VARIANTS}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
        className="flex flex-col min-h-screen bg-gradient-to-b from-landing-accent/10 to-emerald-50"
      >
        {/* Header */}
        <div className="h-12" />

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 18,
              delay: 0.2,
            }}
            className="w-24 h-24 bg-landing-accent rounded-3xl flex items-center justify-center shadow-xl shadow-landing-accent/30"
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <h1 className="text-4xl font-bold text-slate-900 font-display mb-1">
              Geschafft!
            </h1>
            <p className="text-slate-500 text-base">
              Klasse — du hast diese Pausen-Fit Session abgeschlossen!
            </p>
          </motion.div>

          {/* Rating */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 w-full max-w-sm border border-landing-accent/10 shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-600 mb-3">
              Wie war diese Session?
            </p>
            <div className="flex justify-center mb-4">
              <StarRating value={sterne} onChange={setSterne} size="lg" />
            </div>
            <Textarea
              placeholder="Optionales Feedback (optional)…"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="resize-none text-sm bg-slate-50 border-slate-200 rounded-xl h-20"
              maxLength={300}
            />
          </motion.div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-8 pt-4">
          <Button
            onClick={() => onComplete(sterne, feedbackText)}
            disabled={isCompleting}
            className="w-full h-14 text-base font-bold bg-landing-accent hover:bg-landing-accent-hover text-white rounded-2xl shadow-lg shadow-landing-accent/25"
          >
            {isCompleting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Fertig"
            )}
          </Button>
        </div>
      </motion.div>
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PausenFitSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [session, setSession] = useState<PausenFitSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Screen flow:
  // 0 = start
  // 1..N = exercises (index exerciseIndex = screenIndex - 1)
  // N+1 = ergonomie tipp (if exists)
  // last = done
  const [screenIndex, setScreenIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isStarting, setIsStarting] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  // ── Load session ────────────────────────────────────────────────────────

  const fetchSession = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      // We don't have a GET /api/bgf/pausen-fit/[id] endpoint,
      // so we fetch today's sessions and find the right one.
      const res = await fetch("/api/bgf/pausen-fit/today")
      if (!res.ok) throw new Error("Fehler beim Laden.")
      const data = await res.json()
      const found = (data.sessions as PausenFitSession[]).find(
        (s) => s.id === id
      )
      if (!found) {
        setLoadError("Session nicht gefunden.")
      } else {
        setSession(found)
        // If already started, skip start screen
        if (found.status === "gestartet") {
          setScreenIndex(1)
        }
      }
    } catch {
      setLoadError("Session konnte nicht geladen werden.")
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  // ── Derived ─────────────────────────────────────────────────────────────

  const totalExercises = session?.uebungen.length ?? 0
  const hasTipp = Boolean(session?.ergonomie_tipp)

  // Screen boundaries:
  // 0: start
  // 1 to totalExercises: exercises
  // totalExercises + 1: ergonomie tipp (if hasTipp), else done
  // totalExercises + (hasTipp ? 2 : 1): done
  const ergonomieScreenIndex = totalExercises + 1
  const doneScreenIndex = totalExercises + (hasTipp ? 2 : 1)

  const currentExerciseIndex = screenIndex - 1 // 0-based
  const isStartScreen = screenIndex === 0
  const isExerciseScreen =
    screenIndex >= 1 && screenIndex <= totalExercises
  const isErgonomieScreen = hasTipp && screenIndex === ergonomieScreenIndex
  const isDoneScreen = screenIndex === doneScreenIndex

  // ── Actions ─────────────────────────────────────────────────────────────

  async function handleStart() {
    if (!session) return
    setIsStarting(true)
    try {
      await fetch(`/api/bgf/pausen-fit/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      })
    } catch {
      // Non-fatal: still proceed to exercises
    } finally {
      setIsStarting(false)
    }
    goNext()
  }

  function goNext() {
    setDirection(1)
    setScreenIndex((prev) => prev + 1)
  }

  async function handleComplete(sterne: number, text: string) {
    setIsCompleting(true)
    try {
      await fetch(`/api/bgf/pausen-fit/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          ...(sterne > 0 ? { feedback_sterne: sterne } : {}),
          ...(text.trim() ? { feedback_text: text.trim() } : {}),
        }),
      })
    } catch {
      // Non-fatal
    } finally {
      setIsCompleting(false)
    }
    router.push("/app/bgf/dashboard")
  }

  // ── Loading / Error ──────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-landing-accent" />
      </div>
    )
  }

  if (loadError || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center gap-4">
        <p className="text-red-500 font-medium">
          {loadError ?? "Session nicht gefunden."}
        </p>
        <Button variant="outline" onClick={() => router.push("/app/bgf/dashboard")}>
          Zurück zum Dashboard
        </Button>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait" custom={direction}>
        {/* 0: Start screen */}
        {isStartScreen && (
          <StartScreen
            key="start"
            session={session}
            onStart={handleStart}
            isStarting={isStarting}
            onBack={() => router.push("/app/bgf/dashboard")}
          />
        )}

        {/* 1..N: Exercise screens */}
        {isExerciseScreen && (
          <ExerciseScreen
            key={`exercise-${currentExerciseIndex}`}
            session={session}
            exerciseIndex={currentExerciseIndex}
            direction={direction}
            onNext={goNext}
            onSkip={goNext}
          />
        )}

        {/* N+1: Ergonomie-Tipp */}
        {isErgonomieScreen && session.ergonomie_tipp && (
          <ErgonomieTippScreen
            key="tipp"
            tipp={session.ergonomie_tipp}
            direction={direction}
            onContinue={goNext}
          />
        )}

        {/* Last: Done screen */}
        {isDoneScreen && (
          <DoneScreen
            key="done"
            direction={direction}
            onComplete={handleComplete}
            isCompleting={isCompleting}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
