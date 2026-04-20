"use client"

import { useMemo, useCallback, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { usePatientApp } from "@/hooks/use-patient-app"
import { useSessionMode } from "@/hooks/use-session-mode"
import { useWakeLock } from "@/hooks/use-wake-lock"
import { flattenExercises, estimateDuration } from "@/lib/training-helpers"
import type { FlatExercise } from "@/lib/training-helpers"
import { SessionHeader } from "@/components/app/session/SessionHeader"
import { SessionStartScreen } from "@/components/app/session/SessionStartScreen"
import { SessionExerciseView } from "@/components/app/session/SessionExerciseView"
import { SessionPauseScreen } from "@/components/app/session/SessionPauseScreen"
import { SessionTransition } from "@/components/app/session/SessionTransition"
import { SessionExerciseDoneScreen } from "@/components/app/session/SessionExerciseDoneScreen"
import { SessionCompletionScreen } from "@/components/app/session/SessionCompletionScreen"
import { SessionTTSController } from "@/components/app/session/SessionTTSController"
import type { SessionTTSControllerHandle } from "@/components/app/session/SessionTTSController"

const SESSION_KEY_PREFIX = "praxis_session_v2_"

export default function SessionPage() {
  const params = useParams<{ zuweisungsId: string }>()
  const router = useRouter()
  const { assignments, isLoading } = usePatientApp()

  const assignment = assignments?.find((a) => a.id === params.zuweisungsId)

  const exercises: FlatExercise[] = useMemo(
    () => (assignment ? flattenExercises(assignment) : []),
    [assignment]
  )

  const planName = assignment?.plan?.name ?? "Training"
  const duration = useMemo(() => estimateDuration(exercises), [exercises])

  const getSetsForExercise = useCallback(
    (index: number) => exercises[index]?.params.saetze ?? 1,
    [exercises]
  )

  const getPauseForExercise = useCallback(
    (index: number) => exercises[index]?.params.pause_sekunden ?? 0,
    [exercises]
  )

  const session = useSessionMode({
    totalExercises: exercises.length,
    getSetsForExercise,
    getPauseForExercise,
    storageKey: `${SESSION_KEY_PREFIX}${params.zuweisungsId}`,
  })

  // Ref to TTS controller for warming up audio on user gesture
  const ttsControllerRef = useRef<SessionTTSControllerHandle>(null)

  // Keep screen awake during active session
  useWakeLock(session.phase !== "start" && session.phase !== "complete")

  // SAFETY: Auto-skip resting phase when TTS is handling pauses
  useEffect(() => {
    if (session.ttsEnabled && session.phase === "resting") {
      console.log("[Session] Auto-skipping resting phase (TTS handles pauses)")
      session.restComplete()
    }
  }, [session.ttsEnabled, session.phase, session.restComplete])

  const currentExercise = exercises[session.exerciseIndex]
  const nextExercise = exercises[session.exerciseIndex + 1] ?? null

  const handleExit = useCallback(() => {
    router.push(`/app/training/${params.zuweisungsId}`)
  }, [router, params.zuweisungsId])

  const handleComplete = useCallback(
    async (overall: { difficulty?: number; pain_during?: number; notes?: string }) => {
      // Submit training log
      try {
        const completedAt = new Date().toISOString()
        const startedAt = session.startedAt ?? completedAt
        const durationSec = Math.round(
          (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000
        )

        const exerciseLogs = exercises.map((ex, i) => ({
          exercise_id: ex.exerciseId,
          sets_done: session.skipped.includes(i) ? 0 : (session.completedSets[i] ?? 0),
          reps_done: ex.params.wiederholungen ?? undefined,
          duration_seconds: ex.params.dauer_sekunden ?? undefined,
          difficulty: session.exerciseFeedback[i]?.difficulty,
          pain_during: session.exerciseFeedback[i]?.pain_during,
          skipped: session.skipped.includes(i),
          skip_reason: session.skipReasons[i] ?? undefined,
        }))

        // Fire-and-forget training log
        fetch("/api/me/training-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assignment_id: params.zuweisungsId,
            started_at: startedAt,
            completed_at: completedAt,
            duration_seconds: durationSec,
            overall_difficulty: overall.difficulty,
            overall_pain: overall.pain_during,
            notes: overall.notes,
            exercise_logs: exerciseLogs,
          }),
        }).catch(() => {})

        // Blocking: mark as completed
        await fetch(`/api/assignments/${params.zuweisungsId}/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            completed_date: new Date().toISOString().split("T")[0],
          }),
        })
      } catch {
        // Non-critical — session still counts
      }

      session.clearSession()
      router.push("/app/dashboard?done=1")
    },
    [session, exercises, params.zuweisungsId, router]
  )

  // ── Loading ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!assignment || exercises.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <p className="text-slate-500">Training nicht gefunden.</p>
          <button
            onClick={() => router.push("/app/dashboard")}
            className="text-emerald-600 font-medium text-sm"
          >
            Zurück zum Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── Start Screen ─────────────────────────────────────────────────────────

  if (session.phase === "start") {
    return (
      <>
        <SessionStartScreen
          planName={planName}
          exercises={exercises}
          estimatedMinutes={duration}
          ttsEnabled={session.ttsEnabled}
          onToggleTts={session.setTtsEnabled}
          onStart={() => {
            // Warm up the TTS controller's audio element during user gesture (required for mobile autoplay)
            if (session.ttsEnabled) {
              ttsControllerRef.current?.warmUp()
            }
            session.startSession(session.ttsEnabled)
          }}
          onBack={handleExit}
        />
        {/* Mount TTS controller early so ref is available for warmUp during start gesture */}
        <SessionTTSController
          ref={ttsControllerRef}
          exercises={exercises}
          currentIndex={session.exerciseIndex}
          phase={session.phase}
          ttsEnabled={session.ttsEnabled}
          onSetComplete={session.advanceSetTTS}
          onExerciseComplete={session.finishExerciseTTS}
          onTTSError={() => session.setTtsEnabled(false)}
        />
      </>
    )
  }

  // ── Completion Screen ────────────────────────────────────────────────────

  if (session.phase === "complete") {
    return (
      <SessionCompletionScreen
        exercises={exercises}
        completedSets={session.completedSets}
        skipped={session.skipped}
        startedAt={session.startedAt!}
        onSubmit={handleComplete}
      />
    )
  }

  // ── Active Session ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SessionHeader
        exerciseName={currentExercise?.name ?? ""}
        currentIndex={session.exerciseIndex}
        totalExercises={exercises.length}
        onExit={handleExit}
      />

      <div className="flex-1 flex flex-col">
        {/* Transition animation */}
        {session.phase === "transition" && (
          <SessionTransition
            currentExercise={currentExercise}
            nextExercise={nextExercise}
          />
        )}

        {/* Pause / Rest screen (skipped in TTS mode — pauses handled by audio) */}
        {session.phase === "resting" && !session.ttsEnabled && (
          <SessionPauseScreen
            seconds={currentExercise?.params.pause_sekunden ?? 30}
            nextExercise={nextExercise}
            currentSet={session.currentSet}
            totalSets={currentExercise?.params.saetze ?? 1}
            onDone={session.restComplete}
            onSkip={session.skipRest}
          />
        )}

        {/* Exercise done — explicit next tap (also keeps iOS audio context alive) */}
        {session.phase === "feedback" && (
          <SessionExerciseDoneScreen
            exerciseName={currentExercise?.name ?? ""}
            currentIndex={session.exerciseIndex}
            totalExercises={exercises.length}
            nextExerciseName={nextExercise?.name ?? null}
            onNext={() => {
              // Warm up audio context synchronously inside the user-gesture
              // handler so the next exercise's TTS plays without iOS blocking it.
              ttsControllerRef.current?.warmUp()
              session.skipFeedback()
            }}
          />
        )}

        {/* Exercise view (active, holding, set-done) */}
        {(session.phase === "exercise" ||
          session.phase === "holding" ||
          session.phase === "set-done") &&
          currentExercise && (
            <SessionExerciseView
              exercise={currentExercise}
              currentSet={session.completedSets[session.exerciseIndex] ?? 0}
              phase={session.phase}
              onCompleteSet={session.completeSet}
              onStartHold={session.startHold}
              onHoldComplete={session.holdComplete}
              onSkip={() => session.skipExercise()}
              ttsEnabled={session.ttsEnabled}
            />
          )}
      </div>

      {/* TTS Controller (floating mini player) */}
      <SessionTTSController
        ref={ttsControllerRef}
        exercises={exercises}
        currentIndex={session.exerciseIndex}
        phase={session.phase}
        ttsEnabled={session.ttsEnabled}
        onSetComplete={session.advanceSetTTS}
        onExerciseComplete={session.finishExerciseTTS}
        onTTSError={() => session.setTtsEnabled(false)}
      />
    </div>
  )
}
