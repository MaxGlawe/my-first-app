"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, ArrowRight, Trophy, Loader2 } from "lucide-react"
import type { EducationQuiz } from "@/types/education"
import { useSubmitQuiz } from "@/hooks/use-education"

interface QuizScreenProps {
  moduleId: string
  quizzes: EducationQuiz[]
  onComplete: (score: number, total: number) => void
}

interface QuizAnswer {
  questionId: string
  selectedIndex: number
  isCorrect: boolean
  correctIndex: number
  explanation: string | null
}

export function QuizScreen({ moduleId, quizzes, onComplete }: QuizScreenProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [showSummary, setShowSummary] = useState(false)
  const { submit, submitting } = useSubmitQuiz()

  const quiz = quizzes[currentQuestion]
  const isCorrect = selectedOption === quiz?.correct_index

  function handleSelect(index: number) {
    if (showResult) return
    setSelectedOption(index)
  }

  function handleConfirm() {
    if (selectedOption === null) return

    if (!showResult) {
      // Show result
      setShowResult(true)
      setAnswers((prev) => [
        ...prev,
        {
          questionId: quiz.id,
          selectedIndex: selectedOption,
          isCorrect: selectedOption === quiz.correct_index,
          correctIndex: quiz.correct_index,
          explanation: quiz.explanation,
        },
      ])
      return
    }

    // Move to next question or summary
    if (currentQuestion < quizzes.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setSelectedOption(null)
      setShowResult(false)
    } else {
      setShowSummary(true)
    }
  }

  async function handleFinish() {
    const score = answers.filter((a) => a.isCorrect).length

    // Submit to API
    await submit({
      module_id: moduleId,
      answers: answers.map((a) => ({
        question_id: a.questionId,
        selected_index: a.selectedIndex,
      })),
    })

    onComplete(score, quizzes.length)
  }

  // Summary screen
  if (showSummary) {
    const score = answers.filter((a) => a.isCorrect).length
    const perfect = score === quizzes.length

    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-slate-900 dark:to-slate-950 px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center space-y-3 pt-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
              perfect
                ? "bg-green-100 dark:bg-green-900/40"
                : "bg-amber-100 dark:bg-amber-900/40"
            }`}>
              <Trophy className={`h-10 w-10 ${
                perfect ? "text-green-600" : "text-amber-600"
              }`} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {perfect ? "Perfekt!" : score >= 2 ? "Gut gemacht!" : "Weiter so!"}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              {score} von {quizzes.length} richtig
            </p>
          </div>

          {/* Answer review */}
          <div className="space-y-3">
            {answers.map((a, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 border ${
                  a.isCorrect
                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                }`}
              >
                <div className="flex items-start gap-2">
                  {a.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      Frage {i + 1}: {quizzes[i].question_text}
                    </p>
                    {a.explanation && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {a.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleFinish}
            disabled={submitting}
            className="w-full h-12 text-base font-semibold rounded-xl bg-teal-600 hover:bg-teal-700"
          >
            {submitting ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-5 w-5" />
            )}
            {submitting ? "Wird gespeichert..." : "Weiter zum Training"}
          </Button>
        </div>
      </div>
    )
  }

  // Question screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-slate-900 dark:to-slate-950 px-4 py-6">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Frage {currentQuestion + 1} von {quizzes.length}</span>
            <span>{answers.filter((a) => a.isCorrect).length} richtig</span>
          </div>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + (showResult ? 1 : 0)) / quizzes.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="rounded-2xl bg-white dark:bg-slate-800/80 shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-base font-semibold text-slate-900 dark:text-white leading-snug">
            {quiz.question_text}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {quiz.options.map((option, i) => {
            let optionStyle = "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700"
            if (selectedOption === i && !showResult) {
              optionStyle = "bg-teal-50 dark:bg-teal-900/30 border-teal-500 ring-1 ring-teal-500"
            }
            if (showResult) {
              if (i === quiz.correct_index) {
                optionStyle = "bg-green-50 dark:bg-green-950/30 border-green-500"
              } else if (i === selectedOption && !isCorrect) {
                optionStyle = "bg-red-50 dark:bg-red-950/30 border-red-500"
              } else {
                optionStyle = "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60"
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showResult}
                className={`w-full text-left rounded-xl border p-4 flex items-center gap-3 transition-all ${optionStyle}`}
              >
                <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 ${
                  showResult && i === quiz.correct_index
                    ? "bg-green-100 dark:bg-green-900/40 text-green-700"
                    : showResult && i === selectedOption && !isCorrect
                      ? "bg-red-100 dark:bg-red-900/40 text-red-700"
                      : selectedOption === i
                        ? "bg-teal-100 dark:bg-teal-900/40 text-teal-700"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm text-slate-700 dark:text-slate-200 flex-1">
                  {option}
                </span>
                {showResult && i === quiz.correct_index && (
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                )}
                {showResult && i === selectedOption && !isCorrect && (
                  <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {showResult && quiz.explanation && (
          <div className={`rounded-xl p-4 text-sm ${
            isCorrect
              ? "bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
              : "bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
          }`}>
            {isCorrect ? "Richtig! " : "Nicht ganz. "}
            {quiz.explanation}
          </div>
        )}

        {/* Action */}
        <Button
          onClick={handleConfirm}
          disabled={selectedOption === null}
          className="w-full h-12 text-base font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40"
        >
          {!showResult
            ? "Antwort prüfen"
            : currentQuestion < quizzes.length - 1
              ? "Nächste Frage"
              : "Ergebnis ansehen"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
