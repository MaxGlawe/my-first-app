"use client"

import { Button } from "@/components/ui/button"
import { FlipHorizontal2, ArrowRight } from "lucide-react"
import { seiteLabel, type Seite } from "@/lib/exercise-sides"

interface SessionSideSwitchScreenProps {
  exerciseName: string
  /** Seite, die gerade fertig ist */
  fertigeSeite: Seite
  /** Seite, die jetzt kommt */
  naechsteSeite: Seite
  saetzeProSeite: number
  onContinue: () => void
}

/**
 * Eigener Schritt zwischen den beiden Seiten einer Übung.
 *
 * Muss aktiv bestätigt werden — genau hier lief der Player vorher einfach
 * weiter, sodass nur eine Seite trainiert wurde.
 */
export function SessionSideSwitchScreen({
  exerciseName,
  fertigeSeite,
  naechsteSeite,
  saetzeProSeite,
  onContinue,
}: SessionSideSwitchScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center mb-6">
        <FlipHorizontal2 className="h-9 w-9 text-amber-600" />
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-2">
        Seite wechseln
      </p>

      <h2 className="text-2xl font-bold text-slate-900 mb-3">
        Jetzt die {seiteLabel(naechsteSeite)}
      </h2>

      <p className="text-sm text-slate-500 max-w-xs mb-1">
        {exerciseName}
      </p>
      <p className="text-sm text-slate-400 max-w-xs">
        Die {seiteLabel(fertigeSeite)} ist geschafft. Dieselbe Übung noch einmal
        mit {saetzeProSeite === 1 ? "einem Satz" : `${saetzeProSeite} Sätzen`} auf
        der anderen Seite.
      </p>

      <Button
        size="lg"
        onClick={onContinue}
        className="mt-10 w-full max-w-xs h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-base shadow-lg shadow-emerald-500/25"
      >
        Bereit — weiter
        <ArrowRight className="h-5 w-5 ml-2" />
      </Button>
    </div>
  )
}
