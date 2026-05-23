"use client"

/**
 * ModuleQuiz — 3-question quiz gate for completing a course module.
 * Shown as a full-screen overlay over the lesson player.
 * On pass (≥2/3) → calls onPass(). On fail → shows results + retry.
 */

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, ArrowRight, RefreshCw, Trophy, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation?: string | null
}

interface Props {
  questions: QuizQuestion[]
  modulTitle: string
  color: string
  /** Final module (21) — longer course-wide test, labelled "Abschlusstest" */
  isFinalExam?: boolean
  onPass: (score: number, total: number) => void
  onSkip?: () => void
}

const GRADIENT_MAP: Record<string, string> = {
  cyan:    "from-cyan-500 to-sky-500",
  emerald: "from-emerald-500 to-teal-500",
  rose:    "from-rose-500 to-pink-500",
  indigo:  "from-indigo-500 to-violet-500",
}

const ACCENT_MAP: Record<string, string> = {
  cyan:    "text-cyan-600",
  emerald: "text-emerald-600",
  rose:    "text-rose-600",
  indigo:  "text-indigo-600",
}

const BTN_MAP: Record<string, string> = {
  cyan:    "bg-cyan-500 hover:bg-cyan-600",
  emerald: "bg-emerald-500 hover:bg-emerald-600",
  rose:    "bg-rose-500 hover:bg-rose-600",
  indigo:  "bg-indigo-500 hover:bg-indigo-600",
}

type Phase = "intro" | "answering" | "results"

export function ModuleQuiz({ questions, modulTitle, color, isFinalExam = false, onPass, onSkip }: Props) {
  const gradient = GRADIENT_MAP[color] ?? GRADIENT_MAP.emerald
  const accent = ACCENT_MAP[color] ?? ACCENT_MAP.emerald
  const btnCls = BTN_MAP[color] ?? BTN_MAP.emerald

  // Antworten pro Frage einmalig shufflen — sonst landen alle "correct"
  // Antworten an derselben Position (Claude tendiert dazu, "B" oder "A"
  // konsistent richtig zu setzen). Stabile Reihenfolge per useMemo, damit
  // ein Retry NICHT neu shufflt.
  const shuffledQuestions = useMemo(() => {
    return questions.map((q) => {
      const indices = q.options.map((_, i) => i)
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[indices[i], indices[j]] = [indices[j], indices[i]]
      }
      return {
        ...q,
        options: indices.map((idx) => q.options[idx]),
        correctIndex: indices.indexOf(q.correctIndex),
      }
    })
  }, [questions])

  const [phase, setPhase] = useState<Phase>("intro")
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])

  function handleSelect(idx: number) {
    if (selected !== null) return
    setSelected(idx)
  }

  function handleNext() {
    if (selected === null) return
    const newAnswers = [...answers, selected]

    if (currentQ < shuffledQuestions.length - 1) {
      setAnswers(newAnswers)
      setCurrentQ((q) => q + 1)
      setSelected(null)
    } else {
      setAnswers(newAnswers)
      setPhase("results")
    }
  }

  // Pass = at least two-thirds correct (3 Fragen → 2, 6 → 4, 8 → 6)
  const passThreshold = Math.max(1, Math.ceil((shuffledQuestions.length * 2) / 3))
  const score = answers.filter((a, i) => a === shuffledQuestions[i].correctIndex).length
  const passed = score >= passThreshold

  function handleRetry() {
    setPhase("answering")
    setCurrentQ(0)
    setSelected(null)
    setAnswers([])
  }

  const q = shuffledQuestions[currentQ]
  const progressPct = ((currentQ + (selected !== null ? 1 : 0)) / shuffledQuestions.length) * 100

  // ── Intro ─────────────────────────────────────────────────────────────────

  if (phase === "intro") {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col bg-white">
        <div className={`flex-1 flex flex-col items-center justify-center px-6 py-10`}>
          <div className={`h-20 w-20 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-xl mb-6`}>
            <Brain className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-3">
            {isFinalExam ? "Abschlusstest" : "Wissens-Check"}
          </h2>
          <p className="text-sm text-slate-500 text-center leading-relaxed max-w-xs mb-2">
            {isFinalExam ? (
              <>
                Ein Test über die gesamte Challenge — {shuffledQuestions.length} Fragen.
                Zeig nochmal, was hängen geblieben ist.
              </>
            ) : (
              <>
                Bevor du <strong className="text-slate-700">{modulTitle}</strong>{" "}
                abschließt, beantworte {shuffledQuestions.length} kurze Fragen.
              </>
            )}
          </p>
          <p className="text-xs text-slate-400 text-center mb-8">
            Du brauchst mindestens {passThreshold} von {shuffledQuestions.length} Antworten richtig.
          </p>

          <div className="w-full max-w-xs space-y-3">
            <Button
              onClick={() => setPhase("answering")}
              className={`w-full h-12 text-white font-semibold rounded-xl ${btnCls}`}
            >
              Quiz starten
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {onSkip && (
              <button
                onClick={onSkip}
                className="w-full text-xs text-slate-400 hover:text-slate-600 py-2"
              >
                Später
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Results ────────────────────────────────────────────────────────────────

  if (phase === "results") {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col bg-white overflow-y-auto">
        <div className="flex-1 flex flex-col items-center px-6 py-10">
          {/* Score indicator */}
          <div className={cn(
            "h-24 w-24 rounded-full flex items-center justify-center shadow-xl mb-6",
            passed
              ? `bg-gradient-to-br ${gradient}`
              : "bg-gradient-to-br from-slate-200 to-slate-300"
          )}>
            {passed ? (
              <Trophy className="h-12 w-12 text-white" />
            ) : (
              <XCircle className="h-12 w-12 text-slate-500" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">
            {passed ? "Bestanden!" : "Nicht ganz…"}
          </h2>
          <p className={cn("text-lg font-bold mb-1", passed ? accent : "text-slate-500")}>
            {score} / {shuffledQuestions.length} richtig
          </p>
          <p className="text-sm text-slate-400 text-center mb-8">
            {passed
              ? "Sehr gut — du kannst dieses Modul jetzt abschließen."
              : `Du brauchst mindestens ${passThreshold} richtige Antworten. Versuche es nochmal!`}
          </p>

          {/* Per-question breakdown */}
          <div className="w-full max-w-sm space-y-3 mb-8">
            {shuffledQuestions.map((question, i) => {
              const userAnswer = answers[i]
              const isCorrect = userAnswer === question.correctIndex
              return (
                <div
                  key={question.id}
                  className={cn(
                    "rounded-2xl border p-4",
                    isCorrect
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-red-50 border-red-200"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed mb-1">
                        {question.question}
                      </p>
                      {!isCorrect && (
                        <p className="text-[11px] text-emerald-700 font-medium">
                          Richtig: {question.options[question.correctIndex]}
                        </p>
                      )}
                      {question.explanation && (
                        <p className="text-[11px] text-slate-500 mt-1 italic leading-relaxed">
                          {question.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="w-full max-w-xs space-y-3">
            {passed ? (
              <Button
                onClick={() => onPass(score, shuffledQuestions.length)}
                className={`w-full h-12 text-white font-semibold rounded-xl ${btnCls}`}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isFinalExam ? "Challenge abschließen" : "Modul abschließen"}
              </Button>
            ) : (
              <Button
                onClick={handleRetry}
                className={`w-full h-12 text-white font-semibold rounded-xl ${btnCls}`}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Nochmal versuchen
              </Button>
            )}
            {onSkip && !passed && (
              <button
                onClick={onSkip}
                className="w-full text-xs text-slate-400 hover:text-slate-600 py-2"
              >
                Später
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Answering ──────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white">
      {/* Header */}
      <div className={`bg-gradient-to-r ${gradient} px-5 pt-12 pb-6`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
            Frage {currentQ + 1} von {shuffledQuestions.length}
          </span>
          <span className="text-xs text-white/70">{Math.round(progressPct)}% fertig</span>
        </div>
        {/* Progress dots */}
        <div className="flex items-center gap-2 mb-4">
          {shuffledQuestions.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i < currentQ
                  ? "bg-white w-4"
                  : i === currentQ
                  ? "bg-white w-8"
                  : "bg-white/30 w-4"
              )}
            />
          ))}
        </div>
        <h2 className="text-lg font-bold text-white leading-snug">{q.question}</h2>
      </div>

      {/* Options */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-3">
        {q.options.map((option, i) => {
          const isSelected = selected === i
          const isCorrect = selected !== null && i === q.correctIndex
          const isWrong = isSelected && i !== q.correctIndex

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              className={cn(
                "w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 text-sm font-medium leading-relaxed",
                selected === null
                  ? "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50 active:scale-[0.99]"
                  : isCorrect
                  ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                  : isWrong
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "border-slate-200 bg-white text-slate-400"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-7 w-7 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold",
                  selected === null
                    ? "border-slate-300 text-slate-500"
                    : isCorrect
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : isWrong
                    ? "border-red-400 bg-red-400 text-white"
                    : "border-slate-200 text-slate-400"
                )}>
                  {selected !== null ? (
                    isCorrect ? <CheckCircle2 className="h-4 w-4" /> :
                    isWrong ? <XCircle className="h-4 w-4" /> :
                    String.fromCharCode(65 + i)
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </div>
                <span>{option}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer CTA */}
      <div className="px-5 pb-8 pt-2 border-t border-slate-100 bg-white">
        <Button
          onClick={handleNext}
          disabled={selected === null}
          className={cn(
            "w-full h-12 font-semibold rounded-xl text-white transition-all",
            selected !== null ? `${btnCls} shadow-md` : "bg-slate-200 text-slate-400 cursor-not-allowed"
          )}
        >
          {currentQ < shuffledQuestions.length - 1 ? (
            <>
              Weiter
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            "Ergebnis anzeigen"
          )}
        </Button>
      </div>
    </div>
  )
}
