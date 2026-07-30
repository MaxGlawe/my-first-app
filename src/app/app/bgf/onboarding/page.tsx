"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useBgfMembership } from "@/hooks/use-bgf-membership"
import { IstAnalyseStepArbeitsplatz } from "@/components/bgf/onboarding/StepArbeitsplatz"
import { IstAnalyseStepBeschwerden } from "@/components/bgf/onboarding/StepBeschwerden"
import { IstAnalyseStepAlltag } from "@/components/bgf/onboarding/StepAlltag"
import { IstAnalyseStepZiele } from "@/components/bgf/onboarding/StepZiele"
import { IstAnalyseStepErgebnis } from "@/components/bgf/onboarding/StepErgebnis"
import type { IstAnalyseFormValues } from "@/types/bgf"
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  LogOut,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

// ── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Arbeitsplatz", shortLabel: "Arbeitsplatz" },
  { id: 2, label: "Beschwerden", shortLabel: "Beschwerden" },
  { id: 3, label: "Alltag", shortLabel: "Alltag" },
  { id: 4, label: "Ziele", shortLabel: "Ziele" },
  { id: 5, label: "Ergebnis", shortLabel: "Ergebnis" },
]

const INITIAL_VALUES: IstAnalyseFormValues = {
  arbeitsplatz_typ: "buero",
  bildschirmarbeit_stunden: 8,
  sitz_stunden_pro_tag: 6,
  heben_tragen: false,
  beschwerden_regionen: [],
  schmerz_aktuell: 0,
  stress_level: 3,
  schlaf_qualitaet: 7,
  bewegung_minuten_pro_woche: 60,
  ziele: [],
  // Angaben für den heutigen Check-in (siehe StepAlltag)
  stimmung: 5,
  arbeitstag_typ: "buero",
  arbeitszeit_stunden: 8,
}

/**
 * Welche Pausen-Routinen der heutige Tag braucht — gleiche Regel wie im
 * Dashboard-Check-in, damit beide Wege dieselben Sessions erzeugen.
 */
function getSessionTypes(arbeitszeit: number, arbeitstag: string): string[] {
  if (arbeitstag === "frei") return []
  if (arbeitszeit <= 4) return ["morgen_aktivierung"]
  if (arbeitszeit <= 6) return ["morgen_aktivierung", "mittag_mobilisation"]
  return ["morgen_aktivierung", "mittag_mobilisation", "nachmittag_reset"]
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function BgfOnboardingPage() {
  const router = useRouter()
  const { organizationId, refresh: refreshMembership } = useBgfMembership()

  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [values, setValues] = useState<IstAnalyseFormValues>(INITIAL_VALUES)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    risiko_score: number
    ki_empfehlung: string
    pausen_fit_fokus: string[]
  } | null>(null)
  // Kam der heutige Check-in aus diesem Onboarding? Steuert den Abschlusstext.
  const [checkinAngelegt, setCheckinAngelegt] = useState(false)

  const totalSteps = STEPS.length
  const progressPercent = ((step - 1) / (totalSteps - 1)) * 100

  // ── Navigation ─────────────────────────────────────────────────────────────

  function goNext() {
    if (step < totalSteps) {
      setDirection(1)
      setStep((s) => s + 1)
    }
  }

  function goBack() {
    if (step > 1) {
      setDirection(-1)
      setStep((s) => s - 1)
    }
  }

  function updateValues(partial: Partial<IstAnalyseFormValues>) {
    setValues((prev) => ({ ...prev, ...partial }))
  }

  // ── Validation ─────────────────────────────────────────────────────────────

  function canProceed(): boolean {
    switch (step) {
      case 1:
        return !!values.arbeitsplatz_typ
      case 2:
        return true // Beschwerden is optional
      case 3:
        return true // Alltag always valid
      case 4:
        return values.ziele.length >= 1
      default:
        return true
    }
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!organizationId) {
      setSubmitError("Keine Organisation gefunden. Bitte laden Sie die Seite neu.")
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch("/api/bgf/ist-analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, organization_id: organizationId }),
      })

      if (!res.ok) {
        const rawText = await res.text()
        setSubmitError("API Error " + res.status + ": " + rawText)
        return
      }

      const data = await res.json()

      // Der Tages-Check-in ist mit der Analyse entstanden (siehe API). Jetzt
      // im Hintergrund die passenden Routinen erzeugen, damit das Dashboard
      // nach dem Onboarding fertig bestückt ist statt leer.
      const typen = getSessionTypes(values.arbeitszeit_stunden, values.arbeitstag_typ)
      if (typen.length > 0) {
        void Promise.all(
          typen.map((typ) =>
            fetch("/api/bgf/pausen-fit/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ organization_id: organizationId, typ }),
            }).catch(() => null)
          )
        )
      }

      setCheckinAngelegt(data.checkin_angelegt === true)
      setResult({
        risiko_score: data.analyse?.risiko_score ?? 0,
        ki_empfehlung: data.analyse?.ki_empfehlung ?? "",
        pausen_fit_fokus: data.analyse?.pausen_fit_fokus ?? [],
      })
      setDirection(1)
      setStep(5)
      refreshMembership()
    } catch {
      setSubmitError("Netzwerkfehler. Bitte erneut versuchen.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Animation Variants ─────────────────────────────────────────────────────

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.35, ease: "easeOut" as const },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
      transition: { duration: 0.25, ease: "easeIn" as const },
    }),
  }

  // ── Step Components ────────────────────────────────────────────────────────

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <IstAnalyseStepArbeitsplatz
            value={values.arbeitsplatz_typ}
            onChange={(typ) => updateValues({ arbeitsplatz_typ: typ })}
          />
        )
      case 2:
        return (
          <IstAnalyseStepBeschwerden
            selected={values.beschwerden_regionen}
            onChange={(regions) => updateValues({ beschwerden_regionen: regions })}
          />
        )
      case 3:
        return (
          <IstAnalyseStepAlltag
            values={values}
            onChange={updateValues}
          />
        )
      case 4:
        return (
          <IstAnalyseStepZiele
            selected={values.ziele}
            onChange={(ziele) => updateValues({ ziele })}
          />
        )
      case 5:
        return (
          <IstAnalyseStepErgebnis
            result={result}
            checkinAngelegt={checkinAngelegt}
            onFinish={() => router.push("/app/bgf/dashboard")}
          />
        )
      default:
        return null
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const currentStepMeta = STEPS[step - 1]
  const isLastInputStep = step === 4
  const isResultStep = step === 5

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white flex flex-col">

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-slate-100 px-4 py-3">
        <div className="max-w-lg mx-auto">
          {/* Brand + Step Label */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              Gesundheits-Analyse
            </span>
            <div className="ml-auto flex items-center gap-2">
              {!isResultStep && (
                <span className="text-xs text-slate-400 font-medium tabular-nums">
                  {step} / {totalSteps - 1}
                </span>
              )}
              <button
                onClick={async () => { await supabase.auth.signOut(); window.location.href = "/login" }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
                title="Abmelden"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {!isResultStep && (
            <Progress
              value={progressPercent}
              className="h-1.5 bg-slate-100"
            />
          )}

          {/* Step dots */}
          {!isResultStep && (
            <div className="flex items-center justify-between mt-2">
              {STEPS.slice(0, -1).map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col items-center gap-0.5"
                >
                  <div
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      s.id < step
                        ? "bg-indigo-500"
                        : s.id === step
                        ? "bg-indigo-600 ring-2 ring-indigo-200 scale-125"
                        : "bg-slate-200"
                    }`}
                  />
                  <span
                    className={`text-[9px] font-medium transition-colors ${
                      s.id <= step ? "text-indigo-600" : "text-slate-400"
                    }`}
                  >
                    {s.shortLabel}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Step Content */}
      <main className="flex-1 overflow-hidden px-4 py-6">
        <div className="max-w-lg mx-auto relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {/* Step heading */}
              {!isResultStep && (
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                    {getStepHeading(step)}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    {getStepSubheading(step)}
                  </p>
                </div>
              )}

              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Navigation */}
      {!isResultStep && (
        <footer className="sticky bottom-0 z-20 bg-white/90 backdrop-blur-sm border-t border-slate-100 px-4 py-4 pb-safe">
          <div className="max-w-lg mx-auto">
            {submitError && (
              <p className="text-sm text-red-500 text-center mb-3">
                {submitError}
              </p>
            )}
            <div className="flex items-center gap-3">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={goBack}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Zurück
                </Button>
              )}

              <Button
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-md disabled:opacity-60"
                onClick={isLastInputStep ? handleSubmit : goNext}
                disabled={!canProceed() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyse läuft...
                  </>
                ) : isLastInputStep ? (
                  <>
                    Analyse starten
                    <ChevronRight className="w-4 h-4 ml-1.5" />
                  </>
                ) : (
                  <>
                    Weiter
                    <ChevronRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStepHeading(step: number): string {
  switch (step) {
    case 1: return "Wie sieht Ihr Arbeitsplatz aus?"
    case 2: return "Wo haben Sie Beschwerden?"
    case 3: return "Wie sieht Ihr Alltag aus?"
    case 4: return "Was möchten Sie erreichen?"
    default: return ""
  }
}

function getStepSubheading(step: number): string {
  switch (step) {
    case 1: return "Wählen Sie die Umgebung, in der Sie hauptsächlich arbeiten."
    case 2: return "Markieren Sie Bereiche, in denen Sie regelmäßig Beschwerden haben. Mehrfachauswahl möglich."
    case 3: return "Diese Informationen helfen uns, Ihr persönliches Programm zu erstellen."
    case 4: return "Wählen Sie mindestens ein Ziel aus — darauf bauen wir Ihr Programm auf."
    default: return ""
  }
}
