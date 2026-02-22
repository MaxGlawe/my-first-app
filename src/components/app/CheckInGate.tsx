"use client"

import { useState } from "react"
import { usePainDiary } from "@/hooks/use-pain-diary"
import { CheckInForm } from "@/components/app/CheckInForm"
import { Skeleton } from "@/components/ui/skeleton"
import { Sun, Cloud, Moon as MoonIcon } from "lucide-react"

function getGreeting(): { text: string; icon: React.ReactNode } {
  const hour = new Date().getHours()
  if (hour < 12) return { text: "Guten Morgen", icon: <Sun className="h-6 w-6 text-amber-400" /> }
  if (hour < 18) return { text: "Guten Tag", icon: <Cloud className="h-6 w-6 text-sky-400" /> }
  return { text: "Guten Abend", icon: <MoonIcon className="h-6 w-6 text-indigo-400" /> }
}

function getTodayFormatted(): string {
  return new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

export function CheckInGate({ children }: { children: React.ReactNode }) {
  const { todayEntry, isLoading } = usePainDiary()
  const [skipped, setSkipped] = useState(() => {
    if (typeof window === "undefined") return false
    return sessionStorage.getItem("checkin-skipped-today") === new Date().toISOString().split("T")[0]
  })
  const [completed, setCompleted] = useState(false)

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-lg space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  // Already checked in today, or skipped, or just completed
  if (todayEntry || skipped || completed) {
    return <>{children}</>
  }

  // Show check-in gate
  const greeting = getGreeting()

  function handleSkip() {
    const today = new Date().toISOString().split("T")[0]
    sessionStorage.setItem("checkin-skipped-today", today)
    setSkipped(true)
  }

  function handleComplete() {
    setCompleted(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-slate-50">
      <div className="container mx-auto py-8 px-4 max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            {greeting.icon}
            <h1 className="text-2xl font-bold text-slate-800">{greeting.text}!</h1>
          </div>
          <p className="text-sm text-slate-500">{getTodayFormatted()}</p>
          <p className="text-base text-slate-600 mt-3 font-medium">
            Wie geht es dir heute?
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Dein tägliches Check-in hilft deinem Therapeuten, die Behandlung optimal anzupassen.
          </p>
        </div>

        {/* Check-in form */}
        <CheckInForm onComplete={handleComplete} compact />

        {/* Skip button */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm text-slate-400 hover:text-slate-500 transition-colors"
          >
            Später
          </button>
        </div>
      </div>
    </div>
  )
}
