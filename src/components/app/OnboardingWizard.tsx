"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Heart,
  Dumbbell,
  TrendingUp,
  ChevronRight,
  Sparkles,
} from "lucide-react"

const STORAGE_KEY = "praxis-os-onboarding-done"

const STEPS = [
  {
    icon: <img src="/images/Physio Logo_ausgeschnitten.png" alt="Physiotherapie Glawe" className="h-16 w-16 object-contain" />,
    bg: "from-teal-500 to-emerald-500",
    title: "Willkommen bei Praxis OS!",
    description:
      "Dein Therapeut hat einen persönlichen Plan für dich erstellt. Diese App begleitet dich auf deinem Weg zur Besserung.",
    detail: "Hier findest du alles was du brauchst — Training, Wissen und direkten Kontakt.",
  },
  {
    icon: <Heart className="h-12 w-12 text-rose-500" />,
    bg: "from-rose-500 to-pink-500",
    title: "Täglicher Check-in",
    description:
      "Erzähl uns jeden Tag kurz, wie es dir geht. Schmerz, Schlaf, Stress — alles zählt.",
    detail:
      "Dein Therapeut sieht deinen Verlauf und kann die Behandlung optimal anpassen. Je ehrlicher, desto besser!",
  },
  {
    icon: <Dumbbell className="h-12 w-12 text-emerald-500" />,
    bg: "from-emerald-500 to-teal-500",
    title: "Dein Training",
    description:
      "Deine Übungen warten jeden Tag auf dich. Mit Videos und klaren Anleitungen.",
    detail:
      "Regelmäßiges Training ist der Schlüssel. Deine Streak zeigt dir, wie gut du dranbleibst!",
  },
  {
    icon: <TrendingUp className="h-12 w-12 text-sky-500" />,
    bg: "from-sky-500 to-blue-500",
    title: "Los geht's!",
    description:
      "Alles bereit! Starte jetzt mit deinem ersten täglichen Check-in.",
    detail: "Wir begleiten dich bei jedem Schritt. Du schaffst das!",
  },
]

export function OnboardingWizard({ children }: { children: React.ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [step, setStep] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) {
      setShowOnboarding(true)
    }
  }, [])

  // Don't render anything until client-side hydration
  if (!mounted) return <>{children}</>
  if (!showOnboarding) return <>{children}</>

  function handleFinish() {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString())
    setShowOnboarding(false)
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      handleFinish()
    }
  }

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      {/* Background gradient */}
      <div className={`h-2 bg-gradient-to-r ${current.bg} transition-all duration-500`} />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto">
        {/* Step dots */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-8 bg-teal-500"
                  : i < step
                    ? "w-2 bg-teal-300"
                    : "w-2 bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div
          className="h-24 w-24 rounded-3xl bg-slate-50 flex items-center justify-center mb-8 animate-in zoom-in duration-300"
          key={step}
        >
          {current.icon}
        </div>

        {/* Text */}
        <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300" key={`text-${step}`}>
          <h1 className="text-2xl font-bold text-slate-800">{current.title}</h1>
          <p className="text-base text-slate-600 leading-relaxed">
            {current.description}
          </p>
          <p className="text-sm text-slate-400">{current.detail}</p>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="px-6 pb-10 max-w-md mx-auto w-full space-y-3">
        <Button
          onClick={handleNext}
          className={`w-full h-14 text-base font-semibold rounded-2xl bg-gradient-to-r ${current.bg} hover:opacity-90 transition-opacity`}
        >
          {isLast ? "Los geht's!" : "Weiter"}
          {!isLast && <ChevronRight className="h-5 w-5 ml-1" />}
        </Button>

        {!isLast && (
          <button
            type="button"
            onClick={handleFinish}
            className="w-full text-center text-sm text-slate-400 hover:text-slate-500 transition-colors"
          >
            Überspringen
          </button>
        )}
      </div>
    </div>
  )
}
